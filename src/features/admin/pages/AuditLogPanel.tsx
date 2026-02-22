import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    History, User, Shield, Search, Filter,
    RefreshCw, Calendar, ArrowRight, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface AuditLog {
    id: string;
    admin_id: string;
    action: string;
    resource: string;
    target_id: string | null;
    details: any;
    created_at: string;
    admin_name?: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    view_financials: { label: 'Viu Financeiro', color: 'text-amber-400' },
    view_reports: { label: 'Viu Denúncias', color: 'text-red-400' },
    view_user_details: { label: 'Viu Perfil', color: 'text-blue-400' },
    suspend_user: { label: 'Suspendeu Usuário', color: 'text-rose-600 font-black' },
    delete_report: { label: 'Removeu Denúncia', color: 'text-slate-400' },
    update_subscription: { label: 'Alterou Assinatura', color: 'text-emerald-400' },
};

const RESOURCE_LABELS: Record<string, string> = {
    purchases: 'Faturamento',
    user_reports: 'Denúncias',
    profiles: 'Perfis',
    user_subscriptions: 'Assinaturas',
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function AuditLogPanel() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterResource, setFilterResource] = useState<string>('all');

    const { data: logs = [], isLoading, refetch } = useQuery<AuditLog[]>({
        queryKey: ['admin-audit-logs', filterResource],
        queryFn: async (): Promise<AuditLog[]> => {
            let query = supabase
                .from('admin_audit_logs' as any)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (filterResource !== 'all') {
                query = query.eq('resource', filterResource);
            }

            const { data, error } = await (query as any);
            if (error) throw error;

            // Enriquecer com nomes dos admins
            const enriched = await Promise.all(
                (data || []).map(async (log: any) => {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('display_name')
                        .eq('user_id', log.admin_id)
                        .single();

                    return {
                        ...log,
                        admin_name: profile?.display_name || 'Admin Desconhecido',
                    };
                })
            );

            return enriched;
        },
    });

    const filteredLogs = logs.filter(log =>
        log.admin_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white">{logs.length}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Ações Recentes</p>
                    </div>
                </div>
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white">Audit Trail</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Segurança Ativa</p>
                    </div>
                </div>
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <History className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white">100%</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Monitorado</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                        type="text"
                        placeholder="Buscar por admin ou ação..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterResource}
                        onChange={(e) => setFilterResource(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none"
                    >
                        <option value="all" className="bg-[#0f172a]">Todos os Recursos</option>
                        <option value="purchases" className="bg-[#0f172a]">Faturamento</option>
                        <option value="user_reports" className="bg-[#0f172a]">Denúncias</option>
                        <option value="profiles" className="bg-[#0f172a]">Perfis</option>
                    </select>
                    <button
                        onClick={() => refetch()}
                        className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw className={cn("w-4 h-4 text-white/60", isLoading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Logs List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-6 h-6 animate-spin text-white/30" />
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="text-center py-20 text-white/30 bg-slate-800/20 border border-dashed border-white/5 rounded-3xl">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Nenhuma atividade registrada ainda</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredLogs.map((log) => (
                        <div key={log.id} className="bg-slate-800/40 border border-white/5 rounded-2xl p-4 hover:bg-slate-800/60 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center shrink-0 border border-white/10">
                                        <User className="w-5 h-5 text-white/40" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-sm text-white">
                                                {log.admin_name}
                                            </span>
                                            <ArrowRight className="w-3 h-3 text-white/20" />
                                            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/5", ACTION_LABELS[log.action]?.color)}>
                                                {ACTION_LABELS[log.action]?.label || log.action}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest font-medium">
                                            Recurso: <span className="text-white/50">{RESOURCE_LABELS[log.resource] || log.resource}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] text-white/40 flex items-center justify-end gap-1 font-medium">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(log.created_at), "HH:mm:ss")}
                                    </p>
                                    <p className="text-[10px] text-white/20 mt-0.5">
                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                                    </p>
                                </div>
                            </div>

                            {/* Detailed Toggle/Info */}
                            {(log.details || log.target_id) && (
                                <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {log.target_id && (
                                        <div>
                                            <p className="text-[9px] text-white/20 uppercase font-black mb-1">ID do Alvo</p>
                                            <p className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-1 rounded truncate">
                                                {log.target_id}
                                            </p>
                                        </div>
                                    )}
                                    {log.details && (
                                        <div className="sm:col-start-1 sm:col-end-3">
                                            <p className="text-[9px] text-white/20 uppercase font-black mb-1">Contexto adicional</p>
                                            <div className="bg-black/20 rounded-lg p-2 overflow-x-auto">
                                                <pre className="text-[10px] text-white/50 font-mono">
                                                    {JSON.stringify(log.details, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    <p className="text-[10px] text-center text-white/20 py-4 italic">
                        Mostrando as últimas 100 ações de auditoria. Para logs completos, consulte o Supabase.
                    </p>
                </div>
            )}
        </div>
    );
}
