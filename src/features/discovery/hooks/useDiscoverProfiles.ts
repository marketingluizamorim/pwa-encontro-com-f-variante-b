import { useInfiniteQuery, useMutation, useQueryClient, useQuery, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { DiscoverFiltersState } from '@/features/discovery/components/DiscoverFilters';
import { FEMALE_FUNNEL_BOT_IDS, MALE_FUNNEL_BOT_IDS } from '@/features/funnel/utils/profiles';

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
  is_boosted?: boolean;
  latitude?: number;
  longitude?: number;
  pets?: string;
  drink?: string;
  smoke?: string;
  physical_activity?: string;
  social_media?: string;
  gender?: string;
  about_children?: string;
  education?: string;
  languages?: string[];
  is_fake?: boolean;
  is_bot?: boolean;
  swiped_fakes?: string[];
}

interface FetchProfilesParams {
  userId: string;
  filters: DiscoverFiltersState;
  pageParam: number;
  userCity?: string;
  userState?: string;
}

// --- Metadata hooks for better caching and reduced waterfalls ---
function useDiscoveryMetadata(userId: string) {
  return {
    swipes: useQuery({
      queryKey: ['discovery-swipes', userId],
      queryFn: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase.from('swipes').select('swiped_id').eq('swiper_id', userId);
        return data?.map(s => s.swiped_id) || [];
      },
      staleTime: 1000 * 30, // 30s
    }),
    // Special query to count how many BOTS the user has already swiped
    swipedBotsCount: useQuery({
      queryKey: ['discovery-swiped-bots-count', userId],
      queryFn: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase.rpc('get_swiped_bots_count', { p_user_id: userId });
        return data as number || 0;
      },
      staleTime: 1000 * 60,
    }),
    whoLikedMe: useQuery({
      queryKey: ['who-liked-me-ids', userId],
      queryFn: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase.from('swipes')
          .select('swiper_id')
          .eq('swiped_id', userId)
          .in('direction', ['like', 'super_like']);
        return data?.map(s => s.swiper_id) || [];
      },
      staleTime: 1000 * 60, // 1m
    }),
    profile: useQuery({
      queryKey: ['discovery-user-profile', userId],
      queryFn: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
        return data;
      },
      staleTime: 1000 * 60 * 5, // 5m
    }),
  };
}

async function fetchProfiles({ userId, filters, pageParam, userCity, userState, swipedIds, whoLikedMeIds, currentUserProfile, swipedBotsCount }: FetchProfilesParams & {
  swipedIds: string[],
  whoLikedMeIds: string[],
  currentUserProfile: any,
  swipedBotsCount: number
}): Promise<{
  profiles: Profile[];
  nextPage: number | null;
}> {
  const { supabase } = await import('@/integrations/supabase/client');

  const userGender = currentUserProfile?.gender;
  const funnelBotIds = userGender === 'male' ? FEMALE_FUNNEL_BOT_IDS : MALE_FUNNEL_BOT_IDS;

  const userLat = currentUserProfile?.latitude ? parseFloat(String(currentUserProfile.latitude)) : null;
  const userLon = currentUserProfile?.longitude ? parseFloat(String(currentUserProfile.longitude)) : null;
  const targetGender = userGender === 'male' ? 'female' : 'male';

  const { data: profilesData, error } = await (supabase as any).rpc('get_profiles_discovery', {
    user_lat: userLat,
    user_lon: userLon,
    min_age: filters.minAge,
    max_age: filters.maxAge,
    max_dist_km: filters.maxDistance,
    target_gender: targetGender,
    target_state: filters.state && filters.state !== 'all' ? filters.state : null,
    target_city: filters.city && filters.city !== '' ? filters.city : null,
    target_religion: filters.religion && filters.religion !== '' ? filters.religion : null,
    target_church_frequency: filters.churchFrequency && filters.churchFrequency !== '' ? filters.churchFrequency : null,
    target_looking_for: filters.lookingFor && filters.lookingFor !== '' ? filters.lookingFor : null,
    target_interests: filters.christianInterests && filters.christianInterests.length > 0 ? filters.christianInterests : null,
    excluded_ids: [userId, ...swipedIds], // REJECTED ones ARE here, so they won't reappear
    fallback_state: userState || null,
    fallback_city: userCity || null,
    p_limit: 40, // Fetch more to allow bot capping 
    p_offset: pageParam * PAGE_SIZE
  });

  if (error) {
    console.error('Error in fetchProfiles RPC:', error);
    throw error;
  }

  let profiles: any[] = ((profilesData as any[]) || [])
    .filter(Boolean)
    .map((p: any) => ({
      ...p,
      has_liked_me: whoLikedMeIds.includes(p.user_id),
      is_bot: p.is_bot || funnelBotIds.includes(p.user_id)
    }));

  // --- BOT CAPPING RULE (9 TOTAL PER LIFECYCLE) ---
  const MAX_BOTS = 9;
  const availableBotSlots = Math.max(0, MAX_BOTS - swipedBotsCount);

  const bots = profiles.filter(p => p.is_bot);
  const realOnes = profiles.filter(p => !p.is_bot);

  // Take only what's allowed by the 9-bot rule
  const cappedBots = bots.slice(0, availableBotSlots);
  const shuffledBots = [...cappedBots].sort(() => Math.random() - 0.5);

  profiles = [...shuffledBots, ...realOnes];

  if (filters.hasPhotos) {
    profiles = profiles.filter(p => p.photos && p.photos.length > 0);
  }

  const hasMore = profiles.length > PAGE_SIZE;
  const finalProfiles = profiles.slice(0, PAGE_SIZE);

  return {
    profiles: finalProfiles,
    nextPage: hasMore ? pageParam + 1 : null,
  };
}

export function useDiscoverProfiles(
  filters: DiscoverFiltersState,
  userCity?: string,
  userState?: string,
) {
  const { user } = useAuth();
  const metadata = useDiscoveryMetadata(user?.id || '');

  const swipedIds = metadata.swipes.data || [];
  const whoLikedMeIds = metadata.whoLikedMe.data || [];
  const currentUserProfile = metadata.profile.data;
  const swipedBotsCount = metadata.swipedBotsCount.data || 0;

  const isLoadingMetadata = metadata.swipes.isLoading || metadata.profile.isLoading || metadata.swipedBotsCount.isLoading;

  return useInfiniteQuery({
    queryKey: ['discover-profiles', user?.id, filters, userCity, userState, swipedIds.length],
    queryFn: ({ pageParam }) =>
      fetchProfiles({
        userId: user!.id,
        filters,
        pageParam,
        userCity,
        userState,
        swipedIds,
        whoLikedMeIds,
        currentUserProfile,
        swipedBotsCount
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!user && !isLoadingMetadata,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData, // keeps cards visible during background refetch (no skeleton flash)
  });
}

interface SwipeParams {
  swiperId: string;
  swipedId: string;
  direction: 'like' | 'dislike' | 'super_like';
  message?: string;
  source?: 'discover' | 'curtidas'; // identifies where the swipe originated
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
    onSuccess: (_data, variables) => {
      if (variables.source !== 'curtidas') {
        // Only needed when swiping in Descobrir:
        // refresh the discover queue and the likes list (in case they had liked us too)
        queryClient.invalidateQueries({ queryKey: ['discover-profiles', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['likes', user?.id] });
      }

      // Always invalidate conversations when a match happened,
      // regardless of source — so the new chat appears in Mensagens
      if (_data?.match) {
        queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      }
    },
  });
}
