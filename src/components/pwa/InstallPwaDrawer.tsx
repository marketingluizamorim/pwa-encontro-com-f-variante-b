import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { Share, PlusSquare, Download } from 'lucide-react';

interface InstallPwaDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: () => void;
}

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPwaDrawer({ open, onOpenChange, onComplete }: InstallPwaDrawerProps) {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already in standalone mode
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone: boolean }).standalone;
        setIsStandalone(isStandaloneMode);

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));

        // Capture install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                onComplete();
            }
        } else {
            // If no prompt available (or iOS), just close or show instructions
            if (!isIOS) {
                // Fallback for desktop/other
                onComplete();
            }
        }
    };

    if (isStandalone) {
        return null;
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-[#0f172a] border-t border-white/10 text-white">
                <DrawerHeader className="text-center">
                    <DrawerTitle className="font-serif text-2xl mb-2 text-[#d4af37]">Instale o App</DrawerTitle>
                    <DrawerDescription className="text-white/60">
                        Adicione à sua tela inicial para uma melhor experiência, acesso offline e notificações.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="p-6 flex flex-col items-center gap-6">
                    {/* Icon Preview */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#fcd34d] flex items-center justify-center shadow-lg transform rotate-3">
                        <i className="ri-hearts-fill text-4xl text-[#0f172a]" />
                    </div>

                    {isIOS ? (
                        <div className="w-full bg-white/5 rounded-xl p-4 space-y-4 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-[#d4af37]">1</span>
                                </div>
                                <p className="text-sm">Toque no botão <span className="inline-flex items-center gap-1 mx-1 font-bold"><Share size={14} /> Compartilhar</span> abaixo</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-[#d4af37]">2</span>
                                </div>
                                <p className="text-sm">Selecione <span className="inline-flex items-center gap-1 mx-1 font-bold"><PlusSquare size={14} /> Adicionar à Tela de Início</span></p>
                            </div>
                        </div>
                    ) : (
                        deferredPrompt ? (
                            <div className="text-center text-sm text-white/50">
                                O aplicativo será instalado no seu dispositivo para acesso rápido.
                            </div>
                        ) : (
                            <div className="text-center text-sm text-white/50">
                                Identificamos que você não instalou nosso aplicativo.
                            </div>
                        )
                    )}
                </div>

                <DrawerFooter className="gap-3">
                    {!isIOS && deferredPrompt ? (
                        <Button
                            onClick={handleInstallClick}
                            className="w-full h-12 rounded-xl gradient-button text-white font-bold"
                        >
                            <Download className="mr-2 w-4 h-4" />
                            Instalar Agora
                        </Button>
                    ) : (
                        !isIOS && (
                            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-2 text-center">
                                <p className="text-red-400 text-xs font-medium">
                                    Não foi possível instalar automaticamente. <br />
                                    Verifique se você está usando Chrome ou Edge.
                                </p>
                            </div>
                        )
                    )}

                    <Button variant="ghost" onClick={onComplete} className="text-white/40 hover:text-white">
                        {isIOS ? 'Entendi, já fiz isso' : 'Continuar no Navegador'}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
