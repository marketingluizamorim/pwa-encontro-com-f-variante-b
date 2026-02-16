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

  // Get current user's location for distance calculation
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('latitude, longitude')
    .eq('user_id', userId)
    .single();

  const userLat = currentUserProfile?.latitude ? parseFloat(String(currentUserProfile.latitude)) : null;
  const userLon = currentUserProfile?.longitude ? parseFloat(String(currentUserProfile.longitude)) : null;

  // Use RPC for advanced discovery (supports PostGIS distance and complex filters)
  const { data: profilesData, error } = await (supabase as unknown as { rpc: (name: string, params: unknown) => Promise<{ data: unknown, error: unknown }> }).rpc('get_profiles_discovery', {
    user_lat: userLat,
    user_lon: userLon,
    min_age: filters.minAge,
    max_age: filters.maxAge,
    max_dist_km: filters.maxDistance,
    target_state: filters.state && filters.state !== 'all' ? filters.state : null,
    target_city: filters.city && filters.city !== '' ? filters.city : null,
    target_religion: filters.religion && filters.religion !== '' ? filters.religion : null,
    target_church_frequency: filters.churchFrequency && filters.churchFrequency !== '' ? filters.churchFrequency : null,
    target_looking_for: filters.lookingFor && filters.lookingFor !== '' ? filters.lookingFor : null,
    target_interests: filters.christianInterests && filters.christianInterests.length > 0 ? filters.christianInterests : null,
    excluded_ids: excludedIds
  });

  if (error) {
    console.error('Error in fetchProfiles RPC:', error);
    throw error;
  }

  // Handle range locally since rpc returns the whole set (or we can add range to rpc)
  // For better performance, we should ideally add range to RPC, but let's do it here for now or update RPC.
  // Actually, let's update RPC to include limit/offset.

  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  const profiles = (profilesData as Profile[]) || [];
  const paginatedProfiles = profiles.slice(from, to);
  const hasMore = profiles.length > to;

  return {
    profiles: paginatedProfiles,
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
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
  });
}

interface SwipeParams {
  swiperId: string;
  swipedId: string;
  direction: 'like' | 'dislike' | 'super_like';
  message?: string;
}

export function useSwipeMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ swiperId, swipedId, direction, message }: SwipeParams) => {
      const { supabase } = await import('@/integrations/supabase/client');

      const { error } = await supabase.from('swipes').insert({
        swiper_id: swiperId,
        swiped_id: swipedId,
        direction,
        message: message || null,
      });

      if (error) throw error;

      // Check for match if it was a like or super_like
      if (direction === 'like' || direction === 'super_like') {
        // Wait slightly for any DB triggers to create the match
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data: matchData } = await supabase
          .from('matches')
          .select('id')
          .or(
            `and(user1_id.eq.${swiperId},user2_id.eq.${swipedId}),and(user1_id.eq.${swipedId},user2_id.eq.${swiperId})`
          )
          .eq('is_active', true)
          .maybeSingle();

        if (matchData) {
          // 1. Handle MY current message (if any)
          if (message) {
            const { error: msgError } = await supabase.from('messages').insert({
              match_id: matchData.id,
              sender_id: swiperId,
              content: message,
              is_read: false
            });
            if (msgError) console.error('Error creating my super like message:', msgError);
          }

          // 2. Handle OTHER user's pending Super Like message (if they liked first)
          const { data: otherSwipe } = await supabase
            .from('swipes')
            .select('message')
            .eq('swiper_id', swipedId)
            .eq('swiped_id', swiperId)
            .eq('direction', 'super_like')
            .not('message', 'is', null)
            .maybeSingle();

          if ((otherSwipe as unknown as { message?: string })?.message) {
            // Check if already inserted to prevent dupes
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('match_id', matchData.id)
              .eq('sender_id', swipedId)
              .eq('content', (otherSwipe as unknown as { message: string }).message);

            if (count === 0) {
              const { error: otherMsgError } = await supabase.from('messages').insert({
                match_id: matchData.id,
                sender_id: swipedId,
                content: (otherSwipe as unknown as { message: string }).message,
                is_read: false
              });
              if (otherMsgError) console.error('Error creating other super like message:', otherMsgError);
            }
          }
        }

        return { match: matchData };
      }

      return { match: null };
    },
    onSuccess: (data) => {
      // Invalidate the discover profiles query to refresh swiped profiles
      queryClient.invalidateQueries({ queryKey: ['discover-profiles', user?.id] });

      // If a match was created, or even if not certain, invalidate conversations to show new matches
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });

      // Also invalidate likes to keep the matches page in sync
      queryClient.invalidateQueries({ queryKey: ['likes', user?.id] });
    },
  });
}
