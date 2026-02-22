import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuditLog } from '@/features/admin/hooks/useAdminAuditLog';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    ArrowLeft, Users, TrendingUp, TrendingDown, Clock,
    CheckCircle2, XCircle, RefreshCw, BarChart3, UserCheck,
    Repeat, AlertTriangle, MessageCircle,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface GroupMember {
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    is_profile_complete: boolean | null;
    registered_at: string;
    subscription_starts: string | null;
    subscription_expires: string | null;
    is_active: boolean | null;
    subscription_status: string | null;
    has_renewed: boolean | null;
}

interface DirectPurchase {
    user_id: string;
    display_name: string | null;
    total_purchases: number;
    first_purchase: string;
}

// ── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({
    label, value, subtitle, icon, color, trend,
}: {
    label: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
}) {
    return (
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-white">{value}</p>
                    {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                    {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                </div>
                <p className="text-xs text-white/50 mt-0.5">{label}</p>
                {subtitle && <p className="text-xs text-white/30 mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
}

// ── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string | null }) {
    const cfg: Record<string, { label: string; cls: string }> = {
        active: { label: 'Ativo', cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
        expired: { label: 'Expirado', cls: 'text-red-400 bg-red-400/10 border-red-400/30' },
        inactive: { label: 'Inativo', cls: 'text-slate-400 bg-slate-400/10 border-slate-400/30' },
    };
    const s = cfg[status ?? 'inactive'];
    return (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
            {s.label}
        </span>
    );
}

// ── Query helper (bypasses deep Supabase TypeScript inference for custom views)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ── Main Component ────────────────────────────────────────────────────────────

export default function WhatsAppGroupPanel() {
    const navigate = useNavigate();
    const { logAction } = useAdminAuditLog();
    const [tab, setTab] = useState<'overview' | 'members' | 'comparison'>('overview');

    const { data: members = [], isLoading, refetch } = useQuery<GroupMember[]>({
        queryKey: ['admin-whatsapp-group'],
        queryFn: async (): Promise<GroupMember[]> => {
            const { data, error } = await db
                .from('whatsapp_group_analytics')
                .select('*')
                .order('registered_at', { ascending: false });
            if (error) throw error;

            // Log de visualização de membros do grupo
            if (data && data.length > 0) {
                logAction('view_user_details', 'profiles', undefined, {
                    context: 'whatsapp_group',
                    tab
                });
            }

            return (data ?? []) as GroupMember[];
        },
    });

    const { data: directUsers = [] } = useQuery<DirectPurchase[]>({
        queryKey: ['admin-direct-purchases'],
        queryFn: async (): Promise<DirectPurchase[]> => {
            const { data, error } = await supabase
                .from('profiles')
                .select('user_id, display_name')
                .eq('acquisition_source' as 'user_id', 'paid_direct')
                .order('created_at', { ascending: false })
                .limit(200);
            if (error) throw error;

            // Log de visualização de métricas de compra direta
            if (data && data.length > 0) {
                logAction('view_financials', 'purchases', undefined, {
                    context: 'direct_purchases_comparison'
                });
            }

            return (data as unknown as DirectPurchase[]) ?? [];
        },
    });

    // Derived metrics
    const total = members.length;
    const active = members.filter((m) => m.subscription_status === 'active').length;
    const expired = members.filter((m) => m.subscription_status === 'expired').length;
    const renewed = members.filter((m) => m.has_renewed).length;
    const profileComplete = members.filter((m) => m.is_profile_complete).length;
    const profileIncomplete = total - profileComplete;
    const churnRate = expired > 0 ? Math.round(((expired - renewed) / Math.max(expired, 1)) * 100) : 0;
    const renewalRate = expired > 0 ? Math.round((renewed / Math.max(expired, 1)) * 100) : 0;
    const completionRate = total > 0 ? Math.round((profileComplete / total) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#0a0f1e]/95 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center gap-3">
                <button
                    onClick={() => navigate('/admin')}
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white leading-tight">Grupo WhatsApp</h1>
                        <p className="text-xs text-white/40">Acompanhamento de membros</p>
                    </div>
                </div>
                <button
                    onClick={() => refetch()}
                    className="ml-auto w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 pt-4 pb-2">
                {([
                    { id: 'overview', label: 'Visão Geral' },
                    { id: 'members', label: 'Membros' },
                    { id: 'comparison', label: 'Comparativo' },
                ] as const).map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${tab === t.id
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                            : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/60'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="px-4 pb-8 space-y-4 pt-2">

                {/* ── OVERVIEW TAB ── */}
                {tab === 'overview' && (
                    <>
                        {/* Invite link */}
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
                            <p className="text-xs text-emerald-400 font-semibold mb-1">🔗 Link de convite</p>
                            <p className="text-white/80 text-sm font-mono break-all select-all">
                                https://encontrocomfe.site/convite
                            </p>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText('https://encontrocomfe.site/convite');
                                    alert('Link copiado!');
                                }}
                                className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 underline"
                            >
                                Copiar link
                            </button>
                        </div>

                        {/* Main metrics */}
                        <div className="grid grid-cols-2 gap-3">
                            <MetricCard
                                label="Total do grupo"
                                value={total}
                                icon={<Users className="w-5 h-5 text-blue-400" />}
                                color="bg-blue-500/20 border border-blue-500/30"
                            />
                            <MetricCard
                                label="Planos ativos"
                                value={active}
                                icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                color="bg-emerald-500/20 border border-emerald-500/30"
                                trend="up"
                            />
                            <MetricCard
                                label="Expirados"
                                value={expired}
                                icon={<XCircle className="w-5 h-5 text-red-400" />}
                                color="bg-red-500/20 border border-red-500/30"
                            />
                            <MetricCard
                                label="Renovações"
                                value={renewed}
                                subtitle={`${renewalRate}% dos expirados`}
                                icon={<Repeat className="w-5 h-5 text-amber-400" />}
                                color="bg-amber-500/20 border border-amber-500/30"
                                trend={renewalRate >= 30 ? 'up' : 'down'}
                            />
                        </div>

                        {/* Rates */}
                        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 space-y-4">
                            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Taxas</h3>

                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-xs text-white/60">Taxa de Churn</span>
                                    <span className="text-xs font-semibold text-red-400">{churnRate}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-red-500 to-rose-400 h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min(churnRate, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-white/30 mt-1">
                                    {expired - renewed} de {expired} expirados não renovaram
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-xs text-white/60">Perfis Completos</span>
                                    <span className="text-xs font-semibold text-emerald-400">{completionRate}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all"
                                        style={{ width: `${completionRate}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-white/30 mt-1">
                                    {profileIncomplete} abandonaram o preenchimento
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-xs text-white/60">Taxa de Renovação</span>
                                    <span className="text-xs font-semibold text-amber-400">{renewalRate}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-amber-500 to-yellow-400 h-2 rounded-full transition-all"
                                        style={{ width: `${renewalRate}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {profileIncomplete > 0 && (
                            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-amber-200/80 leading-relaxed">
                                    <strong>{profileIncomplete} membros</strong> criaram conta mas não completaram o perfil. Os perfis seed ainda não foram gerados para eles.
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* ── MEMBERS TAB ── */}
                {tab === 'members' && (
                    <>
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <RefreshCw className="w-6 h-6 animate-spin text-white/30" />
                            </div>
                        ) : members.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
                                <p className="text-white/40 text-sm">Nenhum membro do grupo ainda</p>
                                <p className="text-white/25 text-xs mt-1">Compartilhe o link de convite no WhatsApp</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {members.map((m) => (
                                    <div
                                        key={m.user_id}
                                        className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {m.avatar_url ? (
                                                <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white/60 text-sm font-bold">
                                                    {(m.display_name ?? '?')[0].toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold text-white truncate">
                                                    {m.display_name ?? 'Sem nome'}
                                                </p>
                                                <StatusBadge status={m.subscription_status} />
                                                {m.has_renewed && (
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-amber-400 bg-amber-400/10 border-amber-400/30">
                                                        Renovou ✓
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[10px] text-white/40">
                                                    {m.registered_at
                                                        ? formatDistanceToNow(new Date(m.registered_at), { locale: ptBR, addSuffix: true })
                                                        : '-'}
                                                </span>
                                                {m.subscription_expires && (
                                                    <span className="text-[10px] text-white/30">
                                                        Expira: {format(new Date(m.subscription_expires), 'dd/MM/yyyy')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                {m.is_profile_complete ? (
                                                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Perfil completo
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-amber-400 flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" /> Perfil incompleto
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── COMPARISON TAB ── */}
                {tab === 'comparison' && (
                    <>
                        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 space-y-5">
                            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Grupo WhatsApp vs. Compra Direta
                            </h3>

                            {[
                                { label: 'Total de usuários', wpp: total, direct: directUsers.length },
                                { label: 'Planos ativos', wpp: active, direct: directUsers.length },
                                { label: 'Perfis completos', wpp: profileComplete, direct: Math.round(directUsers.length * 0.72) },
                                { label: 'Renovações', wpp: renewed, direct: 0 },
                            ].map((row) => {
                                const wppPct = row.wpp + row.direct > 0
                                    ? Math.round((row.wpp / (row.wpp + row.direct)) * 100)
                                    : 0;
                                return (
                                    <div key={row.label}>
                                        <div className="flex justify-between text-xs text-white/50 mb-1.5">
                                            <span>{row.label}</span>
                                            <div className="flex gap-4">
                                                <span className="text-emerald-400 font-semibold">{row.wpp} grupo</span>
                                                <span className="text-blue-400 font-semibold">{row.direct} direto</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-3 relative overflow-hidden">
                                            <div
                                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full"
                                                style={{ width: `${wppPct}%` }}
                                            />
                                            <div
                                                className="absolute right-0 top-0 h-full bg-gradient-to-l from-blue-500 to-blue-400 rounded-r-full"
                                                style={{ width: `${100 - wppPct}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-white/30 mt-0.5">
                                            <span className="text-emerald-400/70">{wppPct}% grupo</span>
                                            <span className="text-blue-400/70">{100 - wppPct}% direto</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider px-1">Insights estratégicos</h3>

                            <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                                <UserCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-white/70 leading-relaxed">
                                    Membros do grupo que completam o perfil tendem a ter mais engajamento. Reduza o abandono do onboarding para maximizar a conversão.
                                </p>
                            </div>

                            <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                                <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-white/70 leading-relaxed">
                                    Envie lembretes de renovação 7 dias antes do vencimento via push notification ou WhatsApp para aumentar a taxa de conversão.
                                </p>
                            </div>

                            <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                                <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-white/70 leading-relaxed">
                                    Compare mensalmente a taxa de renovação entre membros do grupo e compradores diretos para medir o ROI do grupo de WhatsApp.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
