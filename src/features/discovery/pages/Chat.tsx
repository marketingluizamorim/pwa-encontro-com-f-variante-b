import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageTransition } from '@/features/discovery/components/PageTransition';
import { ChatListSkeleton } from '@/features/discovery/components/SkeletonLoaders';
import { PullToRefresh } from '@/features/discovery/components/PullToRefresh';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  match_id: string;
  profile: {
    id: string;
    display_name: string;
    avatar_url?: string;
    photos: string[];
  };
  last_message?: {
    content: string;
    created_at: string;
    is_read: boolean;
    sender_id: string;
  };
}

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

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
        .select('user_id, display_name, avatar_url, photos')
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
            photos: profile.photos || []
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
        .filter((c): c is Conversation => c !== null)
        .sort((a, b) => {
          const timeA = a.last_message?.created_at || '';
          const timeB = b.last_message?.created_at || '';
          return timeB.localeCompare(timeA);
        });

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

  const handleRefresh = async () => {
    await fetchConversations();
    toast.success('Conversas atualizadas');
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ontem';
    return `${diffDays}d`;
  };

  if (loading) {
    return <ChatListSkeleton />;
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <i className="ri-chat-3-line text-4xl text-muted-foreground" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Nenhuma conversa</h2>
        <p className="text-muted-foreground mb-6 max-w-xs">
          Faça um match para começar a conversar!
        </p>
        <Link
          to="/app/matches"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-button text-white font-semibold"
        >
          <i className="ri-heart-3-line" />
          Ver Matches
        </Link>
      </div>
    );
  }

  return (
    <PageTransition className="h-[calc(100vh-8rem)]">
      <PullToRefresh onRefresh={handleRefresh} className="h-full">
        <div className="space-y-4 px-4 pt-6 pb-24">
          <div>
            <h1 className="font-display text-2xl font-bold">Mensagens</h1>
            <p className="text-muted-foreground text-sm">Suas conversas</p>
          </div>

          <div className="space-y-1">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/app/chat/${conv.match_id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <img
                      src={conv.profile.photos[0] || conv.profile.avatar_url}
                      alt={conv.profile.display_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {conv.last_message && !conv.last_message.is_read && conv.last_message.sender_id !== user?.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold truncate">{conv.profile.display_name}</p>
                    {conv.last_message && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(conv.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  {conv.last_message && (
                    <p
                      className={`text-sm truncate ${!conv.last_message.is_read && conv.last_message.sender_id !== user?.id
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                        }`}
                    >
                      {conv.last_message.sender_id === user?.id && (
                        <span className="text-muted-foreground">Você: </span>
                      )}
                      {conv.last_message.content}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </PullToRefresh>
    </PageTransition>
  );
}
