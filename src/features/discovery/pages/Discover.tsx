import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import DiscoverFilters, { DiscoverFiltersState } from '@/features/discovery/components/DiscoverFilters';
import { useDiscoverProfiles, useSwipeMutation, Profile } from '@/features/discovery/hooks/useDiscoverProfiles';
import { triggerHaptic } from '@/lib/haptics';
import { PageTransition } from '@/features/discovery/components/PageTransition';
import { DiscoverSkeleton } from '@/features/discovery/components/SkeletonLoaders';
import { MatchCelebration } from '@/features/discovery/components/MatchCelebration';
import { playNotification } from '@/lib/notifications';

const DEFAULT_FILTERS: DiscoverFiltersState = {
  minAge: 18,
  maxAge: 60,
  state: '',
  city: '',
  religion: '',
  churchFrequency: '',
  lookingFor: '',
  hasPhotos: false,
  isVerified: false,
  onlineRecently: false,
};

// Swipe threshold in pixels
const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 500;

export default function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<DiscoverFiltersState>(() => {
    const saved = localStorage.getItem('discover-filters');
    return saved ? JSON.parse(saved) : DEFAULT_FILTERS;
  });

  // Use debounced filters to avoid refetching on every slider change
  const [appliedFilters, setAppliedFilters] = useState<DiscoverFiltersState>(filters);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [swiping, setSwiping] = useState(false);

  // Match celebration state
  const [showMatchCelebration, setShowMatchCelebration] = useState(false);
  const [matchData, setMatchData] = useState<{ name: string; photo: string; matchId: string } | null>(null);

  // Motion values for smooth drag animation
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });

  // Rotate based on drag position (subtle tilt effect)
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);

  // Opacity for swipe indicators
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  // Scale for indicators
  const likeScale = useTransform(x, [0, SWIPE_THRESHOLD, SWIPE_THRESHOLD + 50], [0.5, 1, 1.1]);
  const nopeScale = useTransform(x, [-SWIPE_THRESHOLD - 50, -SWIPE_THRESHOLD, 0], [1.1, 1, 0.5]);

  // Background cards animation based on drag progress
  const dragProgress = useTransform(x, [-200, 0, 200], [1, 0, 1]);
  const skeleton1Scale = useTransform(dragProgress, [0, 1], [0.94, 0.97]);
  const skeleton1Y = useTransform(dragProgress, [0, 1], [12, 6]);
  const skeleton2Scale = useTransform(dragProgress, [0, 1], [0.88, 0.94]);
  const skeleton2Y = useTransform(dragProgress, [0, 1], [24, 12]);

  // Color tint overlay based on swipe direction
  const likeTint = useTransform(x, [0, SWIPE_THRESHOLD * 2], [0, 0.15]);
  const nopeTint = useTransform(x, [-SWIPE_THRESHOLD * 2, 0], [0.15, 0]);

  // React Query hook with infinite scrolling
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useDiscoverProfiles(appliedFilters);

  const swipeMutation = useSwipeMutation();

  // Flatten all pages into a single array
  const profiles = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.profiles);
  }, [data]);

  const currentProfile = profiles[currentIndex];

  // Prefetch next page when we're running low on profiles
  useEffect(() => {
    const remainingProfiles = profiles.length - currentIndex;
    if (remainingProfiles <= 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [currentIndex, profiles.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem('discover-filters', JSON.stringify(filters));
  }, [filters]);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setCurrentIndex(0);
  };

  const handleSwipe = async (swipeDirection: 'like' | 'dislike' | 'super_like') => {
    if (!currentProfile || !user || swiping) return;

    setSwiping(true);
    setExitDirection(swipeDirection === 'dislike' ? 'left' : 'right');

    // Haptic feedback based on swipe type
    if (swipeDirection === 'super_like') {
      triggerHaptic('success');
    } else if (swipeDirection === 'like') {
      triggerHaptic('medium');
    } else {
      triggerHaptic('light');
    }

    try {
      const result = await swipeMutation.mutateAsync({
        swiperId: user.id,
        swipedId: currentProfile.user_id,
        direction: swipeDirection,
      });

      if (result.match) {
        // Show celebration with confetti
        setMatchData({
          name: currentProfile.display_name || 'alguém especial',
          photo: currentProfile.photos?.[0] || currentProfile.avatar_url || '',
          matchId: result.match.id,
        });
        setShowMatchCelebration(true);

        // Play match sound and haptic
        triggerHaptic('success');
        playNotification('match');
      }
    } catch (error) {
      console.error('Error saving swipe:', error);
      triggerHaptic('error');
      toast.error('Erro ao salvar swipe');
      setExitDirection(null);
      setSwiping(false);
      x.set(0);
      return;
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setExitDirection(null);
      setSwiping(false);
      x.set(0);
    }, 300);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (swiping) return;

    const shouldSwipeRight = info.offset.x > SWIPE_THRESHOLD || info.velocity.x > SWIPE_VELOCITY_THRESHOLD;
    const shouldSwipeLeft = info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD;

    if (shouldSwipeRight) {
      handleSwipe('like');
    } else if (shouldSwipeLeft) {
      handleSwipe('dislike');
    } else {
      // Spring back to center
      x.set(0);
    }
  };

  const handleRefresh = () => {
    setCurrentIndex(0);
    refetch();
  };

  if (isLoading) {
    return <DiscoverSkeleton />;
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    const isEmpty = profiles.length === 0;
    const isLoadingMore = isFetchingNextPage;

    if (isLoadingMore) {
      return <DiscoverSkeleton />;
    }

    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <i className="ri-compass-3-line text-4xl text-muted-foreground" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">
          {isEmpty ? 'Nenhum perfil encontrado' : 'Acabaram os perfis!'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {isEmpty
            ? 'Tente ajustar seus filtros para ver mais pessoas.'
            : 'Volte mais tarde para ver novos perfis compatíveis.'}
        </p>
        <div className="flex gap-3">
          <DiscoverFilters
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleApplyFilters}
          />
          <Button onClick={handleRefresh} variant="outline">
            <i className="ri-refresh-line mr-2" />
            Atualizar
          </Button>
        </div>
      </div>
    );
  }

  const profilePhoto = currentProfile.photos?.[0] || currentProfile.avatar_url || '/placeholder.svg';
  const profileAge = currentProfile.birth_date ? calculateAge(currentProfile.birth_date) : null;

  return (
    <PageTransition className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header with Filters */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="font-display text-xl font-bold">Descobrir</h1>
        <DiscoverFilters
          filters={filters}
          onFiltersChange={setFilters}
          onApply={handleApplyFilters}
        />
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative overflow-hidden">
        {/* Skeleton cards behind for stack effect - animated based on drag */}
        {profiles.length > currentIndex + 2 && (
          <motion.div
            className="absolute inset-0 rounded-3xl bg-muted/40 shadow-lg transition-colors"
            style={{
              scale: skeleton2Scale,
              y: skeleton2Y,
              zIndex: 1
            }}
          />
        )}
        {profiles.length > currentIndex + 1 && (
          <motion.div
            className="absolute inset-0 rounded-3xl bg-muted/60 shadow-xl transition-colors"
            style={{
              scale: skeleton1Scale,
              y: skeleton1Y,
              zIndex: 2
            }}
          />
        )}

        <AnimatePresence mode="popLayout">
          {currentProfile && (
            <motion.div
              key={currentProfile.id}
              className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
              style={{
                zIndex: 10,
                x: exitDirection ? undefined : x,
                rotate: exitDirection ? undefined : rotate,
              }}
              drag={!swiping ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDrag={(_, info) => {
                x.set(info.offset.x);
              }}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                x: exitDirection === 'left' ? -500 : exitDirection === 'right' ? 500 : undefined,
                rotate: exitDirection === 'left' ? -30 : exitDirection === 'right' ? 30 : undefined,
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
                transition: { duration: 0.2 }
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 0.8
              }}
            >
              <div className="h-full rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Photo */}
                <img
                  src={profilePhoto}
                  alt={currentProfile.display_name || 'Perfil'}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable={false}
                />

                {/* Like tint overlay */}
                <motion.div
                  className="absolute inset-0 bg-green-500 pointer-events-none"
                  style={{ opacity: likeTint }}
                />

                {/* Nope tint overlay */}
                <motion.div
                  className="absolute inset-0 bg-red-500 pointer-events-none"
                  style={{ opacity: nopeTint }}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
                  <div className="flex items-baseline gap-2 mb-2">
                    <h2 className="font-display text-3xl font-bold">
                      {currentProfile.display_name || 'Sem nome'}
                    </h2>
                    {profileAge && <span className="text-2xl font-light">{profileAge}</span>}
                  </div>

                  {(currentProfile.city || currentProfile.state) && (
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                      <i className="ri-map-pin-line" />
                      <span>
                        {[currentProfile.city, currentProfile.state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}

                  {currentProfile.religion && (
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                      <i className="ri-book-open-line" />
                      <span>{currentProfile.religion}</span>
                    </div>
                  )}

                  {currentProfile.bio && (
                    <p className="text-white/90 text-sm line-clamp-2">{currentProfile.bio}</p>
                  )}
                </div>

                {/* Dynamic swipe indicators - appear during drag */}
                <motion.div
                  className="absolute top-10 left-6 border-4 border-green-500 text-green-500 px-4 py-2 rounded-lg font-bold text-2xl -rotate-12 pointer-events-none"
                  style={{
                    opacity: likeOpacity,
                    scale: likeScale,
                  }}
                >
                  CURTIR
                </motion.div>

                <motion.div
                  className="absolute top-10 right-6 border-4 border-red-500 text-red-500 px-4 py-2 rounded-lg font-bold text-2xl rotate-12 pointer-events-none"
                  style={{
                    opacity: nopeOpacity,
                    scale: nopeScale,
                  }}
                >
                  NOPE
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-4 py-4">
        <button
          onClick={() => handleSwipe('dislike')}
          disabled={swiping}
          className="w-14 h-14 rounded-full bg-background border-2 border-destructive text-destructive flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
        >
          <i className="ri-close-line text-2xl" />
        </button>

        <button
          onClick={() => handleSwipe('super_like')}
          disabled={swiping}
          className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
        >
          <i className="ri-star-fill text-xl" />
        </button>

        <button
          onClick={() => handleSwipe('like')}
          disabled={swiping}
          className="w-14 h-14 rounded-full gradient-button text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
        >
          <i className="ri-heart-fill text-2xl" />
        </button>
      </div>

      {/* Match Celebration Overlay */}
      <MatchCelebration
        show={showMatchCelebration}
        matchName={matchData?.name}
        matchPhoto={matchData?.photo}
        onComplete={() => {
          setShowMatchCelebration(false);
          if (matchData?.matchId) {
            navigate(`/app/chat/${matchData.matchId}`);
          }
          setMatchData(null);
        }}
      />
    </PageTransition>
  );
}
