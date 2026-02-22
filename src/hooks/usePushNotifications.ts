import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = 'BHCl9qd0Bl1JrjW0Im3vkRMZdUuej-OxC6q6f4OUo2yuTd3f7Pn5Cb41JSoo2vPS8Lmk_Fj5TsthVE0WCh87t4Kk';

export function usePushNotifications() {
    const { user } = useAuth();
    const [isSubscribing, setIsSubscribing] = useState(false);

    const urlBase64ToUint8Array = (base64String: string) => {
        const str = base64String.trim();
        const padding = '='.repeat((4 - (str.length % 4)) % 4);
        const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribeUser = useCallback(async () => {
        if (!user) return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push messaging is not supported');
            return;
        }

        setIsSubscribing(true);
        try {
            const registration = await navigator.serviceWorker.ready;

            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Permissão negada para notificações');
            }

            // Subscribe
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            // Save to Supabase
            const { endpoint, keys } = subscription.toJSON();
            if (!endpoint || !keys?.auth || !keys?.p256dh) {
                throw new Error('Falha ao obter chaves da inscrição');
            }

            const { error } = await supabase
                .from('push_subscriptions' as any)
                .upsert({
                    user_id: user.id,
                    endpoint,
                    auth: keys.auth,
                    p256dh: keys.p256dh,
                }, { onConflict: 'endpoint' });

            if (error) throw error;

            toast.success('Notificações ativadas com sucesso!');
        } catch (error: any) {
            console.error('Error subscribing to push:', error);
            toast.error(error.message || 'Erro ao ativar notificações');
        } finally {
            setIsSubscribing(false);
        }
    }, [user]);

    const unsubscribeUser = useCallback(async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();

                // Remove from Supabase
                const { endpoint } = subscription.toJSON();
                if (endpoint) {
                    await supabase
                        .from('push_subscriptions' as any)
                        .delete()
                        .eq('endpoint', endpoint);
                }

                toast.info('Notificações desativadas');
            }
        } catch (error) {
            console.error('Error unsubscribing from push:', error);
        }
    }, []);

    return { subscribeUser, unsubscribeUser, isSubscribing };
}
