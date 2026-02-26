import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform, useDragControls } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useFunnelStore } from "@/features/funnel/hooks/useFunnelStore";
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import DiscoverFilters, { DiscoverFiltersState } from '@/features/discovery/components/DiscoverFilters';
import { useDiscoverProfiles, useSwipeMutation } from '@/features/discovery/hooks/useDiscoverProfiles';
import { triggerHaptic } from '@/lib/haptics';
import { PageTransition } from '@/features/discovery/components/PageTransition';
import { DiscoverSkeleton } from '@/features/discovery/components/SkeletonLoaders';
import { ProfileDetails } from '@/features/discovery/components/ProfileDetails';
import { ProfilePhotoGallery } from '@/features/discovery/components/ProfilePhotoGallery';
import { SafetyActions } from '@/features/discovery/components/SafetyActions';
import { getOptimizedImageUrl, IMAGE_SIZES } from '@/lib/image-utils';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { UpgradeFlow } from '@/features/discovery/components/UpgradeFlow';
import { calculateDistance } from '@/lib/geo-utils';
import { MatchCelebration } from '@/features/discovery/components/MatchCelebration';
import { playNotification } from '@/lib/notifications';
import { useGeolocation } from '@/hooks/useGeolocation';
import { LocationPermissionModal } from '@/features/discovery/components/LocationPermissionModal';
import { useLocationModal } from '@/contexts/LocationModalContext';
import { useSubscription } from '@/hooks/useSubscription';
import { LikeLimitDialog } from '@/features/discovery/components/LikeLimitDialog';
import { MessageCircle, Zap, Search, MapPin, Home, Heart, User2, MoreHorizontal, UserCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Header } from '@/features/discovery/components/Header';
import { PLANS } from '@/features/funnel/components/plans/PlansGrid';
import { SuperLikeExplainerDialog } from '@/features/discovery/components/SuperLikeExplainerDialog';
import { SuperLikeMessageDialog } from '@/features/discovery/components/SuperLikeMessageDialog';
import { calculateAge, formatLastActive } from '@/lib/date-utils';
import { enrichBotProfile } from '@/features/funnel/utils/profiles';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DEFAULT_FILTERS: DiscoverFiltersState = {
  minAge: 18,
  maxAge: 80,
  state: '',
  city: '',
  religion: '',
  churchFrequency: '',
  lookingFor: '',
  christianInterests: [],
  hasPhotos: false,
  isVerified: false,
  onlineRecently: false,
  maxDistance: 100,
};

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 500;

export default function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dragControls = useDragControls();
  const { location: geoLocation, error: geoError, requestLocation } = useGeolocation();
  const { showLocationModal, setShowLocationModal } = useLocationModal();
  // Coordinates of the logged-in user — from live GPS or saved in profile
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ city?: string; state?: string }>({});
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<DiscoverFiltersState>(() => {
    const FILTERS_VERSION = 'v5'; // bump when defaults change
    const savedVersion = localStorage.getItem('discover-filters-version');
    const saved = localStorage.getItem('discover-filters');
    if (saved && savedVersion === FILTERS_VERSION) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_FILTERS, ...parsed, christianInterests: parsed.christianInterests || [] };
    }
    // Clear stale filters and save new version
    localStorage.removeItem('discover-filters');
    localStorage.setItem('discover-filters-version', FILTERS_VERSION);
    return DEFAULT_FILTERS;
  });

  const [appliedFilters, setAppliedFilters] = useState<DiscoverFiltersState>(filters);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeFeedback, setSwipeFeedback] = useState<'like' | 'dislike' | 'super_like' | null>(null);
  const [showMatchCelebration, setShowMatchCelebration] = useState(false);
  const [matchData, setMatchData] = useState<{ name: string; photo: string; matchId: string } | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showCompleteProfileDialog, setShowCompleteProfileDialog] = useState(false);
  const { data: subscription } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showCheckoutManager, setShowCheckoutManager] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<{ id: string, name: string, price: number } | null>(null);

  const [upgradeData, setUpgradeData] = useState({
    title: '',
    description: '',
    features: [] as string[],
    planNeeded: 'silver' as 'silver' | 'gold' | 'bronze',
    icon: null as React.ReactNode,
    price: 0,
    planId: ''
  });

  const [showReport, setShowReport] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [showLikeLimitDialog, setShowLikeLimitDialog] = useState(false);
  const [showSuperLikeExplainer, setShowSuperLikeExplainer] = useState(false);
  const [showSuperLikeMessageDialog, setShowSuperLikeMessageDialog] = useState(false);

  // Photo Navigation State
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [quizSwipedCount, setQuizSwipedCount] = useState(0);



  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [currentIndex]);

  // --- NATIVE-LIKE NAVIGATION LOGIC ---
  useEffect(() => {
    const handlePopState = () => {
      if (showInfo) {
        setShowInfo(false);
      }
    };

    if (showInfo) {
      window.history.pushState({ profileOpen: true }, "");
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showInfo]);

  const handleManualBack = () => {
    if (showInfo) {
      window.history.back();
    } else {
      setShowInfo(false);
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentProfile && currentProfile.photos && currentPhotoIndex < currentProfile.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };

  // Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);

  // Visual Indicators (Opacity)
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const superLikeOpacity = useTransform(y, [0, -SWIPE_THRESHOLD], [0, 1]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useDiscoverProfiles(appliedFilters, userLocation.city, userLocation.state);

  const swipeMutation = useSwipeMutation();

  const { data: profileData } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });



  const { gender, quizAnswers } = useFunnelStore();

  // Resolve age range: prefer quiz store (funnel users), fall back to user's
  // actual birth_date (convite users who never took the quiz).
  const resolvedAgeRange = useMemo(() => {
    if (quizAnswers.age) return quizAnswers.age;
    const bd = profileData?.birth_date;
    if (!bd) return '26-35';
    const age = new Date().getFullYear() - new Date(bd).getFullYear();
    if (age <= 25) return '18-25';
    if (age <= 35) return '26-35';
    if (age <= 55) return '36-55';
    return '56+';
  }, [quizAnswers.age, profileData?.birth_date]);

  const profiles = useMemo(() => {
    const realProfiles = data?.pages ? data.pages.flatMap((page) => page.profiles) : [];

    // Enrich bot profiles with static metadata + age-appropriate photos
    return realProfiles.map(p => enrichBotProfile(p, resolvedAgeRange));
  }, [data, resolvedAgeRange]);

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  // Prefetch
  useEffect(() => {
    const remainingProfiles = profiles.length - currentIndex;
    if (remainingProfiles <= 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }

    // Preload next 3 profile images (Full gallery for next 2, primary for the rest)
    const profilesToPreload = profiles.slice(currentIndex + 1, currentIndex + 6);
    profilesToPreload.forEach((profile, index) => {
      // For the next 2 profiles, preload their first 3 photos
      if (index < 2) {
        profile.photos?.slice(0, 3).forEach(photo => {
          const img = new Image();
          img.src = photo;
        });
      } else {
        // For followers, just the primary photo
        const img = new Image();
        img.src = profile.photos?.[0] || profile.avatar_url || '/placeholder.svg';
      }
    });
  }, [currentIndex, profiles, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    localStorage.setItem('discover-filters', JSON.stringify(filters));
  }, [filters]);


  // Sync userCoords: prefer live GPS, fallback to saved profile coords + city/state
  useEffect(() => {
    if (geoLocation) {
      setUserCoords(geoLocation);
      return;
    }
    // No live GPS — try to load saved coords and city/state from the user's profile
    if (!user) return;
    (async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('profiles')
        .select('latitude, longitude, city, state')
        .eq('user_id', user.id)
        .single();
      if (data?.latitude && data?.longitude) {
        setUserCoords({ latitude: data.latitude, longitude: data.longitude });
      }
      // Always save city/state as fallback for when GPS is unavailable
      if (data?.city || data?.state) {
        setUserLocation({ city: data.city ?? undefined, state: data.state ?? undefined });
      }
    })();
  }, [geoLocation, user]);



  const handleApplyFilters = (newFilters?: DiscoverFiltersState) => {
    if (newFilters) {
      setFilters(newFilters);
      setAppliedFilters(newFilters);
    } else {
      setAppliedFilters(filters);
    }
    setCurrentIndex(0);
  };

  useEffect(() => {
    if (!user) return;

    const checkProfile = async () => {
      // Re-show profile completion after 2 hours if dismissed
      const lastDismissed = localStorage.getItem(`profile-completion-dismissed-at-${user.id}`);
      if (lastDismissed) {
        const hoursPassed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60);
        if (hoursPassed < 2) return; // Wait 2 hours
      }


      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

      if (error) {
        console.error('Discover: Error fetching profile:', error);
        setShowCompleteProfileDialog(true);
        return;
      }

      const profileData = (data as Record<string, unknown>) || {};

      const fields = [
        profileData.display_name,
        profileData.bio,
        profileData.birth_date,
        profileData.city,
        profileData.state,
        profileData.religion,
        profileData.church_frequency,
        profileData.looking_for,
        profileData.gender,
        profileData.occupation,
        (Array.isArray(profileData.photos) && profileData.photos.length > 0),
        (Array.isArray(profileData.christian_interests) && profileData.christian_interests.length > 0)
      ];

      const filled = fields.filter(Boolean).length;
      const completion = fields.length > 0 ? Math.round((filled / fields.length) * 100) : 0;

      if (completion < 100) {
        setShowCompleteProfileDialog(true);
      } else {
        setShowCompleteProfileDialog(false);
      }
    };

    checkProfile();

    // Real-time listener to hide dialog immediately if profile is completed elsewhere
    let channel: any = null;
    let supabaseClient: any = null;

    const setupRealtime = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      supabaseClient = supabase;
      channel = supabase
        .channel(`discover-profile-check-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            checkProfile();
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (supabaseClient && channel) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [user]);




  const handleSwipe = async (swipeDirection: 'like' | 'dislike' | 'super_like') => {
    if (!currentProfile || !user || swiping) return;

    // Check if Super Like requires upgrade (EXCLUSIVE TO GOLD PLAN)
    if (swipeDirection === 'super_like') {
      const tier = subscription?.tier || 'none';
      if (tier !== 'gold') {
        // Show explainer dialog first
        setShowSuperLikeExplainer(true);
        return;
      }
      // If Gold, show message dialog
      setShowSuperLikeMessageDialog(true);
      return;
    }

    // Check daily limit for Bronze/None (frontend guard — server also enforces)
    if (subscription) {
      const { swipesToday, dailySwipesLimit } = subscription;
      if (swipesToday >= dailySwipesLimit) {
        setShowLikeLimitDialog(true);
        return;
      }
    }

    setSwiping(true);
    setExitDirection(swipeDirection === 'dislike' ? 'left' : swipeDirection === 'like' ? 'right' : 'up');

    const hapticType = swipeDirection === 'dislike' ? 'light' : swipeDirection === 'like' ? 'medium' : 'success';
    triggerHaptic(hapticType);

    // Feedback visual leve
    setSwipeFeedback(swipeDirection);
    setTimeout(() => setSwipeFeedback(null), 600);

    // OPTIMISTIC UPDATE: Move to next card immediately visually
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setExitDirection(null);
      setSwiping(false);
      x.set(0);
      y.set(0);
      setShowInfo(false);
    }, 200);

    // Intercept Quiz Profiles for instant match or removal
    // Fire and forget mutation (handling errors/matches async)
    swipeMutation.mutate(
      {
        swiperId: user.id,
        swipedId: currentProfile.user_id,
        direction: swipeDirection,
      },
      {
        onSuccess: (data) => {
          if (data.match) {
            setMatchData({
              name: currentProfile.display_name || 'Alguém',
              photo: currentProfile.photos?.[0] || currentProfile.avatar_url || '',
              matchId: data.match.id,
            });
            setShowMatchCelebration(true);
            triggerHaptic('success');
            playNotification('match');
          }
        },
        onError: (error) => {
          console.error('Error saving swipe:', error);
          // Tratar erro de limite de swipes do servidor (plano Bronze)
          const msg = (error as { message?: string })?.message || '';
          if (msg.includes('Limite diário') || msg.includes('P0001')) {
            setShowLikeLimitDialog(true);
          }
        },
      }
    );
  };

  const handleSuperLikeConfirm = (message: string) => {
    if (!currentProfile || !user) return;

    setShowSuperLikeMessageDialog(false);
    setSwiping(true);
    setExitDirection('up');
    triggerHaptic('success');

    // Visual update
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setExitDirection(null);
      setSwiping(false);
      x.set(0);
      y.set(0);
      setShowInfo(false);
    }, 200);
    swipeMutation.mutate(
      {
        swiperId: user.id,
        swipedId: currentProfile.user_id,
        direction: 'super_like',
        message: message
      },
      {
        onSuccess: (data) => {
          // Play special Super Like sound/animation
          playNotification('match');
          toast.success('Super Like enviado com sucesso!', {
            icon: '⭐',
            style: {
              background: 'linear-gradient(to right, #d4af37, #b45309)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              marginTop: '50px',
              zIndex: 9999
            }
          });

          if (data.match) {
            setMatchData({
              name: currentProfile.display_name || 'Alguém',
              photo: currentProfile.photos?.[0] || currentProfile.avatar_url || '',
              matchId: data.match.id,
            });
            setShowMatchCelebration(true);
          }
        },
        onError: (error) => {
          console.error('Error saving super like:', error);
          toast.error('Erro ao enviar Super Like', { style: { marginTop: '50px' } });
        },
      }
    );
  };

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (swiping) return;
    const { offset, velocity } = info;
    const swipeHandler = handleSwipe;

    if (offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD) {
      swipeHandler('like');
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
      swipeHandler('dislike');
    } else if (offset.y < -SWIPE_THRESHOLD || velocity.y < -SWIPE_VELOCITY_THRESHOLD) {
      swipeHandler('super_like');
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleRefresh = async () => {
    setCurrentIndex(0);
    await queryClient.invalidateQueries({ queryKey: ['discover-profiles'] });
    refetch();
  };

  // ── Swipe Feedback Portal ───────────────────────────────────────────────────
  // Wait for seed profiles AND real profiles to load before showing skeleton
  if ((isLoading && profiles.length === 0)) return <DiscoverSkeleton />;

  const isEmpty = (profiles.length === 0 || currentIndex >= profiles.length);

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {swipeFeedback && (
            <motion.div
              key={swipeFeedback}
              className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <div
                className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-2',
                  swipeFeedback === 'like'
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-white/30'
                    : swipeFeedback === 'dislike'
                      ? 'bg-gradient-to-br from-red-500 to-rose-600 border-white/30'
                      : 'bg-gradient-to-br from-blue-400 to-indigo-600 border-white/30',
                )}
              >
                {swipeFeedback === 'like' && <i className="ri-heart-fill text-white text-4xl" />}
                {swipeFeedback === 'dislike' && <i className="ri-close-line text-white text-4xl" />}
                {swipeFeedback === 'super_like' && <i className="ri-star-fill text-white text-3xl" />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
      <PageTransition className="relative w-full h-full flex flex-col items-center">
        <Header
          isDiscover
          action={
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md border border-border/10 flex items-center justify-center text-foreground/80 hover:bg-background/30 active:scale-95 transition-all"
            >
              <i className={cn('text-lg', isDarkMode ? 'ri-moon-line' : 'ri-sun-line text-amber-500')} />
            </button>
          }
        />

        {currentProfile && (
          <SuperLikeMessageDialog
            open={showSuperLikeMessageDialog}
            onOpenChange={setShowSuperLikeMessageDialog}
            profileName={currentProfile.display_name}
            profilePhoto={currentProfile.photos?.[0] || currentProfile.avatar_url || '/placeholder.svg'}
            onConfirm={handleSuperLikeConfirm}
          />
        )}

        {/* DEBUG BANNER REMOVED */}

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center w-full h-full min-h-[50vh] text-center px-6">
            <div className="flex flex-col items-center justify-center opacity-60 mb-6">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-foreground" strokeWidth={1.5} />
              </div>
            </div>

            <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Sem novos perfis</h2>
            <p className="text-muted-foreground mb-8 text-sm max-w-xs mx-auto">
              Tente expandir seus filtros para encontrar mais pessoas.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button
                onClick={() => document.getElementById('discover-filters-trigger')?.click()}
                className="w-full h-11 rounded-xl border border-accent/50 bg-transparent text-accent hover:bg-accent/10"
              >
                Ajustar Filtros
              </Button>
              <Button
                onClick={handleRefresh}
                className="w-full h-11 rounded-xl gradient-button text-white shadow-lg shadow-primary/20"
              >
                Procurar Novamente
              </Button>
            </div>

            <div className="hidden">
              <DiscoverFilters
                filters={filters}
                onFiltersChange={setFilters}
                onApply={handleApplyFilters}
                triggerId="discover-filters-trigger"
              />
            </div>
          </div>
        ) : (
          <>


            {/* Card Stack Container */}
            <div className="flex-1 w-full max-w-xl relative flex items-center justify-center pb-24 px-4 transition-all duration-500">

              {/* NEXT CARD (Background) */}
              {nextProfile && (
                <div className="absolute inset-x-4 top-4 bottom-28 z-0">
                  <div className="w-full h-full bg-card rounded-[2rem] overflow-hidden border border-border opacity-60 scale-95 translate-y-2 shadow-xl">
                    <OptimizedImage
                      src={nextProfile.photos?.[0] || nextProfile.avatar_url || '/placeholder.svg'}
                      className="w-full h-full object-cover opacity-50 grayscale"
                      containerClassName="w-full h-full"
                      alt="Next"
                    />
                  </div>
                </div>
              )}

              {currentProfile && (() => {
                const activeCard = currentProfile;
                const photoSrc = activeCard.photos?.[currentPhotoIndex]
                  || activeCard.photos?.[0]
                  || activeCard.avatar_url
                  || '/placeholder.svg';

                const cardKey = (activeCard as any).id || (activeCard as any).user_id;

                const onlineStatus = formatLastActive((activeCard as any)?.last_active_at, (activeCard as any)?.show_online_status, (activeCard as any)?.show_last_active) === 'Online';

                const distance = userCoords
                  ? calculateDistance(
                    userCoords.latitude,
                    userCoords.longitude,
                    (activeCard as any)?.latitude ?? undefined,
                    (activeCard as any)?.longitude ?? undefined
                  )
                  : null;

                return (
                  <motion.div
                    key={cardKey}
                    style={{ x, y, rotate }}
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    dragElastic={{ top: 0.7, bottom: 0, left: 0.7, right: 0.7 }}
                    onDragEnd={handleDragEnd}
                    className="w-full h-full absolute inset-0 px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] z-20 cursor-grab active:cursor-grabbing touch-none"
                    initial={false}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{
                      x: exitDirection === 'left' ? -1000 : exitDirection === 'right' ? 1000 : 0,
                      y: exitDirection === 'up' ? -1000 : 0,
                      opacity: 0,
                      rotate: exitDirection === 'left' ? -45 : exitDirection === 'right' ? 45 : 0,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="w-full h-full bg-card rounded-[2rem] overflow-hidden border border-border shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative select-none">

                      {/* Photo Stories Progress Bar */}
                      {activeCard.photos && activeCard.photos.length > 1 && (
                        <div className="absolute top-3 left-3 right-3 z-40 flex gap-1.5 h-1">
                          {activeCard.photos.map((_, idx) => (
                            <div
                              key={idx}
                              className={`flex-1 rounded-full h-full shadow-sm transition-colors duration-300 ${idx === currentPhotoIndex ? 'bg-white' : 'bg-white/30'}`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Destaque Badge */}
                      {(activeCard as any).is_boosted && (
                        <div className="absolute top-10 left-3 z-40 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#fcd34d] to-[#d4af37] text-black text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 border border-white/20">
                          <Zap className="w-3 h-3 fill-black animate-pulse" />
                          <span>Perfil em Destaque</span>
                        </div>
                      )}

                      {/* Navigation Zones — tap left/right to browse photos */}
                      <div className="absolute inset-0 z-30 flex">
                        <div className="w-1/2 h-[80%]" onClick={handlePrevPhoto} />
                        <div className="w-1/2 h-[80%]" onClick={handleNextPhoto} />
                      </div>

                      {/* Photo */}
                      <OptimizedImage
                        src={getOptimizedImageUrl(photoSrc, IMAGE_SIZES.PROFILE_CARD)}
                        className="w-full h-full object-cover pointer-events-none"
                        containerClassName="w-full h-full"
                        alt="Profile"
                        loading="eager"
                        fetchPriority="high"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                      {/* Text Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none z-30">
                        {/* Online Badge & Liked You Badge */}
                        <div className="flex flex-wrap gap-2 mb-2.5">
                          {onlineStatus && (
                            <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              ONLINE
                            </div>
                          )}
                          {(activeCard as any).has_liked_me && (
                            <div className="bg-orange-500/20 backdrop-blur-md border border-orange-500/30 text-orange-400 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(251,146,60,0.2)]">
                              <Heart className="w-3 h-3 fill-orange-500" />
                              CURTIU VOCÊ!
                            </div>
                          )}
                        </div>

                        {/* Name and Age */}
                        <div className="flex items-center gap-2 mb-2">
                          <h1 className="font-display text-3xl font-bold tracking-tight drop-shadow-md">
                            {activeCard.display_name}
                          </h1>
                          {(activeCard as any).is_bot && (activeCard as any).age ? (
                            <span className="text-3xl font-extralight text-white/90 drop-shadow-md">
                              {(activeCard as any).age}
                            </span>
                          ) : activeCard.birth_date ? (
                            <span className="text-3xl font-extralight text-white/90 drop-shadow-md">
                              {calculateAge(activeCard.birth_date)}
                            </span>
                          ) : null}
                          {(activeCard as any).is_verified && (
                            <div className="bg-blue-500 rounded-full p-0.5 shadow-lg border border-white/20">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white fill-blue-500" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 mb-5">
                          {activeCard.city && (
                            <div className="flex items-center gap-2 text-[15px] font-medium text-white/90 drop-shadow-sm">
                              <Home className="w-4 h-4 opacity-80" />
                              <span>Mora em/no {activeCard.city}</span>
                            </div>
                          )}
                          {distance && (
                            <div className="flex items-center gap-2 text-[15px] font-medium text-white/90 drop-shadow-sm">
                              <MapPin className="w-4 h-4 opacity-80" />
                              <span>{distance}</span>
                            </div>
                          )}
                        </div>

                        {/* Relationship Goal */}
                        {activeCard.looking_for && (
                          <div className="flex items-center gap-2.5 bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 w-fit shadow-xl group transition-all">
                            <div className="w-5 h-5 flex items-center justify-center">
                              {activeCard.looking_for.toLowerCase().includes('relacionamento') || activeCard.looking_for.toLowerCase().includes('família') ? (
                                <Heart className="w-4 h-4 text-white fill-white/20" />
                              ) : (
                                <Search className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <span className="text-[14px] font-bold text-white tracking-tight drop-shadow-sm">
                              {activeCard.looking_for}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Swipe Stamps */}
                      <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-6 z-30 border-4 border-emerald-500 text-emerald-500 px-4 py-1 rounded-lg font-bold text-3xl -rotate-12 tracking-widest uppercase bg-black/20 backdrop-blur-sm">
                        LIKE
                      </motion.div>
                      <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-6 z-30 border-4 border-red-500 text-red-500 px-4 py-1 rounded-lg font-bold text-3xl rotate-12 tracking-widest uppercase bg-black/20 backdrop-blur-sm">
                        NOPE
                      </motion.div>
                      <motion.div style={{ opacity: superLikeOpacity }} className="absolute bottom-40 left-1/2 -translate-x-1/2 z-30 border-4 border-blue-500 text-blue-500 px-4 py-1 rounded-lg font-bold text-3xl tracking-widest uppercase bg-black/20 backdrop-blur-sm">
                        SUPER
                      </motion.div>

                      {/* Info Detail Button → Expand */}
                      <button
                        onClick={() => setShowInfo(true)}
                        className="absolute bottom-8 right-8 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-black/60 z-40 pointer-events-auto transition-all active:scale-95"
                      >
                        <i className="ri-arrow-up-s-line text-2xl" />
                      </button>
                    </div>
                  </motion.div>
                );
              })()}


              {/* Floating Action Controls (Main View) */}
              {!showInfo && (
                <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center items-center gap-8 pointer-events-none transition-all">
                  <button
                    onClick={() => handleSwipe('dislike')}
                    className="w-14 h-14 rounded-full bg-card/80 backdrop-blur-lg border border-red-500/30 text-red-500 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all pointer-events-auto"
                  >
                    <i className="ri-close-line text-3xl font-semibold" />
                  </button>
                  <button
                    onClick={() => handleSwipe('super_like')}
                    className="w-11 h-11 mb-2 rounded-full bg-card/80 backdrop-blur-lg border border-blue-500/30 text-blue-500 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all pointer-events-auto"
                  >
                    <i className="ri-star-fill text-xl" />
                  </button>
                  <button
                    onClick={() => handleSwipe('like')}
                    className="group relative w-14 h-14 rounded-full p-[3px] bg-gradient-to-tr from-[#d4af37] via-[#fcd34d] to-[#b45309] shadow-2xl shadow-orange-500/20 hover:scale-110 active:scale-95 transition-all pointer-events-auto"
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#d4af37] to-[#b45309] flex items-center justify-center border border-white/20 shadow-inner group-hover:from-[#fcd34d] group-hover:to-[#d4af37] transition-colors">
                      <i className="ri-heart-fill text-3xl text-white drop-shadow-md" />
                    </div>
                  </button>
                  <div className="absolute right-6 pointer-events-auto">
                    <DiscoverFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      onApply={handleApplyFilters}
                      triggerClassName="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border-white/10 text-white/50 hover:bg-black/40 hover:text-white transition-all shadow-none ring-0 focus:ring-0 active:scale-95"
                    />
                  </div>
                </div>
              )}

              {/* Expanded Profile Details Overlay - PORTAL for Full Immersion */}
              {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                  {showInfo && currentProfile && (
                    <motion.div
                      key="expanded-profile-view"
                      initial={false}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      drag="y"
                      dragControls={dragControls}
                      dragListener={false}
                      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                      dragElastic={{ top: 0, bottom: 0.7, left: 0.1, right: 0.8 }}
                      onDragEnd={(e, info) => {
                        if (info.offset.y > 100 || info.velocity.y > 500 || info.offset.x > 100 || info.velocity.x > 500) {
                          handleManualBack();
                        }
                      }}
                      className="fixed inset-0 z-[9999] bg-background flex flex-col overflow-hidden"
                    >
                      {/* Scrollable Content */}
                      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide relative">

                        {/* Close Button - Top Right - Size matched to Expand Button */}
                        <button
                          onClick={handleManualBack}
                          className="fixed top-[calc(1.25rem+env(safe-area-inset-top))] right-4 z-[100] w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl text-white flex items-center justify-center border border-white/20 shadow-2xl hover:bg-black/80 active:scale-90 transition-all"
                        >
                          <i className="ri-arrow-down-s-line text-2xl" />
                        </button>

                        {/* Hero Image Section */}
                        {/* Galeria de Fotos Centralizada */}
                        <ProfilePhotoGallery
                          profile={currentProfile as any}
                          currentPhotoIndex={currentPhotoIndex}
                          onNextPhoto={handleNextPhoto}
                          onPrevPhoto={handlePrevPhoto}
                          dragControls={dragControls}
                        />

                        {/* Line Cover - hides the photo container bottom border */}
                        <div className="relative z-[5] h-3 -mt-3 bg-background" />

                        {/* Profile Info Content */}
                        <ProfileDetails
                          profile={currentProfile as any}
                          userCoords={userCoords}
                          showDirectMessage={true}
                          onSendMessage={() => {
                            const tier = subscription?.tier || 'none';
                            if (tier !== 'gold') {
                              setShowSuperLikeExplainer(true);
                            } else {
                              setShowSuperLikeMessageDialog(true);
                            }
                          }}
                          onReport={() => setShowReport(true)}
                          onBlock={() => setShowBlock(true)}
                        />

                        {/* Ações de Segurança Agrupadas */}
                        <SafetyActions
                          showReport={showReport}
                          setShowReport={setShowReport}
                          showBlock={showBlock}
                          setShowBlock={setShowBlock}
                          targetId={(currentProfile as any).user_id || (currentProfile as any).id}
                          targetName={currentProfile.display_name}
                          onSuccess={() => {
                            handleSwipe('dislike');
                            setShowInfo(false);
                          }}
                        />
                      </div>

                      {/* Floating Action Controls (Expanded View) */}
                      <div className="absolute bottom-6 left-0 right-0 z-[100] flex justify-center px-6 pb-[calc(env(safe-area-inset-bottom)*0.6)] pointer-events-none">
                        <div className="pointer-events-auto bg-[#1e293b]/95 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_15px_rgba(255,255,255,0.03)] flex items-center justify-center gap-8 ring-1 ring-white/10">
                          <button onClick={() => handleSwipe('dislike')} className="w-14 h-14 rounded-full bg-card/40 backdrop-blur-lg border border-red-500/30 text-red-500 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                            <i className="ri-close-line text-3xl font-semibold" />
                          </button>
                          <button onClick={() => handleSwipe('super_like')} className="w-11 h-11 rounded-full bg-card/40 backdrop-blur-lg border border-blue-500/30 text-blue-500 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                            <i className="ri-star-fill text-xl" />
                          </button>
                          <button onClick={() => handleSwipe('like')} className="group relative w-14 h-14 rounded-full p-[3px] bg-gradient-to-tr from-[#d4af37] via-[#fcd34d] to-[#b45309] shadow-2xl shadow-orange-500/20 hover:scale-110 active:scale-95 transition-all">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#d4af37] to-[#b45309] flex items-center justify-center border border-white/20 shadow-inner group-hover:from-[#fcd34d] group-hover:to-[#d4af37] transition-colors">
                              <i className="ri-heart-fill text-3xl text-white drop-shadow-md" />
                            </div>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>,
                document.body
              )}

              <MatchCelebration
                show={showMatchCelebration}
                matchName={matchData?.name}
                matchPhoto={matchData?.photo}
                onSendMessage={() => {
                  setShowMatchCelebration(false);
                  if (matchData?.matchId) {
                    navigate(`/app/chat/${matchData.matchId}`);
                  }
                  setMatchData(null);
                }}
                onClose={() => {
                  setShowMatchCelebration(false);
                  setMatchData(null);
                }}
              />

              <Dialog
                open={showCompleteProfileDialog}
                onOpenChange={(open) => {
                  if (!open) {
                    if (user?.id) {
                      localStorage.setItem(`profile-completion-dismissed-${user.id}`, 'true');
                    }
                    setShowCompleteProfileDialog(false);
                  }
                }}
              >
                <DialogContent hideClose className="w-[85vw] max-w-[320px] rounded-[2rem] p-6 border-border dark:border-white/20 bg-card/95 backdrop-blur-xl dark:backdrop-blur-2xl shadow-xl dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_0_20px_rgba(255,255,255,0.02)] ring-1 ring-black/5 dark:ring-white/10 outline-none">
                  <DialogHeader className="space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <i className="ri-user-star-line text-2xl text-primary animate-pulse" />
                    </div>
                    <DialogTitle className="text-center text-xl font-display font-semibold">
                      Complete seu Perfil!
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
                      Adicione até 6 fotos e seus interesses para destacar seu perfil.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-3 mt-6">
                    <Button
                      onClick={() => navigate('/app/profile/edit')}
                      className="w-full h-11 rounded-xl gradient-button text-white font-semibold shadow-lg"
                    >
                      Completar Agora
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        localStorage.setItem(`profile-completion-dismissed-at-${user?.id}`, Date.now().toString());
                        setShowCompleteProfileDialog(false);
                      }}
                      className="w-full h-11 rounded-xl hover:bg-white/5 text-muted-foreground"
                    >
                      Depois
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <SuperLikeExplainerDialog
                open={showSuperLikeExplainer}
                onOpenChange={setShowSuperLikeExplainer}
                profileName={currentProfile?.display_name}
                onViewPlans={() => {
                  setShowSuperLikeExplainer(false);
                  setUpgradeData({
                    title: "Super Like - Exclusivo Plano Ouro",
                    description: "Destaque-se e envie uma mensagem direta! O Super Like é exclusivo do Plano Ouro e mostra que você está realmente interessado.",
                    features: PLANS.find(p => p.id === 'gold')?.features || [],
                    planNeeded: 'gold',
                    icon: <i className="ri-star-fill text-4xl text-blue-500" />,
                    price: PLANS.find(p => p.id === 'gold')?.price || 49.90,
                    planId: 'gold'
                  });
                  setShowUpgradeDialog(true);
                }}
              />

              <UpgradeFlow
                showUpgrade={showUpgradeDialog}
                setShowUpgrade={setShowUpgradeDialog}
                upgradeData={upgradeData}
                showCheckout={showCheckoutManager}
                setShowCheckout={setShowCheckoutManager}
                selectedPlan={selectedCheckoutPlan}
                onUpgrade={(planData) => {
                  setSelectedCheckoutPlan({ id: planData.id, name: planData.name, price: planData.price });
                  setShowUpgradeDialog(false);
                  setShowCheckoutManager(true);
                }}
              />

              <LikeLimitDialog
                open={showLikeLimitDialog}
                onOpenChange={setShowLikeLimitDialog}
                onSeePlans={() => {
                  setUpgradeData({
                    title: "Plano Prata",
                    description: "Não pare sua busca! Assine o Plano Prata para ter curtidas ilimitadas e falar com quem você gosta!",
                    features: ["Ver quem curtiu você", "Curtidas ilimitadas", "Enviar ou receber fotos e áudios", "Filtro por cidade / região", "Fazer chamadas de voz e vídeo", "Comunidade cristã no WhatsApp"],
                    planNeeded: 'silver',
                    icon: <i className="ri-heart-line text-4xl" />,
                    price: 29.90,
                    planId: 'silver'
                  });
                  setShowUpgradeDialog(true);
                }}
              />

              {/* Location Permission Modal — only show if profile completion is NOT showing to avoid overlap */}
              {!showCompleteProfileDialog && (
                <LocationPermissionModal
                  onActivate={() => {
                    setShowLocationModal(false);
                    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as { standalone?: boolean }).standalone === true;
                    if (isPWA) {
                      requestLocation();
                    } else {
                      navigate('/install');
                    }
                  }}
                  onDismiss={() => {
                    // Save timestamp — will reappear after 2 hours
                    localStorage.setItem(`location-modal-dismissed-at-${user?.id}`, Date.now().toString());
                    setShowLocationModal(false);
                  }}
                />
              )}

            </div>
          </>
        )}
      </PageTransition>
    </>
  );
}
