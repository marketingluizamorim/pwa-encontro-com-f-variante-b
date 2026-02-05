import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import DiscoverFilters, { DiscoverFiltersState } from '@/features/discovery/components/DiscoverFilters';
import { useDiscoverProfiles, useSwipeMutation } from '@/features/discovery/hooks/useDiscoverProfiles';
import { triggerHaptic } from '@/lib/haptics';
import { PageTransition } from '@/features/discovery/components/PageTransition';
import { DiscoverSkeleton } from '@/features/discovery/components/SkeletonLoaders';
import { MatchCelebration } from '@/features/discovery/components/MatchCelebration';
import { playNotification } from '@/lib/notifications';
import { Search } from 'lucide-react';
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
};

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 500;

export default function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
  } = useDiscoverProfiles(appliedFilters);

  const swipeMutation = useSwipeMutation();

  const profiles = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.profiles);
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

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
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

    setSwiping(true);
    setExitDirection(swipeDirection === 'dislike' ? 'left' : swipeDirection === 'like' ? 'right' : 'up');

    const hapticType = swipeDirection === 'dislike' ? 'light' : swipeDirection === 'like' ? 'medium' : 'success';
    triggerHaptic(hapticType);

    try {
      const result = await swipeMutation.mutateAsync({
        swiperId: user.id,
        swipedId: currentProfile.user_id,
        direction: swipeDirection,
      });

      if (result.match) {
        setMatchData({
          name: currentProfile.display_name || 'Alguém',
          photo: currentProfile.photos?.[0] || currentProfile.avatar_url || '',
          matchId: result.match.id,
        });
        setShowMatchCelebration(true);
        triggerHaptic('success');
        playNotification('match');
      }
    } catch (error) {
      console.error('Error saving swipe:', error);
      toast.error('Erro ao processar swipe');
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setExitDirection(null);
      setSwiping(false);
      x.set(0);
      y.set(0);
      setShowInfo(false);
    }, 200);
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

  const handleRefresh = () => {
    setCurrentIndex(0);
    refetch();
  };

  if (isLoading) return <DiscoverSkeleton />;

  const isEmpty = profiles.length === 0 || currentIndex >= profiles.length;

  return (
    <PageTransition className="relative w-full h-full flex flex-col items-center pt-6">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[50vh] text-center px-6">
          <div className="relative w-32 h-32 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-[#d4af37]/10 rounded-full animate-pulse opacity-50" style={{ animationDuration: '3s' }} />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#d4af37]/10 to-transparent border border-[#d4af37]/20 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.1)] backdrop-blur-sm">
              <Search className="w-12 h-12 text-[#d4af37] drop-shadow-md animate-pulse" strokeWidth={1.5} style={{ animationDuration: '3s' }} />
            </div>
          </div>

          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Sem novos perfis</h2>
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
          {/* Filters Trigger (Top Right) */}
          <div className="absolute top-0 right-4 z-40">
            <DiscoverFilters filters={filters} onFiltersChange={setFilters} onApply={handleApplyFilters} />
          </div>

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
              dragElastic={0.7}
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

                {/* Photo */}
                <img
                  src={currentProfile.photos?.[0] || currentProfile.avatar_url || '/placeholder.svg'}
                  className="w-full h-full object-cover pointer-events-none"
                  alt="Profile"
                  draggable={false}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                {/* Text Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
                  <div className="flex items-end gap-3 mb-2">
                    <h1 className="font-display text-4xl font-bold tracking-tight drop-shadow-md">
                      {currentProfile.display_name}
                    </h1>
                    {currentProfile.birth_date && (
                      <span className="text-2xl font-light text-white/90 mb-1">{calculateAge(currentProfile.birth_date)}</span>
                    )}
                    {(currentProfile as any).is_verified && (
                      <i className="ri-verified-badge-fill text-blue-400 text-2xl mb-1" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3 text-sm font-medium text-white/90">
                    {(currentProfile.city || currentProfile.state) && (
                      <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                        <i className="ri-map-pin-line text-accent" />
                        <span>{currentProfile.city}</span>
                      </div>
                    )}
                    {currentProfile.religion && (
                      <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                        <i className="ri-book-open-line text-accent" />
                        <span>{currentProfile.religion}</span>
                      </div>
                    )}
                  </div>

                  {currentProfile.bio && (
                    <p className="text-white/80 line-clamp-2 text-sm leading-relaxed max-w-[85%]">
                      {currentProfile.bio}
                    </p>
                  )}
                </div>

                {/* Stamps */}
                <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-6 z-30 border-4 border-emerald-500 text-emerald-500 px-4 py-1 rounded-lg font-black text-3xl -rotate-12 tracking-widest uppercase bg-black/20 backdrop-blur-sm">
                  LIKE
                </motion.div>
                <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-6 z-30 border-4 border-red-500 text-red-500 px-4 py-1 rounded-lg font-black text-3xl rotate-12 tracking-widest uppercase bg-black/20 backdrop-blur-sm">
                  NOPE
                </motion.div>
                <motion.div style={{ opacity: superLikeOpacity }} className="absolute bottom-40 left-1/2 -translate-x-1/2 z-30 border-4 border-blue-500 text-blue-500 px-4 py-1 rounded-lg font-black text-3xl tracking-widest uppercase bg-black/20 backdrop-blur-sm">
                  SUPER
                </motion.div>

                {/* Info Detail Button */}
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 z-30 pointer-events-auto"
                >
                  <i className="ri-information-line text-xl" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Floating Action Controls */}
          <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center items-center gap-6 pointer-events-none">
            {/* Nope */}
            <button
              onClick={() => handleSwipe('dislike')}
              className="w-14 h-14 rounded-full bg-card/80 backdrop-blur-lg border border-red-500/30 text-red-500 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all pointer-events-auto"
            >
              <i className="ri-close-line text-3xl font-bold" />
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
              className="w-14 h-14 rounded-full gradient-button text-white shadow-[0_8px_25px_rgba(16,185,129,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all pointer-events-auto border border-emerald-400/20"
            >
              <i className="ri-heart-fill text-3xl" />
            </button>
          </div>
        </>
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
            <AlertDialogTitle className="text-center text-xl font-display font-bold">
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
    </PageTransition>
  );
}
