import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';
import type { QuizAnswers } from '@/types/funnel';

/**
 * Fetches quiz_data from the user's most recent PAID purchase in Supabase
 * and syncs it into the funnelStore (which pre-fills ProfileSetup fields).
 *
 * This is the cross-device solution: data lives in the DB, not in localStorage.
 * Call this after login or after registration when linking purchases.
 */
export async function syncQuizDataFromPurchase(userId: string): Promise<boolean> {
    try {
        const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');

        const { data: purchase } = await supabaseRuntime
            .from('purchases')
            .select('quiz_data, order_bumps')
            .eq('user_id', userId)
            .eq('payment_status', 'PAID')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!purchase?.quiz_data || typeof purchase.quiz_data !== 'object') {
            return false;
        }

        const quizData = purchase.quiz_data as Record<string, string>;
        const { setQuizAnswer, setGender } = useFunnelStore.getState();

        // Sync all quiz fields
        Object.entries(quizData).forEach(([key, value]) => {
            if (value && typeof value === 'string') {
                setQuizAnswer(key as keyof QuizAnswers, value);
            }
        });

        // Sync gender if present
        if (quizData.gender === 'male' || quizData.gender === 'female') {
            setGender(quizData.gender);
        }

        return true;
    } catch (err) {
        console.error('[syncQuizData] Failed to sync quiz data:', err);
        return false;
    }
}

/**
 * Applies quiz_data from a purchase object (already fetched) into the funnelStore.
 * Used during registration when purchases are linked right after sign-up.
 */
export function applyQuizDataToStore(quizData: Record<string, unknown>): void {
    if (!quizData || typeof quizData !== 'object') return;

    const { setQuizAnswer, setGender } = useFunnelStore.getState();

    Object.entries(quizData).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
            setQuizAnswer(key as keyof QuizAnswers, value);
        }
    });

    const gender = quizData.gender;
    if (gender === 'male' || gender === 'female') {
        setGender(gender);
    }
}
