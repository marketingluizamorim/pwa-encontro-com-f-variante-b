import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, formatDistanceToNow, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAdminAuditLog } from '@/features/admin/hooks/useAdminAuditLog';
import {
    Shield, AlertTriangle, CheckCircle, XCircle, Clock,
    User, ChevronDown, ChevronUp, RefreshCw, Ban, Eye,
    DollarSign, ArrowLeft, HelpCircle, MessageCircle,
    History as HistoryIcon, Send, Heart, Lightbulb
} from 'lucide-react';
import FinancialPanel, { PlanLegendDialog, MetricsImportanceDialog } from './FinancialPanel';
import AuditLogPanel from './AuditLogPanel';
import CampaignPanel from './CampaignPanel';
import EngagementPanel, { EngagementImportanceDialog } from './EngagementPanel';

// ── Types ────────────────────────────────────────────────────────────────────
type Section = 'menu' | 'reports' | 'financial' | 'audit' | 'campaigns' | 'engagement';

const REASON_LABELS: Record<string, string> = {
    fake_profile: 'Perfil falso',
    harassment: 'Assédio',
    inappropriate: 'Conteúdo inadequado',
    scam: 'Golpe/Fraude',
    other: 'Outro',
};

const STATUS_CONFIG = {
    pending: { label: 'Pendente', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
    resolved: { label: 'Resolvido', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
    dismissed: { label: 'Ignorado', color: 'text-slate-400 bg-slate-400/10 border-slate-400/30' },
    suspended: { label: 'Suspenso', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
};

interface Report {
    id: string;
    reporter_id: string;
    reported_id: string;
    reason: string;
    description: string | null;
    status: string;
    created_at: string;
    reviewed_at: string | null;
    reporter_name?: string;
    reported_name?: string;
    reported_avatar?: string;
    report_count?: number;
    suspended_until?: string | null;
}

function NumCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
    return (
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/50 mt-0.5">{label}</p>
            </div>
        </div>
    );
}

// ── Main Menu ────────────────────────────────────────────────────────────────
function MainMenu({ onSelect }: { onSelect: (s: Section) => void }) {
    const { data: menuStats } = useQuery({
        queryKey: ['admin-menu-badges'],
        queryFn: async () => {
            const today = startOfDay(new Date()).toISOString();

            const [
                { count: pending },
                { count: newProfiles }
            ] = await Promise.all([
                supabase.from('purchases').select('*', { count: 'exact', head: true }).eq('payment_status', 'PENDING').gte('created_at', today),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today)
            ]);

            return {
                pending: pending || 0,
                newProfiles: newProfiles || 0
            };
        },
        refetchInterval: 30000 // A cada 30s
    });

    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
            <div className="text-center mb-2">
                <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Painel Admin</h2>
                <p className="text-sm text-white/40 mt-1">Selecione uma seção</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
                <button
                    onClick={() => onSelect('reports')}
                    className="group bg-slate-800/60 border border-white/10 hover:border-red-500/40 rounded-2xl p-6 text-left transition-all hover:bg-slate-800/80 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Denúncias</h3>
                    <p className="text-xs text-white/40 leading-relaxed">
                        Revise, resolva e suspenda perfis denunciados
                    </p>
                </button>

                <button
                    onClick={() => onSelect('financial')}
                    className="group relative bg-slate-800/60 border border-white/10 hover:border-amber-500/40 rounded-2xl p-6 text-left transition-all hover:bg-slate-800/80 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:bg-amber-500/30 transition-colors">
                        <DollarSign className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Faturamento</h3>
                    <p className="text-xs text-white/40 leading-relaxed">
                        Receita, planos, renovações e origens de venda
                    </p>
                    {menuStats?.pending ? (
                        <span className="absolute top-4 right-4 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                            {menuStats.pending} PENDENTES
                        </span>
                    ) : null}
                </button>

                {/* Grupo WhatsApp moved up */}
                <button
                    onClick={() => navigate('/admin/grupo-whatsapp')}
                    className="group bg-slate-800/60 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-6 text-left transition-all hover:bg-slate-800/80 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors">
                        <MessageCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Grupo WhatsApp</h3>
                    <p className="text-xs text-white/40 leading-relaxed">
                        Membros do grupo, conversão, churn e renovações
                    </p>
                </button>

                <button
                    onClick={() => onSelect('engagement')}
                    className="group relative bg-slate-800/60 border border-white/10 hover:border-rose-500/40 rounded-2xl p-6 text-left transition-all hover:bg-slate-800/80 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-4 group-hover:bg-rose-500/30 transition-colors">
                        <Heart className="w-6 h-6 text-rose-400" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Engajamento</h3>
                    <p className="text-xs text-white/40 leading-relaxed">
                        Likes, matches, perfis e atividade de mensagens
                    </p>
                    {menuStats?.newProfiles ? (
                        <span className="absolute top-4 right-4 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            +{menuStats.newProfiles} HOJE
                        </span>
                    ) : null}
                </button>

                <button
                    onClick={() => onSelect('campaigns')}
                    className="group bg-slate-800/60 border border-white/10 hover:border-indigo-500/40 rounded-2xl p-6 text-left transition-all hover:bg-slate-800/80 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:bg-indigo-500/30 transition-colors">
                        <Send className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Campanhas Push</h3>
                    <p className="text-xs text-white/40 leading-relaxed">
                        Métricas de opt-in e disparo de notificações em massa
                    </p>
                </button>

                <button
                    onClick={() => onSelect('audit')}
                    className="group bg-slate-800/60 border border-white/10 hover:border-blue-500/40 rounded-2xl p-6 text-left transition-all hover:bg-slate-800/80 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                        <HistoryIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Auditoria</h3>
                    <p className="text-xs text-white/40 leading-relaxed">
                        Histórico de ações dos administradores e segurança
                    </p>
                </button>
            </div>
        </div>
    );
}

// ── Reports Panel ────────────────────────────────────────────────────────────
function ReportsPanel() {
    const queryClient = useQueryClient();
    const { logAction } = useAdminAuditLog();
    const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const { data: reports = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-reports', filter],
        queryFn: async () => {
            let query = supabase
                .from('user_reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') query = query.eq('status', filter);

            const { data: rawReports, error } = await query;
            if (error) throw error;

            if (rawReports && rawReports.length > 0) {
                logAction('view_reports', 'user_reports', undefined, { filter });
            }

            const enriched = await Promise.all(
                (rawReports || []).map(async (r) => {
                    const [reporterRes, reportedRes, countRes] = await Promise.all([
                        supabase.from('profiles').select('display_name').eq('user_id', r.reporter_id).single(),
                        supabase.from('profiles').select('display_name, avatar_url, suspended_until').eq('user_id', r.reported_id).single(),
                        supabase.from('user_reports').select('id', { count: 'exact' }).eq('reported_id', r.reported_id),
                    ]);
                    return {
                        ...r,
                        reporter_name: reporterRes.data?.display_name ?? 'Desconhecido',
                        reported_name: reportedRes.data?.display_name ?? 'Desconhecido',
                        reported_avatar: reportedRes.data?.avatar_url,
                        suspended_until: reportedRes.data?.suspended_until,
                        report_count: countRes.count ?? 0,
                    } as Report;
                })
            );
            return enriched;
        },
    });

    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase
                .from('user_reports')
                .update({ status, reviewed_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            logAction(status === 'resolved' ? 'view_reports' : 'delete_report', 'user_reports', id, { status });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
    });

    const suspendUser = useMutation({
        mutationFn: async ({ reportId, userId }: { reportId: string; userId: string }) => {
            const suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const [profileRes, reportRes] = await Promise.all([
                supabase.from('profiles').update({ suspended_until: suspendedUntil, is_active: false }).eq('user_id', userId),
                supabase.from('user_reports').update({ status: 'suspended', reviewed_at: new Date().toISOString() }).eq('id', reportId),
            ]);
            if (profileRes.error) throw profileRes.error;
            if (reportRes.error) throw reportRes.error;
            logAction('suspend_user', 'profiles', userId, { reportId, duration: '7 days' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
            toast.success('Usuário suspenso por 7 dias');
        },
        onError: () => toast.error('Erro ao suspender usuário'),
    });

    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        dismissed: reports.filter(r => r.status === 'dismissed').length,
    };

    const isSuspended = (r: Report) =>
        r.suspended_until && new Date(r.suspended_until) > new Date();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <NumCard label="Total (filtro)" value={stats.total} icon={<Eye className="w-5 h-5" />} color="bg-blue-500/20 text-blue-400" />
                <NumCard label="Pendentes" value={stats.pending} icon={<Clock className="w-5 h-5" />} color="bg-yellow-500/20 text-yellow-400" />
                <NumCard label="Resolvidos" value={stats.resolved} icon={<CheckCircle className="w-5 h-5" />} color="bg-green-500/20 text-green-400" />
                <NumCard label="Ignorados" value={stats.dismissed} icon={<XCircle className="w-5 h-5" />} color="bg-slate-500/20 text-slate-400" />
            </div>

            <div className="flex gap-2 flex-wrap items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    {(['all', 'pending', 'resolved', 'dismissed'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${filter === tab
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {tab === 'all' ? 'Todas' : STATUS_CONFIG[tab]?.label ?? tab}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => refetch()}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                    <RefreshCw className="w-4 h-4 text-white/60" />
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-6 h-6 animate-spin text-white/30" />
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-20 text-white/30">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhuma denúncia encontrada</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reports.map(report => {
                        const isExpanded = expandedId === report.id;
                        const suspended = isSuspended(report);

                        return (
                            <div key={report.id} className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
                                <div
                                    className="p-4 flex items-start gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                                >
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                                        {report.reported_avatar
                                            ? <img src={report.reported_avatar} alt="" className="w-full h-full object-cover" />
                                            : <User className="w-5 h-5 text-white/40" />
                                        }
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-sm truncate">{report.reported_name}</span>
                                            {(report.report_count ?? 0) > 1 && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-400/30">
                                                    {report.report_count} denúncias
                                                </span>
                                            )}
                                            {suspended && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600/20 text-red-300 border border-red-500/30">
                                                    🔴 Suspenso até {format(new Date(report.suspended_until!), 'dd/MM', { locale: ptBR })}
                                                </span>
                                            )}
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG]?.color ?? ''}`}>
                                                {STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG]?.label ?? report.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                                            <span className="flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                {REASON_LABELS[report.reason] ?? report.reason}
                                            </span>
                                            <span>·</span>
                                            <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: ptBR })}</span>
                                        </div>
                                    </div>

                                    <button className="shrink-0 text-white/30 mt-1">
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-white/10 p-4 space-y-4 bg-slate-900/40">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="bg-white/5 rounded-xl p-3">
                                                <p className="text-xs text-white/40 mb-1">Denunciante</p>
                                                <p className="text-sm font-medium">{report.reporter_name}</p>
                                                <p className="text-xs text-white/30 mt-0.5 font-mono">{report.reporter_id?.slice(0, 8)}...</p>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-3">
                                                <p className="text-xs text-white/40 mb-1">Denunciado</p>
                                                <p className="text-sm font-medium">{report.reported_name}</p>
                                                <p className="text-xs text-white/30 mt-0.5 font-mono">{report.reported_id?.slice(0, 8)}...</p>
                                            </div>
                                        </div>

                                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                                            <p className="text-xs text-red-300/70 mb-0.5">Total de denúncias recebidas por este perfil</p>
                                            <p className="text-2xl font-bold text-red-400">{report.report_count}</p>
                                        </div>

                                        {report.description && (
                                            <div className="bg-white/5 rounded-xl p-3">
                                                <p className="text-xs text-white/40 mb-1">Descrição adicional</p>
                                                <p className="text-sm text-white/70 leading-relaxed">{report.description}</p>
                                            </div>
                                        )}

                                        <div className="text-xs text-white/30 flex gap-4 flex-wrap">
                                            <span>Criada em: {format(new Date(report.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                                            {report.reviewed_at && <span>Revisada em: {format(new Date(report.reviewed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>}
                                        </div>

                                        {suspended && (
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                                                <p className="text-xs text-red-300 font-semibold">
                                                    🔴 Conta suspensa até {format(new Date(report.suspended_until!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-2 flex-wrap pt-1">
                                            {report.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus.mutate({ id: report.id, status: 'resolved' })}
                                                        disabled={updateStatus.isPending}
                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                                    >
                                                        <CheckCircle className="w-4 h-4" /> Resolver
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus.mutate({ id: report.id, status: 'dismissed' })}
                                                        disabled={updateStatus.isPending}
                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-slate-500/20 text-slate-300 border border-slate-400/30 hover:bg-slate-500/30 transition-colors disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-4 h-4" /> Ignorar
                                                    </button>
                                                    {!suspended && (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Suspender ${report.reported_name} por 7 dias?`)) {
                                                                    suspendUser.mutate({ reportId: report.id, userId: report.reported_id });
                                                                }
                                                            }}
                                                            disabled={suspendUser.isPending}
                                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                                        >
                                                            <Ban className="w-4 h-4" /> Suspender 7 dias
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            {report.status !== 'pending' && (
                                                <button
                                                    onClick={() => updateStatus.mutate({ id: report.id, status: 'pending' })}
                                                    disabled={updateStatus.isPending}
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
                                                >
                                                    <Clock className="w-4 h-4" /> Reabrir
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Root ─────────────────────────────────────────────────────────────────────
const SECTION_META: Record<Exclude<Section, 'menu'>, { label: string; icon: React.ReactNode; accent: string }> = {
    reports: { label: 'Denúncias', icon: <AlertTriangle className="w-5 h-5 text-red-400" />, accent: 'bg-red-500/20 border-red-500/30' },
    financial: { label: 'Faturamento', icon: <DollarSign className="w-5 h-5 text-amber-400" />, accent: 'bg-amber-500/20 border-amber-500/30' },
    audit: { label: 'Auditoria', icon: <HistoryIcon className="w-5 h-5 text-blue-400" />, accent: 'bg-blue-500/20 border-blue-500/30' },
    campaigns: { label: 'Campanhas Push', icon: <Send className="w-5 h-5 text-indigo-400" />, accent: 'bg-indigo-500/20 border-indigo-500/30' },
    engagement: { label: 'Engajamento', icon: <Heart className="w-5 h-5 text-rose-400" />, accent: 'bg-rose-500/20 border-rose-500/30' },
};

export default function AdminPanel() {
    const [section, setSection] = useState<Section>('menu');
    const [showLegend, setShowLegend] = useState(false);
    const [showMetricsGuide, setShowMetricsGuide] = useState(false);
    const [showEngagementGuide, setShowEngagementGuide] = useState(false);

    return (
        <div className="h-screen overflow-y-auto bg-[#0f172a] text-white">
            <div className="bg-slate-900/80 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
                    {section !== 'menu' && (
                        <button
                            onClick={() => setSection('menu')}
                            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4 text-white/60" />
                        </button>
                    )}

                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${section === 'menu' ? 'bg-red-500/20 border-red-500/30' : SECTION_META[section]?.accent}`}>
                        {section === 'menu'
                            ? <Shield className="w-5 h-5 text-red-400" />
                            : SECTION_META[section]?.icon
                        }
                    </div>

                    <div>
                        <h1 className="font-bold text-lg leading-tight">
                            {section === 'menu' ? 'Painel Admin' : SECTION_META[section]?.label}
                        </h1>
                        <p className="text-xs text-white/40">Encontro com Fé</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {section === 'financial' && (
                            <>
                                <button
                                    onClick={() => setShowMetricsGuide(true)}
                                    className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center hover:bg-yellow-500/30 transition-colors"
                                    title="Importância das Métricas"
                                >
                                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                                </button>
                                <button
                                    onClick={() => setShowLegend(true)}
                                    className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center hover:bg-amber-500/30 transition-colors"
                                    title="Legenda dos planos"
                                >
                                    <HelpCircle className="w-4 h-4 text-amber-400" />
                                </button>
                            </>
                        )}
                        {section === 'engagement' && (
                            <button
                                onClick={() => setShowEngagementGuide(true)}
                                className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center hover:bg-yellow-500/30 transition-colors"
                                title="Importância das Métricas"
                            >
                                <Lightbulb className="w-4 h-4 text-yellow-400" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6">
                {section === 'menu' && <MainMenu onSelect={setSection} />}
                {section === 'reports' && <ReportsPanel />}
                {section === 'financial' && <FinancialPanel onOpenLegend={() => setShowLegend(true)} />}
                {section === 'audit' && <AuditLogPanel />}
                {section === 'campaigns' && <CampaignPanel />}
                {section === 'engagement' && <EngagementPanel />}
            </div>

            <PlanLegendDialog open={showLegend} onClose={() => setShowLegend(false)} />
            <MetricsImportanceDialog open={showMetricsGuide} onClose={() => setShowMetricsGuide(false)} />
            <EngagementImportanceDialog open={showEngagementGuide} onClose={() => setShowEngagementGuide(false)} />
        </div>
    );
}
