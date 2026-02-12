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
import { MessageCircle, Zap, Search, MapPin } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Header } from '@/features/discovery/components/Header';
import { PLANS } from '@/features/funnel/components/plans/PlansGrid';
import { SuperLikeExplainerDialog } from '@/features/discovery/components/SuperLikeExplainerDialog';

const LOOKING_FOR_EMOJIS: Record<string, string> = {
  'Um compromisso sério': '💍',
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
  maxDistance: 100,
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
    const saved = localStorage.getItem('discover-filters');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_FILTERS, ...parsed, christianInterests: parsed.christianInterests || [] };
    }
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

  // Photo Navigation State
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [currentIndex]);

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

  console.log('Discover Render. User:', user?.id);

  const profiles = useMemo(() => {
    console.log('Discover: Memoizing profiles. Data:', data);
    if (!data?.pages) return [];
    const allProfiles = data.pages.flatMap((page) => page.profiles);
    console.log('Discover: Flattened Profiles:', allProfiles.length, allProfiles);
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
  }, [currentIndex, profiles.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    localStorage.setItem('discover-filters', JSON.stringify(filters));
  }, [filters]);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    return today.getFullYear() - birth.getFullYear();
  };

  const formatLastActive = (lastActiveAt?: string, showOnline?: boolean, showLastActive?: boolean) => {
    if (showOnline === false) return null;
    if (!lastActiveAt) return null;

    const lastActive = new Date(lastActiveAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));

    // Considere "Online agora" se ativo nos últimos 5 minutos
    if (diffInMinutes < 5) return 'Online agora';

    if (showLastActive === false) return 'Visto recentemente';

    if (diffInMinutes < 60) return `Visto há ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Visto há ${diffInHours} h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Visto ontem';
    if (diffInDays < 7) return `Visto há ${diffInDays} dias`;

    return `Visto em ${lastActive.toLocaleDateString('pt-BR')}`;
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
      console.log('Discover: Starting Profile Check...');

      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

      if (error) {
        console.error('Discover: Error fetching profile:', error);
        // If error (e.g. no profile found), consider incomplete and show dialog
        setShowCompleteProfileDialog(true);
        return;
      }

      console.log('Discover: Profile Data:', data);

      const profileData = data as any || {};

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
        (profileData.photos && profileData.photos.length > 0),
        ((profileData.christian_interests && profileData.christian_interests.length > 0) || (profileData.interests && profileData.interests.length > 0))
      ];

      const filled = fields.filter(Boolean).length;
      const completion = fields.length > 0 ? Math.round((filled / fields.length) * 100) : 0;

      console.log(`Discover: Final Completion: ${completion}%`);

      if (completion < 100) {
        console.log('Discover: Triggering Dialog');
        setShowCompleteProfileDialog(true);
      }
    };
    checkProfile();
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

  const handleDragEnd = (event: any, info: PanInfo) => {
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
          <div className="flex-1 w-full max-w-md relative flex items-center justify-center pb-24 px-4">

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
              initial={{ scale: 0.95, opacity: 0, y: 50 }}
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

                {/* Navigation Zones (Left/Right) - Only Active if not swiping (handled by onClick vs Drag) */}
                <div className="absolute inset-0 z-30 flex">
                  <div className="w-1/2 h-[80%]" onClick={handlePrevPhoto} />
                  <div className="w-1/2 h-[80%]" onClick={handleNextPhoto} />
                </div>

                {/* Photo */}
                <img
                  src={currentProfile.photos?.[currentPhotoIndex] || currentProfile.photos?.[0] || currentProfile.avatar_url || '/placeholder.svg'}
                  className="w-full h-full object-cover pointer-events-none"
                  alt="Profile"
                  draggable={false}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                {/* Text Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none z-30">
                  <div className="flex items-end gap-3 mb-4">
                    <h1 className="font-display text-4xl font-semibold tracking-tight drop-shadow-md">
                      {currentProfile.display_name}
                    </h1>
                    {currentProfile.birth_date && (
                      <span className="text-2xl font-light text-white/90 mb-1">{calculateAge(currentProfile.birth_date)}</span>
                    )}
                  </div>

                  {/* Looking For Section */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 opacity-90">
                      <Search className="w-3.5 h-3.5 text-white/80" strokeWidth={3} />
                      <span className="text-sm font-semibold text-white/90">Tô procurando</span>
                    </div>

                    {currentProfile.looking_for ? (
                      <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                          <div className="absolute w-8 h-8 bg-amber-500/40 blur-xl rounded-full translate-y-1" />
                          <span className="relative text-3xl z-10 drop-shadow-md">
                            {LOOKING_FOR_EMOJIS[currentProfile.looking_for] || '💘'}
                          </span>
                        </div>
                        <span className="text-lg font-semibold text-white tracking-wide">
                          {currentProfile.looking_for}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 opacity-50">
                        <span className="text-xl">✨</span>
                        <span className="text-lg font-semibold text-white tracking-wide">
                          Buscando conexões
                        </span>
                      </div>
                    )}
                  </div>
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
                  className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-black/60 z-40 pointer-events-auto transition-colors"
                >
                  <i className="ri-arrow-up-s-line text-2xl" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Floating Action Controls (Main View) */}
          {!showInfo && (
            <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center items-center gap-6 pointer-events-none">
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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="y"
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.7 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setShowInfo(false);
                }
              }}
              className="fixed inset-0 z-[9999] bg-background flex flex-col overflow-hidden"
            >
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pb-44 scrollbar-hide relative">

                {/* Close Button - Top Right (Replaces Theme Toggle) */}
                <button
                  onClick={() => setShowInfo(false)}
                  className="fixed top-4 right-4 z-[100] w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg hover:bg-black/60 transition-colors"
                >
                  <i className="ri-arrow-down-s-line text-2xl" />
                </button>

                {/* Hero Image - Drag Handle */}
                <div
                  className="relative w-full h-[65vh] touch-none cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => dragControls.start(e)}
                >
                  <img
                    src={currentProfile.photos?.[0] || currentProfile.avatar_url || '/placeholder.svg'}
                    className="w-full h-full object-cover pointer-events-none"
                    alt={currentProfile.display_name}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
                </div>

                {/* Profile Info Content */}
                <div className="px-5 -mt-20 relative z-10 space-y-6">

                  {/* Header: Name & Age */}
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-4xl font-display font-semibold text-foreground">
                        {currentProfile.display_name}
                      </h1>
                      <span className="text-3xl font-light text-muted-foreground">
                        {currentProfile.birth_date ? calculateAge(currentProfile.birth_date) : ''}
                      </span>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-col gap-2.5 mt-4">
                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          formatLastActive(currentProfile.last_active_at, currentProfile.show_online_status, currentProfile.show_last_active) === 'Online agora'
                            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                            : "bg-muted-foreground/30"
                        )} />
                        <span className="text-sm font-medium text-muted-foreground">
                          {formatLastActive(currentProfile.last_active_at, currentProfile.show_online_status, currentProfile.show_last_active) || 'Offline'}
                        </span>
                      </div>

                      {/* Job & Location */}
                      <div className="flex items-center gap-4 text-sm text-foreground/70">
                        {currentProfile.occupation && (
                          <div className="flex items-center gap-1.5 leading-none">
                            <i className="ri-briefcase-line text-lg" />
                            <span>{currentProfile.occupation}</span>
                          </div>
                        )}
                        {(currentProfile.city) && (currentProfile.show_distance !== false) && (
                          <div className="flex items-center gap-1.5 leading-none">
                            <i className="ri-map-pin-line text-lg" />
                            <span>{currentProfile.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section: Looking For */}
                  <div className="bg-card/50 border border-border/50 rounded-2xl p-4 backdrop-blur-sm">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Tô procurando</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                        <i className="ri-heart-2-fill text-xl" />
                      </div>
                      <span className="text-lg font-medium">{currentProfile.looking_for || 'Um encontro abençoado'}</span>
                    </div>
                  </div>

                  {/* Section: About Me */}
                  {currentProfile.bio && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Sobre mim</h3>
                      <p className="text-muted-foreground leading-relaxed text-base">
                        {currentProfile.bio}
                      </p>
                    </div>
                  )}

                  {/* Section: Basic Info */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Informações básicas</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-secondary/30 rounded-xl p-3 flex items-center gap-3">
                        <i className="ri-ruler-line text-foreground/50 text-xl" />
                        <div>
                          <p className="text-xs text-muted-foreground">Altura</p>
                          <p className="font-medium">170 cm</p> {/* Placeholder if not in DB */}
                        </div>
                      </div>
                      <div className="bg-secondary/30 rounded-xl p-3 flex items-center gap-3">
                        <i className="ri-translate-2 text-foreground/50 text-xl" />
                        <div>
                          <p className="text-xs text-muted-foreground">Idiomas</p>
                          <p className="font-medium">Português</p>
                        </div>
                      </div>
                      <div className="bg-secondary/30 rounded-xl p-3 flex items-center gap-3">
                        <i className="ri-book-open-line text-foreground/50 text-xl" />
                        <div>
                          <p className="text-xs text-muted-foreground">Religião</p>
                          <p className="font-medium">{currentProfile.religion || 'Cristão'}</p>
                        </div>
                      </div>
                      <div className="bg-secondary/30 rounded-xl p-3 flex items-center gap-3">
                        <i className="ri-graduation-cap-line text-foreground/50 text-xl" />
                        <div>
                          <p className="text-xs text-muted-foreground">Formação</p>
                          <p className="font-medium">Superior</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Interests */}
                  {(currentProfile.christian_interests && currentProfile.christian_interests.length > 0) && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Interesses</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentProfile.christian_interests.map((tag: string) => (
                          <span key={tag} className="px-4 py-2 rounded-full border border-primary/30 text-primary bg-primary/5 text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section: Direct Message (Direct Connect) */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                      <Zap className="w-12 h-12 text-amber-500" />
                    </div>

                    <h3 className="text-xl font-semibold text-amber-500 mb-2 flex items-center gap-2">
                      Mensagem Direta <Zap className="w-5 h-5 fill-amber-500" />
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      Não espere pelo match! Envie uma mensagem direta agora mesmo para {currentProfile.display_name} e saia na frente.
                    </p>

                    <Button
                      onClick={() => {
                        if (subscription?.tier !== 'gold') {
                          setUpgradeData({
                            title: "Plano Ouro",
                            description: "Quebre o gelo agora mesmo com 90% de desconto! O Plano Ouro libera tudo para você.",
                            features: PLANS.find(p => p.id === 'gold')?.features || [],
                            planNeeded: 'gold',
                            icon: <i className="ri-chat-1-line text-4xl" />,
                            price: PLANS.find(p => p.id === 'gold')?.price || 49.90,
                            planId: 'gold'
                          });
                          setShowUpgradeDialog(true);
                        } else {
                          toast.info("Funcionalidade de DM Direta em breve para Plano Ouro!");
                        }
                      }}
                      className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Enviar Mensagem
                    </Button>
                  </div>

                  {/* Bottom Spacer */}
                  <div className="h-10" />
                </div>
              </div>

              {/* Floating Action Controls (Expanded View) - Matching Main View Style */}
              <div className="absolute bottom-6 left-0 right-0 z-[100] flex justify-center items-center gap-6 pointer-events-none">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Overlays */}
      {/* Match Celebration */}
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
            <AlertDialogAction
              onClick={() => navigate('/app/profile/edit')}
              className="w-full h-11 rounded-xl gradient-button text-white font-semibold shadow-lg"
            >
              Completar Agora
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => {
                localStorage.setItem(`profile-completion-dismissed-${user?.id}`, 'true');
                setShowCompleteProfileDialog(false);
              }}
              className="w-full h-11 rounded-xl border-none bg-transparent hover:bg-white/5 text-muted-foreground"
            >
              Depois
            </AlertDialogCancel>
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
          setSelectedCheckoutPlan({
            id: planData.id,
            name: planData.name,
            price: planData.price
          });
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
            features: [
              "Ver quem curtiu você",
              "Curtidas ilimitadas",
              "Enviar ou receber fotos e áudios",
              "Filtro por cidade / região",
              "Fazer chamadas de vídeo",
              "Comunidade cristã no WhatsApp"
            ],
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
