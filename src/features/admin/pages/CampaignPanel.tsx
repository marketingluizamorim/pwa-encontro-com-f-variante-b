import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell, Send, Users, Globe, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CampaignPanel() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [url, setUrl] = useState('/app/discover');
    const [isSending, setIsSending] = useState(false);

    // 1. Fetch Push Subscription Stats
    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['admin-push-stats'],
        queryFn: async () => {
            const { count, error } = await supabase
                .from('push_subscriptions' as any)
                .select('*', { count: 'exact', head: true });

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
                p_url: url || '/'
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

        if (confirm(`Deseja enviar esta notificação para ${stats?.totalSubscriptions || 0} usuários?`)) {
            sendCampaignMutation.mutate();
        }
    };

    return (
        <div className="space-y-6">
            {/* Metric Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                        <Users className="w-7 h-7 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-white">
                            {isLoadingStats ? '...' : stats?.totalSubscriptions}
                        </p>
                        <p className="text-sm text-white/50">Usuários com Push Ativo</p>
                    </div>
                </div>

                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <Bell className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm text-white font-medium">Auto-notificações ativas</p>
                        <p className="text-xs text-white/40 mt-1 leading-relaxed">
                            Avisos automáticos de novas mensagens e matches estão operantes.
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
                    <p className="text-xs text-white/40 mt-1">Dispare uma notificação escrita para toda a base</p>
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
                            <p className="text-center text-red-400/60 text-[11px] mt-2">Nenhum usuário com push ativo para receber.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
