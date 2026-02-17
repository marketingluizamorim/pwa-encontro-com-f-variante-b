import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { ReportDialog, BlockDialog, DeleteConversationDialog } from '@/features/discovery/components/UserActions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertTriangle, Ban, Lock, Video, Phone } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureGateDialog } from '@/features/discovery/components/FeatureGateDialog';
import { CheckoutManager } from '@/features/discovery/components/CheckoutManager';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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
  social_media?: string | Record<string, string>;
  last_active_at?: string;
  show_online_status?: boolean;
  show_last_active?: boolean;
}

interface SocialMediaLinks {
  instagram?: string;
  whatsapp?: string;
  facebook?: string;
}

const LOOKING_FOR_ICONS: Record<string, string> = {
  'Relacionamento sério': 'ri-heart-pulse-fill',
  'Construir uma família': 'ri-home-heart-fill',
  'Conhecer pessoas novas': 'ri-sparkles-line',
  'Amizade verdadeira': 'ri-hand-heart-fill',
};

// Custom WhatsApp-style Audio Player Component
function AudioMessage({ url, isOwn, avatarUrl }: { url: string; isOwn: boolean; avatarUrl?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-3 py-1.5 px-1 min-w-[220px] max-w-full overflow-hidden",
    )}>
      {/* Avatar with Mic Badge */}
      <div className="relative shrink-0 ml-1">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 shadow-md">
          <img src={avatarUrl || '/placeholder.svg'} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-background rounded-full flex items-center justify-center shadow-md border border-border/20">
          <i className={cn("ri-mic-fill text-[10px]", isOwn ? "text-primary" : "text-primary")} />
        </div>
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="shrink-0 w-9 h-9 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
      >
        <i className={cn(
          "text-4xl",
          isPlaying ? "ri-pause-mini-fill" : "ri-play-mini-fill",
          isOwn ? "text-white" : "text-primary"
        )} />
      </button>

      {/* Progress & Time */}
      <div className="flex-1 flex flex-col gap-1 min-w-0 pr-2 pt-1">
        <div className="relative h-6 w-full flex items-center group">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className={cn(
              "w-full h-1 rounded-full appearance-none cursor-pointer outline-none z-10",
              isOwn ? "accent-white bg-white/20" : "accent-primary bg-primary/20"
            )}
            style={{
              background: `linear-gradient(to right, ${isOwn ? 'white' : 'hsl(var(--primary))'} ${(currentTime / duration) * 100 || 0}%, ${isOwn ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} 0%)`
            }}
          />
        </div>
        <div className="flex justify-between items-center pr-1 -mt-1">
          <span className={cn("text-[10px] font-semibold", isOwn ? "text-white/90" : "text-muted-foreground/80")}>
            {formatTime(currentTime || 0)}
          </span>
          {duration > 0 && (
            <span className={cn("text-[10px] font-semibold", isOwn ? "text-white/90" : "text-muted-foreground/80")}>
              {formatTime(duration)}
            </span>
          )}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        preload="metadata"
        className="hidden"
      />
    </div>
  );
}

export default function ChatRoom() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dragControls = useDragControls();

  const queryClient = useQueryClient();

  // Optimized Data Fetching with React Query
  const { data: matchDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ['chat-details', matchId, user?.id],
    enabled: !!matchId && !!user,
    staleTime: Infinity,
    queryFn: async () => {
      if (!matchId || !user) throw new Error("No user/match");
      const { supabase } = await import('@/integrations/supabase/client');

      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError || !match) throw matchError;

      const matchedOtherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;

      // Check for Super Like
      const { data: superLike } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', matchedOtherUserId)
        .eq('swiped_id', user.id)
        .eq('direction', 'super_like')
        .maybeSingle();

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, photos, bio, birth_date, city, state, religion, church_frequency, looking_for, occupation, show_distance, christian_interests, interests, last_active_at, show_online_status, show_last_active')
        .eq('user_id', matchedOtherUserId)
        .single();

      let mProfile: MatchProfile | null = null;
      if (profile) {
        const p = profile as Record<string, unknown>;
        mProfile = {
          id: String(p.user_id),
          display_name: String(p.display_name || 'Usuário'),
          avatar_url: p.avatar_url ? String(p.avatar_url) : undefined,
          photos: Array.isArray(p.photos) ? p.photos.map(String) : [],
          bio: p.bio ? String(p.bio) : undefined,
          birth_date: p.birth_date ? String(p.birth_date) : undefined,
          city: p.city ? String(p.city) : undefined,
          state: p.state ? String(p.state) : undefined,
          religion: p.religion ? String(p.religion) : undefined,
          church_frequency: p.church_frequency ? String(p.church_frequency) : undefined,
          looking_for: p.looking_for ? String(p.looking_for) : undefined,
          occupation: p.occupation ? String(p.occupation) : undefined,
          is_verified: !!p.is_verified,
          show_distance: !!p.show_distance,
          christian_interests: Array.isArray(p.christian_interests) ? p.christian_interests.map(String) : [],
          interests: Array.isArray(p.interests) ? p.interests.map(String) : [],
          last_active_at: p.last_active_at ? String(p.last_active_at) : undefined,
          show_online_status: !!p.show_online_status,
          show_last_active: !!p.show_last_active
        };
      }

      return {
        matchProfile: mProfile,
        otherUserId: matchedOtherUserId,
        isSuperLikeMatch: !!superLike
      };
    }
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['chat-messages', matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      return messagesData || [];
    }
  });

  const { data: myProfile } = useQuery({
    queryKey: ['my-profile', user?.id],
    enabled: !!user,
    staleTime: Infinity,
    queryFn: async () => {
      if (!user) return null;
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return profile;
    }
  });

  const mySocials = useMemo(() => {
    if (myProfile?.social_media) {
      try {
        return typeof myProfile.social_media === 'string'
          ? JSON.parse(myProfile.social_media)
          : myProfile.social_media;
      } catch (e) {
        console.error('Error parsing my socials:', e);
      }
    }
    return {};
  }, [myProfile?.social_media]);

  const loading = loadingDetails || loadingMessages;
  const matchProfile = matchDetails?.matchProfile || null;
  const otherUserId = matchDetails?.otherUserId || null;
  const isSuperLikeMatch = matchDetails?.isSuperLikeMatch || false;

  const setMessages = useCallback((updater: Message[] | ((prev: Message[]) => Message[])) => {
    queryClient.setQueryData(['chat-messages', matchId], (old: Message[] | undefined) => {
      const prev = old || [];
      if (typeof updater === 'function') {
        const newData = updater(prev);
        return newData;
      }
      return updater;
    });
  }, [queryClient, matchId]);

  const setMySocials = useCallback((updater: SocialMediaLinks | ((prev: SocialMediaLinks) => SocialMediaLinks)) => {
    queryClient.setQueryData(['my-socials', user?.id], (old: SocialMediaLinks | undefined) => {
      const prev = old || {};
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return updater;
    });
  }, [queryClient, user?.id]);

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showSocialBadges, setShowSocialBadges] = useState(false);
  const { data: subscription } = useSubscription();

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [upgradeData, setUpgradeData] = useState({
    title: '',
    description: '',
    features: [] as string[],
    icon: null as React.ReactNode,
    price: 49.90,
    planId: 'gold'
  });
  const [showCheckoutManager, setShowCheckoutManager] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<{ id: string, name: string, price: number } | null>(null);

  const [socialModal, setSocialModal] = useState<{ isOpen: boolean; platform: keyof SocialMediaLinks | null }>({ isOpen: false, platform: null });
  const [socialInputValue, setSocialInputValue] = useState('');

  // Photo Navigation State
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (matchProfile && matchProfile.photos && currentPhotoIndex < matchProfile.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };

  // Call State (Audio or Video)
  const [activeCall, setActiveCall] = useState<{ roomId: string; isIncoming: boolean; status: 'calling' | 'ongoing'; type: 'video' | 'audio' } | null>(null);

  const startCall = async (type: 'video' | 'audio') => {
    if (!matchId || !user) return;
    const roomId = `room-${matchId}-${Math.random().toString(36).substring(7)}`;

    // Inicia a chamada localmente
    setActiveCall({ roomId, isIncoming: false, status: 'calling', type });
    if (type === 'audio') setIsCameraOff(true);

    // Envia o convite para o outro usuário
    await sendMediaMessage(`[${type}-call:${roomId}]`);
  };

  const startVideoCall = () => startCall('video');
  const startAudioCall = () => startCall('audio');

  const handleAcceptCall = async () => {
    if (activeCall) {
      setActiveCall({ ...activeCall, status: 'ongoing' });
      // Se for áudio, garante que a câmera está desligada
      if (activeCall.type === 'audio') setIsCameraOff(true);
      // Envia confirmação de aceite para o outro usuário saber que pode iniciar o vídeo/áudio
      await sendMediaMessage(`[${activeCall.type}-call-accepted:${activeCall.roomId}]`);
    }
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatLastActive = (lastActiveAt?: string, showOnline?: boolean, showLastActive?: boolean) => {
    if (showOnline === false) return null;
    if (!lastActiveAt) return null;

    const lastActive = new Date(lastActiveAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));

    if (diffInMinutes < 5) return 'Online';
    if (showLastActive === false) return 'Visto recentemente';

    if (diffInMinutes < 60) return `Visto há ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return 'Visto hoje';

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Visto ontem';
    if (diffInDays < 7) return 'Visto esta semana';

    return 'Visto a algum tempo';
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { isOtherUserTyping, broadcastTyping, stopTyping } = useTypingIndicator({
    matchId: matchId || '',
    userId: user?.id || '',
    otherUserId: otherUserId || '',
  });

  // Handle History for Profile Overlay
  useEffect(() => {
    const handlePopState = () => {
      if (showProfileInfo) setShowProfileInfo(false);
    };

    if (showProfileInfo) {
      window.history.pushState({ profileOpen: true }, "");
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showProfileInfo]);

  const closeProfile = () => {
    if (showProfileInfo) {
      window.history.back();
    } else {
      setShowProfileInfo(false);
    }
  };

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => scrollToBottom(loading ? 'auto' : 'smooth'), 100);
      return () => clearTimeout(timer);
    }
  }, [messages, loading, scrollToBottom]);

  // Mark as read effect
  useEffect(() => {
    if (!messages.length || !user || !matchId) return;
    const markAsRead = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: myPrivacySettings } = await supabase
        .from('profiles')
        .select('show_read_receipts')
        .eq('user_id', user.id)
        .single();

      if (myPrivacySettings?.show_read_receipts !== false) {
        await supabase
          .from('messages')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('match_id', matchId)
          .neq('sender_id', user.id)
          .eq('is_read', false);
      }
    };
    markAsRead();
  }, [messages.length, user, matchId]);

  useEffect(() => {
    if (!matchId) return;

    let channel: { unsubscribe: () => void } | null = null;
    let supabaseClient: { removeChannel: (ch: unknown) => void } | null = null;

    (async () => {
      const { supabase } = await import('@/integrations/supabase/client');
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
            // Confirmação de aceite (Vídeo ou Áudio)
            if (payload.new.content.includes('-call-accepted:')) {
              const type = payload.new.content.includes('video-call') ? 'video' : 'audio';
              const acceptedRoomId = payload.new.content.replace(`[${type}-call-accepted:`, '').replace(']', '');
              setActiveCall(prev => {
                if (prev && prev.roomId === acceptedRoomId) {
                  return { ...prev, status: 'ongoing' };
                }
                return prev;
              });
            }

            // Novo convite (Vídeo ou Áudio)
            if (payload.new.content.includes('-call:') && !payload.new.content.includes('-accepted:') && payload.new.sender_id !== user?.id) {
              const type = payload.new.content.includes('video-call') ? 'video' : 'audio';
              const roomId = payload.new.content.replace(`[${type}-call:`, '').replace(']', '');
              setActiveCall({ roomId, isIncoming: true, status: 'calling', type });
            }

            setMessages(prev => {
              // Evitar duplicatas
              if (prev.some(m => m.id === (payload.new as Message).id)) return prev;
              return [...prev, payload.new as Message];
            });

            if (newMsg.sender_id !== user?.id) {
              playNotification('message');

              // Check user's privacy settings before marking as read
              supabase
                .from('profiles')
                .select('show_read_receipts')
                .eq('user_id', user.id)
                .single()
                .then(({ data: privacySettings }) => {
                  if (privacySettings?.show_read_receipts !== false) {
                    supabase
                      .from('messages')
                      .update({ is_read: true, read_at: new Date().toISOString() })
                      .eq('id', newMsg.id)
                      .then(() => { });
                  }
                });
            }

            // Real-time: Invalidate conversation list to update last message and sorting
            queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
          }
        )
        .subscribe();
    })();

    return () => {
      if (supabaseClient && channel) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [matchId, user?.id]);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleViewport = () => {
      const isKeyboard = window.innerHeight - vv.height > 100;
      setIsKeyboardVisible(isKeyboard);
      if (isKeyboard) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
    };

    vv.addEventListener('resize', handleViewport);
    handleViewport();

    return () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      vv.removeEventListener('resize', handleViewport);
    };
  }, []);

  const sendMediaMessage = async (content: string) => {
    if (!matchId || !user) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content: content,
      sender_id: user.id,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, tempMessage]);

    const { supabase } = await import('@/integrations/supabase/client');
    const { data } = await supabase
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
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error('Erro ao enviar mensagem', { style: { marginTop: '50px' } });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRecording) {
      stopRecording();
      return;
    }

    if (!newMessage.trim() || !matchId || !user) return;

    const content = newMessage.trim();
    setNewMessage('');
    stopTyping();

    // Focar IMEDIATAMENTE para manter o teclado
    inputRef.current?.focus();

    // Usar scroll INSTANTÂNEO ao enviar para não brigar com a ancoragem do teclado no iOS/Android
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    });

    sendMediaMessage(content);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !matchId) return;

    if (subscription?.tier === 'bronze' || subscription?.tier === 'none') {
      setUpgradeData({
        title: "Plano Prata",
        description: "Envie fotos e áudios ilimitados! Assine o Plano Prata e tenha o controle total da sua conversa.",
        features: [
          "Ver quem curtiu você",
          "Curtidas ilimitadas",
          "Enviar ou receber fotos e áudios",
          "Filtro por cidade / região",
          "Fazer chamadas de voz e vídeo",
          "Comunidade cristã no WhatsApp"
        ],
        icon: <i className="ri-image-line text-4xl" />,
        price: 29.90,
        planId: 'silver'
      });
      setShowUpgradeDialog(true);
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx 10MB)', { style: { marginTop: '50px' } });
      return;
    }

    setSending(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `chat/${matchId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      await sendMediaMessage(`[image:${publicUrl}]`);
      toast.success('Imagem enviada!', { style: { marginTop: '50px' } });
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Erro ao subir imagem', { style: { marginTop: '50px' } });
    } finally {
      setSending(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleCameraClick = () => {
    if (subscription?.tier === 'bronze' || subscription?.tier === 'none') {
      setUpgradeData({
        title: "Plano Prata",
        description: "Envie fotos e áudios ilimitados! Assine o Plano Prata e tenha o controle total da sua conversa.",
        features: [
          "Ver quem curtiu você",
          "Curtidas ilimitadas",
          "Enviar ou receber fotos e áudios",
          "Filtro por cidade / região",
          "Fazer chamadas de voz e vídeo",
          "Comunidade cristã no WhatsApp"
        ],
        icon: <i className="ri-image-line text-4xl" />,
        price: 29.90,
        planId: 'silver'
      });
      setShowUpgradeDialog(true);
    } else {
      imageInputRef.current?.click();
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Seu navegador não suporta gravação de áudio.', { style: { marginTop: '50px' } });
      return;
    }

    if (subscription?.tier === 'bronze' || subscription?.tier === 'none') {
      setUpgradeData({
        title: "Plano Prata",
        description: "Falar é melhor que digitar! Assine o Plano Prata para liberar áudios e vídeos ilimitados!",
        features: [
          "Ver quem curtiu você",
          "Curtidas ilimitadas",
          "Enviar ou receber fotos e áudios",
          "Filtro por cidade / região",
          "Fazer chamadas de voz e vídeo",
          "Comunidade cristã no WhatsApp"
        ],
        icon: <i className="ri-mic-line text-4xl" />,
        price: 29.90,
        planId: 'silver'
      });
      setShowUpgradeDialog(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine most compatible mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Error starting recording:', err);
      const error = err as { name?: string };
      if (error.name === 'NotAllowedError') {
        toast.error('Acesso ao microfone negado. Ative as permissões nas configurações do seu navegador.', { style: { marginTop: '50px' } });
      } else if (error.name === 'NotFoundError') {
        toast.error('Nenhum microfone encontrado no seu dispositivo.', { style: { marginTop: '50px' } });
      } else {
        toast.error('Erro ao acessar microfone. Verifique se ele está sendo usado por outro app.', { style: { marginTop: '50px' } });
      }
    }
  };

  const stopRecording = (shouldCancel = false) => {
    if (mediaRecorderRef.current && isRecording) {
      // If cancelled, we temporarily replace the onstop handler
      if (shouldCancel) {
        mediaRecorderRef.current.onstop = () => {
          if (mediaRecorderRef.current?.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }
        };
      }
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const uploadAudio = async (blob: Blob) => {
    if (!user || !matchId) return;
    setSending(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      // Fix extension based on actual blob type to ensure correct Content-Type in storage
      const ext = blob.type.includes('mp4') ? 'm4a' : 'webm';
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const filePath = `chat/${matchId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, blob, {
          contentType: blob.type,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      await sendMediaMessage(`[audio:${publicUrl}]`);
      toast.success('Áudio enviado!', { style: { marginTop: '50px' } });
    } catch (err) {
      console.error('Audio upload error:', err);
      toast.error('Erro ao enviar áudio', { style: { marginTop: '50px' } });
    } finally {
      setSending(false);
    }
  };

  const handleRecordAudio = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const shareSocialLink = (platform: keyof SocialMediaLinks) => {
    const link = mySocials[platform];
    if (link && link.trim() !== '') {
      sendMediaMessage(`[profile-card:${JSON.stringify({ [platform]: link })}]`);
      toast.success(`${platform} compartilhado!`, { style: { marginTop: '50px' } });
      setShowSocialBadges(false);
    } else {
      setSocialInputValue('');
      setSocialModal({ isOpen: true, platform });
    }
  };

  const saveSocialLink = async () => {
    if (!user || !socialModal.platform) return;
    const valueToSave = socialInputValue.trim();
    if (!valueToSave) return;

    const updatedSocials = { ...mySocials, [socialModal.platform]: valueToSave };
    setMySocials(updatedSocials);

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await (supabase
        .from('profiles')
        .update({ social_media: JSON.stringify(updatedSocials) } as { social_media: string }) as unknown as { eq: (k: string, v: string) => Promise<unknown> })
        .eq('user_id', user.id);

      toast.success('Rede social salva no seu perfil!', { style: { marginTop: '50px' } });
      await sendMediaMessage(`[profile-card:${JSON.stringify({ [socialModal.platform]: valueToSave })}]`);
      setSocialModal({ isOpen: false, platform: null });
      setShowSocialBadges(false);
    } catch (err) {
      console.error('Error saving social:', err);
      toast.error('Erro ao salvar rede social', { style: { marginTop: '50px' } });
    }
  };

  const renderMessageContent = (content: string, isOwn: boolean, m_time: string, m_status?: React.ReactNode) => {
    if (content.startsWith('[image:')) {
      const url = content.replace('[image:', '').replace(']', '');
      return (
        <div className="relative group cursor-pointer overflow-hidden rounded-xl" onClick={() => setFullScreenImage(url)}>
          <img
            src={url}
            alt="Imagem enviada"
            className="rounded-xl max-w-full h-auto border border-border/10 transition-transform active:scale-[0.98]"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
          {/* Overlay for time and status inside image - WhatsApp style */}
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/30 backdrop-blur-md px-1.5 py-0.5 rounded-full z-10">
            <p className="text-[10px] text-white/90 font-medium">{m_time}</p>
            {isOwn && m_status}
          </div>
        </div>
      );
    }
    if (content.startsWith('[audio:')) {
      const url = content.replace('[audio:', '').replace(']', '').trim();
      const avatarUrl = isOwn
        ? (myProfile?.photos?.[0] || myProfile?.avatar_url || user?.user_metadata?.avatar_url || '/placeholder.svg')
        : (matchProfile?.photos?.[0] || matchProfile?.avatar_url || '/placeholder.svg');

      return (
        <AudioMessage
          url={url}
          isOwn={isOwn}
          avatarUrl={avatarUrl}
        />
      );
    }
    if (content.startsWith('[profile-card:')) {
      let socials: SocialMediaLinks = {};
      try {
        socials = JSON.parse(content.substring(14, content.length - 1));
      } catch (e) { return <p>Erro ao ver cartão</p>; }

      const platformConfig: Record<string, { bg: string; label: string }> = {
        instagram: { bg: 'bg-pink-600', label: 'Instagram' },
        whatsapp: { bg: 'bg-green-600', label: 'WhatsApp' },
        facebook: { bg: 'bg-blue-600', label: 'Facebook' },
      };

      return (
        <div className="flex flex-col gap-2 min-w-[210px] mt-1">
          {Object.entries(socials).map(([platform, value]) => {
            const config = platformConfig[platform] || { bg: 'bg-muted', label: platform };
            return (
              <div key={platform} className={cn("p-3 rounded-xl flex items-center gap-3 shadow-sm border border-white/10", config.bg, "text-white")}>
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <i className={`ri-${platform}-line text-xl`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider leading-none mb-1">{config.label}</p>
                  <p className="text-sm font-bold truncate leading-tight">{value as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    if (content.startsWith('[video-call-accepted:') || content.startsWith('[audio-call-accepted:')) {
      return null;
    }
    if (content.startsWith('[video-call:') || content.startsWith('[audio-call:')) {
      const isVideo = content.startsWith('[video-call:');
      const typeLabel = isVideo ? 'vídeo' : 'áudio';
      const roomId = content.replace(isVideo ? '[video-call:' : '[audio-call:', '').replace(']', '');
      return (
        <div className="flex flex-col gap-2 p-1 min-w-[200px]">
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/10">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <i className={cn(isVideo ? "ri-video-line" : "ri-phone-line", "text-xl")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Chamada de {typeLabel}</p>
              <p className="text-[10px] text-white/60">{isOwn ? 'Iniciada por você' : 'Convite recebido'}</p>
            </div>
          </div>
          {!isOwn && (
            <button
              onClick={() => handleAcceptCall()}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-lg active:scale-[0.98]"
            >
              Atender Chamada
            </button>
          )}
        </div>
      );
    }
    return <p className="text-sm break-words leading-relaxed">{content}</p>;
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Hoje';
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.created_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!matchProfile) return <div className="p-8 text-center">Match não encontrado. <Link to="/app/chat" className="text-primary underline">Voltar</Link></div>;

  return (
    <SlideTransition
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.1, right: 0.8 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100 || info.velocity.x > 500) {
          navigate('/app/chat');
        }
      }}
      className="fixed inset-0 flex flex-col bg-background overflow-hidden font-sans z-[1000]"
      style={{ height: '100%' }}
    >
      <div className="flex items-center gap-3 px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 border-b shrink-0 bg-background/80 backdrop-blur">
        <Link to="/app/chat" className="text-muted-foreground"><i className="ri-arrow-left-line text-xl" /></Link>
        <div
          className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setShowProfileInfo(true)}
        >
          <img src={matchProfile.photos?.[0] || matchProfile.avatar_url || '/placeholder.svg'} className="w-full h-full object-cover" />
        </div>
        <div
          className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setShowProfileInfo(true)}
        >
          <p className="font-semibold truncate">{matchProfile.display_name}</p>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
            {formatLastActive(matchProfile.last_active_at, matchProfile.show_online_status, matchProfile.show_last_active) || 'Visto recentemente'}
          </p>
        </div>
        <button
          onClick={() => {
            if (subscription?.tier === 'bronze' || subscription?.tier === 'none') {
              setUpgradeData({
                title: "Plano Prata",
                description: "Tenha encontros reais por vídeo! Recurso liberado para membros do Plano Prata.",
                features: [
                  "Ver quem curtiu você",
                  "Curtidas ilimitadas",
                  "Enviar ou receber fotos e áudios",
                  "Filtro por cidade / região",
                  "Chamadas de voz e vídeo",
                  "Comunidade cristã no WhatsApp"
                ],
                icon: <i className="ri-video-line text-4xl" />,
                price: 29.90,
                planId: 'silver'
              });
              setShowUpgradeDialog(true);
            } else {
              startVideoCall();
            }
          }}
          className="p-2 text-primary/80 hover:text-primary transition-colors"
        >
          <Video className="w-6 h-6" />
        </button>
        <button
          onClick={() => {
            if (subscription?.tier === 'bronze' || subscription?.tier === 'none') {
              setUpgradeData({
                title: "Plano Prata",
                description: "Tenha encontros reais por áudio ou vídeo! Recurso liberado para membros do Plano Prata.",
                features: [
                  "Ver quem curtiu você",
                  "Curtidas ilimitadas",
                  "Enviar ou receber fotos e áudios",
                  "Filtro por cidade / região",
                  "Chamadas de voz e vídeo",
                  "Comunidade cristã no WhatsApp"
                ],
                icon: <i className="ri-phone-line text-4xl" />,
                price: 29.90,
                planId: 'silver'
              });
              setShowUpgradeDialog(true);
            } else {
              startAudioCall();
            }
          }}
          className="p-2 text-primary/80 hover:text-primary transition-colors"
        >
          <Phone className="w-6 h-6" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><button className="p-2"><i className="ri-more-2-fill text-xl" /></button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowReport(true)} className="text-amber-600">Denunciar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowBlock(true)} className="text-destructive">Bloquear</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-destructive">Excluir conversa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {(Object.entries(groupedMessages) as [string, Message[]][]).map(([date, msgs]) => (
          <div key={date} className="space-y-4">
            <div className="flex justify-center"><span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded-full">{date}</span></div>
            {msgs.map((m, index) => {
              const isOwn = m.sender_id === user?.id;
              return (
                <div key={m.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[80%] shadow-sm relative overflow-hidden transition-all duration-200',
                    m.content.startsWith('[image:') ? 'p-1 rounded-2xl' : 'p-3 rounded-2xl',
                    isOwn ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none',
                    (!isOwn && index === 0 && isSuperLikeMatch) && 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-2 border-[#d4af37]/50 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                  )}>
                    {(!isOwn && index === 0 && isSuperLikeMatch) && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#d4af37] rotate-12 flex items-center justify-center shadow-sm z-10 rounded-lg">
                        <i className="ri-star-fill text-white text-xs" />
                      </div>
                    )}
                    {(!isOwn && index === 0 && isSuperLikeMatch) && (
                      <p className="text-[10px] font-bold text-[#d4af37] mb-1 uppercase tracking-wider flex items-center gap-1">
                        <i className="ri-star-fill" /> Super Like
                      </p>
                    )}
                    {renderMessageContent(
                      m.content,
                      isOwn,
                      formatTime(m.created_at),
                      isOwn ? (
                        <MessageStatus
                          isRead={m.is_read}
                          isSending={m.id.startsWith('temp-')}
                          className={cn("text-[14px] opacity-100", m.is_read ? "text-blue-400" : "text-white/70")}
                        />
                      ) : undefined
                    )}

                    {!m.content.startsWith('[image:') && (
                      <div className={cn('flex items-center justify-end gap-1 mt-1',
                        isOwn ? 'text-primary-foreground' : 'text-muted-foreground',
                        (!isOwn && index === 0 && isSuperLikeMatch) && 'text-blue-100'
                      )}>
                        <p className="text-[9px] opacity-70">{formatTime(m.created_at)}</p>
                        {isOwn && (
                          <MessageStatus
                            isRead={m.is_read}
                            isSending={m.id.startsWith('temp-')}
                            className={cn("text-[16px] opacity-100", m.is_read ? "text-blue-600" : "text-white")}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div
        className="px-4 pt-3 pb-0.5 border-t bg-background shrink-0 z-50 transition-none"
        style={{
          paddingBottom: isKeyboardVisible ? '4px' : 'calc(4px + env(safe-area-inset-bottom) * 0.25)'
        }}
      >
        <AnimatePresence>
          {showSocialBadges && (
            <motion.div initial={false} animate={{ height: 'auto' }} transition={{ duration: 0 }} className="flex gap-2 overflow-x-auto pb-3">
              <Button size="sm" onClick={() => shareSocialLink('instagram')} className="bg-pink-600 hover:bg-pink-700">Instagram</Button>
              <Button size="sm" onClick={() => shareSocialLink('whatsapp')} className="bg-green-600 hover:bg-green-700">WhatsApp</Button>
              <Button size="sm" onClick={() => shareSocialLink('facebook')} className="bg-blue-600 hover:bg-blue-700">Facebook</Button>
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          {isRecording ? (
            <div className="flex-1 h-11 rounded-full bg-red-500/10 text-red-500 flex items-center px-4 animate-pulse justify-between border border-red-500/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-sm">{formatDuration(recordingTime)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-red-500/70">Gravando áudio...</span>
                <button
                  type="button"
                  onClick={() => stopRecording(true)}
                  className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
                  title="Cancelar gravação"
                >
                  <i className="ri-delete-bin-line text-lg" />
                </button>
              </div>
            </div>
          ) : (
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => { setNewMessage(e.target.value); broadcastTyping(true); }}
              onBlur={() => {
                stopTyping();
              }}
              placeholder="Sua mensagem..."
              className="rounded-full bg-muted border-none h-11"
              autoComplete="off"
            />
          )}
          <Button
            type="submit"
            size="icon"
            className={cn(
              "rounded-full shrink-0 transition-all duration-300",
              isRecording ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30" : "gradient-button"
            )}
            disabled={(!isRecording && !newMessage.trim()) || sending}
          >
            {sending ? (
              <i className="ri-loader-4-line animate-spin" />
            ) : isRecording ? (
              <i className="ri-send-plane-fill text-white" />
            ) : (
              <i className="ri-send-plane-fill" />
            )}
          </Button>
        </form>
        <div className="flex gap-4 mt-1">
          <button onClick={() => setShowSocialBadges(!showSocialBadges)} className="text-primary opacity-70 hover:opacity-100"><i className="ri-id-card-line text-xl" /></button>
          <button onClick={handleCameraClick} className="text-primary opacity-70 hover:opacity-100"><i className="ri-camera-line text-xl" /></button>
          <button onClick={handleRecordAudio} className={cn("transition-all", isRecording ? "text-red-500 scale-110" : "text-primary opacity-70 hover:opacity-100")}><i className="ri-mic-line text-xl" /></button>
          <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
        </div>
      </div>

      {otherUserId && (
        <ReportDialog open={showReport} onOpenChange={setShowReport} userId={otherUserId} userName={matchProfile.display_name} />
      )}
      {otherUserId && (
        <BlockDialog open={showBlock} onOpenChange={setShowBlock} userId={otherUserId} userName={matchProfile.display_name} onBlocked={() => navigate('/app/chat')} />
      )}
      {matchId && (
        <DeleteConversationDialog open={showDelete} onOpenChange={setShowDelete} matchId={matchId} onDeleted={() => navigate('/app/chat')} />
      )}

      {/* Overlay de Informações do Perfil - PORTAL FIX - DESIGN SINCRONIZADO COM DESCOBRIR */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showProfileInfo && matchProfile && (
            <motion.div
              key="chatroom-profile-overlay"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
              dragElastic={{ top: 0, bottom: 0.7, left: 0.1, right: 0.8 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500 || info.offset.x > 100 || info.velocity.x > 500) {
                  closeProfile();
                }
              }}
              className="fixed inset-0 z-[9999] bg-background overflow-hidden flex flex-col"
            >
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pb-32 scrollbar-hide relative">

                {/* Hero Image Section */}
                <div
                  className="relative w-full h-[60vh] shrink-0 touch-none cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => dragControls.start(e)}
                >
                  {/* Photo Stories Progress Bar */}
                  {matchProfile.photos && matchProfile.photos.length > 1 && (
                    <div className="absolute top-[calc(1.25rem+env(safe-area-inset-top))] left-3 right-3 z-40 flex gap-1.5 h-1">
                      {matchProfile.photos.map((_, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 rounded-full h-full shadow-sm transition-all duration-300 ${idx === currentPhotoIndex ? 'bg-white scale-y-110 shadow-lg' : 'bg-white/30'
                            }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Navigation Zones (Left/Right) */}
                  <div className="absolute inset-0 z-30 flex">
                    <div className="w-1/2 h-full cursor-pointer" onClick={handlePrevPhoto} />
                    <div className="w-1/2 h-full cursor-pointer" onClick={handleNextPhoto} />
                  </div>



                  <img
                    src={matchProfile.photos?.[currentPhotoIndex] || matchProfile.avatar_url || '/placeholder.svg'}
                    className="h-full w-full object-cover pointer-events-none"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

                  {/* Close Button - Top Right */}
                  <Button
                    onClick={closeProfile}
                    variant="secondary"
                    size="icon"
                    className="fixed top-[calc(1.25rem+env(safe-area-inset-top))] right-4 z-[110] rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-black/60 shadow-2xl active:scale-90 transition-all"
                  >
                    <i className="ri-arrow-down-s-line text-2xl" />
                  </Button>
                </div>

                {/* Profile Info Content - Overlaps Hero Image */}
                <div className="px-5 -mt-20 relative z-10 space-y-6">

                  {/* Header: Name & Age */}
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-4xl font-display font-semibold text-foreground">
                        {matchProfile.display_name}
                      </h1>
                      <span className="text-3xl font-light text-muted-foreground">
                        {matchProfile.birth_date ? calculateAge(matchProfile.birth_date) : ''}
                      </span>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-col gap-2.5 mt-4">
                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          formatLastActive(matchProfile.last_active_at, matchProfile.show_online_status, matchProfile.show_last_active) === 'Online agora'
                            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                            : "bg-muted-foreground/30"
                        )} />
                        <span className="text-sm font-medium text-muted-foreground">
                          {formatLastActive(matchProfile.last_active_at, matchProfile.show_online_status, matchProfile.show_last_active) || 'Offline'}
                        </span>
                      </div>

                      {/* Job & Location */}
                      <div className="flex items-center gap-4 text-sm text-foreground/70">
                        {matchProfile.occupation && (
                          <div className="flex items-center gap-1.5 leading-none">
                            <i className="ri-briefcase-line text-lg" />
                            <span>{matchProfile.occupation}</span>
                          </div>
                        )}
                        {(matchProfile.city) && (matchProfile.show_distance !== false) && (
                          <div className="flex items-center gap-1.5 leading-none">
                            <i className="ri-map-pin-line text-lg" />
                            <span>{matchProfile.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section: Looking For */}
                  <div className="bg-card/50 border border-border/50 rounded-2xl p-4 backdrop-blur-sm">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-widest font-bold">Tô procurando</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                        <i className={cn(
                          "text-xl",
                          LOOKING_FOR_ICONS[matchProfile.looking_for || ''] || 'ri-heart-2-fill'
                        )} />
                      </div>
                      <span className="text-lg font-medium">{matchProfile.looking_for || 'Um encontro abençoado'}</span>
                    </div>
                  </div>

                  {/* Section: About Me */}
                  {matchProfile.bio && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Sobre mim</h3>
                      <p className="text-muted-foreground leading-relaxed text-base">
                        {matchProfile.bio}
                      </p>
                    </div>
                  )}

                  {/* Section: Basic Info */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Informações básicas</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-secondary/30 rounded-xl p-3 flex items-center gap-3">
                        <i className="ri-book-open-line text-foreground/50 text-xl" />
                        <div>
                          <p className="text-xs text-muted-foreground">Religião</p>
                          <p className="font-medium">{matchProfile.religion || 'Cristão'}</p>
                        </div>
                      </div>
                      {matchProfile.church_frequency && (
                        <div className="bg-secondary/30 rounded-xl p-3 flex items-center gap-3">
                          <i className="ri-building-line text-foreground/50 text-xl" />
                          <div>
                            <p className="text-xs text-muted-foreground">Freq. Igreja</p>
                            <p className="font-medium">{matchProfile.church_frequency}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Interests */}
                  {matchProfile.interests && matchProfile.interests.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Interesses</h3>
                      <div className="flex flex-wrap gap-2">
                        {matchProfile.interests.map((tag, i) => (
                          <span key={i} className="px-4 py-2 rounded-full border border-primary/30 text-primary bg-primary/5 text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(matchProfile.christian_interests && matchProfile.christian_interests.length > 0) && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Interesses Cristãos</h3>
                      <div className="flex flex-wrap gap-2">
                        {matchProfile.christian_interests.map((tag) => (
                          <span key={tag} className="px-4 py-2 rounded-full border border-blue-500/30 text-blue-500 bg-blue-500/5 text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Diálogo de Upgrade */}
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
          key={`chatroom-checkout-v1-${selectedCheckoutPlan.id}`}
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

      {/* Modal de Entrada de Link de Rede Social */}
      <Dialog open={socialModal.isOpen} onOpenChange={(open) => setSocialModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-[400px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <i className={`ri-${socialModal.platform}-line text-primary`} />
              Compartilhar {socialModal.platform}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Você ainda não cadastrou seu {socialModal.platform} no perfil. Informe abaixo para compartilhar agora e salvar para as próximas vezes.
            </p>
            <div className="relative">
              <Input
                value={socialInputValue}
                onChange={(e) => setSocialInputValue(e.target.value)}
                placeholder={socialModal.platform === 'whatsapp' ? '(11) 99999-9999' : 'seu.usuario'}
                className={cn(
                  "h-12 bg-muted/50 rounded-2xl",
                  socialModal.platform === 'whatsapp' ? "pl-14" : "pl-8"
                )}
                autoFocus
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold opacity-50">
                {socialModal.platform === 'whatsapp' ? '+55' : '@'}
              </span>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2">
            <Button onClick={saveSocialLink} className="w-full h-12 rounded-2xl font-bold gradient-button">
              Salvar e Compartilhar
            </Button>
            <Button variant="ghost" onClick={() => setSocialModal({ isOpen: false, platform: null })} className="w-full h-11 rounded-2xl text-muted-foreground">
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de Imagem em Tela Cheia (Lightbox) */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[11000] bg-black flex items-center justify-center p-4"
            onClick={() => setFullScreenImage(null)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-8 right-6 text-white text-3xl z-[11001]"
              onClick={() => setFullScreenImage(null)}
            >
              <i className="ri-close-line" />
            </motion.button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={fullScreenImage}
              alt="Imagem expandida"
              className="max-w-full max-h-full object-contain rounded-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* WhatsApp Style Video Call Overlay - REPLICATING IMAGE 1 */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[12000] bg-[#0b141a] flex flex-col text-white overflow-hidden"
          >
            {/* Background Pattern Overlay (Doodle Style) */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}
            />

            {activeCall.status === 'calling' ? (
              <div className="relative h-full flex flex-col items-center z-10 w-full">
                {/* Header: Top aligned */}
                <div className="w-full flex items-center justify-between px-6 pt-[calc(1.5rem+env(safe-area-inset-top))]">
                  <button onClick={handleEndCall} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full backdrop-blur-md active:scale-90 transition-transform">
                    <i className="ri-arrow-down-s-line text-3xl" />
                  </button>
                  <div className="text-center flex-1">
                    <h2 className="text-[20px] font-medium leading-tight text-white">{matchProfile?.display_name}</h2>
                    <p className="text-[14px] text-white/60 mt-0.5 font-normal tracking-wide">Chamando...</p>
                  </div>
                  {/* Empty div to keep the title centered */}
                  <div className="w-12" />
                </div>

                {/* Spacer to push avatar down */}
                <div className="flex-[1.5] flex items-center justify-center w-full" />

                {/* Center: Circular Avatar - Large and positioned lower */}
                <div className="relative z-10">
                  <div className="w-52 h-52 rounded-full overflow-hidden border-[6px] border-white/5 shadow-2xl">
                    <img
                      src={(activeCall.isIncoming ? matchProfile?.photos?.[0] : (myProfile?.photos?.[0] || user?.user_metadata?.avatar_url)) || '/placeholder.svg'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Subtle pulse animation */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-20" />
                </div>

                {/* Smaller spacer before controls */}
                <div className="flex-1 w-full" />

                {/* Footer: Control Bar (Image 1 Style) */}
                <div className="w-full px-5 mb-12">
                  {activeCall.isIncoming ? (
                    <div className="flex items-center justify-around w-full max-w-sm mx-auto mb-6">
                      <button onClick={handleEndCall} className="w-16 h-16 rounded-full bg-[#ff3b30] flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform">
                        <i className="ri-phone-fill text-3xl rotate-[135deg]" />
                      </button>
                      <button onClick={handleAcceptCall} className="w-16 h-16 rounded-full bg-[#34c759] flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform">
                        <i className="ri-video-add-fill text-3xl" />
                      </button>
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto bg-[#202c33]/90 backdrop-blur-2xl rounded-[40px] p-2 flex items-center justify-center gap-6 shadow-2xl border border-white/10">
                      <button
                        onClick={() => setIsCameraOff(!isCameraOff)}
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90",
                          isCameraOff ? "bg-white/10 text-white/30" : "text-white/90 hover:bg-white/5"
                        )}
                        title={isCameraOff ? "Ativar Vídeo" : "Modo Somente Voz"}
                      >
                        <i className={cn(isCameraOff ? "ri-video-off-fill" : "ri-video-fill", "text-2xl")} />
                      </button>

                      <button
                        onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90",
                          !isSpeakerOn ? "bg-white/10 text-white/30" : "text-white/90 hover:bg-white/5"
                        )}
                      >
                        <i className={cn(!isSpeakerOn ? "ri-volume-mute-fill" : "ri-volume-up-fill", "text-2xl")} />
                      </button>

                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90",
                          isMuted ? "bg-white text-black shadow-lg" : "text-white/90 hover:bg-white/5"
                        )}
                      >
                        <i className={cn(isMuted ? "ri-mic-off-fill" : "ri-mic-fill", "text-2xl")} />
                      </button>

                      <button
                        onClick={handleEndCall}
                        className="w-12 h-12 rounded-full bg-[#ff3b30] flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                      >
                        <i className="ri-phone-fill text-2xl rotate-[135deg]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Ongoing Call - Jitsi Iframe
              <div className="absolute inset-0 bg-black z-20">
                <iframe
                  src={`https://meet.jit.si/${activeCall.roomId}#config.prejoinPageEnabled=false&config.startWithVideoMuted=${activeCall.type === 'audio' ? 'true' : 'false'}&interfaceConfig.TOOLBAR_BUTTONS=["microphone",${activeCall.type === 'video' ? '"camera",' : ''}"closedcaptions","desktop","fullscreen","fodeviceselection","hangup","profile","videobackgroundblur","participants-pane"]`}
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  className="w-full h-full border-none"
                  onLoad={() => { }}
                />

                {/* Visual controls even on top of iframe if needed, but jitsi has its own. 
                    Adding an exit button just in case */}
                <button
                  onClick={handleEndCall}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white shadow-xl z-[12001] active:scale-90 transition-transform"
                >
                  <i className="ri-close-line text-3xl" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </SlideTransition>
  );
}
