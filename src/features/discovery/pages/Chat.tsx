import { useState, useCallback } from 'react';
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

// Demo conversations
const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    match_id: 'match-1',
    profile: {
      id: 'profile-1',
      display_name: 'Maria',
      photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'],
    },
    last_message: {
      content: 'Oi! Vi que você também gosta de música. Qual seu estilo favorito?',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      is_read: false,
      sender_id: 'profile-1',
    },
  },
  {
    id: 'conv-2',
    match_id: 'match-2',
    profile: {
      id: 'profile-2',
      display_name: 'Ana',
      photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'],
    },
    last_message: {
      content: 'Foi muito bom conversar com você ontem!',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      is_read: true,
      sender_id: 'user-id',
    },
  },
];

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(DEMO_CONVERSATIONS);
  const [loading, setLoading] = useState(false);

  const handleRefresh = useCallback(async () => {
    // Simulate API call - replace with actual fetch
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Re-fetch conversations here
    toast.success('Conversas atualizadas');
  }, []);

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
      <PullToRefresh onRefresh={handleRefresh} className="h-full -mx-4 -my-4">
        <div className="space-y-4 px-4 py-4">
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
