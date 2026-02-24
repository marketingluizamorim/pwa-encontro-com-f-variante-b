import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Users, Heart, MessageSquare, Zap,
    TrendingUp, BarChart3, Clock,
    UserPlus, CheckCircle2, RefreshCw
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar,
    Cell, PieChart, Pie
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, Info, Lightbulb } from 'lucide-react';

function KpiCard({ label, value, sub, icon, accent }: any) {
    return (
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-2xl font-bold text-white leading-tight">{value}</p>
                {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
                <p className="text-[10px] text-white/30 mt-1.5 uppercase tracking-wider font-semibold">{label}</p>
            </div>
        </div>
    );
}

// ── Engagement Importance Dialog ──────────────────────────────────────────
export function EngagementImportanceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;
    const items = [
        { label: 'Ativos Hoje (DAU)', desc: 'Usuários únicos ativos nas últimas 24h. É o batimento cardíaco do app.', icon: <Zap className="w-4 h-4 text-amber-400" /> },
        { label: 'Retenção Semanal', desc: 'Saúde real do app. Mostra se os usuários que entraram semana passada voltaram.', icon: <BarChart3 className="w-4 h-4 text-indigo-400" /> },
        { label: 'Conversas Ativas', desc: 'Métrica de conexão profunda. Mais mensagens significam usuários criando valor.', icon: <MessageSquare className="w-4 h-4 text-emerald-400" /> },
        { label: 'Matches', desc: 'O "Sucesso" do usuário. É o motivo principal de estarem na plataforma.', icon: <Heart className="w-4 h-4 text-rose-400" /> },
        { label: 'Likes Enviados', desc: 'Atividade de topo de funil. Mostra o interesse e a exploração dos perfis.', icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
        { label: 'Total de Usuários', desc: 'O tamanho da sua comunidade. Importante para escala e densidade.', icon: <Users className="w-4 h-4 text-blue-400" /> },
    ];

    return (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-sm bg-[#13191f] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                            <Lightbulb className="w-4 h-4 text-yellow-400" />
                        </div>
                        <h3 className="font-bold text-white text-lg">Métricas de Valor</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-white/40" />
                    </button>
                </div>
                <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                    {items.map((it, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-4">
                            <div className="shrink-0 mt-1">{it.icon}</div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-0.5">{it.label}</h4>
                                <p className="text-[11px] text-white/40 leading-relaxed">{it.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-center text-white/20 pt-1">
                    Foque em DAU e Retenção para garantir a longevidade do app.
                </p>
            </div>
        </div>
    );
}

const DATE_PRESETS = [
    { key: 'today', label: 'Hoje' },
    { key: 'yesterday', label: 'Ontem' },
    { key: '7d', label: '7 dias' },
    { key: '15d', label: '15 dias' },
    { key: '30d', label: '30 dias' },
    { key: '90d', label: '90 dias' },
    { key: 'month', label: 'Este mês' },
    { key: 'all', label: 'Tudo' },
] as const;
type Preset = typeof DATE_PRESETS[number]['key'];

function getRange(preset: Preset, custom: { from: string; to: string }) {
    const now = new Date();
    switch (preset) {
        case 'today': return { from: startOfDay(now), to: endOfDay(now) };
        case 'yesterday': {
            const yest = subDays(now, 1);
            return { from: startOfDay(yest), to: endOfDay(yest) };
        }
        case '7d': return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
        case '15d': return { from: startOfDay(subDays(now, 14)), to: endOfDay(now) };
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

export default function EngagementPanel() {
    const [preset, setPreset] = useState<Preset>('30d');
    const [custom, setCustom] = useState({ from: '', to: '' });
    const [showCustom, setShowCustom] = useState(false);

    const range = useMemo(() => getRange(preset === 'all' && (custom.from || custom.to) ? 'all' : preset, custom), [preset, custom]);

    const { data: stats, isLoading, refetch } = useQuery({
        queryKey: ['admin-engagement-stats', range],
        queryFn: async () => {
            const fromStr = range.from.toISOString();
            const toStr = range.to.toISOString();

            // Fetch everything in parallel
            const [
                { count: totalProfiles },
                { count: totalLikes },
                { count: totalMatches },
                { count: totalMessages },
                { count: dauCount },
                { count: retentionCount },
                { data: recentProfiles },
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('swipes').select('*', { count: 'exact', head: true }).eq('direction', 'like').gte('created_at', fromStr).lte('created_at', toStr),
                supabase.from('matches').select('*', { count: 'exact', head: true }).gte('created_at', fromStr).lte('created_at', toStr),
                supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', fromStr).lte('created_at', toStr),
                // DAU: Users active in the selected window (using the end of range as reference)
                supabase.from('profiles').select('*', { count: 'exact', head: true })
                    .gte('last_active_at', subDays(range.to, 1).toISOString())
                    .lte('last_active_at', endOfDay(range.to).toISOString()),
                // Retention: Users joined 7-14 days before 'range.to' who were active near 'range.to'
                supabase.from('profiles').select('*', { count: 'exact', head: true })
                    .gte('created_at', subDays(range.to, 14).toISOString())
                    .lte('created_at', subDays(range.to, 7).toISOString())
                    .gte('last_active_at', subDays(range.to, 3).toISOString()),
                supabase.from('profiles').select('created_at').gte('created_at', fromStr).lte('created_at', toStr),
            ]);

            // Group profiles by day for chart
            const profilesByDay = new Map();
            recentProfiles?.forEach(p => {
                const day = format(new Date(p.created_at), 'dd/MM');
                profilesByDay.set(day, (profilesByDay.get(day) || 0) + 1);
            });

            const chartData = Array.from(profilesByDay.entries())
                .map(([day, count]) => ({ day, count }))
                .sort((a, b) => {
                    const [d1, m1] = a.day.split('/').map(Number);
                    const [d2, m2] = b.day.split('/').map(Number);
                    return (m1 * 100 + d1) - (m2 * 100 + d2);
                });

            const retentionRate = totalProfiles ? ((retentionCount || 0) / Math.max(1, totalProfiles * 0.1) * 100).toFixed(0) : 0;

            return {
                totalProfiles: totalProfiles || 0,
                totalLikes: totalLikes || 0,
                totalMatches: totalMatches || 0,
                totalMessages: totalMessages || 0,
                actualDau: dauCount || 0,
                retentionRate: retentionRate || 0,
                chartData,
                engagementRate: totalProfiles ? ((totalLikes || 0) / totalProfiles).toFixed(1) : 0
            };
        }
    });

    if (isLoading) return <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-white/20" /></div>;

    return (
        <div className="space-y-5">
            {/* ── Date Filter bar ─────────────────────────────────────────── */}
            <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-3 flex flex-wrap items-center gap-2">
                <Clock className="w-4 h-4 text-white/40 shrink-0" />
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
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[10px] text-white/40 uppercase tracking-wider">Até</label>
                        <input type="date" value={custom.to} onChange={e => setCustom(c => ({ ...c, to: e.target.value }))}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white [color-scheme:dark] focus:outline-none focus:border-[#ffb400]/50" />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <KpiCard
                    label="Ativos Hoje (DAU)"
                    value={stats?.actualDau}
                    sub="Nas últimas 24h"
                    icon={<Zap className="w-5 h-5 text-amber-400" />}
                    accent="bg-amber-500/20"
                />
                <KpiCard
                    label="Retenção Semanal"
                    value={`${stats?.retentionRate}%`}
                    sub="Ainda ativos após 7d"
                    icon={<BarChart3 className="w-5 h-5 text-indigo-400" />}
                    accent="bg-indigo-500/20"
                />
                <KpiCard
                    label="Conversas Ativas"
                    value={stats?.totalMessages}
                    icon={<MessageSquare className="w-5 h-5 text-emerald-400" />}
                    accent="bg-emerald-500/20"
                />
                <KpiCard
                    label="Matches"
                    value={stats?.totalMatches}
                    sub="Pares formadores"
                    icon={<Heart className="w-5 h-5 text-rose-400" />}
                    accent="bg-rose-500/20"
                />
                <KpiCard
                    label="Likes Enviados"
                    value={stats?.totalLikes}
                    sub={`Média ${stats?.engagementRate}`}
                    icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
                    accent="bg-emerald-500/20"
                />
                <KpiCard
                    label="Total de Usuários"
                    value={stats?.totalProfiles}
                    icon={<Users className="w-5 h-5 text-blue-400" />}
                    accent="bg-blue-500/20"
                />
            </div>

            <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Novos Perfis (Últimos 30 dias)
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.chartData}>
                            <defs>
                                <linearGradient id="colorProfiles" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="count" name="Novos Perfis" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfiles)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Qualidade da Base
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-white/50">Matches por Perfil</span>
                            <span className="text-sm font-bold text-white">
                                {stats?.totalProfiles ? (stats.totalMatches / stats.totalProfiles).toFixed(2) : 0}
                            </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm text-white/50">Mensagens por Match</span>
                            <span className="text-sm font-bold text-white">
                                {stats?.totalMatches ? (stats.totalMessages / stats.totalMatches).toFixed(1) : 0}
                            </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 flex flex-col justify-center items-center text-center">
                    <Zap className="w-10 h-10 text-amber-400 mb-3 opacity-50" />
                    <h4 className="text-white font-bold">Dica dos Gigantes</h4>
                    <p className="text-xs text-white/40 max-w-[200px] mt-2">
                        Tinder foca em "Likes per User" para medir retenção. Se este número cair, é hora de enviar uma notificação push.
                    </p>
                </div>
            </div>
        </div>
    );
}
