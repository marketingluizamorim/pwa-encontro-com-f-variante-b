import { useEffect, useState } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

export function PushNotificationManager() {
    const { user } = useAuth();
    const { subscribeUser, isSubscribing } = usePushNotifications();
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const checkConditions = async () => {
            // 1. Check if user is logged in
            if (!user) return;

            // 2. Check if PWA is installed (Standalone mode)
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                || (window.navigator as any).standalone === true;

            if (!isStandalone) return;

            // 3. Check for Notification support
            if (!('Notification' in window)) return;

            // 4. Check Location Permission
            try {
                const geoPermission = await navigator.permissions.query({ name: 'geolocation' });
                if (geoPermission.state !== 'granted') return;
            } catch (e) {
                console.debug('Permissions API not fully supported for geolocation', e);
            }

            if (Notification.permission === 'default') {
                const dismissed = localStorage.getItem('push_prompt_dismissed');
                if (!dismissed) {
                    // 30 seconds delay as requested
                    setTimeout(() => setShowPrompt(true), 30000);
                }
            }
        };

        checkConditions();
    }, [user]);

    const handleSubscribe = async () => {
        await subscribeUser();
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('push_prompt_dismissed', 'true');
    };

    const handleBackdropClick = () => {
        triggerHaptic('light');
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleBackdropClick}
                    />

                    {/* Centered Modal */}
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none">
                        <motion.div
                            className="relative w-full max-w-[320px] bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-6 pointer-events-auto"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        >
                            <button
                                onClick={handleDismiss}
                                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-12 h-12 bg-primary/15 border border-primary/30 rounded-full flex items-center justify-center">
                                    <Bell className="text-primary w-6 h-6 animate-pulse" />
                                </div>

                                <div className="space-y-1.5">
                                    <h3 className="text-lg font-semibold text-white">Ativar Notificações?</h3>
                                    <p className="text-white/60 text-xs leading-relaxed">
                                        Fique por dentro de novas mensagens, conexões e avisos importantes da comunidade.
                                    </p>
                                </div>

                                <div className="flex flex-col w-full gap-2 pt-2">
                                    <Button
                                        onClick={handleSubscribe}
                                        disabled={isSubscribing}
                                        className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all active:scale-95"
                                    >
                                        {isSubscribing ? 'Ativando...' : 'Sim, quero ser notificado'}
                                    </Button>
                                    <button
                                        onClick={handleDismiss}
                                        className="py-2 text-white/40 text-xs font-medium hover:text-white/60 transition-colors"
                                    >
                                        Agora não
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
