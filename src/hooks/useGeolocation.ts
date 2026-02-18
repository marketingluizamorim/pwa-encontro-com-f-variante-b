import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

export function useGeolocation() {
    const { user } = useAuth();
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const updateProfileLocation = useCallback(async (lat: number, lon: number) => {
        if (!user) return;

        try {
            const { supabase } = await import('@/integrations/supabase/client');
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    latitude: lat,
                    longitude: lon,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);

            if (updateError) throw updateError;
            console.log('Location updated in profile:', { lat, lon });
        } catch (err) {
            console.error('Error updating profile location:', err);
        }
    }, [user]);

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            const msg = 'Geolocalização não é suportada por este navegador.';
            setError(msg);
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                updateProfileLocation(latitude, longitude);

                // Save timestamp to prevent frequent requests
                localStorage.setItem('last-geo-update', Date.now().toString());

                setLoading(false);
                setError(null);
            },
            (err) => {
                let msg = 'Erro ao obter localização.';
                if (err.code === err.PERMISSION_DENIED) {
                    const isDismissed = localStorage.getItem('geo-permission-dismissed') === 'true';

                    if (!isDismissed) {
                        msg = 'Localização negada. Ative para ver pessoas próximas.';

                        toast.error(msg, {
                            id: 'geolocation-error',
                            duration: Infinity,
                            onDismiss: () => {
                                localStorage.setItem('geo-permission-dismissed', 'true');
                            },
                            action: {
                                label: 'Ativar Agora',
                                onClick: () => navigate('/install'),
                            },
                            cancel: {
                                label: 'Mais tarde',
                                onClick: () => {
                                    localStorage.setItem('geo-permission-dismissed', 'true');
                                    toast.dismiss('geolocation-error');
                                },
                            },
                            style: {
                                background: '#1e293b',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.1)',
                                marginTop: '50px',
                            },
                        });
                    }
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
    }, [updateProfileLocation, navigate]);

    useEffect(() => {
        if (!user) return;

        const lastUpdate = localStorage.getItem('last-geo-update');
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        // Check if we need to update location (first time or expired)
        if (!lastUpdate || (now - parseInt(lastUpdate)) > TWENTY_FOUR_HOURS) {
            console.log('Location request scheduled...');

            let hasTriggered = false;

            const triggerRequest = () => {
                if (hasTriggered) return;
                hasTriggered = true;

                console.log('Triggering geolocation request after delay/interaction');
                requestLocation();

                // Cleanup listeners
                window.removeEventListener('click', triggerRequest);
                window.removeEventListener('touchstart', triggerRequest);
                window.removeEventListener('scroll', triggerRequest);
            };

            // Set a timeout of 15 seconds as a fallback
            const timer = setTimeout(triggerRequest, 15000);

            // Add interaction listeners
            window.addEventListener('click', triggerRequest, { once: true });
            window.addEventListener('touchstart', triggerRequest, { once: true });
            window.addEventListener('scroll', triggerRequest, { once: true });

            return () => {
                clearTimeout(timer);
                window.removeEventListener('click', triggerRequest);
                window.removeEventListener('touchstart', triggerRequest);
                window.removeEventListener('scroll', triggerRequest);
            };
        } else {
            console.log('Using recent location data, skipping auto-request.');
        }
    }, [user, requestLocation]);

    return { location, loading, error, requestLocation };
}
