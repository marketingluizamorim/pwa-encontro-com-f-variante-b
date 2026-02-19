import { useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';
import { syncQuizDataFromPurchase } from '@/features/funnel/utils/syncQuizData';

/**
 * Automatically syncs quiz_data from the user's PAID purchase in Supabase
 * into the funnelStore whenever a user logs in.
 *
 * This ensures ProfileSetup is pre-filled even on new devices/browsers
 * where localStorage (funnelStore) is empty.
 *
 * Mount this hook once at the app root (e.g., App.tsx or ProtectedRoute).
 */
export function useQuizSync() {
    const { user } = useAuth();
    const quizAnswers = useFunnelStore((s) => s.quizAnswers);
    const syncedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!user) {
            syncedRef.current = null;
            return;
        }

        // Already synced for this user session or store already has data
        if (syncedRef.current === user.id) return;
        if (Object.keys(quizAnswers).length > 0) {
            syncedRef.current = user.id;
            return;
        }

        syncedRef.current = user.id;
        syncQuizDataFromPurchase(user.id);
    }, [user, quizAnswers]);
}
