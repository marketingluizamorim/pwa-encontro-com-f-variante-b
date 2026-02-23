import { Drawer } from 'vaul';
import { X, ChevronLeft, Flag, Settings, ShieldCheck, ExternalLink, ShieldAlert, MessageCircle, Eye, EyeOff, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SafetyToolkitDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type ViewType = 'menu' | 'report' | 'settings' | 'center' | 'critical';

export function SafetyToolkitDrawer({ open, onOpenChange }: SafetyToolkitDrawerProps) {
    const [view, setView] = useState<ViewType>('menu');
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        show_read_receipts: true,
        show_online_status: true,
        show_last_active: true
    });
    const [isSaving, setIsSaving] = useState(false);

    // Reset view when drawer closes
    useEffect(() => {
        if (!open) {
            setTimeout(() => setView('menu'), 300);
        }
    }, [open]);

    // Fetch settings when opening settings view
    useEffect(() => {
        if (view === 'settings' && user) {
            const fetchSettings = async () => {
                const { supabase } = await import('@/integrations/supabase/client');
                const { data, error } = await supabase
                    .from('profiles')
                    .select('show_read_receipts, show_online_status, show_last_active')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    // Use type assertion to bypass lint errors if columns are missing from generated types but exist in DB
                    const profile = data as Record<string, unknown>;
                    setSettings({
                        show_read_receipts: (profile.show_read_receipts as boolean) ?? true,
                        show_online_status: (profile.show_online_status as boolean) ?? true,
                        show_last_active: (profile.show_last_active as boolean) ?? true,
                    });
                }
            };
            fetchSettings();
        }
    }, [view, user]);

    const updateSetting = async (key: keyof typeof settings, value: boolean) => {
        if (!user) return;

        // Optimistic update
        const previousSettings = { ...settings };
        setSettings({ ...settings, [key]: value });

        setIsSaving(true);
        const { supabase } = await import('@/integrations/supabase/client');
        const { error } = await supabase
            .from('profiles')
            .update({ [key]: value } as Record<string, unknown>)
            .eq('user_id', user.id);

        if (error) {
            toast.error('Erro ao salvar configuração', { style: { marginTop: '50px' } });
            setSettings(previousSettings);
        } else {
            toast.success('Configuração atualizada', { style: { marginTop: '50px' } });
        }
        setIsSaving(false);
    };

    const renderContent = () => {
        switch (view) {
            case 'report':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Flag className="w-5 h-5 text-pink-500" />
                            Guia: Como denunciar
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                                <p className="text-sm leading-relaxed">
                                    Sua segurança é nossa prioridade. Se você se sentir desconfortável ou notar comportamento impróprio, denuncie imediatamente.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">1</div>
                                    <p className="text-sm pt-1">Abra a conversa com a pessoa que você deseja denunciar.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">2</div>
                                    <p className="text-sm pt-1">Clique na foto do perfil dela no topo para abrir os detalhes.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">3</div>
                                    <p className="text-sm pt-1">Role até o final e toque em <strong>"Denunciar Usuário"</strong>.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">4</div>
                                    <p className="text-sm pt-1">Escolha o motivo e descreva brevemente o que aconteceu. Nossa equipe revisará em até 24h.</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <p className="text-[12px] text-muted-foreground italic">
                                    * Denúncias são anônimas. A pessoa não saberá quem a denunciou.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'settings':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Settings className="w-5 h-5 text-muted-foreground" />
                            Configurações de Mensagens
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/40 rounded-2xl">
                                <div className="space-y-0.5">
                                    <Label htmlFor="read-receipts" className="text-base font-bold">Confirmação de Leitura</Label>
                                    <p className="text-xs text-muted-foreground">Permitir que outros vejam quando você leu as mensagens.</p>
                                </div>
                                <Switch
                                    id="read-receipts"
                                    checked={settings.show_read_receipts}
                                    onCheckedChange={(val) => updateSetting('show_read_receipts', val)}
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/40 rounded-2xl">
                                <div className="space-y-0.5">
                                    <Label htmlFor="online-status" className="text-base font-bold">Status Online</Label>
                                    <p className="text-xs text-muted-foreground">Mostrar se você está ativo no momento.</p>
                                </div>
                                <Switch
                                    id="online-status"
                                    checked={settings.show_online_status}
                                    onCheckedChange={(val) => updateSetting('show_online_status', val)}
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/40 rounded-2xl">
                                <div className="space-y-0.5">
                                    <Label htmlFor="last-active" className="text-base font-bold">Visto por último</Label>
                                    <p className="text-xs text-muted-foreground">Mostrar a última vez que você abriu o app.</p>
                                </div>
                                <Switch
                                    id="last-active"
                                    checked={settings.show_last_active}
                                    onCheckedChange={(val) => updateSetting('show_last_active', val)}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'critical':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-red-500">
                            <ShieldAlert className="w-5 h-5" />
                            Ajuda em situações críticas
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                                <p className="text-sm font-bold text-red-600 mb-2 underline">Ação Imediata:</p>
                                <p className="text-sm leading-relaxed text-red-700/90 font-medium">
                                    Se você estiver em perigo imediato ou sofrer uma agressão física/ameaça grave, <strong>ligue para as autoridades (190) imediatamente</strong>.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 font-bold text-sm">1</div>
                                    <p className="text-sm pt-1"><strong>Acione as autoridades:</strong> Procure a delegacia mais próxima ou ligue para a polícia.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 font-bold text-sm">2</div>
                                    <p className="text-sm pt-1"><strong>Relate o ocorrido:</strong> Tente manter prints ou evidências do que aconteceu.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 font-bold text-sm">3</div>
                                    <p className="text-sm pt-1"><strong>Contate nosso Suporte:</strong> Após estar em segurança, nos relate o ocorrido pelo WhatsApp para que possamos banir o agressor e tomar as medidas cabíveis.</p>
                                </div>
                            </div>

                            <button
                                onClick={() => window.open('https://wa.me/556298268199', '_blank')}
                                className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-red-500/20"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Relatar ao Suporte Agora
                            </button>
                        </div>
                    </div>
                );

            case 'center':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            Centro de Segurança
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Boas Práticas</h4>
                                <div className="grid gap-3">
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex gap-3">
                                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <p className="text-xs leading-relaxed"><strong>Nunca compartilhe senhas</strong> ou informações financeiras no primeiro chat.</p>
                                    </div>
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex gap-3">
                                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <p className="text-xs leading-relaxed"><strong>Encontros em locais públicos:</strong> Sempre avise amigos ou familiares sobre seu paradeiro.</p>
                                    </div>
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex gap-3">
                                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <p className="text-xs leading-relaxed"><strong>Verifique perfis:</strong> Dê preferência a usuários com perfis completos e fotos claras.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Suporte e Ajuda</h4>
                                <div className="bg-muted/20 border border-border/40 rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => setView('critical')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors border-b border-border/40 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ShieldAlert className="w-5 h-5 text-red-400" />
                                            <span className="text-sm font-medium">Ajuda em situações críticas</span>
                                        </div>
                                        <ChevronLeft className="w-4 h-4 rotate-180 opacity-50" />
                                    </button>
                                    <button
                                        onClick={() => window.open('https://wa.me/556298268199', '_blank')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MessageCircle className="w-5 h-5 text-blue-400" />
                                            <span className="text-sm font-medium">Falar com o Suporte</span>
                                        </div>
                                        <ChevronLeft className="w-4 h-4 rotate-180 opacity-50" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                        <h2 className="text-2xl font-bold px-1">
                            Kit de ferramentas de segurança
                        </h2>

                        <div className="space-y-8 px-1">
                            {/* Report Item */}
                            <button
                                onClick={() => setView('report')}
                                className="flex gap-4 w-full cursor-pointer active:opacity-60 transition-opacity group text-left"
                            >
                                <div className="mt-1">
                                    <i className="ri-flag-fill text-[#FF4D67] text-2xl" />
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-sm tracking-wide uppercase">Denunciar</h4>
                                        <ChevronLeft className="w-4 h-4 rotate-180 opacity-40 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-muted-foreground text-[13px] leading-relaxed">
                                        Denuncie alguém de quem você não é mais um match ou qualquer conteúdo ilegal em nossa plataforma.
                                    </p>
                                </div>
                            </button>

                            {/* Message Settings Item */}
                            <button
                                onClick={() => setView('settings')}
                                className="flex gap-4 w-full cursor-pointer active:opacity-60 transition-opacity group text-left"
                            >
                                <div className="mt-1">
                                    <i className="ri-settings-4-fill text-muted-foreground text-2xl" />
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-sm tracking-wide uppercase">Configurações de mensagens</h4>
                                        <ChevronLeft className="w-4 h-4 rotate-180 opacity-40 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-muted-foreground text-[13px] leading-relaxed">
                                        Configure quem pode ver seu status e confirmações de leitura.
                                    </p>
                                </div>
                            </button>

                            {/* Security Center Item */}
                            <button
                                onClick={() => setView('center')}
                                className="flex gap-4 w-full cursor-pointer active:opacity-60 transition-opacity group text-left"
                            >
                                <div className="mt-1">
                                    <i className="ri-shield-keyhole-fill text-muted-foreground text-2xl" />
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-sm tracking-wide uppercase">Centro de segurança</h4>
                                        <ChevronLeft className="w-4 h-4 rotate-180 opacity-40 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-muted-foreground text-[13px] leading-relaxed">
                                        Encontre as melhores ferramentas e suporte para sua segurança.
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[100]" />
                <Drawer.Content className="bg-background flex flex-col rounded-t-[32px] h-auto max-h-[96vh] fixed bottom-0 left-0 right-0 z-[101] outline-none border-t border-border/50">
                    {/* Handle bar */}
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-4 mb-2 opacity-30 px-1" />

                    <div className="px-6 py-4 flex flex-col min-h-[400px]">
                        {/* Header with Back/Close Button */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => {
                                    if (view !== 'menu') setView('menu');
                                    else onOpenChange(false);
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/40 text-foreground/80 hover:bg-muted/80 transition-colors"
                                aria-label={view === 'menu' ? "Close" : "Back"}
                            >
                                {view === 'menu' ? <X className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5 -ml-0.5" />}
                            </button>
                        </div>

                        <div className="flex-1 pb-10">
                            {renderContent()}
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
