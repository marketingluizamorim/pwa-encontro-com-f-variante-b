import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell, Send, Users, Globe, MessageSquare, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type PlanFilter = 'all' | 'free' | 'bronze' | 'silver' | 'gold';

export default function CampaignPanel() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [url, setUrl] = useState('/app/discover');
    const [planFilter, setPlanFilter] = useState<PlanFilter>('all');

    // 1. Fetch Push Subscription Stats with filtering
    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['admin-push-stats', planFilter],
        queryFn: async () => {
            let query = supabase
                .from('push_subscriptions' as any)
                .select('user_id', { count: 'exact', head: false });

            // If filtering by plan, we need to join with user_subscriptions
            if (planFilter !== 'all') {
                const { data: subs, error: subsError } = await supabase
                    .from('user_subscriptions' as any)
                    .select('user_id, plan_id, is_active');

                if (subsError) throw subsError;

                const { data: allPush, error: pushError } = await supabase
                    .from('push_subscriptions' as any)
                    .select('user_id');

                if (pushError) throw pushError;

                const pushUserIds = new Set(allPush.map((p: any) => p.user_id));
                const activeSubs = subs.filter((s: any) => s.is_active);

                let filteredCount = 0;
                if (planFilter === 'free') {
                    const subUserIds = new Set(activeSubs.map((s: any) => s.user_id));
                    filteredCount = [...pushUserIds].filter(id => !subUserIds.has(id)).length;
                } else {
                    const filteredUsers = activeSubs.filter((s: any) => s.plan_id === planFilter);
                    filteredCount = filteredUsers.filter((u: any) => pushUserIds.has(u.user_id)).length;
                }

                return { totalSubscriptions: filteredCount };
            }

            const { count, error } = await query;
            if (error) throw error;
            return { totalSubscriptions: count || 0 };
        },
    });

    // 2. Mutation to trigger mass push
    const sendCampaignMutation = useMutation({
        mutationFn: async () => {
            if (!title || !body) throw new Error('Título e mensagem são obrigatórios');

            const { data, error } = await (supabase as any).rpc('send_mass_push', {
                p_title: title,
                p_body: body,
                p_url: url || '/',
                p_plan_filter: planFilter
            });

            if (error) throw error;
            return data;
        },
        onSuccess: (data: any) => {
            toast.success(`Campanha enviada com sucesso para ${data?.users_notified || 0} usuários!`);
            setTitle('');
            setBody('');
            setUrl('/app/discover');
        },
        onError: (error: any) => {
            console.error('Error sending campaign:', error);
            toast.error(error.message || 'Erro ao enviar campanha');
        },
    });

    const handleSend = async () => {
        if (!title || !body) {
            toast.error('Preencha o título e a mensagem');
            return;
        }

        const planLabel = {
            all: 'todos os',
            free: 'usuários gratuitos',
            bronze: 'usuários Bronze',
            silver: 'usuários Silver',
            gold: 'usuários Gold'
        }[planFilter];

        if (confirm(`Deseja enviar esta notificação para ${stats?.totalSubscriptions || 0} ${planLabel}?`)) {
            sendCampaignMutation.mutate();
        }
    };

    return (
        <div className="space-y-6">
            {/* Metric Card & Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                        <Users className="w-7 h-7 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-white">
                            {isLoadingStats ? '...' : stats?.totalSubscriptions}
                        </p>
                        <p className="text-sm text-white/50">Audiência Filtrada</p>
                    </div>
                </div>

                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 flex flex-col justify-center gap-2">
                    <label className="text-xs text-white/50 flex items-center gap-1.5 uppercase font-bold tracking-wider">
                        <Filter className="w-3 h-3" /> Filtrar por Plano
                    </label>
                    <Select value={planFilter} onValueChange={(v) => setPlanFilter(v as PlanFilter)}>
                        <SelectTrigger className="bg-slate-900/50 border-white/10 h-10">
                            <SelectValue placeholder="Selecione o plano" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                            <SelectItem value="all">Todos os Usuários</SelectItem>
                            <SelectItem value="free">Usuários Gratuitos</SelectItem>
                            <SelectItem value="bronze">Plano Bronze</SelectItem>
                            <SelectItem value="silver">Plano Prata (Silver)</SelectItem>
                            <SelectItem value="gold">Plano Ouro (Gold)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <Bell className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm text-white font-medium">Segmentação ativa</p>
                        <p className="text-xs text-white/40 mt-1 leading-relaxed">
                            Apenas usuários com push habilitado do plano selecionado receberão.
                        </p>
                    </div>
                </div>
            </div>

            {/* Campaign Form */}
            <div className="bg-slate-800/60 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <Send className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg">Nova Campanha Push</h3>
                    </div>
                    <p className="text-xs text-white/40 mt-1">Dispare uma notificação escrita para o segmento selecionado</p>
                </div>

                <div className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Título da Notificação
                        </label>
                        <Input
                            placeholder="Ex: Oferta Especial! 🎁"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-slate-900/50 border-white/10 rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Mensagem (Corpo)
                        </label>
                        <Textarea
                            placeholder="Descreva o conteúdo da notificação aqui..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="bg-slate-900/50 border-white/10 rounded-xl min-h-[100px] resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">URL de Destino (opcional)</label>
                        <Input
                            placeholder="/app/plans"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="bg-slate-900/50 border-white/10 rounded-xl font-mono text-sm"
                        />
                        <p className="text-[10px] text-white/30">Onde o usuário cairá ao clicar na notificação</p>
                    </div>

                    <div className="pt-4">
                        <Button
                            onClick={handleSend}
                            disabled={sendCampaignMutation.isPending || stats?.totalSubscriptions === 0}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            {sendCampaignMutation.isPending ? (
                                <>Aguarde...</>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" /> Disparar para {stats?.totalSubscriptions || 0} usuários
                                </>
                            )}
                        </Button>
                        {stats?.totalSubscriptions === 0 && (
                            <p className="text-center text-red-400/60 text-[11px] mt-2">Nenhum usuário no segmento selecionado com push ativo.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

