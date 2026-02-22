import { useEffect, useState } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PushNotificationManager() {
    const { subscribeUser, isSubscribing } = usePushNotifications();
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const checkConditions = async () => {
            // 1. Check if PWA is installed (Standalone mode)
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                || (window.navigator as any).standalone === true;

            if (!isStandalone) return;

            // 2. Check for Notification support
            if (!('Notification' in window)) return;

            // 3. Check Location Permission
            try {
                const geoPermission = await navigator.permissions.query({ name: 'geolocation' });
                if (geoPermission.state !== 'granted') return;
            } catch (e) {
                // Some browsers don't support permissions.query for geolocation
                console.debug('Permissions API not fully supported for geolocation', e);
            }

            if (Notification.permission === 'default') {
                const dismissed = localStorage.getItem('push_prompt_dismissed');
                if (!dismissed) {
                    setTimeout(() => setShowPrompt(true), 3000);
                }
            }
        };

        checkConditions();
    }, []);

    const handleSubscribe = async () => {
        await subscribeUser();
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('push_prompt_dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-24 left-4 right-4 z-[100] bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl"
                >
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 text-white/40 hover:text-white"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                            <Bell className="text-primary w-8 h-8 animate-bounce" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-white">Ativar Notificações?</h3>
                            <p className="text-white/60 text-sm">
                                Fique por dentro de novas mensagens, matches e avisos importantes da comunidade.
                            </p>
                        </div>

                        <div className="flex flex-col w-full gap-3 pt-2">
                            <Button
                                onClick={handleSubscribe}
                                disabled={isSubscribing}
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold"
                            >
                                {isSubscribing ? 'Ativando...' : 'Sim, quero ser notificado'}
                            </Button>
                            <button
                                onClick={handleDismiss}
                                className="text-white/40 text-sm font-medium hover:text-white/60"
                            >
                                Agora não
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
