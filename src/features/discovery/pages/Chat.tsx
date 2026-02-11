import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageTransition } from '@/features/discovery/components/PageTransition';
import { ChatListSkeleton } from '@/features/discovery/components/SkeletonLoaders';
import { PullToRefresh } from '@/features/discovery/components/PullToRefresh';
import { toast } from 'sonner';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FeatureGateDialog } from '@/features/discovery/components/FeatureGateDialog';
import { Header } from '@/features/discovery/components/Header';
import { SafetyToolkitDrawer } from '@/features/discovery/components/SafetyToolkitDrawer';

const LOOKING_FOR_EMOJIS: Record<string, string> = {
    'Um compromisso sério': '💍',
    'Construir uma família': '👨‍👩‍👧‍👦',
    'Conhecer pessoas novas': '✨',
    'Amizade verdadeira': '🤝',
};

interface Conversation {
    id: string;
    match_id: string;
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
    };
    last_message?: {
        content: string;
        created_at: string;
        is_read: boolean;
        sender_id: string;
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

const FloatingHeart = () => (
    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="relative flex items-center justify-center">
            <div className="absolute w-5 h-5 bg-[#d4af37] blur-md opacity-50 rounded-full" />
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#d4af37] via-[#fcd34d] to-[#b45309] border-2 border-[#1a1a1a] flex items-center justify-center shadow-lg">
                <i className="ri-heart-fill text-white text-[10px]" />
            </div>
        </div>
    </div>
);

export default function Chat() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [viewedMatches, setViewedMatches] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('viewed-matches');
        return new Set(saved ? JSON.parse(saved) : []);
    });
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<Conversation['profile'] | null>(null);
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [showSafety, setShowSafety] = useState(false);
    const dragControls = useDragControls();

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        try {
            const { supabase } = await import('@/integrations/supabase/client');

            // 1. Get Matches
            const { data: matchesData, error: matchesError } = await supabase
                .from('matches')
                .select('id, user1_id, user2_id')
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                .eq('is_active', true);

            if (matchesError) throw matchesError;
            if (!matchesData || matchesData.length === 0) {
                setConversations([]);
                return;
            }

            // 2. Get Profiles
            const otherUserIds = matchesData.map(m => m.user1_id === user.id ? m.user2_id : m.user1_id);
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('user_id, display_name, avatar_url, photos, birth_date, bio, city, looking_for, religion')
                .in('user_id', otherUserIds);

            const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]));

            // 3. Get Last Messages
            const matchesWithMessages = await Promise.all(matchesData.map(async (m) => {
                const { data: msgs } = await supabase
                    .from('messages')
                    .select('content, created_at, sender_id, is_read')
                    .eq('match_id', m.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                const lastMsg = msgs?.[0];
                const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
                const profile = profilesMap.get(otherId);

                if (!profile) return null;

                return {
                    id: 'conv-' + m.id,
                    match_id: m.id,
                    profile: {
                        id: profile.user_id,
                        display_name: profile.display_name || 'Usuário',
                        avatar_url: profile.avatar_url || undefined,
                        photos: profile.photos || [],
                        birth_date: profile.birth_date,
                        bio: profile.bio,
                        city: profile.city,
                        looking_for: profile.looking_for,
                        religion: profile.religion
                    },
                    last_message: lastMsg ? {
                        content: lastMsg.content,
                        created_at: lastMsg.created_at,
                        is_read: lastMsg.is_read,
                        sender_id: lastMsg.sender_id
                    } : undefined
                };
            }));

            const validConversations = matchesWithMessages
                .filter((c) => c !== null) as Conversation[];

            setConversations(validConversations);

        } catch (error) {
            console.error('Error loading chats:', error);
            toast.error('Erro ao carregar conversas');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const markMatchAsViewed = (matchId: string) => {
        const newViewed = new Set(viewedMatches);
        newViewed.add(matchId);
        setViewedMatches(newViewed);
        localStorage.setItem('viewed-matches', JSON.stringify(Array.from(newViewed)));
    };

    // Fetch like count for the "Gold Card"
    const [likesCount, setLikesCount] = useState(0);
    const [likesPhoto, setLikesPhoto] = useState<string | null>(null);

    const fetchLikesCount = useCallback(async () => {
        if (!user) return;
        const { supabase } = await import('@/integrations/supabase/client');

        // 1. Get all users who LIKED me
        const { data: incomingLikes } = await supabase
            .from('swipes')
            .select('swiper_id')
            .eq('swiped_id', user.id)
            .in('direction', ['like', 'super_like']);

        if (!incomingLikes || incomingLikes.length === 0) {
            setLikesCount(0);
            return;
        }

        // 2. Get all users I have already SWIPED on (Like or Dislike)
        const { data: mySwipes } = await supabase
            .from('swipes')
            .select('swiped_id')
            .eq('swiper_id', user.id);

        const mySwipedIds = new Set(mySwipes?.map(s => s.swiped_id));

        // 3. Filter: Only count likes from people I haven't swiped on yet
        const pendingLikes = incomingLikes.filter(like => !mySwipedIds.has(like.swiper_id));

        setLikesCount(pendingLikes.length);

        // 4. Get a photo from one of those users to show blurred
        if (pendingLikes.length > 0) {
            const firstPendingId = pendingLikes[0].swiper_id;
            const { data: profile } = await supabase
                .from('profiles')
                .select('photos, avatar_url')
                .eq('user_id', firstPendingId)
                .single();

            if (profile) {
                setLikesPhoto(profile.photos?.[0] || profile.avatar_url || null);
            }
        } else {
            setLikesPhoto(null);
        }
    }, [user]);

    useEffect(() => {
        fetchLikesCount();
    }, [fetchLikesCount]);

    const handleRefresh = async () => {
        await Promise.all([fetchConversations(), fetchLikesCount()]);
        toast.success('Conversas atualizadas');
    };

    if (loading) {
        return <ChatListSkeleton />;
    }

    // Filter conversations into "New Matches" (no messages) and "Messages"
    const newMatches = conversations.filter(c => !c.last_message);
    const existingChats = conversations.filter(c => !!c.last_message);

    return (
        <PageTransition className="h-[calc(100vh-8rem)]">
            <PullToRefresh onRefresh={handleRefresh} className="h-full">
                <div className="flex flex-col h-full bg-background">
                    <div className="flex-1 overflow-y-auto pb-24">
                        <Header action={
                            <button
                                onClick={() => setShowSafety(true)}
                                className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md border border-border/10 flex items-center justify-center text-foreground/80 hover:bg-background/30 active:scale-95 transition-all outline-none"
                            >
                                <i className="ri-shield-check-line text-xl" />
                            </button>
                        } />

                        {/* Promotional Banner */}
                        <div
                            onClick={() => setShowUpgradeDialog(true)}
                            className="mx-4 mt-4 mb-6 p-4 rounded-xl relative overflow-hidden bg-gradient-to-r from-gray-900 to-black border border-white/10 shadow-lg cursor-pointer active:scale-95 transition-transform"
                        >
                            <div className="relative z-10 flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center bg-gray-800 shrink-0">
                                    <i className="ri-fire-fill text-2xl text-white"></i>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">Saia na frente com as curtidas prioritárias e filtros personalizados</h3>
                                    <p className="text-gray-400 text-xs mt-1">
                                        Chame atenção mais rápido e aumente as suas chances de encontrar alguém em até 30%.
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* New Matches Section */}
                        <div className="px-4 mb-8">
                            <h2 className="font-bold text-lg mb-4">Novos matches</h2>
                            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                                {/* Gold Card - Likes Teaser */}
                                <Link to="/app/matches" className="flex flex-col items-center gap-2 shrink-0 group">
                                    <div className="relative w-24 h-32 rounded-xl border-2 border-[#d4af37] bg-gray-900 flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-[10px] overflow-hidden">
                                            {likesPhoto ? (
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center opacity-60 blur-xl scale-125 transition-transform duration-700 group-hover:scale-150"
                                                    style={{ backgroundImage: `url(${likesPhoto})` }}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-50"></div>
                                            )}
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                        </div>

                                        <div className="relative z-10 w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center shadow-lg border border-white/20">
                                            <span className="text-black font-bold text-xs">{likesCount}</span>
                                        </div>

                                        <FloatingHeart />
                                    </div>
                                    <span className="text-sm font-medium mt-1">Curtidas</span>
                                </Link>

                                {/* Actual New Matches */}
                                {newMatches.map((conv) => (
                                    <div
                                        key={'match-' + conv.id}
                                        onClick={() => {
                                            markMatchAsViewed(conv.match_id);
                                            setSelectedProfile(conv.profile);
                                        }}
                                        className="flex flex-col items-center gap-2 shrink-0 cursor-pointer"
                                    >
                                        <div className="relative w-24 h-32 rounded-xl border border-white/10 overflow-visible bg-muted shadow-sm">
                                            <div className="absolute inset-0 rounded-xl overflow-hidden">
                                                <img
                                                    src={conv.profile.photos[0] || conv.profile.avatar_url}
                                                    className="w-full h-full object-cover"
                                                    alt={conv.profile.display_name}
                                                />
                                            </div>

                                            {/* Red Dot if unread message (though newMatches usually don't have messages) */}
                                            {conv.last_message && !conv.last_message.is_read && conv.last_message.sender_id !== user?.id && (
                                                <div className="absolute right-1 top-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background z-20"></div>
                                            )}

                                            {/* Floating Heart for NEW matches the user hasn't clicked yet */}
                                            {!viewedMatches.has(conv.match_id) && <FloatingHeart />}
                                        </div>
                                        <span className="text-sm font-medium truncate max-w-[96px] mt-1">{conv.profile.display_name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="px-4">
                            <h2 className="font-bold text-lg mb-4">Mensagens</h2>

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
                                                    <img
                                                        src={conv.profile.photos[0] || conv.profile.avatar_url}
                                                        alt={conv.profile.display_name}
                                                        className="w-full h-full object-cover"
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
                </div>
            </PullToRefresh >

            {/* Expanded Profile View (Interactive) */}
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
                                drag="y"
                                dragControls={dragControls}
                                dragConstraints={{ top: 0, bottom: 0 }}
                                dragElastic={{ top: 0, bottom: 0.7 }}
                                onDragEnd={(e, info) => {
                                    if (info.offset.y > 100 || info.velocity.y > 500) {
                                        setSelectedProfile(null);
                                    }
                                }}
                            >
                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto pb-44 scrollbar-hide relative">
                                    {/* Close Button */}
                                    <button
                                        onClick={() => setSelectedProfile(null)}
                                        className="fixed top-4 right-4 z-[100] w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg hover:bg-black/60 transition-colors"
                                    >
                                        <i className="ri-arrow-down-s-line text-2xl" />
                                    </button>

                                    {/* Hero Image */}
                                    <div
                                        className="relative w-full h-[65vh] touch-none cursor-grab active:cursor-grabbing"
                                        onPointerDown={(e) => dragControls.start(e)}
                                    >
                                        <img
                                            src={selectedProfile.photos?.[0] || selectedProfile.avatar_url || '/placeholder.svg'}
                                            className="w-full h-full object-cover pointer-events-none"
                                            alt={selectedProfile.display_name}
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
                                    </div>

                                    {/* Profile Info Content */}
                                    <div className="px-5 -mt-20 relative z-10 space-y-6">
                                        {/* Header: Name & Age */}
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h1 className="text-4xl font-display font-bold text-foreground">
                                                    {selectedProfile.display_name}
                                                </h1>
                                                <span className="text-3xl font-light text-muted-foreground">
                                                    {calculateAge(selectedProfile.birth_date)}
                                                </span>
                                            </div>

                                            {/* Main Badges */}
                                            <div className="flex items-center gap-3 mt-3 text-sm text-foreground/80">
                                                {selectedProfile.occupation && (
                                                    <div className="flex items-center gap-1.5">
                                                        <i className="ri-briefcase-line" />
                                                        <span>{selectedProfile.occupation}</span>
                                                    </div>
                                                )}
                                                {(selectedProfile.city) && (
                                                    <div className="flex items-center gap-1.5">
                                                        <i className="ri-map-pin-line" />
                                                        <span>{selectedProfile.city}</span>
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
                                                <span className="text-lg font-medium">{selectedProfile.looking_for || 'Sincronicidade'}</span>
                                            </div>
                                        </div>

                                        {/* Section: About Me */}
                                        {selectedProfile.bio && (
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-bold">Sobre mim</h3>
                                                <p className="text-muted-foreground leading-relaxed text-base">
                                                    {selectedProfile.bio}
                                                </p>
                                            </div>
                                        )}

                                        {/* Section: Interests */}
                                        {(selectedProfile.christian_interests && selectedProfile.christian_interests.length > 0) && (
                                            <div className="space-y-3">
                                                <h3 className="text-lg font-bold">Interesses</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedProfile.christian_interests.map((tag: string) => (
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

                                {/* Action Button */}
                                <div className="absolute bottom-6 left-0 right-0 z-[100] flex justify-center items-center px-4 pointer-events-none">
                                    <button
                                        onClick={() => {
                                            const match = conversations.find(c => c.profile.id === selectedProfile.id);
                                            if (match) {
                                                navigate(`/app/chat/${match.match_id}`);
                                            } else {
                                                toast.error('Erro ao encontrar conversa');
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

            <FeatureGateDialog
                open={showUpgradeDialog}
                onOpenChange={setShowUpgradeDialog}
                title="Escolha seu Plano"
                description="Desbloqueie todo o potencial do app"
                features={[]}
                price={0}
            />
            <SafetyToolkitDrawer open={showSafety} onOpenChange={setShowSafety} />
        </PageTransition >
    );
}
