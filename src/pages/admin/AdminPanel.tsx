import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Shield, AlertTriangle, CheckCircle, XCircle, Clock,
    User, ChevronDown, ChevronUp, RefreshCw, Ban, Eye
} from 'lucide-react';

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

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
    return (
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/50 mt-0.5">{label}</p>
            </div>
        </div>
    );
}

export default function AdminPanel() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Fetch reports joined with profile data
    const { data: reports = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-reports', filter],
        queryFn: async () => {
            let query = supabase
                .from('user_reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data: rawReports, error } = await query;
            if (error) throw error;

            // Enrich with profile data
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

    // Mutation: update report status
    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase
                .from('user_reports')
                .update({ status, reviewed_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
        },
    });

    // Mutation: suspend user for 7 days
    const suspendUser = useMutation({
        mutationFn: async ({ reportId, userId }: { reportId: string; userId: string }) => {
            const suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const [profileRes, reportRes] = await Promise.all([
                supabase.from('profiles').update({ suspended_until: suspendedUntil, is_active: false }).eq('user_id', userId),
                supabase.from('user_reports').update({ status: 'suspended', reviewed_at: new Date().toISOString() }).eq('id', reportId),
            ]);
            if (profileRes.error) throw profileRes.error;
            if (reportRes.error) throw reportRes.error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
            toast.success('Usuário suspenso por 7 dias', { description: 'A conta foi suspensa e será reativada automaticamente.' });
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
        <div className="min-h-screen bg-[#0f172a] text-white">
            {/* Header */}
            <div className="bg-slate-900/80 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Painel Admin</h1>
                            <p className="text-xs text-white/40">Encontro com Fé — Moderação</p>
                        </div>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 text-white/60" />
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Total (filtro)" value={stats.total} icon={<Eye className="w-5 h-5" />} color="bg-blue-500/20 text-blue-400" />
                    <StatCard label="Pendentes" value={stats.pending} icon={<Clock className="w-5 h-5" />} color="bg-yellow-500/20 text-yellow-400" />
                    <StatCard label="Resolvidos" value={stats.resolved} icon={<CheckCircle className="w-5 h-5" />} color="bg-green-500/20 text-green-400" />
                    <StatCard label="Ignorados" value={stats.dismissed} icon={<XCircle className="w-5 h-5" />} color="bg-slate-500/20 text-slate-400" />
                </div>

                {/* Filter tabs */}
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

                {/* Reports list */}
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
                                <div
                                    key={report.id}
                                    className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden transition-all"
                                >
                                    {/* Card header */}
                                    <div
                                        className="p-4 flex items-start gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                                        onClick={() => setExpandedId(isExpanded ? null : report.id)}
                                    >
                                        {/* Avatar / initials */}
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                                            {report.reported_avatar ? (
                                                <img src={report.reported_avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-white/40" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-sm truncate">{report.reported_name}</span>

                                                {/* Report count badge */}
                                                {(report.report_count ?? 0) > 1 && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-400/30">
                                                        {report.report_count} denúncias
                                                    </span>
                                                )}

                                                {/* Suspended badge */}
                                                {suspended && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600/20 text-red-300 border border-red-500/30">
                                                        🔴 Suspenso até {format(new Date(report.suspended_until!), 'dd/MM', { locale: ptBR })}
                                                    </span>
                                                )}

                                                {/* Status badge */}
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CONFIG[report.status]?.color ?? ''}`}>
                                                    {STATUS_CONFIG[report.status]?.label ?? report.status}
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

                                    {/* Expanded details */}
                                    {isExpanded && (
                                        <div className="border-t border-white/10 p-4 space-y-4 bg-slate-900/40">
                                            {/* Info grid */}
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

                                            {/* Total reports for this user */}
                                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                                                <p className="text-xs text-red-300/70 mb-0.5">Total de denúncias recebidas por este perfil</p>
                                                <p className="text-2xl font-bold text-red-400">{report.report_count}</p>
                                            </div>

                                            {/* Description */}
                                            {report.description && (
                                                <div className="bg-white/5 rounded-xl p-3">
                                                    <p className="text-xs text-white/40 mb-1">Descrição adicional</p>
                                                    <p className="text-sm text-white/70 leading-relaxed">{report.description}</p>
                                                </div>
                                            )}

                                            {/* Dates */}
                                            <div className="text-xs text-white/30 flex gap-4 flex-wrap">
                                                <span>Criada em: {format(new Date(report.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                                                {report.reviewed_at && (
                                                    <span>Revisada em: {format(new Date(report.reviewed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                                                )}
                                            </div>

                                            {/* Suspension info */}
                                            {suspended && (
                                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                                                    <p className="text-xs text-red-300 font-semibold">
                                                        🔴 Conta suspensa até {format(new Date(report.suspended_until!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2 flex-wrap pt-1">
                                                {report.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus.mutate({ id: report.id, status: 'resolved' })}
                                                            disabled={updateStatus.isPending}
                                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Resolver
                                                        </button>

                                                        <button
                                                            onClick={() => updateStatus.mutate({ id: report.id, status: 'dismissed' })}
                                                            disabled={updateStatus.isPending}
                                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-slate-500/20 text-slate-300 border border-slate-400/30 hover:bg-slate-500/30 transition-colors disabled:opacity-50"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Ignorar
                                                        </button>

                                                        {!suspended && (
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Suspender ${report.reported_name} por 7 dias? Esta ação irá desativar a conta temporariamente.`)) {
                                                                        suspendUser.mutate({ reportId: report.id, userId: report.reported_id });
                                                                    }
                                                                }}
                                                                disabled={suspendUser.isPending}
                                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                                Suspender 7 dias
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
                                                        <Clock className="w-4 h-4" />
                                                        Reabrir
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
        </div>
    );
}
