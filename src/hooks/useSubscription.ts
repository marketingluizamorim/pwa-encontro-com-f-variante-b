import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionTier = 'none' | 'free' | 'bronze' | 'silver' | 'gold';

export interface Subscription {
    tier: SubscriptionTier;
    isActive: boolean;
    expiresAt: string | null;
    canSeeWhoLiked: boolean;
    canUseAdvancedFilters: boolean;
    canVideoCall: boolean;
    canSendMedia: boolean;
    canDirectMessage: boolean;
    isProfileBoosted: boolean;
    dailySwipesLimit: number;
    swipesToday: number;
}

const defaultSubscription: Subscription = {
    tier: 'none',
    isActive: false,
    expiresAt: null,
    canSeeWhoLiked: false,
    canUseAdvancedFilters: false,
    canVideoCall: false,
    canSendMedia: false,
    canDirectMessage: false,
    isProfileBoosted: false,
    dailySwipesLimit: 20,
    swipesToday: 0,
};

export function useSubscription() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['subscription', user?.id],
        staleTime: 1000 * 60 * 15,
        gcTime: 1000 * 60 * 60,
        retry: false,
        refetchOnWindowFocus: false,
        enabled: !!user,
        queryFn: async (): Promise<Subscription> => {
            if (!user) throw new Error('No user — query should be disabled');

            const { data, error } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('Error fetching subscription:', error);
            }

            // Count today's swipes
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { count: swipesToday, error: swipesError } = await supabase
                .from('swipes')
                .select('*', { count: 'exact', head: true })
                .eq('swiper_id', user.id)
                .gte('created_at', today.toISOString());

            if (swipesError) {
                console.error('Error counting swipes:', swipesError);
            }

            if (!data) return { ...defaultSubscription, swipesToday: swipesToday || 0 };

            // ── Client-side expiry / inactive check ────────────────────────────
            // Covers two cases:
            //   (a) DB already has is_active=false (self-heal already ran)
            //   (b) DB still has is_active=true but expires_at is in the past
            const isExpiredByDate =
                !data.is_lifetime &&
                data.expires_at !== null &&
                new Date(data.expires_at) < new Date();

            const isExpired = !data.is_active || isExpiredByDate;

            if (isExpired) {
                if (isExpiredByDate && data.is_active) {
                    // Self-heal only when the DB hasn't been updated yet
                    supabase
                        .from('user_subscriptions')
                        .update({ is_active: false, updated_at: new Date().toISOString() })
                        .eq('id', data.id)
                        // fire-and-forget — no need to invalidate again, we already handle it
                        .then(() => { });
                }
                // Return tier so ProtectedRoute shows renewal modal (not a redirect)
                return {
                    ...defaultSubscription,
                    tier: data.plan_id as SubscriptionTier,
                    isActive: false,
                    expiresAt: data.expires_at,
                    swipesToday: swipesToday || 0,
                };
            }
            // ──────────────────────────────────────────────────────────────────

            const tier = data.plan_id as SubscriptionTier;

            // ── Use real DB flags (respects order bumps & custom limits) ───────
            // Fall back to tier-based logic only for legacy rows where column is null
            const canSeeWhoLiked = data.can_see_who_liked ?? (tier === 'silver' || tier === 'gold');
            const canUseAdvancedFilters = data.can_use_advanced_filters ?? (tier === 'gold');
            const canVideoCall = data.can_video_call ?? (tier === 'silver' || tier === 'gold');
            const isProfileBoosted = data.is_profile_boosted ?? (tier === 'gold');
            const dailySwipesLimit = data.daily_swipes_limit ?? ((tier === 'bronze' || tier === 'none') ? 20 : 999999);
            // ──────────────────────────────────────────────────────────────────

            return {
                tier,
                isActive: data.is_active,
                expiresAt: data.expires_at,
                canSeeWhoLiked,
                canUseAdvancedFilters,
                canVideoCall,
                canSendMedia: canVideoCall,         // same gate as video call
                canDirectMessage: tier === 'gold',
                isProfileBoosted,
                dailySwipesLimit,
                swipesToday: swipesToday || 0,
            };
        },
    });

    // Real-time listener — invalidates cache on any subscription or swipe change
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`subscription:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_subscriptions',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['subscription', user.id] });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'swipes',
                    filter: `swiper_id=eq.${user.id}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['subscription', user.id] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient]);

    return query;
}
