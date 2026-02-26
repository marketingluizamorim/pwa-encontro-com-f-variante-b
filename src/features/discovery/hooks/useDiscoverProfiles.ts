import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

async function fetchProfiles({ userId, filters, pageParam, userCity, userState }: FetchProfilesParams): Promise<{
  profiles: Profile[];
  nextPage: number | null;
}> {
  const { supabase } = await import('@/integrations/supabase/client');

  // Fetch all necessary data in parallel to avoid waterfalls
  const [
    { data: existingSwipes },
    { data: blockedUsers },
    { data: blockedByUsers },
    { data: whoLikedMe },
    { data: currentUserProfile }
  ] = await Promise.all([
    supabase.from('swipes').select('swiped_id').eq('swiper_id', userId),
    supabase.from('user_blocks').select('blocked_id').eq('blocker_id', userId),
    supabase.from('user_blocks').select('blocker_id').eq('blocked_id', userId),
    supabase.from('swipes').select('swiper_id').eq('swiped_id', userId).in('direction', ['like', 'super_like']),
    supabase.from('profiles').select('latitude, longitude, gender').eq('user_id', userId).single()
  ]);

  const swipedIds = existingSwipes?.map((s) => s.swiped_id) || [];
  const blockedIds = blockedUsers?.map((b) => b.blocked_id) || [];
  const blockedByIds = blockedByUsers?.map((b) => b.blocker_id) || [];
  const whoLikedMeIds = whoLikedMe?.map((s) => s.swiper_id) || [];

  const userGender = currentUserProfile?.gender;
  const funnelBotIds = userGender === 'male' ? FEMALE_FUNNEL_BOT_IDS : MALE_FUNNEL_BOT_IDS;

  // whoLikedMeIds are NOT excluded so bots that liked the user still appear in Discover

  const userLat = currentUserProfile?.latitude ? parseFloat(String(currentUserProfile.latitude)) : null;
  const userLon = currentUserProfile?.longitude ? parseFloat(String(currentUserProfile.longitude)) : null;
  const targetGender = userGender === 'male' ? 'female' : 'male';

  // ── Track A: Bots — own fetch, only gender + age filters ──────────────────
  // Location, religion, churchFrequency and distance are intentionally ignored.
  // Bots exist to guarantee the deck is never empty (Tinder/Badoo approach).
  const excludedForBots = [userId, ...swipedIds, ...blockedIds, ...blockedByIds];

  // Build the bots query dynamically (Supabase JS v2 chained builder)
  let botQuery = supabase
    .from('profiles')
    .select('*')
    .in('user_id', funnelBotIds)
    .not('user_id', 'in', `(${excludedForBots.join(',')})`)
    .eq('gender', targetGender);

  if (filters.minAge && filters.minAge > 18) {
    const maxBirth = new Date();
    maxBirth.setFullYear(maxBirth.getFullYear() - filters.minAge);
    botQuery = (botQuery as any).lte('birth_date', maxBirth.toISOString().split('T')[0]);
  }
  if (filters.maxAge && filters.maxAge < 80) {
    const minBirth = new Date();
    minBirth.setFullYear(minBirth.getFullYear() - filters.maxAge - 1);
    botQuery = (botQuery as any).gte('birth_date', minBirth.toISOString().split('T')[0]);
  }

  // ── Track B: Real profiles — full RPC with every user-applied filter ───────
  // Bots are explicitly excluded from the RPC so they don't appear twice.
  const excludedIdsForRPC = [userId, ...swipedIds, ...blockedIds, ...blockedByIds, ...funnelBotIds];

  const [{ data: botsData }, { data: profilesData, error }] = await Promise.all([
    botQuery,
    (supabase as any).rpc('get_profiles_discovery', {
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
      excluded_ids: excludedIdsForRPC,
      fallback_state: userState || null,
      fallback_city: userCity || null,
    })
  ]);

  if (error) {
    console.error('Error in fetchProfiles RPC:', error);
    throw error;
  }

  // Tag has_liked_me on bots and real profiles
  const taggedBots: any[] = ((botsData as any[]) || [])
    .filter(Boolean)
    .map((p: any) => ({ ...p, has_liked_me: whoLikedMeIds.includes(p.user_id) }));

  const realProfiles: any[] = ((profilesData as any[]) || [])
    .filter(Boolean)
    .map((p: any) => ({ ...p, has_liked_me: whoLikedMeIds.includes(p.user_id) }));

  // Separate bots by like status and interleave: like, like, no-like, ...
  const likedBots = taggedBots.filter(p => p.has_liked_me);
  const nonLikedBots = taggedBots.filter(p => !p.has_liked_me);

  const shuffledLikedBots = [...likedBots].sort(() => Math.random() - 0.5);
  const shuffledNonLikedBots = [...nonLikedBots].sort(() => Math.random() - 0.5);

  const allBots: any[] = [];
  const maxBotSlots = shuffledLikedBots.length + shuffledNonLikedBots.length;
  let li = 0, ni = 0;
  for (let i = 0; i < maxBotSlots; i++) {
    if (ni < shuffledNonLikedBots.length && (li % 3 === 2 || li >= shuffledLikedBots.length)) {
      allBots.push(shuffledNonLikedBots[ni++]);
    } else if (li < shuffledLikedBots.length) {
      allBots.push(shuffledLikedBots[li++]);
    }
  }

  // On the first session (< 5 swipes), cap the deck at 9 so the user sees a curated start
  let profiles: any[];
  if (pageParam === 0 && swipedIds.length < 5) {
    profiles = [...allBots, ...realProfiles].slice(0, 9);
  } else {
    profiles = [...allBots, ...realProfiles];
  }

  // Client-side filters not backed by RPC
  if (filters.onlineRecently) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    profiles = profiles.filter(p =>
      funnelBotIds.includes(p.user_id) || // bots always count as recently online
      (p.show_online_status !== false &&
        p.last_active_at !== undefined &&
        p.last_active_at !== null &&
        p.last_active_at >= cutoff)
    );
  }
  if (filters.hasPhotos) {
    profiles = profiles.filter(p => p.photos && p.photos.length > 0);
  }

  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  const paginatedProfiles = profiles.slice(from, to);
  const hasMore = profiles.length > to && (pageParam === 0 && swipedIds.length < 5 ? false : true);

  return {
    profiles: paginatedProfiles,
    nextPage: hasMore ? pageParam + 1 : null,
  };
}

export function useDiscoverProfiles(
  filters: DiscoverFiltersState,
  userCity?: string,
  userState?: string,
) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['discover-profiles', user?.id, filters, userCity, userState],
    queryFn: ({ pageParam }) =>
      fetchProfiles({
        userId: user!.id,
        filters,
        pageParam,
        userCity,
        userState,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
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
