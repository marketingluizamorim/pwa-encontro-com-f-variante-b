import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';
import { SlideTransition } from '@/features/discovery/components/PageTransition';
import { TypingIndicator } from '@/features/discovery/components/TypingIndicator';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { MessageStatus } from '@/features/discovery/components/MessageStatus';
import { playNotification } from '@/lib/notifications';
import { ReportDialog, BlockDialog } from '@/features/discovery/components/UserActions';
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
  bio?: string;
  birth_date?: string;
  city?: string;
  state?: string;
  religion?: string;
  church_frequency?: string;
  looking_for?: string;
  occupation?: string;
  is_verified?: boolean;
  show_distance?: boolean;
  christian_interests?: string[];
  interests?: string[];
  social_media?: string | any; // JSON string or object from DB
  last_active_at?: string;
  show_online_status?: boolean;
  show_last_active?: boolean;
}

interface SocialMediaLinks {
  instagram?: string;
  whatsapp?: string;
  facebook?: string;
}

export default function ChatRoom() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dragControls = useDragControls();

  const [messages, setMessages] = useState<Message[]>([]);
  const [matchProfile, setMatchProfile] = useState<MatchProfile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSocialBadges, setShowSocialBadges] = useState(false);

  // Social Media Logic
  const [mySocials, setMySocials] = useState<SocialMediaLinks>({});
  const [socialModal, setSocialModal] = useState<{ isOpen: boolean; platform: keyof SocialMediaLinks | null }>({ isOpen: false, platform: null });
  const [socialInputValue, setSocialInputValue] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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
        .select('user_id, display_name, avatar_url, photos, bio, birth_date, city, state, religion, church_frequency, looking_for, occupation, show_distance, christian_interests, interests, last_active_at, show_online_status, show_last_active')
        .eq('user_id', matchedOtherUserId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profile) {
        // Safe cast or manual mapping because types might not be perfectly aligned with generic JSON
        const p: any = profile;
        setMatchProfile({
          id: p.user_id,
          display_name: p.display_name || 'Usuário',
          avatar_url: p.avatar_url || undefined,
          photos: p.photos || [],
          bio: p.bio,
          birth_date: p.birth_date,
          city: p.city,
          state: p.state,
          religion: p.religion,
          church_frequency: p.church_frequency,
          looking_for: p.looking_for,
          occupation: p.occupation,
          is_verified: p.is_verified,
          show_distance: p.show_distance,
          christian_interests: p.christian_interests,
          interests: p.interests,
          last_active_at: p.last_active_at,
          show_online_status: p.show_online_status,
          show_last_active: p.show_last_active
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



    const { supabase } = await import('@/integrations/supabase/client');

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

  // Fetch my profile socials
  useEffect(() => {
    if (!user) return;
    const fetchMySocials = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('profiles')
          .select('social_media')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching socials:", error);
          return;
        }

        if (data?.social_media) {
          let parsed = data.social_media;

          // Handle stringified JSON
          if (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
            } catch (e) {
              console.error("Error parsing socials JSON:", e);
            }
          }

          // Handle double-stringified JSON (just in case)
          if (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
            } catch (e) {
              console.error("Error parsing socials JSON (2nd pass):", e);
            }
          }

          const finalSocials = (typeof parsed === 'object' && parsed !== null)
            ? (parsed as SocialMediaLinks)
            : {};

          setMySocials(finalSocials);
        }
      } catch (err) {
        console.error("Unexpected error in fetchMySocials:", err);
      }
    };
    fetchMySocials();
  }, [user]);

  const saveSocialLink = async () => {
    if (!user || !socialModal.platform) return;

    let valueToSave = socialInputValue.trim();

    // Format inputs
    if (socialModal.platform === 'instagram' || socialModal.platform === 'facebook') {
      if (!valueToSave.startsWith('@')) {
        valueToSave = '@' + valueToSave;
      }
    } else if (socialModal.platform === 'whatsapp') {
      // Brazil Phone Format: (XX) 9XXXX-XXXX
      const nums = valueToSave.replace(/\D/g, '');
      if (nums.length >= 10) {
        const ddd = nums.slice(0, 2);
        const rest = nums.slice(2);
        // Format as (XX) XXXXX-XXXX
        if (rest.length > 4) {
          valueToSave = `(${ddd}) ${rest.slice(0, rest.length - 4)}-${rest.slice(rest.length - 4)}`;
        }
      }
    }

    // Create new object to avoid mutation
    const updatedSocials = { ...mySocials, [socialModal.platform]: valueToSave };

    // Optimistic update
    setMySocials(updatedSocials);
    setSocialModal({ isOpen: false, platform: null });

    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.from('profiles').update({
      social_media: JSON.stringify(updatedSocials)
    }).eq('user_id', user.id);

    toast.success(`${socialModal.platform} salvo com sucesso!`);

    // Auto-share after saving
    sendMediaMessage(`[profile-card:${JSON.stringify({ [socialModal.platform]: valueToSave })}]`);
  };

  const shareSocialLink = (platform: keyof SocialMediaLinks) => {
    // 1. Check if we already have this social saved
    const link = mySocials[platform];

    if (link && link.trim() !== '') {
      // 2. If yes, send immediately
      sendMediaMessage(`[profile-card:${JSON.stringify({ [platform]: link })}]`);
      toast.success(`${platform} compartilhado!`);
      setShowSocialBadges(false);
    } else {
      // 3. If not, open modal to ask for it
      setSocialInputValue('');
      setSocialModal({ isOpen: true, platform });
    }
  };

  const sendMediaMessage = async (content: string) => {
    if (!matchId || !user) return;

    // Optimistic UI for media
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content: content,
      sender_id: user.id,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, tempMessage]);

    // Simulate DB delay and assume success for prototype consistency
    // In a real app, this would upload the file to storage bucket first
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: user.id,
        content: content,
      })
      .select()
      .single();

    if (data) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local URL for preview/simulation
    const objectUrl = URL.createObjectURL(file);
    const tag = `[image:${objectUrl}]`;
    sendMediaMessage(tag);

    // Reset input
    e.target.value = '';
  };

  const handleRecordAudio = () => {
    if (isRecording) return;

    setIsRecording(true);
    toast.info('Gravando áudio...');

    // Simulate recording duration
    setTimeout(() => {
      setIsRecording(false);
      sendMediaMessage('[audio:mock-recording]');
      toast.success('Áudio enviado!');
    }, 2000);
  };

  const renderMessageContent = (content: string) => {
    if (content.startsWith('[image:')) {
      const url = content.replace('[image:', '').replace(']', '');
      return (
        <img
          src={url}
          alt="Imagem enviada"
          className="rounded-lg max-w-full h-auto mt-1 border border-border/10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      );
    }
    if (content.startsWith('[audio:')) {
      return (
        <div className="flex items-center gap-3 min-w-[140px] py-1">
          <button className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 hover:bg-primary/30 transition-colors">
            <i className="ri-play-fill text-primary-foreground" />
          </button>
          <div className="flex flex-col gap-1 flex-1">
            <div className="h-1 bg-primary/20 w-full rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-primary rounded-full" />
            </div>
            <span className="text-[10px] opacity-70">0:00 / 0:15</span>
          </div>
        </div>
      );
    }
    if (content.startsWith('[profile-card:')) {
      let socials: SocialMediaLinks = {};
      try {
        const jsonStr = content.substring(14, content.length - 1);
        socials = JSON.parse(jsonStr);
      } catch (e) {
        return <p className="text-xs text-red-500">Erro ao ver cartão.</p>;
      }

      return (
        <div className="flex flex-col gap-2 min-w-[240px]">
          {/* Instagram Card */}
          {socials.instagram && (
            <a
              href={`https://instagram.com/${socials.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-zinc-900 transition-all hover:scale-[1.02] active:scale-95"
            >
              {/* Instagram Gradient Icon Background */}
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-lg shadow-pink-500/20 group-hover:shadow-pink-500/40 transition-all">
                <i className="ri-instagram-line text-2xl text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white/90">Instagram</span>
                <span className="text-base font-medium truncate text-white/70 group-hover:text-white transition-colors">
                  {socials.instagram}
                </span>
              </div>
            </a>
          )}

          {/* Facebook Card */}
          {socials.facebook && (
            <a
              href={`https://facebook.com/${socials.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-zinc-900 transition-all hover:scale-[1.02] active:scale-95"
            >
              {/* Facebook Blue Icon Background */}
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#1877F2] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                <i className="ri-facebook-fill text-2xl text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white/90">Facebook</span>
                <span className="text-base font-medium truncate text-white/70 group-hover:text-white transition-colors">
                  {socials.facebook}
                </span>
              </div>
            </a>
          )}

          {/* WhatsApp Card */}
          {socials.whatsapp && (
            <a
              href={`https://wa.me/55${socials.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-zinc-900 transition-all hover:scale-[1.02] active:scale-95"
            >
              {/* WhatsApp Green Icon Background */}
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#25D366] shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-all">
                <i className="ri-whatsapp-line text-2xl text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white/90">WhatsApp</span>
                <span className="text-base font-medium truncate text-white/70 group-hover:text-white transition-colors">
                  {socials.whatsapp}
                </span>
              </div>
            </a>
          )}
        </div>
      );
    }
    if (content === '[profile-card]') {
      return (
        <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50 min-w-[200px] space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <i className="ri-user-follow-line text-primary text-lg" />
            </div>
            <div>
              <p className="font-bold text-sm">Minhas Redes</p>
              <p className="text-[10px] text-muted-foreground">Vamos continuar o papo por lá?</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 transition-colors">
              <i className="ri-instagram-line text-xl" />
              <span className="text-[10px] font-medium">Instagram</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-600 transition-colors">
              <i className="ri-whatsapp-line text-xl" />
              <span className="text-[10px] font-medium">WhatsApp</span>
            </button>
          </div>
        </div>
      );
    }
    return <p className="text-sm break-words leading-relaxed">{content}</p>;
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
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-4 px-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
          <i className="ri-error-warning-line text-3xl opacity-50" />
        </div>
        <h3 className="text-xl font-bold">Conversa não encontrada</h3>
        <p className="text-muted-foreground text-sm">
          Não conseguimos carregar o chat. ID: {matchId?.slice(0, 8)}...
        </p>
        <div className="flex gap-2 w-full max-w-xs">
          <Link to="/app/chat" className="flex-1">
            <Button variant="outline" className="w-full">Voltar</Button>
          </Link>
          <Button
            variant="default"
            className="flex-1"
            onClick={() => window.location.reload()}
          >
            Tentar navamente
          </Button>
        </div>
      </div>
    );
  }

  const profileImage = matchProfile.photos?.[0] || matchProfile.avatar_url || '/placeholder.svg';

  return (
    <SlideTransition className="flex flex-col w-full h-[100dvh] bg-background overflow-hidden">
      {/* Header - Fixed Top (Flex Child) */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0 h-16">
        <Link to="/app/chat" className="text-muted-foreground hover:text-foreground">
          <i className="ri-arrow-left-line text-xl" />
        </Link>
        <div
          onClick={() => setShowProfileInfo(true)}
          className="cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden hover:opacity-80 transition-opacity">
            <img
              src={profileImage}
              alt={matchProfile.display_name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowProfileInfo(true)}>
          <p className="font-semibold truncate hover:text-primary transition-colors">{matchProfile.display_name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {formatLastActive(
              matchProfile.last_active_at,
              matchProfile.show_online_status,
              matchProfile.show_last_active
            ) || 'Offline'}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground p-2 shrink-0">
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

      {/* Messages - Flex Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
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
              <div className="flex justify-center mb-4 sticky top-0 z-10 py-2">
                <span className="text-xs text-muted-foreground bg-muted/80 backdrop-blur px-3 py-1 rounded-full shadow-sm">
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
                          'max-w-[75%] px-4 py-2 rounded-2xl shadow-sm',
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-muted text-foreground rounded-tl-sm'
                        )}
                      >
                        {renderMessageContent(message.content)}
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
        <div ref={messagesEndRef} className="h-2" />

        {/* Typing indicator */}
        <TypingIndicator
          isTyping={isOtherUserTyping}
          userName={matchProfile?.display_name}
        />
      </div>

      {/* Footer Area: Input + Action Buttons */}
      <div className="shrink-0 bg-background border-t border-border pb-safe transition-all">

        {/* Social Badges Tray (Contextual) */}
        <AnimatePresence>
          {showSocialBadges && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 overflow-x-auto no-scrollbar flex items-center gap-2 pt-3"
            >
              <button onClick={() => shareSocialLink('instagram')} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 text-white text-xs font-medium whitespace-nowrap active:scale-95 transition-transform hover:opacity-90 shadow-sm border border-transparent">
                <i className="ri-instagram-line" />
                + Instagram
              </button>
              <button onClick={() => shareSocialLink('whatsapp')} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-medium whitespace-nowrap active:scale-95 transition-transform hover:opacity-90 shadow-sm border border-transparent">
                <i className="ri-whatsapp-line" />
                + WhatsApp
              </button>
              <button onClick={() => shareSocialLink('facebook')} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1877F2] text-white text-xs font-medium whitespace-nowrap active:scale-95 transition-transform hover:opacity-90 shadow-sm border border-transparent">
                <i className="ri-facebook-fill" />
                + Facebook
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSend} className="px-4 py-3 flex items-center gap-2">
          {isRecording ? (
            <div className="flex-1 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center px-4 animate-pulse">
              <i className="ri-mic-fill mr-2" />
              <span className="font-medium text-sm">Gravando áudio...</span>
            </div>
          ) : (
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
              className="flex-1 rounded-full bg-secondary/80 border-transparent focus:bg-background transition-all placeholder:text-muted-foreground font-medium"
              disabled={sending}
            />
          )}
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || sending || isRecording}
            className="rounded-full w-10 h-10 gradient-button shadow-lg shrink-0"
          >
            {sending ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <i className="ri-send-plane-fill text-lg ml-0.5" />
            )}
          </Button>
        </form>

        {/* Separator Line */}
        <div className="h-px bg-border/40 mx-4 mb-3" />

        {/* Quick Actions Toolbar */}
        <div className="px-4 pb-3 flex items-center gap-4 relative">

          {/* Hidden Inputs */}
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, 'image')}
            capture="environment" /* Prefer camera on mobile */
          />

          {/* 1. Socials Button (Card Icon) */}
          <button
            type="button"
            onClick={() => setShowSocialBadges(!showSocialBadges)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95",
              showSocialBadges ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
            )}
            title="Compartilhar Redes"
          >
            <i className="ri-id-card-line text-xl" />
          </button>

          {/* 2. Camera/Image Button */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center hover:bg-purple-500/20 active:scale-95 transition-all"
            title="Tirar Foto / Galeria"
          >
            <i className="ri-camera-fill text-xl" />
          </button>

          {/* 3. Audio Button */}
          <button
            type="button"
            onClick={handleRecordAudio}
            disabled={isRecording}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95",
              isRecording ? "bg-red-500 text-white animate-pulse" : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
            )}
            title="Gravar Áudio"
          >
            <i className={cn("text-xl", isRecording ? "ri-stop-fill" : "ri-mic-fill")} />
          </button>
        </div>
      </div>

      {
        typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {socialModal.isOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setSocialModal({ ...socialModal, isOpen: false })}
                />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-card w-full max-w-sm rounded-xl p-6 relative z-10 border border-border shadow-2xl space-y-4"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <i className={cn("text-2xl",
                      socialModal.platform === 'instagram' ? "ri-instagram-line text-pink-500" :
                        socialModal.platform === 'whatsapp' ? "ri-whatsapp-line text-green-500" :
                          "ri-facebook-circle-fill text-blue-600"
                    )} />
                    Adicionar {socialModal.platform}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Digite seu {socialModal.platform === 'whatsapp' ? 'número com DDD' : 'usuário'} para compartilhar.
                  </p>

                  <div className="relative">
                    <Input
                      value={socialInputValue}
                      onChange={(e) => {
                        let val = e.target.value;
                        const platform = socialModal.platform?.toLowerCase();

                        if (platform === 'whatsapp') {
                          // Remove non-digits
                          val = val.replace(/\D/g, '');
                          // Limit to 11 digits
                          if (val.length > 11) val = val.slice(0, 11);

                          // Mask: (XX) XXXXX-XXXX
                          val = val.replace(/^(\d{2})(\d)/g, '($1) $2');
                          val = val.replace(/(\d)(\d{4})$/, '$1-$2');
                        } else if (platform === 'instagram' || platform === 'facebook') {
                          if (val.startsWith('@')) val = val.substring(1);
                        }
                        setSocialInputValue(val);
                      }}
                      placeholder={socialModal.platform?.toLowerCase() === 'whatsapp' ? '(11) 99999-9999' : 'seu.usuario'}
                      className={cn(
                        "transition-all font-medium",
                        socialModal.platform?.toLowerCase() === 'whatsapp' ? "pl-14" : "pl-9"
                      )}
                      autoFocus
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold pointer-events-none select-none z-50">
                      {socialModal.platform?.toLowerCase() === 'whatsapp' ? '+55' : '@'}
                    </span>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setSocialModal({ ...socialModal, isOpen: false })}>Cancelar</Button>
                    <Button onClick={saveSocialLink} disabled={!socialInputValue.trim()}>Salvar e Enviar</Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )
      }

      {/* Expanded Profile Info Component */}
      {
        typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {showProfileInfo && matchProfile && (
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
                    setShowProfileInfo(false);
                  }
                }}
                className="fixed inset-0 z-[9999] bg-background flex flex-col overflow-hidden"
              >
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pb-44 scrollbar-hide relative">

                  {/* Close Button */}
                  <button
                    onClick={() => setShowProfileInfo(false)}
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
                      src={matchProfile.photos?.[0] || matchProfile.avatar_url || '/placeholder.svg'}
                      className="w-full h-full object-cover pointer-events-none"
                      alt={matchProfile.display_name}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
                  </div>

                  {/* Profile Info Content */}
                  <div className="px-5 -mt-20 relative z-10 space-y-6">

                    {/* Header: Name & Age */}
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-display font-bold text-foreground">
                          {matchProfile.display_name}
                        </h1>
                        <span className="text-3xl font-light text-muted-foreground">
                          {matchProfile.birth_date ? calculateAge(matchProfile.birth_date) : ''}
                        </span>

                      </div>

                      {/* Main Badges */}
                      <div className="flex items-center gap-3 mt-3 text-sm text-foreground/80">
                        {matchProfile.occupation && (
                          <div className="flex items-center gap-1.5">
                            <i className="ri-briefcase-line" />
                            <span>{matchProfile.occupation}</span>
                          </div>
                        )}
                        {(matchProfile.city) && (matchProfile.show_distance !== false) && (
                          <div className="flex items-center gap-1.5">
                            <i className="ri-map-pin-line" />
                            <span>{matchProfile.city}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section: Looking For */}
                    {(matchProfile.looking_for) && (
                      <div className="bg-card/50 border border-border/50 rounded-2xl p-4 backdrop-blur-sm">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tô procurando</h3>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                            <i className="ri-heart-2-fill text-xl" />
                          </div>
                          <span className="text-lg font-medium">{matchProfile.looking_for}</span>
                        </div>
                      </div>
                    )}

                    {/* Section: About Me */}
                    {matchProfile.bio && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold">Sobre mim</h3>
                        <p className="text-muted-foreground leading-relaxed text-base">
                          {matchProfile.bio}
                        </p>
                      </div>
                    )}

                    {/* Section: Basic Info */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold">Informações básicas</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-secondary/30 rounded-xl p-3 flex items-center gap-3">
                          <i className="ri-ruler-line text-foreground/50 text-xl" />
                          <div>
                            <p className="text-xs text-muted-foreground">Altura</p>
                            <p className="font-medium">170 cm</p>
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
                            <p className="font-medium">{matchProfile.religion || 'Cristão'}</p>
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
                    {(matchProfile.christian_interests && matchProfile.christian_interests.length > 0) && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold">Interesses</h3>
                        <div className="flex flex-wrap gap-2">
                          {matchProfile.christian_interests.map((tag: string) => (
                            <span key={tag} className="px-4 py-2 rounded-full border border-primary/30 text-primary bg-primary/5 text-sm font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Spacer */}
                    <div className="h-10" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      }
    </SlideTransition >
  );
}
