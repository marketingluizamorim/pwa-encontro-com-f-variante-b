import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform, useDragControls } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import DiscoverFilters, { DiscoverFiltersState } from '@/features/discovery/components/DiscoverFilters';
import { useDiscoverProfiles, useSwipeMutation } from '@/features/discovery/hooks/useDiscoverProfiles';
import { triggerHaptic } from '@/lib/haptics';
import { PageTransition } from '@/features/discovery/components/PageTransition';
import { DiscoverSkeleton } from '@/features/discovery/components/SkeletonLoaders';
import { MatchCelebration } from '@/features/discovery/components/MatchCelebration';
import { playNotification } from '@/lib/notifications';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureGateDialog } from '@/features/discovery/components/FeatureGateDialog';
import { CheckoutManager } from '@/features/discovery/components/CheckoutManager';
import { LikeLimitDialog } from '@/features/discovery/components/LikeLimitDialog';
import { MessageCircle, Zap, Search, MapPin, Home, CheckCircle2, Clock, Heart, User2, MoreHorizontal, Ruler, UserCircle, Dumbbell, Wine, Cigarette, Share2, LayoutList, Baby, MessageSquareText, Sparkles, PawPrint, Compass, Ban, AlertTriangle, Briefcase, BookOpen, GraduationCap, Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog, BlockDialog } from "@/features/discovery/components/UserActions";
import { useTheme } from '@/components/theme-provider';
import { Header } from '@/features/discovery/components/Header';
import { PLANS } from '@/features/funnel/components/plans/PlansGrid';
import { SuperLikeExplainerDialog } from '@/features/discovery/components/SuperLikeExplainerDialog';
import { SuperLikeMessageDialog } from '@/features/discovery/components/SuperLikeMessageDialog';
import { calculateAge, formatLastActive } from '@/lib/date-utils';

const LOOKING_FOR_EMOJIS: Record<string, string> = {
  'Relacionamento sério': '💍',
  'Construir uma família': '👨‍👩‍👧‍👦',
  'Conhecer pessoas novas': '✨',
  'Amizade verdadeira': '🤝',
};
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DEFAULT_FILTERS: DiscoverFiltersState = {
  minAge: 18,
  maxAge: 60,
  state: '',
  city: '',
  religion: '',
  churchFrequency: '',
  lookingFor: '',
  christianInterests: [],
  hasPhotos: false,
  isVerified: false,
  onlineRecently: false,
  maxDistance: 500,
};

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 500;

export default function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dragControls = useDragControls();
  const { error: geoError, requestLocation } = useGeolocation();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<DiscoverFiltersState>(() => {
    const FILTERS_VERSION = 'v2'; // bump when defaults change
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
  const [showMatchCelebration, setShowMatchCelebration] = useState(false);
  const [matchData, setMatchData] = useState<{ name: string; photo: string; matchId: string } | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showCompleteProfileDialog, setShowCompleteProfileDialog] = useState(false);
  const { data: subscription } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  const [upgradeData, setUpgradeData] = useState({
    title: '',
    description: '',
    features: [],
    planNeeded: 'silver' as 'silver' | 'gold' | 'bronze',
    icon: null as React.ReactNode,
    price: 0,
    planId: ''
  });
  const [showCheckoutManager, setShowCheckoutManager] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<{ id: string, name: string, price: number } | null>(null);
  const [showLikeLimitDialog, setShowLikeLimitDialog] = useState(false);
  const [showSuperLikeExplainer, setShowSuperLikeExplainer] = useState(false);
  const [showSuperLikeMessageDialog, setShowSuperLikeMessageDialog] = useState(false);

  // Photo Navigation State
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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
  } = useDiscoverProfiles(appliedFilters);

  const swipeMutation = useSwipeMutation();

  const profiles = useMemo(() => {
    if (!data?.pages) return [];
    const allProfiles = data.pages.flatMap((page) => page.profiles);
    return allProfiles;
  }, [data]);

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


  const calculateDistance = (lat1?: number, lon1?: number, lat2?: number, lon2?: number): string | null => {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;

    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    if (d < 1) return 'a menos de 1 km de distância';
    return `a ${Math.round(d)} km de distância`;
  };

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

    // Check if dismissed
    if (localStorage.getItem(`profile-completion-dismissed-${user.id}`) === 'true') {
      return;
    }

    const checkProfile = async () => {

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

    // Check daily limit for Bronze/None
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

    // OPTIMISTIC UPDATE: Move to next card immediately visually
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setExitDirection(null);
      setSwiping(false);
      x.set(0);
      y.set(0);
      setShowInfo(false);
    }, 200);

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
          // Optional: You could revert the swipe here, but for dating apps it's usually better to just ignore or show a toast
          // toast.error('Erro ao salvar interação');
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

    if (offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD) {
      handleSwipe('like');
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
      handleSwipe('dislike');
    } else if (offset.y < -SWIPE_THRESHOLD || velocity.y < -SWIPE_VELOCITY_THRESHOLD) {
      handleSwipe('super_like');
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

  if (isLoading) return <DiscoverSkeleton />;

  const isEmpty = profiles.length === 0 || currentIndex >= profiles.length;

  return (
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
                  <img
                    src={nextProfile.photos?.[0] || nextProfile.avatar_url || '/placeholder.svg'}
                    className="w-full h-full object-cover opacity-50 grayscale"
                    alt="Next"
                  />
                </div>
              </div>
            )}

            {/* CURRENT CARD (Foreground) */}
            <motion.div
              key={currentProfile.id}
              style={{ x, y, rotate }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={{ top: 0.7, bottom: 0, left: 0.7, right: 0.7 }}
              onDragEnd={handleDragEnd}
              className="w-full h-full absolute inset-0 px-4 pt-4 pb-24 z-20 cursor-grab active:cursor-grabbing touch-none"
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
                {currentProfile.photos && currentProfile.photos.length > 1 && (
                  <div className="absolute top-3 left-3 right-3 z-40 flex gap-1.5 h-1">
                    {currentProfile.photos.map((_, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 rounded-full h-full shadow-sm transition-colors duration-300 ${idx === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                          }`}
                      />
                    ))}
                  </div>
                )}

                {/* Destaque Badge */}
                {currentProfile.is_boosted && (
                  <div className="absolute top-10 left-3 z-40 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#fcd34d] to-[#d4af37] text-black text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 border border-white/20">
                    <Zap className="w-3 h-3 fill-black animate-pulse" />
                    <span>Perfil em Destaque</span>
                  </div>
                )}

                {/* Navigation Zones (Left/Right) - Only Active if not swiping (handled by onClick vs Drag) */}
                <div className="absolute inset-0 z-30 flex">
                  <div className="w-1/2 h-[80%]" onClick={handlePrevPhoto} />
                  <div className="w-1/2 h-[80%]" onClick={handleNextPhoto} />
                </div>

                {/* Photo */}
                <img
                  src={currentProfile.photos?.[currentPhotoIndex] || currentProfile.photos?.[0] || currentProfile.avatar_url}
                  className="w-full h-full object-cover pointer-events-none"
                  alt="Profile"
                  draggable={false}
                  loading="eager"
                  fetchPriority="high"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                {/* Text Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none z-30">
                  {/* Online Badge */}
                  {formatLastActive(currentProfile.last_active_at, currentProfile.show_online_status, currentProfile.show_last_active) === 'Online' && (
                    <div className="mb-2.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      ONLINE
                    </div>
                  )}

                  {/* Name and Age Group */}
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="font-display text-3xl font-bold tracking-tight drop-shadow-md">
                      {currentProfile.display_name}
                    </h1>
                    {currentProfile.birth_date && (
                      <span className="text-3xl font-extralight text-white/90 drop-shadow-md">
                        {calculateAge(currentProfile.birth_date)}
                      </span>
                    )}
                    {currentProfile.is_verified && (
                      <div className="bg-blue-500 rounded-full p-0.5 shadow-lg border border-white/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white fill-blue-500" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 mb-5">
                    {currentProfile.city && (
                      <div className="flex items-center gap-2 text-[15px] font-medium text-white/90 drop-shadow-sm">
                        <Home className="w-4 h-4 opacity-80" />
                        <span>Mora em/no {currentProfile.city}</span>
                      </div>
                    )}

                    {/* Distância */}
                    {(() => {
                      const distance = calculateDistance(
                        //@ts-ignore
                        user?.latitude || user?.profile?.latitude,
                        //@ts-ignore
                        user?.longitude || user?.profile?.longitude,
                        currentProfile.latitude,
                        currentProfile.longitude
                      );

                      if (!distance) return null;

                      return (
                        <div className="flex items-center gap-2 text-[15px] font-medium text-white/90 drop-shadow-sm">
                          <MapPin className="w-4 h-4 opacity-80" />
                          <span>{distance}</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Relationship Goal */}
                  {currentProfile.looking_for && (
                    <div className="flex items-center gap-2.5 bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 w-fit shadow-xl group transition-all">
                      <div className="w-5 h-5 flex items-center justify-center">
                        {currentProfile.looking_for.toLowerCase().includes('relacionamento') || currentProfile.looking_for.toLowerCase().includes('família') ? (
                          <Heart className="w-4 h-4 text-white fill-white/20" />
                        ) : (
                          <Search className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-[14px] font-bold text-white tracking-tight drop-shadow-sm">
                        {currentProfile.looking_for}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stamps */}
                <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-6 z-30 border-4 border-emerald-500 text-emerald-500 px-4 py-1 rounded-lg font-bold text-3xl -rotate-12 tracking-widest uppercase bg-black/20 backdrop-blur-sm">
                  LIKE
                </motion.div>
                <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-6 z-30 border-4 border-red-500 text-red-500 px-4 py-1 rounded-lg font-bold text-3xl rotate-12 tracking-widest uppercase bg-black/20 backdrop-blur-sm">
                  NOPE
                </motion.div>
                <motion.div style={{ opacity: superLikeOpacity }} className="absolute bottom-40 left-1/2 -translate-x-1/2 z-30 border-4 border-blue-500 text-blue-500 px-4 py-1 rounded-lg font-bold text-3xl tracking-widest uppercase bg-black/20 backdrop-blur-sm">
                  SUPER
                </motion.div>

                {/* Info Detail Button -> Expand */}
                <button
                  onClick={() => setShowInfo(true)}
                  className="absolute bottom-8 right-8 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-black/60 z-40 pointer-events-auto transition-all active:scale-95"
                >
                  <i className="ri-arrow-up-s-line text-2xl" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Floating Action Controls (Main View) */}
          {!showInfo && (
            <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center items-center gap-8 pointer-events-none transition-all">
              {/* Nope */}
              <button
                onClick={() => handleSwipe('dislike')}
                className="w-14 h-14 rounded-full bg-card/80 backdrop-blur-lg border border-red-500/30 text-red-500 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all pointer-events-auto"
              >
                <i className="ri-close-line text-3xl font-semibold" />
              </button>

              {/* Super Like */}
              <button
                onClick={() => handleSwipe('super_like')}
                className="w-11 h-11 mb-2 rounded-full bg-card/80 backdrop-blur-lg border border-blue-500/30 text-blue-500 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all pointer-events-auto"
              >
                <i className="ri-star-fill text-xl" />
              </button>

              {/* Like */}
              <button
                onClick={() => handleSwipe('like')}
                className="group relative w-14 h-14 rounded-full p-[3px] bg-gradient-to-tr from-[#d4af37] via-[#fcd34d] to-[#b45309] shadow-2xl shadow-orange-500/20 hover:scale-110 active:scale-95 transition-all pointer-events-auto"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#d4af37] to-[#b45309] flex items-center justify-center border border-white/20 shadow-inner group-hover:from-[#fcd34d] group-hover:to-[#d4af37] transition-colors">
                  <i className="ri-heart-fill text-3xl text-white drop-shadow-md" />
                </div>
              </button>

              {/* Filter Button (Discreet - Absolute Right) */}
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
        </>
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
                <motion.div
                  className="relative w-full h-[60vh] touch-none cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => dragControls.start(e)}
                >
                  {/* Photo Stories Progress Bar - Expanded View */}
                  {currentProfile.photos && currentProfile.photos.length > 1 && (
                    <div className="absolute top-[calc(1.25rem+env(safe-area-inset-top))] left-3 right-3 z-40 flex gap-1.5 h-1">
                      {currentProfile.photos.map((_, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 rounded-full h-full shadow-sm transition-all duration-300 ${idx === currentPhotoIndex ? 'bg-white scale-y-110 shadow-lg' : 'bg-white/30'
                            }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Navigation Zones (Left/Right) - Expanded View */}
                  <div className="absolute inset-0 z-30 flex">
                    <div className="w-1/2 h-full cursor-pointer" onClick={handlePrevPhoto} />
                    <div className="w-1/2 h-full cursor-pointer" onClick={handleNextPhoto} />
                  </div>

                  <img
                    src={currentProfile.photos?.[currentPhotoIndex] || currentProfile.photos?.[0] || currentProfile.avatar_url || '/placeholder.svg'}
                    className="w-full h-full object-cover pointer-events-none"
                    alt={currentProfile.display_name}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

                  {/* Destaque Badge - Expanded View */}
                  {currentProfile.is_boosted && (
                    <div className="absolute bottom-24 left-5 z-40 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#fcd34d] to-[#d4af37] text-black text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 border border-white/20">
                      <Zap className="w-3 h-3 fill-black animate-pulse" />
                      <span>Perfil em Destaque</span>
                    </div>
                  )}
                </motion.div>

                {/* Line Cover - hides the photo container bottom border */}
                <div className="relative z-20 h-2 -mt-2 bg-background" />

                {/* Profile Info Content */}
                <div className="px-4 -mt-16 relative z-10 space-y-4 pb-12">

                  {/* Name, Age & Verified */}
                  <div className="px-1 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl text-foreground tracking-tight">
                        <span className="font-bold">{currentProfile.display_name}</span>
                        <span className="font-extralight text-muted-foreground ml-2">
                          {currentProfile.birth_date ? calculateAge(currentProfile.birth_date) : ''}
                        </span>
                      </div>
                      {/* {currentProfile.is_verified && (
                        <div className="bg-blue-500 rounded-full p-1 shadow-lg">
                          <CheckCircle2 className="w-5 h-5 text-white fill-blue-500" />
                        </div>
                      )} */}
                    </div>

                    {/* Atividade Recente */}
                    {(() => {
                      const status = formatLastActive(currentProfile.last_active_at, currentProfile.show_online_status, currentProfile.show_last_active);
                      if (!status) return null;

                      return (
                        <div className="flex items-center gap-1.5 mt-2.5 text-emerald-500 font-medium text-[15px]">
                          <div className={cn("w-2 h-2 rounded-full", status === 'Online' ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-emerald-500/50")} />
                          <span>{status === 'Online' ? 'Online agora' : status}</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Section: About Me */}
                  {currentProfile.bio && (
                    <div className="px-1 space-y-3 pt-2 pb-4">
                      <h3 className="text-lg font-bold text-foreground">Sobre mim</h3>
                      <p className="text-[17px] text-muted-foreground leading-relaxed">
                        {currentProfile.bio}
                      </p>
                    </div>
                  )}

                  {/* Section: Looking For */}
                  {currentProfile.looking_for && (
                    <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-muted-foreground/80">
                          <Search className="w-4 h-4" />
                          <span className="text-sm font-semibold uppercase tracking-wider">Tô procurando</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">
                            {LOOKING_FOR_EMOJIS[currentProfile.looking_for] || '💍'}
                          </span>
                          <span className="text-xl font-bold text-foreground">
                            {currentProfile.looking_for}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section: Basic Info */}
                  <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-foreground">
                        <User2 className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Informações básicas</h3>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-10 h-10 rounded-xl bg-secondary/40 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-slate-900/95 backdrop-blur-xl border-white/10 rounded-2xl p-1 z-[10000]">
                          <DropdownMenuItem
                            onClick={() => setShowReportDialog(true)}
                            className="flex items-center gap-2 p-3 text-amber-500 focus:bg-amber-500/10 focus:text-amber-500 rounded-xl cursor-pointer"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            Denunciar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setShowBlockDialog(true)}
                            className="flex items-center gap-2 p-3 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 rounded-xl cursor-pointer"
                          >
                            <Ban className="w-4 h-4" />
                            Bloquear
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="px-5 pb-2">
                      {/* Distance Row */}
                      {(() => {
                        const distance = calculateDistance(
                          //@ts-ignore
                          user?.latitude || user?.profile?.latitude,
                          //@ts-ignore
                          user?.longitude || user?.profile?.longitude,
                          currentProfile.latitude,
                          currentProfile.longitude
                        );
                        if (!distance) return null;
                        return (
                          <div className="py-3.5 border-t border-border/40 flex items-center gap-3.5 group">
                            <MapPin className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                            <span className="text-[15px] font-medium text-foreground/90">{distance} daqui</span>
                          </div>
                        );
                      })()}

                      {/* City & State */}
                      {(currentProfile.city || currentProfile.state) && (
                        <div className="py-3.5 border-t border-border/40 flex items-center gap-3.5 group">
                          <Home className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                          <span className="text-[15px] font-medium text-foreground/90 leading-tight">
                            Mora em/no {currentProfile.city}
                            {currentProfile.state ? `, ${currentProfile.state}` : ''}
                          </span>
                        </div>
                      )}

                      {/* Occupation */}
                      {currentProfile.occupation && (
                        <div className="py-3.5 border-t border-border/40 flex items-center gap-3.5 group">
                          <Briefcase className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                          <span className="text-[15px] font-medium text-foreground/90 leading-tight">Trabalha como {currentProfile.occupation}</span>
                        </div>
                      )}

                      {/* Religion */}
                      {currentProfile.religion && (
                        <div className="py-3.5 border-t border-border/40 flex items-center gap-3.5 group">
                          <BookOpen className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                          <span className="text-[15px] font-medium text-foreground/90 leading-tight">{currentProfile.religion}</span>
                        </div>
                      )}



                      {/* Education */}
                      {currentProfile.education && (
                        <div className="py-3.5 border-t border-border/40 flex items-center gap-3.5 group">
                          <GraduationCap className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                          <span className="text-[15px] font-medium text-foreground/90 leading-tight">{currentProfile.education}</span>
                        </div>
                      )}

                      {/* Gender */}
                      {currentProfile.gender && (
                        <div className="py-3.5 border-t border-border/40 flex items-center gap-3.5 group">
                          <UserCircle className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                          <span className="text-[15px] font-medium text-foreground/90 leading-tight">
                            {currentProfile.gender.toLowerCase() === 'male' ? 'Homem' :
                              currentProfile.gender.toLowerCase() === 'female' ? 'Mulher' :
                                currentProfile.gender}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Lifestyle */}
                  {((currentProfile.pets || currentProfile.drink || currentProfile.smoke || currentProfile.physical_activity || currentProfile.social_media || (currentProfile.languages && currentProfile.languages.length > 0))) && (
                    <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl overflow-hidden shadow-sm">
                      <div className="p-5 flex items-center gap-2.5 text-foreground border-b border-border/40">
                        <LayoutList className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Estilo de vida</h3>
                      </div>

                      <div className="px-5 py-2 space-y-4 divide-y divide-border/40">
                        {currentProfile.pets && (
                          <div className="pt-4 first:pt-2">
                            <p className="text-xs font-bold text-muted-foreground mb-2">Pets</p>
                            <div className="flex items-center gap-3 text-foreground/90">
                              <PawPrint className="w-5 h-5 text-muted-foreground/60" />
                              <span className="text-[15px] font-medium">{currentProfile.pets}</span>
                            </div>
                          </div>
                        )}

                        {currentProfile.drink && (
                          <div className="pt-4">
                            <p className="text-xs font-bold text-muted-foreground mb-2">Bebida</p>
                            <div className="flex items-center gap-3 text-foreground/90">
                              <Wine className="w-5 h-5 text-muted-foreground/60" />
                              <span className="text-[15px] font-medium">{currentProfile.drink}</span>
                            </div>
                          </div>
                        )}

                        {currentProfile.smoke && (
                          <div className="pt-4">
                            <p className="text-xs font-bold text-muted-foreground mb-2">Você fuma?</p>
                            <div className="flex items-center gap-3 text-foreground/90">
                              <Cigarette className="w-5 h-5 text-muted-foreground/60" />
                              <span className="text-[15px] font-medium">{currentProfile.smoke}</span>
                            </div>
                          </div>
                        )}

                        {currentProfile.physical_activity && (
                          <div className="pt-4">
                            <p className="text-xs font-bold text-muted-foreground mb-2">Atividade física</p>
                            <div className="flex items-center gap-3 text-foreground/90">
                              <Dumbbell className="w-5 h-5 text-muted-foreground/60" />
                              <span className="text-[15px] font-medium">{currentProfile.physical_activity}</span>
                            </div>
                          </div>
                        )}

                        {currentProfile.social_media && (
                          <div className="pt-4">
                            <p className="text-xs font-bold text-muted-foreground mb-2">Redes sociais</p>
                            <div className="flex items-center gap-3 text-foreground/90">
                              <Share2 className="w-5 h-5 text-muted-foreground/60" />
                              <span className="text-[15px] font-medium">{currentProfile.social_media}</span>
                            </div>
                          </div>
                        )}

                        {currentProfile.languages && currentProfile.languages.length > 0 && (
                          <div className="pt-4 pb-2">
                            <p className="text-xs font-bold text-muted-foreground mb-2">Idiomas</p>
                            <div className="flex items-center gap-3 text-foreground/90">
                              <Languages className="w-5 h-5 text-muted-foreground/60" />
                              <span className="text-[15px] font-medium">
                                {Array.isArray(currentProfile.languages) ? currentProfile.languages.join(', ') : currentProfile.languages}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section: More Info */}
                  {(currentProfile.about_children || currentProfile.church_frequency) && (
                    <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl overflow-hidden shadow-sm">
                      <div className="p-5 flex items-center gap-2.5 text-foreground border-b border-border/40">
                        <LayoutList className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Mais informações</h3>
                      </div>

                      <div className="px-5 py-2 space-y-4 divide-y divide-border/40">
                        {currentProfile.church_frequency && (
                          <div className="pt-4 first:pt-2">
                            <p className="text-xs font-bold text-muted-foreground mb-2">Frequência na Igreja</p>
                            <div className="flex items-center gap-3 text-foreground/90">
                              <Sparkles className="w-5 h-5 text-muted-foreground/60" />
                              <span className="text-[15px] font-medium">{currentProfile.church_frequency}</span>
                            </div>
                          </div>
                        )}

                        {currentProfile.about_children && (
                          <div className="pt-4 pb-2">
                            <p className="text-xs font-bold text-muted-foreground mb-2">Família</p>
                            <div className="flex items-center gap-3 text-foreground/90">
                              <Baby className="w-5 h-5 text-muted-foreground/60" />
                              <span className="text-[15px] font-medium">{currentProfile.about_children}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 text-foreground">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-lg">Interesses</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(currentProfile.christian_interests || []).map((tag: string) => (
                        <span key={tag} className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Section: Direct Message (Direct Connect) */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                      <Zap className="w-12 h-12 text-blue-500" />
                    </div>

                    <h3 className="text-xl font-semibold text-blue-500 mb-2 flex items-center gap-2">
                      Mensagem Direta <Zap className="w-5 h-5 fill-blue-500" />
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      Não espere pela conexão! Envie uma mensagem direta agora mesmo para {currentProfile.display_name} e saia na frente.
                    </p>

                    <Button
                      onClick={() => {
                        const tier = subscription?.tier || 'none';
                        if (tier !== 'gold') {
                          setShowSuperLikeExplainer(true);
                        } else {
                          setShowSuperLikeMessageDialog(true);
                        }
                      }}
                      className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Enviar Mensagem
                    </Button>
                  </div>

                  {/* Bottom Spacer */}
                  <div className="h-24" />
                </div>

                {/* Interaction Dialogs (Report/Block) */}
                <ReportDialog
                  open={showReportDialog}
                  onOpenChange={setShowReportDialog}
                  userId={currentProfile.id}
                  userName={currentProfile.display_name}
                  onReported={() => {
                    handleSwipe('dislike');
                    setShowInfo(false);
                  }}
                />
                <BlockDialog
                  open={showBlockDialog}
                  onOpenChange={setShowBlockDialog}
                  userId={currentProfile.id}
                  userName={currentProfile.display_name}
                  onBlocked={() => {
                    handleSwipe('dislike');
                    setShowInfo(false);
                  }}
                />
              </div>

              {/* Floating Action Controls (Expanded View) */}
              <div className="absolute bottom-6 left-0 right-0 z-[100] flex justify-center px-6 pb-[calc(env(safe-area-inset-bottom)*0.4)] pointer-events-none">
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
        onComplete={() => {
          setShowMatchCelebration(false);
          if (matchData?.matchId) navigate(`/app/chat/${matchData.matchId}`);
          setMatchData(null);
        }}
      />

      <AlertDialog open={showCompleteProfileDialog} onOpenChange={setShowCompleteProfileDialog}>
        <AlertDialogContent className="w-[85vw] max-w-[320px] rounded-[2rem] p-6 border-border dark:border-white/20 bg-card/95 backdrop-blur-xl dark:backdrop-blur-2xl shadow-xl dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_0_20px_rgba(255,255,255,0.02)] ring-1 ring-black/5 dark:ring-white/10">
          <AlertDialogHeader className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <i className="ri-user-star-line text-2xl text-primary animate-pulse" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-display font-semibold">
              Complete seu Perfil!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
              Perfis completos têm 3x mais chances de match. Adicione informações e até 6 fotos para se destacar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <AlertDialogAction onClick={() => navigate('/app/profile/edit')} className="w-full h-11 rounded-xl gradient-button text-white font-semibold shadow-lg">Completar Agora</AlertDialogAction>
            <AlertDialogCancel onClick={() => { localStorage.setItem(`profile-completion-dismissed-${user?.id}`, 'true'); setShowCompleteProfileDialog(false); }} className="w-full h-11 rounded-xl border-none bg-transparent hover:bg-white/5 text-muted-foreground">Depois</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>

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

      <FeatureGateDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        title={upgradeData.title}
        description={upgradeData.description}
        features={upgradeData.features}
        icon={upgradeData.icon}
        price={upgradeData.price}
        onUpgrade={(planData) => {
          setSelectedCheckoutPlan({ id: planData.id, name: planData.name, price: planData.price });
          setShowUpgradeDialog(false);
          setShowCheckoutManager(true);
        }}
      />

      {showCheckoutManager && selectedCheckoutPlan && (
        <CheckoutManager
          key={`discover-checkout-v1-${selectedCheckoutPlan.id}`}
          open={showCheckoutManager}
          onOpenChange={(open) => {
            setShowCheckoutManager(open);
            if (!open) {
              setTimeout(() => {
                setSelectedCheckoutPlan(null);
                setShowUpgradeDialog(true);
              }, 50);
            }
          }}
          planId={selectedCheckoutPlan.id}
          planPrice={selectedCheckoutPlan.price}
          planName={selectedCheckoutPlan.name}
        />
      )}

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
    </PageTransition>
  );
}
