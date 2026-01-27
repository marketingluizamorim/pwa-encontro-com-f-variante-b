import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { SlideTransition } from '@/components/app/PageTransition';
import { TypingIndicator } from '@/components/app/TypingIndicator';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { MessageStatus } from '@/components/app/MessageStatus';
import { playNotification } from '@/lib/notifications';
import { ReportDialog, BlockDialog } from '@/components/app/UserActions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertTriangle, Ban, UserX } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface MatchProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  photos: string[];
}

export default function ChatRoom() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [matchProfile, setMatchProfile] = useState<MatchProfile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Typing indicator hook
  const { isOtherUserTyping, broadcastTyping, stopTyping } = useTypingIndicator({
    matchId: matchId || '',
    userId: user?.id || '',
    otherUserId: otherUserId || '',
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch match profile and messages
  useEffect(() => {
    if (!matchId || !user) return;

    const fetchData = async () => {
      setLoading(true);

       const { supabase } = await import('@/integrations/supabase/client');

      // Fetch match to get the other user's ID
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        console.error('Error fetching match:', matchError);
        setLoading(false);
        return;
      }

      // Determine the other user's ID
      const matchedOtherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
      setOtherUserId(matchedOtherUserId);

      // Fetch the other user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, photos')
        .eq('user_id', matchedOtherUserId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profile) {
        setMatchProfile({
          id: profile.user_id,
          display_name: profile.display_name || 'Usuário',
          avatar_url: profile.avatar_url || undefined,
          photos: profile.photos || [],
        });
      }

      // Fetch messages for this match
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      } else {
        setMessages(messagesData || []);
      }

      // Mark unread messages as read
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('match_id', matchId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      setLoading(false);
    };

    fetchData();
  }, [matchId, user]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!matchId) return;

    let cancelled = false;
    let channel: any = null;
    let supabaseClient: any = null;

    (async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      if (cancelled) return;

      supabaseClient = supabase;

      channel = supabase
        .channel(`messages:${matchId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `match_id=eq.${matchId}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            // Play notification if from other user
            if (newMsg.sender_id !== user?.id) {
              playNotification('message');
              
              supabase
                .from('messages')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', newMsg.id);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `match_id=eq.${matchId}`,
          },
          (payload) => {
            const updatedMsg = payload.new as Message;
            setMessages((prev) => prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)));
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (supabaseClient && channel) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [matchId, user?.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !matchId || !user) return;

    setSending(true);
    stopTyping(); // Stop typing indicator when sending

    const { supabase } = await import('@/integrations/supabase/client');

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Add message optimistically
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content: messageContent,
      sender_id: user.id,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, tempMessage]);

    // Insert into database
    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: user.id,
        content: messageContent,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(messageContent);
    } else if (data) {
      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? data : m))
      );
    }

    setSending(false);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.created_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!matchProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-4">
        <p className="text-muted-foreground">Conversa não encontrada</p>
        <Link to="/app/chat">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    );
  }

  const profileImage = matchProfile.photos?.[0] || matchProfile.avatar_url || '/placeholder.svg';

  return (
    <SlideTransition className="flex flex-col h-[calc(100vh-8rem)] -mx-4 -my-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-background">
        <Link to="/app/chat" className="text-muted-foreground hover:text-foreground">
          <i className="ri-arrow-left-line text-xl" />
        </Link>
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img
            src={profileImage}
            alt={matchProfile.display_name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{matchProfile.display_name}</p>
          <p className="text-xs text-muted-foreground">Online agora</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground p-2">
              <i className="ri-more-2-fill text-xl" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-background">
            <DropdownMenuItem
              onClick={() => setShowReport(true)}
              className="text-amber-600 focus:text-amber-600"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Denunciar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowBlock(true)}
              className="text-destructive focus:text-destructive"
            >
              <Ban className="w-4 h-4 mr-2" />
              Bloquear usuário
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Report and Block Dialogs */}
      {otherUserId && (
        <>
          <ReportDialog
            open={showReport}
            onOpenChange={setShowReport}
            userId={otherUserId}
            userName={matchProfile.display_name}
          />
          <BlockDialog
            open={showBlock}
            onOpenChange={setShowBlock}
            userId={otherUserId}
            userName={matchProfile.display_name}
            onBlocked={() => navigate('/app/chat')}
          />
        </>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-4">
              <img
                src={profileImage}
                alt={matchProfile.display_name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-muted-foreground mb-2">
              Você deu match com {matchProfile.display_name}!
            </p>
            <p className="text-sm text-muted-foreground">
              Envie uma mensagem para iniciar a conversa
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex justify-center mb-4">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {date}
                </span>
              </div>
              <div className="space-y-2">
                {msgs.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[75%] px-4 py-2 rounded-2xl',
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-muted text-foreground rounded-tl-sm'
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div
                          className={cn(
                            'flex items-center justify-end gap-1 text-[10px] mt-1',
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}
                        >
                          <span>{formatTime(message.created_at)}</span>
                          {isOwn && (
                            <MessageStatus 
                              isRead={message.is_read} 
                              isSending={message.id.startsWith('temp-')}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
        
        {/* Typing indicator */}
        <TypingIndicator 
          isTyping={isOtherUserTyping} 
          userName={matchProfile?.display_name} 
        />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border bg-background">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (e.target.value.trim()) {
                broadcastTyping(true);
              } else {
                stopTyping();
              }
            }}
            onBlur={stopTyping}
            placeholder="Digite uma mensagem..."
            className="flex-1"
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || sending}
            className="gradient-button"
          >
            <i className="ri-send-plane-fill" />
          </Button>
        </div>
      </form>
    </SlideTransition>
  );
}
