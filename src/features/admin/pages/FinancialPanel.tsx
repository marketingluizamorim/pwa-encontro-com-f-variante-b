import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    DollarSign, TrendingUp, TrendingDown, RefreshCw,
    ArrowUpRight, ArrowDownRight, Minus,
    BarChart3, Repeat2, ShoppingCart, Calendar,
    HelpCircle, X, Crown, Users, Target, Percent
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────
const PLAN_META: Record<string, { label: string; color: string; hex: string }> = {
    bronze: { label: 'Bronze', color: 'text-orange-400', hex: '#fb923c' },
    silver: { label: 'Prata', color: 'text-slate-300', hex: '#cbd5e1' },
    gold: { label: 'Ouro', color: 'text-amber-400', hex: '#fbbf24' },
};

const SOURCE_META: Record<string, { label: string; hex: string }> = {
    funnel: { label: 'Funil (/planos)', hex: '#6366f1' },
    in_app_upgrade: { label: 'Upgrade in-app', hex: '#10b981' },
    in_app_renewal: { label: 'Renovação in-app', hex: '#8b5cf6' },
};

const DATE_PRESETS = [
    { key: 'today', label: 'Hoje' },
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: '90d', label: '90 dias' },
    { key: 'month', label: 'Este mês' },
    { key: 'all', label: 'Tudo' },
] as const;
type Preset = typeof DATE_PRESETS[number]['key'];

// ── Types ────────────────────────────────────────────────────────────────────
type PurchaseRow = {
    plan_id: string;
    total_price: number;
    is_renewal: boolean;
    source_platform: string | null;
    created_at: string;
    payment_status: string;
};

type RenewalRow = {
    previous_plan_id: string | null;
    new_plan_id: string;
    revenue: number;
    is_upgrade: boolean;
    is_downgrade: boolean;
    created_at: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const BRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function pct(a: number, b: number) {
    if (!b) return '—';
    const delta = ((a - b) / b) * 100;
    return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
}

function getRange(preset: Preset, custom: { from: string; to: string }) {
    const now = new Date();
    switch (preset) {
        case 'today': return { from: startOfDay(now), to: endOfDay(now) };
        case '7d': return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
        case '30d': return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
        case '90d': return { from: startOfDay(subDays(now, 89)), to: endOfDay(now) };
        case 'month': return { from: startOfMonth(now), to: endOfMonth(now) };
        case 'all': return { from: new Date(0), to: endOfDay(now) };
        default: {
            const from = custom.from ? startOfDay(new Date(custom.from)) : new Date(0);
            const to = custom.to ? endOfDay(new Date(custom.to)) : endOfDay(now);
            return { from, to };
        }
    }
}

// ── Sub-components ────────────────────────────────────────────────────────────
function KpiCard({
    label, value, sub, delta, deltaLabel, icon, accent,
}: {
    label: string; value: string; sub?: string;
    delta?: string; deltaLabel?: string;
    icon: React.ReactNode; accent: string;
}) {
    const isPos = delta?.startsWith('+');
    const isNeg = delta?.startsWith('-');
    return (
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
                    {icon}
                </div>
                {delta && delta !== '—' && (
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${isPos ? 'text-emerald-400' : isNeg ? 'text-red-400' : 'text-white/40'}`}>
                        {isPos ? <TrendingUp className="w-3 h-3" /> : isNeg ? <TrendingDown className="w-3 h-3" /> : null}
                        {delta}
                    </span>
                )}
            </div>
            <div>
                <p className="text-2xl font-bold text-white leading-tight">{value}</p>
                {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
                <p className="text-[10px] text-white/30 mt-1.5 uppercase tracking-wider">{label}</p>
                {deltaLabel && <p className="text-[10px] text-white/20 mt-0.5">{deltaLabel}</p>}
            </div>
        </div>
    );
}

// ── Legend Dialog ─────────────────────────────────────────────────────────────
export function PlanLegendDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm bg-[#13191f] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 space-y-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-400" /> Legenda
                    </h3>
                    <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/50">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div>
                    <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider font-bold">Planos</p>
                    <div className="space-y-2">
                        {[
                            { id: 'bronze', name: 'Plano Bronze', desc: 'Teste por 7 dias', price: 'R$12,90', color: 'text-orange-400' },
                            { id: 'silver', name: 'Plano Prata', desc: 'Mensal – 30 dias', price: 'R$29,90', color: 'text-slate-300' },
                            { id: 'gold', name: 'Plano Ouro', desc: 'Mensal – 30 dias', price: 'R$49,90', color: 'text-amber-400' },
                        ].map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${p.color}`}>{p.name}</span>
                                        <span className="text-[10px] font-mono bg-white/10 text-white/50 px-1.5 py-0.5 rounded">{p.id}</span>
                                    </div>
                                    <p className="text-xs text-white/40 mt-0.5">{p.desc}</p>
                                </div>
                                <span className="text-sm font-bold text-white/70">{p.price}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider font-bold">Origens de compra</p>
                    <div className="space-y-1.5">
                        {Object.entries(SOURCE_META).map(([id, { label, hex }]) => (
                            <div key={id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: hex }} />
                                    <span className="text-sm text-white/80">{label}</span>
                                </div>
                                <span className="text-[10px] font-mono bg-white/10 text-white/40 px-1.5 py-0.5 rounded">{id}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#1e293b] border border-white/20 rounded-xl p-3 text-xs shadow-xl">
            <p className="text-white/50 mb-1.5 font-medium">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-white/60">{p.name}:</span>
                    <span className="text-white font-bold">{typeof p.value === 'number' && p.name?.toLowerCase().includes('receita') ? BRL(p.value) : p.value}</span>
                </div>
            ))}
        </div>
    );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
interface FinancialPanelProps {
    onOpenLegend: () => void;
}

export default function FinancialPanel({ onOpenLegend }: FinancialPanelProps) {
    const [preset, setPreset] = useState<Preset>('30d');
    const [custom, setCustom] = useState({ from: '', to: '' });
    const [showCustom, setShowCustom] = useState(false);

    const range = useMemo(() => getRange(preset === 'all' && (custom.from || custom.to) ? 'all' : preset, custom), [preset, custom]);

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: allPurchases = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-financial-all'],
        queryFn: async () => {
            const { data, error } = await (supabase
                .from('purchases')
                .select('plan_id, total_price, is_renewal, source_platform, created_at, payment_status')
                .order('created_at', { ascending: true }) as unknown as Promise<{ data: PurchaseRow[] | null; error: unknown }>);
            if (error) throw error;
            return data ?? [];
        },
    });

    const { data: allRenewals = [] } = useQuery({
        queryKey: ['admin-financial-renewals-all'],
        queryFn: async () => {
            const { data, error } = await (supabase
                .from('subscription_renewals' as 'purchases')
                .select('previous_plan_id, new_plan_id, revenue, is_upgrade, is_downgrade, created_at')
                .order('created_at', { ascending: false })
                .limit(50) as unknown as Promise<{ data: RenewalRow[] | null; error: unknown }>);
            if (error) throw error;
            return data ?? [];
        },
    });

    // ── Filtered data ─────────────────────────────────────────────────────────
    const inRange = useCallback((dateStr: string) =>
        isWithinInterval(new Date(dateStr), { start: range.from, end: range.to }),
        [range]);

    const purchases = useMemo(() =>
        allPurchases.filter(p => p.payment_status === 'PAID' && inRange(p.created_at)),
        [allPurchases, inRange]);

    // Previous period for delta comparison
    const prevMs = range.to.getTime() - range.from.getTime();
    const prevRange = { from: new Date(range.from.getTime() - prevMs), to: new Date(range.from.getTime() - 1) };
    const prevPurchases = useMemo(() =>
        allPurchases.filter(p => p.payment_status === 'PAID' &&
            isWithinInterval(new Date(p.created_at), { start: prevRange.from, end: prevRange.to })),
        [allPurchases, prevRange.from, prevRange.to]);

    // ── KPIs ──────────────────────────────────────────────────────────────────
    const revenue = purchases.reduce((s, p) => s + Number(p.total_price ?? 0), 0);
    const prevRev = prevPurchases.reduce((s, p) => s + Number(p.total_price ?? 0), 0);
    const newCount = purchases.filter(p => !p.is_renewal).length;
    const renCount = purchases.filter(p => p.is_renewal).length;
    const newRev = purchases.filter(p => !p.is_renewal).reduce((s, p) => s + Number(p.total_price ?? 0), 0);
    const renRev = purchases.filter(p => p.is_renewal).reduce((s, p) => s + Number(p.total_price ?? 0), 0);
    const avgTicket = purchases.length ? revenue / purchases.length : 0;
    const renewRate = purchases.length ? (renCount / purchases.length) * 100 : 0;
    const prevNewC = prevPurchases.filter(p => !p.is_renewal).length;

    // ── Revenue by day (area chart) ───────────────────────────────────────────
    const revenueByDay = useMemo(() => {
        const map = new Map<string, { receita: number; vendas: number }>();
        purchases.forEach(p => {
            const day = format(new Date(p.created_at), 'dd/MM');
            const cur = map.get(day) ?? { receita: 0, vendas: 0 };
            cur.receita += Number(p.total_price ?? 0);
            cur.vendas++;
            map.set(day, cur);
        });
        return Array.from(map.entries()).map(([day, v]) => ({ day, ...v }));
    }, [purchases]);

    // ── By plan (pie + bar) ───────────────────────────────────────────────────
    const byPlan = useMemo(() => {
        const map: Record<string, { count: number; revenue: number }> = {};
        purchases.forEach(p => {
            if (!map[p.plan_id]) map[p.plan_id] = { count: 0, revenue: 0 };
            map[p.plan_id].count++;
            map[p.plan_id].revenue += Number(p.total_price ?? 0);
        });
        return Object.entries(map)
            .map(([id, v]) => ({
                name: PLAN_META[id]?.label ?? id,
                id,
                count: v.count,
                receita: v.revenue,
                fill: PLAN_META[id]?.hex ?? '#6b7280',
            }))
            .sort((a, b) => b.receita - a.receita);
    }, [purchases]);

    // ── By source ────────────────────────────────────────────────────────────
    const bySource = useMemo(() => {
        const map: Record<string, { count: number; revenue: number }> = {};
        purchases.forEach(p => {
            const src = p.source_platform ?? 'funnel';
            if (!map[src]) map[src] = { count: 0, revenue: 0 };
            map[src].count++;
            map[src].revenue += Number(p.total_price ?? 0);
        });
        return Object.entries(map).map(([src, v]) => ({
            name: SOURCE_META[src]?.label ?? src,
            src,
            count: v.count,
            receita: v.revenue,
            fill: SOURCE_META[src]?.hex ?? '#6b7280',
        }));
    }, [purchases]);

    // ── New vs Renewal by day (stacked bar) ──────────────────────────────────
    const newVsRenewal = useMemo(() => {
        const map = new Map<string, { novos: number; renovacoes: number }>();
        purchases.forEach(p => {
            const day = format(new Date(p.created_at), 'dd/MM');
            const cur = map.get(day) ?? { novos: 0, renovacoes: 0 };
            if (p.is_renewal) cur.renovacoes++; else cur.novos++;
            map.set(day, cur);
        });
        return Array.from(map.entries()).map(([day, v]) => ({ day, ...v }));
    }, [purchases]);

    const renewals = useMemo(() =>
        allRenewals.filter(r => inRange(r.created_at)),
        [allRenewals, inRange]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <RefreshCw className="w-6 h-6 animate-spin text-white/30" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* ── Date Filter bar ─────────────────────────────────────────── */}
            <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-3 flex flex-wrap items-center gap-2">
                <Calendar className="w-4 h-4 text-white/40 shrink-0" />
                <div className="flex gap-1.5 flex-wrap flex-1">
                    {DATE_PRESETS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => { setPreset(key); setShowCustom(false); }}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${preset === key && !showCustom
                                ? 'bg-[#ffb400] border-[#ffb400] text-[#1a0f00]'
                                : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                    <button
                        onClick={() => { setShowCustom(v => !v); setPreset('all'); }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${showCustom
                            ? 'bg-[#ffb400] border-[#ffb400] text-[#1a0f00]'
                            : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        Personalizado
                    </button>
                </div>

                <button onClick={() => refetch()} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0">
                    <RefreshCw className="w-3.5 h-3.5 text-white/50" />
                </button>
            </div>

            {/* Custom date range */}
            {showCustom && (
                <div className="flex gap-3 items-center bg-slate-800/40 border border-white/10 rounded-2xl p-4">
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[10px] text-white/40 uppercase tracking-wider">De</label>
                        <input type="date" value={custom.from} onChange={e => setCustom(c => ({ ...c, from: e.target.value }))}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white [color-scheme:dark] focus:outline-none focus:border-[#ffb400]/50" />
                    </div>
                    <span className="text-white/30 mt-5">—</span>
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[10px] text-white/40 uppercase tracking-wider">Até</label>
                        <input type="date" value={custom.to} onChange={e => setCustom(c => ({ ...c, to: e.target.value }))}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white [color-scheme:dark] focus:outline-none focus:border-[#ffb400]/50" />
                    </div>
                </div>
            )}

            {/* Period label */}
            <p className="text-[11px] text-white/30 -mt-2">
                {format(range.from, "dd/MM/yyyy", { locale: ptBR })} → {format(range.to, "dd/MM/yyyy", { locale: ptBR })}
                {preset !== 'all' && prevPurchases.length > 0 && (
                    <span className="ml-2 text-white/20">vs. período anterior</span>
                )}
            </p>

            {/* ── KPI Grid ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard
                    label="Receita total"
                    value={BRL(revenue)}
                    delta={pct(revenue, prevRev)}
                    deltaLabel={`anterior: ${BRL(prevRev)}`}
                    icon={<DollarSign className="w-5 h-5" />}
                    accent="bg-emerald-500/20 text-emerald-400"
                />
                <KpiCard
                    label="Novos clientes"
                    value={String(newCount)}
                    sub={BRL(newRev)}
                    delta={pct(newCount, prevNewC)}
                    icon={<ShoppingCart className="w-5 h-5" />}
                    accent="bg-blue-500/20 text-blue-400"
                />
                <KpiCard
                    label="Renovações"
                    value={String(renCount)}
                    sub={BRL(renRev)}
                    icon={<Repeat2 className="w-5 h-5" />}
                    accent="bg-violet-500/20 text-violet-400"
                />
                <KpiCard
                    label="Total compras"
                    value={String(purchases.length)}
                    delta={pct(purchases.length, prevPurchases.length)}
                    icon={<BarChart3 className="w-5 h-5" />}
                    accent="bg-amber-500/20 text-amber-400"
                />
                <KpiCard
                    label="Ticket médio"
                    value={BRL(avgTicket)}
                    icon={<Target className="w-5 h-5" />}
                    accent="bg-pink-500/20 text-pink-400"
                />
                <KpiCard
                    label="Taxa renovação"
                    value={`${renewRate.toFixed(1)}%`}
                    sub={`${renCount} de ${purchases.length}`}
                    icon={<Percent className="w-5 h-5" />}
                    accent="bg-cyan-500/20 text-cyan-400"
                />
                <KpiCard
                    label="Clientes únicos"
                    value={String(purchases.length)}
                    icon={<Users className="w-5 h-5" />}
                    accent="bg-teal-500/20 text-teal-400"
                />
                <KpiCard
                    label="Upgrades"
                    value={String(renewals.filter(r => r.is_upgrade).length)}
                    sub={`${renewals.filter(r => r.is_downgrade).length} downgrades`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    accent="bg-indigo-500/20 text-indigo-400"
                />
            </div>

            {/* ── Revenue over time ───────────────────────────────────────── */}
            <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Receita ao longo do tempo
                </h3>
                {revenueByDay.length === 0 ? (
                    <p className="text-center text-white/20 py-10 text-sm">Sem dados no período</p>
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={revenueByDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffb400" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ffb400" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} width={55} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="receita" name="Receita" stroke="#ffb400" strokeWidth={2} fill="url(#gradRev)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* ── New vs Renewal stacked bar ───────────────────────────────── */}
            <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Novos vs. Renovações por dia
                </h3>
                {newVsRenewal.length === 0 ? (
                    <p className="text-center text-white/20 py-10 text-sm">Sem dados no período</p>
                ) : (
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={newVsRenewal} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }} />
                            <Bar dataKey="novos" name="Novos" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
                            <Bar dataKey="renovacoes" name="Renovações" fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* ── By plan + By source ──────────────────────────────────────── */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Pie plan */}
                <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Crown className="w-4 h-4" /> Por plano
                    </h3>
                    {byPlan.length === 0 ? (
                        <p className="text-center text-white/20 py-8 text-sm">Sem dados</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={byPlan} dataKey="receita" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                                        {byPlan.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => BRL(v)} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {byPlan.map(p => (
                                    <div key={p.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.fill }} />
                                            <span className="text-sm text-white/70">{p.name}</span>
                                            <span className="text-xs text-white/30">{p.count} vendas</span>
                                        </div>
                                        <span className="text-sm font-bold text-white">{BRL(p.receita)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Pie source */}
                <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Por origem
                    </h3>
                    {bySource.length === 0 ? (
                        <p className="text-center text-white/20 py-8 text-sm">Sem dados</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={bySource} dataKey="receita" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                                        {bySource.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => BRL(v)} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {bySource.map(s => (
                                    <div key={s.src} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                                            <span className="text-sm text-white/70">{s.name}</span>
                                            <span className="text-xs text-white/30">{s.count}</span>
                                        </div>
                                        <span className="text-sm font-bold text-white">{BRL(s.receita)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Last renewals ─────────────────────────────────────────────── */}
            <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Repeat2 className="w-4 h-4" /> Renovações / Upgrades no período
                </h3>
                {renewals.length === 0 ? (
                    <p className="text-white/20 text-sm text-center py-6">Nenhuma renovação no período</p>
                ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {renewals.map((r, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.is_upgrade ? 'bg-emerald-500/20 text-emerald-400' : r.is_downgrade ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/40'}`}>
                                    {r.is_upgrade ? <ArrowUpRight className="w-4 h-4" /> : r.is_downgrade ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 text-sm flex-wrap">
                                        <span style={{ color: PLAN_META[r.previous_plan_id ?? '']?.hex ?? '#6b7280' }} className="font-semibold">
                                            {PLAN_META[r.previous_plan_id ?? '']?.label ?? (r.previous_plan_id ?? '—')}
                                        </span>
                                        <span className="text-white/30">→</span>
                                        <span style={{ color: PLAN_META[r.new_plan_id]?.hex ?? '#6b7280' }} className="font-semibold">
                                            {PLAN_META[r.new_plan_id]?.label ?? r.new_plan_id}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-white/30 mt-0.5">
                                        {format(new Date(r.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-bold text-white">{BRL(Number(r.revenue))}</p>
                                    <p className={`text-[10px] font-semibold ${r.is_upgrade ? 'text-emerald-400' : r.is_downgrade ? 'text-red-400' : 'text-white/40'}`}>
                                        {r.is_upgrade ? 'upgrade' : r.is_downgrade ? 'downgrade' : 'renovação'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
