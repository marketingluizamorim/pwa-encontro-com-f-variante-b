import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect } from 'react';

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
        staleTime: 1000 * 60 * 15, // 15 minutes cache — reduces refetch on F5
        gcTime: 1000 * 60 * 60,    // 1 hour garbage collection
        queryFn: async (): Promise<Subscription> => {
            if (!user) throw new Error('No user — query should be disabled');

            const { supabase } = await import('@/integrations/supabase/client');

            const { data, error } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_active', true)
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

            const tier = data.plan_id as SubscriptionTier;

            // Map tier to permissions based on business rules
            return {
                tier,
                isActive: data.is_active,
                expiresAt: data.expires_at,
                canSeeWhoLiked: tier === 'silver' || tier === 'gold',
                canUseAdvancedFilters: tier === 'gold',
                canVideoCall: tier === 'silver' || tier === 'gold',
                canSendMedia: tier === 'silver' || tier === 'gold',
                canDirectMessage: tier === 'gold',
                isProfileBoosted: tier === 'gold',
                dailySwipesLimit: (tier === 'bronze' || tier === 'none') ? 20 : 999999,
                swipesToday: swipesToday || 0,
            };
        },
        enabled: !!user,
    });

    // Real-time listener for subscription and swipe limit changes
    useEffect(() => {
        if (!user) return;

        let channel: { unsubscribe: () => void } | null = null;
        let supabaseClient: { removeChannel: (ch: unknown) => void } | null = null;

        (async () => {
            const { supabase } = await import('@/integrations/supabase/client');
            supabaseClient = supabase;

            channel = supabase
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
                        // Refresh subscription to update swipesToday count
                        queryClient.invalidateQueries({ queryKey: ['subscription', user.id] });
                    }
                )
                .subscribe();
        })();

        return () => {
            if (supabaseClient && channel) {
                supabaseClient.removeChannel(channel);
            }
        };
    }, [user, queryClient]);

    return query;
}
