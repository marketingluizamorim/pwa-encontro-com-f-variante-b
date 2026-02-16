import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageTransition } from '@/features/discovery/components/PageTransition';
import { MatchesListSkeleton } from '@/features/discovery/components/SkeletonLoaders';
import { PullToRefresh } from '@/features/discovery/components/PullToRefresh';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useDragControls, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSwipeMutation } from '@/features/discovery/hooks/useDiscoverProfiles';
import { MatchCelebration } from '@/features/discovery/components/MatchCelebration';
import { playNotification } from '@/lib/notifications';
import { FeatureGateDialog } from '@/features/discovery/components/FeatureGateDialog';
import { CheckoutManager } from '@/features/discovery/components/CheckoutManager';
import { Header } from '@/features/discovery/components/Header';
import { HelpDrawer } from '@/features/discovery/components/HelpDrawer';
import { triggerHaptic } from '@/lib/haptics';
import { Search, Lock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/features/funnel/components/plans/PlansGrid';

const LOOKING_FOR_EMOJIS: Record<string, string> = {
  'Um compromisso sério': '💍',
  'Construir uma família': '👨‍👩‍👧‍👦',
  'Conhecer pessoas novas': '✨',
  'Amizade verdadeira': '🤝',
};

interface LikeProfile {
  id: string; // The swipe ID or user ID
  user_id: string;
  liked_at: string;
  message?: string;
  is_super_like?: boolean;
  profile: {
    display_name: string;
    birth_date?: string;
    avatar_url?: string;
    photos: string[];
    bio?: string;
    city?: string;
    state?: string;
    religion?: string;
    occupation?: string;
    looking_for?: string;
    christian_interests?: string[];
    show_distance?: boolean;
  };
}

const calculateAge = (birthDate?: string) => {
  if (!birthDate) return '20';
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Componente Cartão Interativo para a Grid
const SwipeableMatchCard = ({
  like,
  onSwipe,
  onExpand,
  isLocked
}: {
  like: LikeProfile,
  onSwipe: (id: string, dir: 'like' | 'dislike' | 'super_like') => void,
  onExpand: () => void,
  isLocked?: boolean
}) => {
  const { data: subscription } = useSubscription();
  const locked = isLocked ?? !subscription?.canSeeWhoLiked;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-150, 0, 150], [-10, 0, 10]);

  // Opacities for stamps
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);
  const superOpacity = useTransform(y, [-20, -100], [0, 1]);

  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    setIsDragging(false);
    const { offset, velocity } = info;
    const swipeThreshold = 80;

    if (offset.x > swipeThreshold || velocity.x > 500) {
      onSwipe(like.user_id, 'like');
    } else if (offset.x < -swipeThreshold || velocity.x < -500) {
      onSwipe(like.user_id, 'dislike');
    }
  };

  return (
    <motion.div
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      dragSnapToOrigin
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      style={{ x, y, rotate, zIndex: isDragging ? 50 : 1 }}
      className={cn(
        "relative aspect-[3/4.2] rounded-[2rem] overflow-hidden bg-muted group cursor-grab active:cursor-grabbing touch-none select-none shadow-xl border border-white/5",
        like.is_super_like && "ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
      )}
      onClick={() => {
        if (!isDragging) onExpand();
      }}
      // Entrance animation removed for instant loading
      initial={false}
      animate={undefined}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
    >
      <img
        src={like.profile.photos[0] || like.profile.avatar_url}
        alt="Foto oculta"
        className={cn(
          "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none",
          locked && "blur-lg scale-110"
        )}
        draggable={false}
      />

      {/* Super Like Star Badge */}
      {like.is_super_like && (
        <div className="absolute top-2 right-2 z-20">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
            <i className="ri-star-fill text-white text-sm" />
          </div>
        </div>
      )}

      {/* Identidade Visual Discover: Gradiente e Texto Interno */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none z-10">
        {locked ? (
          <div className="flex flex-col items-start justify-end h-full gap-1">
            <div className="h-5 w-20 bg-white/20 backdrop-blur-md rounded-full border border-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-display font-bold text-white tracking-tight">
                {calculateAge(like.profile.birth_date)}
              </span>
              <div className="flex items-center gap-1 opacity-70">
                <i className="ri-map-pin-line text-[10px]" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Ver Perfil</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {like.is_super_like && like.message && (
              <div className="mb-2 bg-blue-500/80 backdrop-blur-md p-2 rounded-2xl rounded-bl-none border border-white/10 shadow-lg max-w-[90%]">
                <p className="text-[10px] text-white leading-tight line-clamp-2 italic">
                  "{like.message}"
                </p>
              </div>
            )}

            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-xl tracking-tight leading-none">
                {like.profile.display_name}
              </span>
              <span className="text-lg font-light text-white/80">
                {calculateAge(like.profile.birth_date)}
              </span>
            </div>

            <p className="text-[10px] font-medium text-white/70 line-clamp-1 flex items-center gap-1 capitalize">
              <i className="ri-map-pin-2-fill text-[#d4af37]" />
              {like.profile.city || 'Cristão'}
            </p>
          </div>
        )}
      </div>

      {/* STAMPS */}
      <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-4 z-30 border-4 border-emerald-500 text-emerald-500 px-2 py-1 rounded-lg font-black text-2xl -rotate-12 tracking-wider uppercase bg-black/20 backdrop-blur-sm pointer-events-none">
        LIKE
      </motion.div>
      <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-4 z-30 border-4 border-red-500 text-red-500 px-2 py-1 rounded-lg font-black text-2xl rotate-12 tracking-wider uppercase bg-black/20 backdrop-blur-sm pointer-events-none">
        NOPE
      </motion.div>


    </motion.div>
  );
};

export default function Matches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedLike, setSelectedLike] = useState<LikeProfile | null>(null);

  // Interaction State
  const dragControls = useDragControls();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleNextPhoto = (e: React.MouseEvent, photos: string[]) => {
    e.stopPropagation();
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };
  const [showMatchCelebration, setShowMatchCelebration] = useState(false);
  const [matchData, setMatchData] = useState<{ name: string; photo: string; matchId: string } | null>(null);

  const { data: subscription } = useSubscription();
  const swipeMutation = useSwipeMutation();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeData, setUpgradeData] = useState({
    title: '',
    description: '',
    features: [] as string[],
    icon: null as React.ReactNode,
    price: 0,
    planId: ''
  });
  const [showCheckoutManager, setShowCheckoutManager] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<{ id: string, name: string, price: number } | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // --- NATIVE-LIKE NAVIGATION LOGIC ---
  useEffect(() => {
    const handlePopState = () => {
      if (selectedLike) {
        setSelectedLike(null);
        setCurrentPhotoIndex(0);
      }
    };

    if (selectedLike) {
      window.history.pushState({ profileOpen: true }, "");
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedLike]);

  const handleManualBack = () => {
    if (selectedLike) {
      window.history.back();
    } else {
      setSelectedLike(null);
      setCurrentPhotoIndex(0);
    }
  };

  const { data: likes = [], isLoading: loading, refetch: fetchLikes } = useQuery({
    queryKey: ['likes', user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    queryFn: async () => {
      if (!user) return [];

      const { supabase } = await import('@/integrations/supabase/client');

      // 1. Get ALL users I have already SWIPED on (Like or Dislike)
      const { data: mySwipes } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const mySwipedIds = new Set(mySwipes?.map(s => s.swiped_id));

      // 2. Get Swipes (Likes received)
      const { data: swipesData, error: swipesError } = await supabase
        .from('swipes')
        .select('created_at, swiper_id, message, direction')
        .eq('swiped_id', user.id)
        .in('direction', ['like', 'super_like'])
        .order('created_at', { ascending: false });

      if (swipesError) throw swipesError;

      // 1.5. Get Blocked Users (Both directions)
      const { data: blocks } = await supabase
        .from('user_blocks')
        .select('blocker_id, blocked_id')
        .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

      const blockedUserIds = new Set(blocks?.map(b =>
        b.blocker_id === user.id ? b.blocked_id : b.blocker_id
      ));

      // Filter out users I have acted upon AND blocked users
      const pendingLikeUserIds = ((swipesData as unknown as { swiper_id: string }[]) || [])
        .map((s) => s.swiper_id)
        .filter(id => !mySwipedIds.has(id))
        .filter(id => !blockedUserIds.has(id));

      if (pendingLikeUserIds.length === 0) {
        return [];
      }

      // 3. Get Profiles with MORE fields
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, birth_date, avatar_url, photos, bio, city, state, religion, looking_for')
        .in('user_id', pendingLikeUserIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]));

      const formattedLikes: LikeProfile[] = (swipesData as unknown as { swiper_id: string, created_at: string, message?: string, direction: string }[] || [])
        .filter((s) => pendingLikeUserIds.includes(s.swiper_id))
        .map((s) => {
          const profile = profilesMap.get(s.swiper_id);
          if (!profile) return null;
          return {
            id: s.swiper_id,
            user_id: s.swiper_id,
            liked_at: s.created_at,
            message: s.message,
            is_super_like: s.direction === 'super_like',
            profile: {
              display_name: profile.display_name,
              birth_date: profile.birth_date,
              avatar_url: profile.avatar_url,
              photos: profile.photos || [],
              bio: profile.bio,
              city: profile.city,
              state: profile.state,
              religion: profile.religion,
              looking_for: profile.looking_for,
            }
          };
        })
        .filter((l) => l !== null) as LikeProfile[];

      return formattedLikes;
    }
  });

  const handleRefresh = async () => {
    await fetchLikes();
    toast.success('Lista atualizada');
  };

  const handleSwipe = async (targetUserId: string, direction: 'like' | 'dislike' | 'super_like') => {
    if (!user) return;

    // Haptic Feedback
    const hapticType = direction === 'dislike' ? 'light' : direction === 'like' ? 'medium' : 'success';
    triggerHaptic(hapticType);

    // Optimistic UI Update: Remove from list and close modal
    // Find name/photo BEFORE removing
    const matchedProfile = likes.find(l => l.user_id === targetUserId)?.profile;

    setSelectedLike(null);
    setCurrentPhotoIndex(0);

    queryClient.setQueryData(['likes', user?.id], (old: LikeProfile[] | undefined) => {
      return old ? old.filter(l => l.user_id !== targetUserId) : [];
    });

    // Execute Mutation
    swipeMutation.mutate(
      {
        swiperId: user.id,
        swipedId: targetUserId,
        direction: direction,
      },
      {
        onSuccess: (data) => {
          if (data.match) {
            setMatchData({
              name: matchedProfile?.display_name || 'Alguém',
              photo: matchedProfile?.photos?.[0] || matchedProfile?.avatar_url || '',
              matchId: data.match.id,
            });
            setShowMatchCelebration(true);
            playNotification('match');
            triggerHaptic('success');
          } else if (direction === 'like' || direction === 'super_like') {
            if (!data.match) {
              toast.success('Você curtiu também!');
            }
          }
        },
        onError: (error) => {
          console.error('Swipe error:', error);
          toast.error('Erro ao processar ação');
          fetchLikes();
        }
      }
    );
  };

  // Wrapper for swipes from the Expanded View (which passes no ID arg because it knows selectedLike)
  const handleExpandedSwipe = (direction: 'like' | 'dislike' | 'super_like') => {
    if (selectedLike) {
      handleSwipe(selectedLike.user_id, direction);
    }
  };

  if (loading) {
    return <MatchesListSkeleton />;
  }

  return (
    <PageTransition className="h-[calc(100vh-8rem)] relative">
      <PullToRefresh onRefresh={handleRefresh} className="h-full">
        <div className="flex flex-col min-h-full pb-24">
          <Header action={
            <button
              onClick={() => setShowHelp(true)}
              className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md border border-border/10 flex items-center justify-center text-foreground/80 hover:bg-background/30 active:scale-95 transition-all outline-none"
            >
              <i className="ri-question-line text-xl" />
            </button>
          } />

          {/* Stats Header - New Style */}
          <div className="flex flex-col items-center justify-center px-4 mb-6 mt-2 text-center">
            <h2 className="text-xl font-display font-bold text-foreground">
              Curtidas
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {likes.length > 0 ? (
                subscription?.canSeeWhoLiked
                  ? "Veja todos que gostaram de você e não perca nenhuma conexão."
                  : "Faça um upgrade de plano para ver as pessoas que já curtiram você."
              ) : (
                "Ninguém curtiu ainda. Use o Boost para aparecer mais!"
              )}
            </p>

            {/* Likes Count Badge - Simple, Small & Non-interactive */}
            {likes.length > 0 && !subscription?.canSeeWhoLiked && (
              <div
                className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-sm">
                  <i className="ri-heart-fill text-white text-[10px]" />
                </div>
                <span className="text-amber-200/90 font-medium text-xs tracking-wide">
                  <span className="text-amber-400 font-bold mr-1">{likes.length}</span>
                  {likes.length === 1 ? 'Pessoa curtiu' : 'Pessoas curtiram'}
                </span>
              </div>
            )}
          </div>

          {/* Grid Content */}
          {likes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 mt-10 px-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <i className="ri-heart-pulse-line text-4xl"></i>
              </div>
              <p className="font-medium">Nenhuma curtida nova</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-4 pb-32">
              <AnimatePresence>
                {likes.map((like) => (
                  <SwipeableMatchCard
                    key={like.id}
                    like={like}
                    onSwipe={(id, dir) => {
                      if (!subscription?.canSeeWhoLiked) {
                        setUpgradeData({
                          title: "Plano Prata",
                          description: "Veja agora mesmo quem curtiu seu perfil e dê o primeiro passo para um novo encontro!",
                          features: [
                            "Ver quem curtiu você",
                            "Curtidas ilimitadas",
                            "Enviar ou receber fotos e áudios",
                            "Filtro por cidade / região",
                            "Fazer chamadas de vídeo",
                            "Comunidade cristã no WhatsApp"
                          ],
                          icon: <i className="ri-heart-fill text-4xl" />,
                          price: 29.90,
                          planId: 'silver'
                        });
                        setShowUpgradeDialog(true);
                      } else {
                        handleSwipe(id, dir);
                      }
                    }}
                    onExpand={() => {
                      if (!subscription?.canSeeWhoLiked) {
                        setUpgradeData({
                          title: "Plano Prata",
                          description: "Assine o Plano Prata para ver todos os perfis que já te deram like e dar o match instantâneo!",
                          features: [
                            "Ver quem curtiu você",
                            "Curtidas ilimitadas",
                            "Enviar ou receber fotos e áudios",
                            "Filtro por cidade / região",
                            "Fazer chamadas de vídeo",
                            "Comunidade cristã no WhatsApp"
                          ],
                          icon: <i className="ri-heart-fill text-4xl" />,
                          price: 29.90,
                          planId: 'silver'
                        });
                        setShowUpgradeDialog(true);
                      } else {
                        setSelectedLike(like);
                      }
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}



          {/* Floating 'See Who Liked You' Button - ONLY for non-premium with likes */}
          {(!subscription?.canSeeWhoLiked && likes.length > 0 && !showUpgradeDialog) && typeof document !== 'undefined' && createPortal(
            <div className="fixed bottom-[calc(10rem+env(safe-area-inset-bottom))] left-0 right-0 z-[100] flex justify-center px-4 animate-in slide-in-from-bottom-10 fade-in duration-500 pointer-events-none">
              <button
                onClick={() => {
                  setUpgradeData({
                    title: "Plano Prata",
                    description: "Veja agora mesmo quem curtiu seu perfil e dê o primeiro passo para um novo encontro!",
                    features: PLANS.find(p => p.id === 'silver')?.features || [],
                    icon: <i className="ri-heart-fill text-4xl text-amber-500" />,
                    price: PLANS.find(p => p.id === 'silver')?.price || 29.90,
                    planId: 'silver'
                  });
                  setShowUpgradeDialog(true);
                }}
                className="bg-[#fcd34d] hover:bg-[#fbbf24] text-amber-950 px-8 py-3.5 rounded-full font-bold shadow-lg shadow-amber-500/30 border border-[#fbbf24]/50 flex items-center gap-2 transform transition-all active:scale-95 pointer-events-auto"
              >
                <span className="underline decoration-amber-950/30 underline-offset-2">Veja quem Curtiu Você</span>
              </button>
            </div>,
            document.body
          )}

          {/* Boost Button - Only show if NO likes AND not gold plan */}
          {(subscription?.tier !== 'gold' && likes.length === 0) && (
            <div className="mt-8 px-4 pb-8 flex justify-center w-full z-20">
              <button
                onClick={() => {
                  setUpgradeData({
                    title: "Escolha seu Plano",
                    description: "Dê um boost no seu perfil e apareça para mais pessoas!",
                    features: [],
                    icon: <i className="ri-rocket-2-fill text-4xl" />,
                    price: 0,
                    planId: ''
                  });
                  setShowUpgradeDialog(true);
                }}
                className="gradient-button text-white font-bold py-3 px-10 rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 border border-white/20"
              >
                Dar um boost no meu perfil
              </button>
            </div>
          )}

        </div>
      </PullToRefresh>

      {/* Expanded Profile View (Interactive) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedLike && (
            <motion.div
              key="expanded-match-profile"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[9999] bg-background flex flex-col overflow-hidden"
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
            >
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pb-44 h-full overscroll-contain touch-pan-y scrollbar-hide relative">

                {/* Close Button */}
                <button
                  onClick={handleManualBack}
                  className="fixed top-[calc(1rem+env(safe-area-inset-top))] right-4 z-[100] w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg hover:bg-black/60 transition-colors"
                >
                  <i className="ri-arrow-down-s-line text-2xl" />
                </button>

                {/* Hero Image - Drag Handle for Closing */}
                <div
                  className="relative w-full h-[65vh] touch-none cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => dragControls.start(e)}
                >
                  {/* Photo Indicators */}
                  {selectedLike.profile.photos && selectedLike.profile.photos.length > 1 && (
                    <div className="absolute top-4 inset-x-4 z-30 flex gap-1.5 px-2">
                      {selectedLike.profile.photos.map((_, i) => (
                        <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full bg-white transition-all duration-300",
                              i === currentPhotoIndex ? "w-full" : "w-0"
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Photo Navigation Tap Areas */}
                  <div className="absolute inset-0 z-20 flex">
                    <div className="w-1/2 h-full cursor-pointer" onClick={(e) => handlePrevPhoto(e)} />
                    <div className="w-1/2 h-full cursor-pointer" onClick={(e) => handleNextPhoto(e, selectedLike.profile.photos)} />
                  </div>

                  <img
                    src={selectedLike.profile.photos?.[currentPhotoIndex] || selectedLike.profile.photos?.[0] || selectedLike.profile.avatar_url || '/placeholder.svg'}
                    className="w-full h-full object-cover pointer-events-none"
                    alt={selectedLike.profile.display_name}
                  />
                  {/* Gradient for Text Readability */}
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
                </div>

                {/* Profile Info Content */}
                <div className="px-5 -mt-20 relative z-10 space-y-6">

                  {/* Header: Name & Age */}
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-4xl font-display font-bold text-foreground">
                        {selectedLike.profile.display_name}
                      </h1>
                      <span className="text-3xl font-light text-muted-foreground">
                        {calculateAge(selectedLike.profile.birth_date)}
                      </span>
                    </div>

                    {/* Main Badges */}
                    <div className="flex items-center gap-3 mt-3 text-sm text-foreground/80">
                      {selectedLike.profile.occupation && (
                        <div className="flex items-center gap-1.5">
                          <i className="ri-briefcase-line" />
                          <span>{selectedLike.profile.occupation}</span>
                        </div>
                      )}
                      {(selectedLike.profile.city) && (
                        <div className="flex items-center gap-1.5">
                          <i className="ri-map-pin-line" />
                          <span>{selectedLike.profile.city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Looking For */}
                  <div className="bg-card/50 border border-border/50 rounded-2xl p-4 backdrop-blur-sm">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Tô procurando</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                        <i className="ri-heart-2-fill text-xl" />
                      </div>
                      <span className="text-lg font-medium">{selectedLike.profile.looking_for || 'Um propósito em comum'}</span>
                    </div>
                  </div>

                  {/* Section: About Me */}
                  {selectedLike.profile.bio && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold">Sobre mim</h3>
                      <p className="text-muted-foreground leading-relaxed text-base">
                        {selectedLike.profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Section: Basic Info */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold">Informações básicas</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-secondary/30 rounded-xl p-3 flex items-center gap-3">
                        <i className="ri-book-open-line text-foreground/50 text-xl" />
                        <div>
                          <p className="text-xs text-muted-foreground">Religião</p>
                          <p className="font-medium">{selectedLike.profile.religion || 'Cristão'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Interests */}
                  {(selectedLike.profile.christian_interests && selectedLike.profile.christian_interests.length > 0) && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold">Interesses</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedLike.profile.christian_interests.map((tag: string) => (
                          <span key={tag} className="px-4 py-2 rounded-full border border-primary/30 text-primary bg-primary/5 text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="h-20" />
                </div>
              </div>

              {/* Floating Action Controls (Expanded View) - Matching Bottom Nav Style */}
              <div className="absolute bottom-6 left-0 right-0 z-[100] flex justify-center px-6 pb-[env(safe-area-inset-bottom)] pointer-events-none">
                <div className="pointer-events-auto bg-[#1e293b]/95 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_15px_rgba(255,255,255,0.03)] flex items-center justify-center gap-8 ring-1 ring-white/10">
                  {/* Nope */}
                  <button
                    onClick={() => handleExpandedSwipe('dislike')}
                    className="w-14 h-14 rounded-full bg-card/40 backdrop-blur-lg border border-red-500/30 text-red-500 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                  >
                    <i className="ri-close-line text-3xl font-semibold" />
                  </button>

                  {/* Super Like */}
                  <button
                    onClick={() => handleExpandedSwipe('super_like')}
                    className="w-11 h-11 rounded-full bg-card/40 backdrop-blur-lg border border-blue-500/30 text-blue-500 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                  >
                    <i className="ri-star-fill text-xl" />
                  </button>

                  {/* Like */}
                  <button
                    onClick={() => handleExpandedSwipe('like')}
                    className="group relative w-14 h-14 rounded-full p-[3px] bg-gradient-to-tr from-[#d4af37] via-[#fcd34d] to-[#b45309] shadow-2xl shadow-orange-500/20 hover:scale-110 active:scale-95 transition-all"
                  >
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
          key={`matches-checkout-v1-${selectedCheckoutPlan.id}`}
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

      <HelpDrawer open={showHelp} onOpenChange={setShowHelp} />
    </PageTransition>
  );
}
