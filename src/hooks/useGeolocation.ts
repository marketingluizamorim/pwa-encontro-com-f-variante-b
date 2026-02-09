import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

export function useGeolocation() {
    const { user } = useAuth();
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                setLoading(false);
                setError(null);
            },
            (err) => {
                let msg = 'Erro ao obter localização.';
                if (err.code === err.PERMISSION_DENIED) {
                    msg = 'Permissão de localização negada. Ative-a para ver pessoas próximas.';
                }
                setError(msg);
                setLoading(false);
                toast.error(msg);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 3600000 }
        );
    }, [updateProfileLocation]);

    useEffect(() => {
        // Check if we should auto-request
        const hasAsked = localStorage.getItem('geo-permission-asked');
        if (!hasAsked && user) {
            requestLocation();
            localStorage.setItem('geo-permission-asked', 'true');
        }
    }, [user, requestLocation]);

    return { location, loading, error, requestLocation };
}
