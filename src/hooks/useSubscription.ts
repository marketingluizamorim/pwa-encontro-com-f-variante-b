import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';

export type SubscriptionTier = 'none' | 'bronze' | 'silver' | 'gold';

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

    return useQuery({
        queryKey: ['subscription', user?.id],
        queryFn: async (): Promise<Subscription> => {
            if (!user) return defaultSubscription;

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

            // Developer Override for testing - Acts as fallback if no active subscription found in DB
            const hasActiveDbPlan = data && data.is_active && data.plan_id !== 'none';
            if (!hasActiveDbPlan && user.email === 'marketing.luizamorim@gmail.com') {
                return {
                    tier: 'gold',
                    isActive: true,
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                    canSeeWhoLiked: true,
                    canUseAdvancedFilters: true,
                    canVideoCall: true,
                    canSendMedia: true,
                    canDirectMessage: true,
                    isProfileBoosted: true,
                    dailySwipesLimit: 999999,
                    swipesToday: swipesToday || 0,
                };
            }

            if (!data) return { ...defaultSubscription, swipesToday: swipesToday || 0 };

            const tier = data.plan_id as SubscriptionTier;

            // Map tier to permissions based on business rules
            return {
                tier,
                isActive: data.is_active,
                expiresAt: data.expires_at,
                canSeeWhoLiked: tier === 'silver' || tier === 'gold' || data.can_see_who_liked,
                canUseAdvancedFilters: tier === 'gold' || data.can_use_advanced_filters,
                canVideoCall: tier === 'silver' || tier === 'gold' || data.can_video_call,
                canSendMedia: tier === 'silver' || tier === 'gold',
                canDirectMessage: tier === 'gold',
                isProfileBoosted: tier === 'gold' || data.is_profile_boosted,
                dailySwipesLimit: (tier === 'bronze' || tier === 'none') ? 20 : 999999,
                swipesToday: swipesToday || 0,
            };
        },
        enabled: !!user,
    });
}
