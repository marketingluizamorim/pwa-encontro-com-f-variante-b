import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { DiscoverFiltersState } from '@/features/discovery/components/DiscoverFilters';

const PAGE_SIZE = 10;

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  birth_date?: string;
  city?: string;
  state?: string;
  religion?: string;
  church_frequency?: string;
  christian_interests?: string[];
  bio?: string;
  photos: string[];
  avatar_url?: string;
  looking_for?: string;
  occupation?: string;
  is_verified?: boolean;
  show_online_status?: boolean;
  show_last_active?: boolean;
  show_distance?: boolean;
  last_active_at?: string;
}

interface FetchProfilesParams {
  userId: string;
  filters: DiscoverFiltersState;
  pageParam: number;
}

async function fetchProfiles({ userId, filters, pageParam }: FetchProfilesParams): Promise<{
  profiles: Profile[];
  nextPage: number | null;
}> {
  const { supabase } = await import('@/integrations/supabase/client');

  // Get IDs of profiles the user has already swiped
  const { data: existingSwipes } = await supabase
    .from('swipes')
    .select('swiped_id')
    .eq('swiper_id', userId);

  // Get IDs of blocked users
  const { data: blockedUsers } = await supabase
    .from('user_blocks')
    .select('blocked_id')
    .eq('blocker_id', userId);

  // Get IDs of users who blocked this user
  const { data: blockedByUsers } = await supabase
    .from('user_blocks')
    .select('blocker_id')
    .eq('blocked_id', userId);

  const swipedIds = existingSwipes?.map((s) => s.swiped_id) || [];
  const blockedIds = blockedUsers?.map((b) => b.blocked_id) || [];
  const blockedByIds = blockedByUsers?.map((b) => b.blocker_id) || [];
  const excludedIds = [userId, ...swipedIds, ...blockedIds, ...blockedByIds];

  // SUPER DEBUG MODE: FETCH CRUDE DATA
  let query = supabase
    .from('profiles')
    .select('id, user_id, display_name, birth_date, city, state, religion, church_frequency, bio, photos, avatar_url, looking_for, occupation, show_online_status, show_last_active, show_distance')
    .eq('is_active', true)
    .eq('is_profile_complete', true);

  // Always exclude current user
  query = query.neq('user_id', userId);

  // Exclude swiped and blocked users
  // const otherExcludedIds = [...swipedIds, ...blockedIds, ...blockedByIds];
  // if (otherExcludedIds.length > 0) {
  //   query = query.not('user_id', 'in', `(${otherExcludedIds.join(',')})`);
  // }

  // Apply location filters
  if (filters.state && filters.state !== 'all') {
    query = query.eq('state', filters.state);
  }

  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }

  console.log('Fetching profiles for user:', userId);
  console.log('Excluded IDs:', excludedIds.length);

  // Apply age filter - calculate date range from age
  const today = new Date();
  const maxBirthDate = new Date(today.getFullYear() - filters.minAge, today.getMonth(), today.getDate());
  const minBirthDate = new Date(today.getFullYear() - filters.maxAge - 1, today.getMonth(), today.getDate());

  query = query
    .gte('birth_date', minBirthDate.toISOString().split('T')[0])
    .lte('birth_date', maxBirthDate.toISOString().split('T')[0]);

  // Pagination
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: profilesData, error } = await query
    .order('last_active_at', { ascending: false, nullsFirst: false })
    .range(from, to) as any;

  console.log('Profiles fetched:', profilesData?.length, error);

  if (error) {
    throw error;
  }

  const profiles = (profilesData || []) as Profile[];
  const hasMore = profiles.length === PAGE_SIZE;

  return {
    profiles,
    nextPage: hasMore ? pageParam + 1 : null,
  };
}

export function useDiscoverProfiles(filters: DiscoverFiltersState) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['discover-profiles', user?.id, filters],
    queryFn: ({ pageParam }) =>
      fetchProfiles({
        userId: user!.id,
        filters,
        pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!user,
    staleTime: 0, // Disable cache for dev
    gcTime: 0, // Disable garbage collection cache for dev
  });
}

interface SwipeParams {
  swiperId: string;
  swipedId: string;
  direction: 'like' | 'dislike' | 'super_like';
}

export function useSwipeMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ swiperId, swipedId, direction }: SwipeParams) => {
      const { supabase } = await import('@/integrations/supabase/client');

      const { error } = await supabase.from('swipes').insert({
        swiper_id: swiperId,
        swiped_id: swipedId,
        direction,
      });

      if (error) throw error;

      // Check for match if it was a like or super_like
      if (direction === 'like' || direction === 'super_like') {
        const { data: matchData } = await supabase
          .from('matches')
          .select('id')
          .or(
            `and(user1_id.eq.${swiperId},user2_id.eq.${swipedId}),and(user1_id.eq.${swipedId},user2_id.eq.${swiperId})`
          )
          .eq('is_active', true)
          .maybeSingle();

        return { match: matchData };
      }

      return { match: null };
    },
    onSuccess: () => {
      // Invalidate the discover profiles query to refresh swiped profiles
      queryClient.invalidateQueries({ queryKey: ['discover-profiles', user?.id] });
    },
  });
}
