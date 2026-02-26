import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { PageTransition } from '@/features/discovery/components/PageTransition';
import { ChatListSkeleton } from '@/features/discovery/components/SkeletonLoaders';
import { PullToRefresh } from '@/features/discovery/components/PullToRefresh';
import { toast } from 'sonner';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FeatureGateDialog } from '@/features/discovery/components/FeatureGateDialog';
import { CheckoutManager } from '@/features/discovery/components/CheckoutManager';
import { Header } from '@/features/discovery/components/Header';
import { SafetyToolkitDrawer } from '@/features/discovery/components/SafetyToolkitDrawer';
import { PLANS } from '@/features/funnel/components/plans/PlansGrid';
import { ProfileDetails } from '@/features/discovery/components/ProfileDetails';
import { ProfilePhotoGallery } from '@/features/discovery/components/ProfilePhotoGallery';
import { SafetyActions } from '@/features/discovery/components/SafetyActions';
import { UpgradeFlow } from '@/features/discovery/components/UpgradeFlow';
import { DeleteConversationDialog } from '@/features/discovery/components/UserActions';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Search, MapPin, Home, UserCircle, User2, MoreHorizontal,
    AlertTriangle, Ban, LayoutList, PawPrint, Wine, Cigarette,
    Dumbbell, Share2, Baby, Sparkles, CheckCircle2, Briefcase, BookOpen,
    GraduationCap, Languages, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateAge, formatLastActive } from '@/lib/date-utils';
import { enrichBotProfile, BOT_PHOTO_MAP } from '@/features/funnel/utils/profiles';
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';
import { QuizAnswers } from '@/types/funnel';

interface Conversation {
    id: string;
    match_id: string;
    created_at: string;
    profile: {
        id: string; // This is the user_id (swiped_id)
        display_name: string;
        avatar_url?: string;
        photos: string[];
        birth_date?: string;
        bio?: string;
        occupation?: string;
        city?: string;
        looking_for?: string;
        christian_interests?: string[];
        religion?: string;
        gender?: string;
        pets?: string;
        drink?: string;
        smoke?: string;
        physical_activity?: string;
        church_frequency?: string;
        about_children?: string;
        education?: string;
        languages?: string[];
        social_media?: string;
        state?: string;
        last_active_at?: string;
        show_online_status?: boolean;
        show_last_active?: boolean;
    };
    is_super_like?: boolean;
    last_message?: {
        content: string;
        created_at: string;
        is_read: boolean;
        sender_id: string;
    };
}


const FloatingHeart = () => (
    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-[40] pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
        <div className="relative flex items-center justify-center scale-110">
            <div className="absolute w-6 h-6 bg-[#d4af37] blur-lg opacity-60 rounded-full" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d4af37] via-[#fcd34d] to-[#b45309] border-2 border-[#121212] flex items-center justify-center shadow-2xl">
                <i className="ri-heart-fill text-white text-[11px]" />
            </div>
        </div>
    </div>
);

// ── Welcome Card (pinned at top of messages list) ──────────────────────────
function WelcomeCard() {
    const navigate = useNavigate();
    const [read, setRead] = useState(() => localStorage.getItem('welcome-chat-read') === '1');
    const [hidden] = useState(() => localStorage.getItem('welcome-chat-hidden') === '1');

    if (hidden) return null;

    const handleClick = () => {
        localStorage.setItem('welcome-chat-read', '1');
        setRead(true);
        navigate('/app/chat/welcome');
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center gap-4 w-full -mx-2 px-2 py-2 rounded-lg active:bg-muted/50 transition-colors mb-1 text-left"
        >
            <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/40 shadow-md">
                    <img src="/logo-branca1080x1080.png " alt="Bem-vindo" className="w-full h-full object-cover" />
                </div>
                {!read && (
                    <div className="absolute right-0 top-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                )}
            </div>
            <div className="flex-1 min-w-0 border-b border-border/40 pb-4">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-base">Bem-vindo(a) ao aplicativo</h3>
                    {!read && (
                        <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full text-[10px] font-bold flex-shrink-0">NOVO</span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">Toque para abrir...</p>
            </div>
        </button>
    );
}

export default function Chat() {
    const { user } = useAuth();
    const { data: subscription } = useSubscription();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: conversations = [], isLoading: loading, refetch: fetchConversations } = useQuery({
        queryKey: ['conversations', user?.id],
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        queryFn: async () => {
            if (!user) return [];
            const { supabase } = await import('@/integrations/supabase/client');

            // 1. Buscar Bloqueios
            const { data: blocks } = await supabase
                .from('user_blocks')
                .select('blocker_id, blocked_id')
                .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

            const blockedUserIds = new Set(blocks?.map(b =>
                b.blocker_id === user.id ? b.blocked_id : b.blocker_id
            ));

            // 2. Buscar Matches ativos
            const { data: matchesData, error: matchesError } = await supabase
                .from('matches')
                .select('id, user1_id, user2_id, created_at')
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                .eq('is_active', true);

            if (matchesError) throw matchesError;

            // 3. Buscar Seeds que deram match (liked)
            const { data: seedMatches } = await supabase
                .from('seed_likes')
                .select('id, profile_index, age_range, user_gender, city, state_name, looking_for, religion, created_at')
                .eq('user_id', user.id)
                .eq('status', 'liked');

            const activeMatches = (matchesData as { id: string, user1_id: string, user2_id: string, created_at: string }[] || []).filter(m => {
                const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
                return !blockedUserIds.has(otherId);
            });

            const matchIds = activeMatches.map(m => m.id);
            const otherUserIds = activeMatches.map(m => m.user1_id === user.id ? m.user2_id : m.user1_id);

            // 4. Buscar Perfis, Super Likes e Últimas Mensagens em paralelo
            const [profilesResult, superLikesResult, lastMessagesResult] = await Promise.all([
                (supabase
                    .from('profiles')
                    .select('user_id, display_name, avatar_url, photos, birth_date, bio, occupation, city, state, looking_for, christian_interests, religion, gender, pets, drink, smoke, physical_activity, church_frequency, about_children, education, languages, social_media, last_active_at, show_online_status, show_last_active, is_bot') as any)
                    .in('user_id', otherUserIds),
                supabase
                    .from('swipes')
                    .select('swiper_id, swiped_id')
                    .eq('direction', 'super_like')
                    .or(`swiper_id.eq.${user.id},swiped_id.eq.${user.id}`),
                supabase
                    .from('messages')
                    .select('match_id, content, created_at, sender_id, is_read')
                    .in('match_id', matchIds)
                    .order('created_at', { ascending: false }),
            ]);

            const profilesMap = new Map(profilesResult.data?.map(p => [p.user_id, p]));

            const superLikePairs = new Set(
                superLikesResult.data?.map(s => `${s.swiper_id}-${s.swiped_id}`)
            );

            const lastMsgByMatch = new Map<string, typeof lastMessagesResult.data extends (infer T)[] | null ? T : never>();
            for (const msg of (lastMessagesResult.data || [])) {
                if (!lastMsgByMatch.has(msg.match_id)) {
                    lastMsgByMatch.set(msg.match_id, msg);
                }
            }

            const userAge = useFunnelStore.getState().quizAnswers.age;

            const realConversations = activeMatches.map(m => {
                const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
                const profile = profilesMap.get(otherId);
                if (!profile) return null;

                const enriched = enrichBotProfile(profile, userAge);

                const lastMsg = lastMsgByMatch.get(m.id);
                const isSuperLike = superLikePairs.has(`${user.id}-${otherId}`) || superLikePairs.has(`${otherId}-${user.id}`);

                return {
                    id: 'conv-' + m.id,
                    match_id: m.id,
                    created_at: m.created_at,
                    is_super_like: isSuperLike,
                    profile: {
                        id: enriched.user_id,
                        display_name: enriched.display_name || 'Usuário',
                        avatar_url: enriched.avatar_url || undefined,
                        photos: enriched.photos || [],
                        birth_date: enriched.birth_date,
                        bio: enriched.bio,
                        occupation: enriched.occupation,
                        city: enriched.city,
                        looking_for: enriched.looking_for,
                        religion: enriched.religion,
                        gender: enriched.gender,
                        pets: enriched.pets,
                        drink: enriched.drink,
                        smoke: enriched.smoke,
                        physical_activity: enriched.physical_activity,
                        church_frequency: enriched.church_frequency,
                        about_children: (enriched as any).about_children,
                        education: (enriched as any).education,
                        languages: (enriched as any).languages,
                        social_media: (enriched as any).social_media,
                        state: (enriched as any).state,
                        last_active_at: (enriched as any).last_active_at,
                        show_online_status: (enriched as any).show_online_status,
                        show_last_active: (enriched as any).show_last_active,
                    },
                    last_message: lastMsg ? {
                        content: lastMsg.content,
                        created_at: lastMsg.created_at,
                        is_read: lastMsg.is_read,
                        sender_id: lastMsg.sender_id
                    } : undefined
                };
            }).filter(Boolean) as Conversation[];

            return realConversations;
        }
    });

    // Smart Preload for Chat Photos
    useEffect(() => {
        if (conversations.length > 0) {
            // Preload primary photo of all conversations on the screen
            conversations.slice(0, 15).forEach((conv) => {
                if (conv.profile.photos?.[0] || conv.profile.avatar_url) {
                    const img = new Image();
                    img.src = (conv.profile.photos?.[0] || conv.profile.avatar_url) as string;
                }
                // Also preload expanded photos for the first 3 (likely to be clicked)
                if (conversations.indexOf(conv) < 3) {
                    conv.profile.photos?.slice(1, 3).forEach(photo => {
                        const img = new Image();
                        img.src = photo;
                    });
                }
            });
        }
    }, [conversations]);

    // Real-time listener for the chat list (New matches and New messages)
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`chat-list:${user.id}`)
            // Listen for new matches where user is user1 or user2
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'matches', filter: `user1_id=eq.${user.id}` },
                () => queryClient.invalidateQueries({ queryKey: ['conversations', user.id] })
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'matches', filter: `user2_id=eq.${user.id}` },
                () => queryClient.invalidateQueries({ queryKey: ['conversations', user.id] })
            )
            // Listen for updates (active/inactive)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'matches', filter: `user1_id=eq.${user.id}` },
                () => queryClient.invalidateQueries({ queryKey: ['conversations', user.id] })
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'matches', filter: `user2_id=eq.${user.id}` },
                () => queryClient.invalidateQueries({ queryKey: ['conversations', user.id] })
            )
            // Listen for any new messages (broad invalidation for the list)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    // Only invalidate if the message is for one of the user's matches
                    const matchIds = conversations.map(c => c.match_id);
                    if (matchIds.includes(payload.new.match_id)) {
                        queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, queryClient, conversations]);

    // Listener para atualizações de quiz (Simulado)
    useEffect(() => {
        const handleQuizUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
        };

        window.addEventListener('quiz-update', handleQuizUpdate);
        return () => window.removeEventListener('quiz-update', handleQuizUpdate);
    }, [user?.id, queryClient]);


    const [viewedMatches, setViewedMatches] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('viewed-matches');
        return new Set(saved ? JSON.parse(saved) : []);
    });
    const [selectedProfile, setSelectedProfile] = useState<Conversation['profile'] | null>(null);
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [showCheckoutManager, setShowCheckoutManager] = useState(false);
    const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<{ id: string, name: string, price: number } | null>(null);
    const [upgradeData, setUpgradeData] = useState({
        title: "Destaque seu Perfil",
        description: "Chame atenção mais rápido e aumente as suas chances de encontrar alguém em até 30%.",
        features: PLANS.find(p => p.id === 'silver')?.features || [],
        icon: <i className="ri-fire-fill text-4xl" />,
        price: PLANS.find(p => p.id === 'silver')?.price || 29.90,
        planId: 'silver'
    });
    const [showSafety, setShowSafety] = useState(false);
    const dragControls = useDragControls();
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    // --- NATIVE-LIKE NAVIGATION LOGIC ---
    useEffect(() => {
        const handlePopState = () => {
            if (selectedProfile) {
                setSelectedProfile(null);
                setCurrentPhotoIndex(0);
            }
        };

        if (selectedProfile) {
            window.history.pushState({ profileOpen: true }, "");
            window.addEventListener('popstate', handlePopState);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [selectedProfile]);

    const handleManualBack = () => {
        if (selectedProfile) {
            window.history.back();
        } else {
            setSelectedProfile(null);
            setCurrentPhotoIndex(0);
        }
    };

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

    // Estado para ações do usuário (Denunciar, Bloquear, Excluir)
    const [actionProfileId, setActionProfileId] = useState<string | null>(null);
    const [actionMatchId, setActionMatchId] = useState<string | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [showBlock, setShowBlock] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const markMatchAsViewed = (matchId: string) => {
        const newViewed = new Set(viewedMatches);
        newViewed.add(matchId);
        setViewedMatches(newViewed);
        localStorage.setItem('viewed-matches', JSON.stringify(Array.from(newViewed)));
    };

    // Buscar contagem de curtidas para o "Cartão Gold"
    const [likesCount, setLikesCount] = useState(0);
    const [likesPhoto, setLikesPhoto] = useState<string | null>(null);

    const fetchLikesCount = useCallback(async () => {
        if (!user) return;
        const { supabase } = await import('@/integrations/supabase/client');

        // 1. Buscar todos os usuários que me CURTIRAM
        const { data: incomingLikes } = await supabase
            .from('swipes')
            .select('swiper_id')
            .eq('swiped_id', user.id)
            .in('direction', ['like', 'super_like']);

        if (!incomingLikes || incomingLikes.length === 0) {
            setLikesCount(0);
            return;
        }

        // 2. Buscar todos os usuários que eu já DESLIZEI (Curti ou Descurti)
        const { data: mySwipes } = await supabase
            .from('swipes')
            .select('swiped_id')
            .eq('swiper_id', user.id);

        const mySwipedIds = new Set(mySwipes?.map(s => s.swiped_id));

        // 3. Filtrar: Contar apenas curtidas de pessoas que eu ainda não deslizei
        const pendingLikes = incomingLikes.filter(like => !mySwipedIds.has(like.swiper_id));

        setLikesCount(pendingLikes.length);

        if (pendingLikes.length > 0) {
            const { data: profile } = await (supabase
                .from('profiles')
                .select('avatar_url, photos, is_bot, display_name, gender, birth_date') as any)
                .eq('user_id', pendingLikes[0].swiper_id)
                .single();

            if (profile) {
                // Enriquecimento vital para mostrar a foto do bot no teaser
                const userAge = useFunnelStore.getState().quizAnswers.age;
                const enriched = enrichBotProfile(profile, userAge);
                setLikesPhoto(enriched.photos?.[0] || enriched.avatar_url || null);
            }
        } else {
            setLikesPhoto(null);
        }
    }, [user]);

    // Real-time: Listen for new messages, matches, and likes to update the UI automatically
    useEffect(() => {
        if (!user) return;

        let channel: { unsubscribe: () => void } | null = null;
        let supabaseClient: { removeChannel: (ch: unknown) => void } | null = null;

        (async () => {
            const { supabase } = await import('@/integrations/supabase/client');
            supabaseClient = supabase;

            channel = supabase
                .channel('realtime:chat_and_likes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'messages',
                    },
                    () => {
                        queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
                        fetchLikesCount();
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'matches',
                    },
                    () => {
                        queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
                        fetchLikesCount();
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'swipes',
                        filter: `swiped_id=eq.${user.id}`,
                    },
                    () => {
                        // When someone likes the user, update the likes count
                        fetchLikesCount();
                    }
                )
                .subscribe();
        })();

        return () => {
            if (supabaseClient && channel) {
                supabaseClient.removeChannel(channel);
            }
        };
    }, [user, queryClient, fetchLikesCount]);

    useEffect(() => {
        fetchLikesCount();
    }, [fetchLikesCount]);

    const handleRefresh = async () => {
        await Promise.all([fetchConversations(), fetchLikesCount()]);
        toast.success('Conversas atualizadas', { style: { marginTop: '50px' } });
    };

    // Só exibe skeleton na primeira carga (sem dados em cache)
    // Re-fetches em background não mostram skeleton
    if (loading && conversations.length === 0) {
        return <ChatListSkeleton />;
    }

    // Filtrar conversas em "Novos Matches" (sem mensagens) e "Mensagens"
    const newMatches = conversations
        .filter(c => !c.last_message)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const existingChats = conversations
        .filter(c => !!c.last_message)
        .sort((a, b) => {
            const dateA = new Date(a.last_message!.created_at).getTime();
            const dateB = new Date(b.last_message!.created_at).getTime();
            return dateB - dateA;
        });

    return (
        <PageTransition className="h-[calc(100vh-8rem)]">
            <PullToRefresh onRefresh={handleRefresh} className="h-full">
                <div className="flex flex-col min-h-full bg-background pb-24">
                    <Header action={
                        <button
                            onClick={() => setShowSafety(true)}
                            className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md border border-border/10 flex items-center justify-center text-foreground/80 hover:bg-background/30 active:scale-95 transition-all outline-none"
                        >
                            <i className="ri-shield-check-line text-xl" />
                        </button>
                    } />

                    {/* Banner Promocional */}
                    {subscription?.tier !== 'gold' && (
                        <div
                            onClick={() => setShowUpgradeDialog(true)}
                            className="mx-4 mt-6 mb-6 p-4 rounded-xl relative overflow-hidden bg-gradient-to-r from-gray-900 to-black border border-white/10 shadow-lg cursor-pointer active:scale-95 transition-transform"
                        >
                            <div className="relative z-10 flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center bg-gray-800 shrink-0">
                                    <i className="ri-fire-fill text-2xl text-white"></i>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">Alguém próximo está te esperando</h3>
                                    <p className="text-gray-400 text-xs mt-1">
                                        Perfil em destaque, mensagens diretas e filtros avançados. Aumente em até 3x suas chances.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Seção de Novos Matches */}
                    <div className="px-4 mt-6 mb-8">
                        <h2 className="font-bold text-lg mb-1">Novas conexões</h2>
                        <div
                            className="flex gap-4 overflow-x-auto pb-4 pt-0 -mx-4 px-4 scrollbar-hide snap-none overscroll-x-contain"
                            style={{ WebkitOverflowScrolling: 'touch' }}
                        >
                            {/* Cartão Gold - Teaser de Curtidas */}
                            <Link to="/app/matches" className="flex flex-col items-center gap-2 shrink-0 group relative">
                                <div className="relative w-28 h-40 rounded-[2.2rem] border-2 border-[#d4af37]/50 bg-gray-900 flex items-center justify-center shadow-xl shadow-[#d4af37]/10">
                                    <div className="absolute inset-0 z-0 rounded-[2.1rem] overflow-hidden">
                                        {likesPhoto ? (
                                            <div
                                                className="absolute inset-0 bg-cover bg-center opacity-40 blur-lg scale-110 transition-transform duration-700 group-hover:scale-125"
                                                style={{ backgroundImage: `url(${likesPhoto})` }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 to-black opacity-50"></div>
                                        )}
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                                    </div>

                                    <div className="relative z-10 w-9 h-9 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b45309] flex items-center justify-center shadow-2xl border border-white/20">
                                        <span className="text-white font-bold text-xs">{likesCount}</span>
                                    </div>

                                    <FloatingHeart />
                                </div>
                                <span className="text-sm font-medium text-foreground mt-1">Curtidas</span>
                            </Link>

                            {/* Actual New Matches */}
                            {newMatches.map((conv) => (
                                <div
                                    key={'match-' + conv.id}
                                    onClick={() => {
                                        markMatchAsViewed(conv.match_id);
                                        setSelectedProfile(conv.profile);
                                    }}
                                    className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group relative"
                                >
                                    <div className={cn(
                                        "relative w-28 h-40 rounded-[2.2rem] border bg-muted shadow-lg transition-all border-white/5",
                                        conv.is_super_like
                                            ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-500/50"
                                            : "border-white/5"
                                    )}>
                                        <div className="absolute inset-0 rounded-[2.1rem] overflow-hidden">
                                            <OptimizedImage
                                                src={BOT_PHOTO_MAP[conv.profile.id] || conv.profile.photos?.[0] || conv.profile.avatar_url || '/placeholder.svg'}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                containerClassName="w-full h-full"
                                                alt={conv.profile.display_name}
                                                loading="eager"
                                                fetchPriority="high"
                                            />
                                        </div>

                                        {/* Super Like Badge */}
                                        {conv.is_super_like && (
                                            <div className="absolute top-3 right-3 z-30 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
                                                <div className="relative flex items-center justify-center scale-110">
                                                    <div className="absolute w-6 h-6 bg-blue-500 blur-lg opacity-60 rounded-full" />
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-blue-400 to-blue-800 border-2 border-[#121212] flex items-center justify-center shadow-2xl">
                                                        <i className="ri-star-fill text-white text-[11px]" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Ponto vermelho se houver mensagem não lida */}
                                        {conv.last_message && !conv.last_message.is_read && conv.last_message.sender_id !== user?.id && (
                                            <div className="absolute right-3 top-3 w-3 h-3 bg-red-500 rounded-full border-2 border-background z-20"></div>
                                        )}

                                        {/* Coração flutuante para NOVOS matches que o usuário ainda não clicou */}
                                        {!viewedMatches.has(conv.match_id) && !conv.is_super_like && <FloatingHeart />}
                                    </div>
                                    <span className="text-sm font-bold truncate max-w-[112px] text-center mt-1">
                                        {conv.profile.display_name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lista de Mensagens */}
                    <div className="px-4">
                        <h2 className="font-bold text-lg mb-4">Mensagens</h2>

                        {/* ── Card de Boas-vindas (sempre visível, fixado no topo) ── */}
                        <WelcomeCard />

                        {existingChats.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center opacity-60 py-10">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <i className="ri-chat-smile-2-line text-4xl"></i>
                                </div>
                                <p className="font-medium">Nenhuma conversa ainda</p>
                                <p className="text-sm">Envie uma mensagem para seus matches!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {existingChats.map((conv) => (
                                    <Link
                                        key={conv.id}
                                        to={`/app/chat/${conv.match_id}`}
                                        className="flex items-center gap-4 active:bg-muted/50 rounded-lg transition-colors -mx-2 px-2 py-2"
                                    >
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border border-border">
                                                <OptimizedImage
                                                    src={BOT_PHOTO_MAP[conv.profile.id] || conv.profile.photos?.[0] || conv.profile.avatar_url || '/placeholder.svg'}
                                                    alt={conv.profile.display_name}
                                                    className="w-full h-full object-cover"
                                                    containerClassName="w-full h-full"
                                                    loading="eager"
                                                    fetchPriority="high"
                                                />
                                            </div>
                                            {conv.last_message && !conv.last_message.is_read && conv.last_message.sender_id !== user?.id && (
                                                <div className="absolute right-0 top-0 w-4 h-4 bg-red-500 rounded-full border-2 border-background"></div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 border-b border-border/40 pb-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold text-base flex items-center gap-1">
                                                    {conv.profile.display_name}
                                                </h3>
                                                {conv.last_message?.sender_id !== user?.id && (
                                                    <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                                        Sua vez
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm truncate ${!conv.last_message?.is_read && conv.last_message?.sender_id !== user?.id ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                {conv.last_message?.sender_id === user?.id && 'Você: '}
                                                {(() => {
                                                    const content = conv.last_message?.content;
                                                    if (!content) return 'Começou uma conversa';
                                                    if (content.startsWith('[image:')) return '📷 Imagem';
                                                    if (content.startsWith('[audio:')) return '🎤 Mensagem de áudio';
                                                    if (content.startsWith('[profile-card')) return '👤 Cartão de Perfil';
                                                    if (content.startsWith('[video-call-accepted') || content.startsWith('[audio-call-accepted')) return 'Chamada aceita';
                                                    if (content.startsWith('[video-call')) return '📞 Chamada de vídeo';
                                                    if (content.startsWith('[audio-call')) return '📞 Chamada de áudio';
                                                    return content;
                                                })()}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </PullToRefresh >

            {/* Visualização Expandida de Perfil (Interativa) */}
            {
                typeof document !== 'undefined' && createPortal(
                    <AnimatePresence>
                        {selectedProfile && (
                            <motion.div
                                key="expanded-chat-profile"
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed inset-0 z-[9999] bg-background flex flex-col overflow-hidden"
                            >
                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide relative">
                                    {/* Botão Fechar */}
                                    <button
                                        onClick={handleManualBack}
                                        className="fixed top-[calc(1.25rem+env(safe-area-inset-top))] right-4 z-[100] w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg hover:bg-black/60 transition-colors"
                                    >
                                        <i className="ri-arrow-down-s-line text-2xl" />
                                    </button>

                                    {/* Botão de Ações (3 pontinhos - Topo Esquerdo) */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="fixed top-[calc(1.25rem+env(safe-area-inset-top))] left-4 z-[100] w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg hover:bg-black/60 transition-colors">
                                                <i className="ri-more-2-fill text-xl" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-xl border-white/10 z-[10000]">
                                            <DropdownMenuItem
                                                onSelect={() => {
                                                    setActionProfileId(selectedProfile.id);
                                                    setShowReport(true);
                                                }}
                                                className="text-amber-500 focus:text-amber-500 cursor-pointer"
                                            >
                                                <i className="ri-flag-line mr-2" />
                                                Denunciar
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem
                                                onSelect={() => {
                                                    setActionProfileId(selectedProfile.id);
                                                    setShowBlock(true);
                                                }}
                                                className="text-red-500 focus:text-red-500 cursor-pointer"
                                            >
                                                <i className="ri-prohibited-line mr-2" />
                                                Bloquear
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onSelect={() => {
                                                    const match = conversations.find(c => c.profile.id === selectedProfile.id);
                                                    if (match) {
                                                        setActionMatchId(match.match_id);
                                                        setShowDelete(true);
                                                    }
                                                }}
                                                className="text-red-500 focus:text-red-500 cursor-pointer"
                                            >
                                                <i className="ri-delete-bin-line mr-2" />
                                                Desfazer Match
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Imagem Hero */}
                                    <ProfilePhotoGallery
                                        profile={selectedProfile as any}
                                        currentPhotoIndex={currentPhotoIndex}
                                        onNextPhoto={(e) => handleNextPhoto(e, selectedProfile.photos)}
                                        onPrevPhoto={(e) => handlePrevPhoto(e)}
                                        dragControls={dragControls}
                                        className="h-[65vh]"
                                    />

                                    <div className="relative z-[5] h-3 -mt-3 bg-background" />

                                    <ProfileDetails
                                        profile={selectedProfile as any}
                                        showDirectMessage={false}
                                        onReport={() => setShowReport(true)}
                                        onBlock={() => setShowBlock(true)}
                                    />

                                    <SafetyActions
                                        showReport={showReport}
                                        setShowReport={setShowReport}
                                        showBlock={showBlock}
                                        setShowBlock={setShowBlock}
                                        targetId={actionProfileId || (selectedProfile as any).id}
                                        targetName={selectedProfile.display_name}
                                        onSuccess={() => {
                                            setSelectedProfile(null);
                                            handleRefresh();
                                        }}
                                    />
                                </div>

                                {/* Botão de Ação */}
                                <div className="absolute bottom-6 left-0 right-0 z-[100] flex justify-center px-6 pb-[calc(env(safe-area-inset-bottom)*0.6)] pointer-events-none">
                                    <button
                                        onClick={() => {
                                            const match = conversations.find(c => c.profile.id === selectedProfile.id);
                                            if (match) {
                                                navigate(`/app/chat/${match.match_id}`);
                                            } else {
                                                toast.error('Erro ao encontrar conversa', { style: { marginTop: '50px' } });
                                            }
                                        }}
                                        className="w-full max-w-sm h-14 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 pointer-events-auto hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        <i className="ri-chat-smile-2-fill text-xl" />
                                        Enviar Mensagem
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )
            }

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

            <SafetyToolkitDrawer open={showSafety} onOpenChange={setShowSafety} />

            {/* Dialogs de Ações Restantes */}
            {actionMatchId && (
                <DeleteConversationDialog
                    open={showDelete}
                    onOpenChange={setShowDelete}
                    matchId={actionMatchId}
                    onDeleted={() => {
                        setSelectedProfile(null);
                        setActionMatchId(null);
                        setShowDelete(false);
                        handleRefresh();
                    }}
                />
            )}
        </PageTransition >
    );
}
