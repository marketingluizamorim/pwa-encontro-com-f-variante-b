import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLocationModal } from '@/contexts/LocationModalContext';
import { toast } from 'sonner';

export function useGeolocation() {
    const { user } = useAuth();
    const { setShowLocationModal } = useLocationModal();
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateProfileLocation = useCallback(async (lat: number, lon: number) => {
        if (!user) return;
        try {
            const { supabase } = await import('@/integrations/supabase/client');
            await supabase
                .from('profiles')
                .update({ latitude: lat, longitude: lon, updated_at: new Date().toISOString() })
                .eq('user_id', user.id);
        } catch (err) {
            console.error('Error updating profile location:', err);
        }
    }, [user]);

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocalização não é suportada por este navegador.');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                updateProfileLocation(latitude, longitude);
                localStorage.setItem('last-geo-update', Date.now().toString());
                setLoading(false);
                setError(null);
                // Success: hide modal and mark as resolved
                setShowLocationModal(false);
            },
            (err) => {
                let msg = 'Erro ao obter localização.';
                if (err.code === err.PERMISSION_DENIED) {
                    msg = 'Localização negada.';

                    // Check if dismissed recently (2 hour window)
                    const lastDismissed = localStorage.getItem(`location-modal-dismissed-at-${user?.id}`);
                    if (lastDismissed) {
                        const hoursPassed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60);
                        if (hoursPassed < 2) return;
                    }

                    setShowLocationModal(true);
                } else {
                    toast.error(msg, {
                        id: 'geolocation-error',
                        style: {
                            background: '#1e293b',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginTop: '50px',
                        }
                    });
                }
                setError(msg);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 3600000 }
        );
    }, [updateProfileLocation, setShowLocationModal]);

    useEffect(() => {
        if (!user) return;

        const lastUpdate = localStorage.getItem('last-geo-update');
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        // Only auto-request if no recent location data
        if (!lastUpdate || (now - parseInt(lastUpdate)) > TWENTY_FOUR_HOURS) {
            let hasTriggered = false;

            const triggerRequest = () => {
                if (hasTriggered) return;
                hasTriggered = true;
                requestLocation();
                window.removeEventListener('click', triggerRequest);
                window.removeEventListener('touchstart', triggerRequest);
                window.removeEventListener('scroll', triggerRequest);
            };

            const timer = setTimeout(triggerRequest, 15000);
            window.addEventListener('click', triggerRequest, { once: true });
            window.addEventListener('touchstart', triggerRequest, { once: true });
            window.addEventListener('scroll', triggerRequest, { once: true });

            return () => {
                clearTimeout(timer);
                window.removeEventListener('click', triggerRequest);
                window.removeEventListener('touchstart', triggerRequest);
                window.removeEventListener('scroll', triggerRequest);
            };
        }
    }, [user, requestLocation]);

    return { location, loading, error, requestLocation };
}
