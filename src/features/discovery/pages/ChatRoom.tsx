import { useState, useEffect, useRef, useCallback } from 'react';
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
import { AlertTriangle, Ban, Lock, Video } from 'lucide-react';
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

  const { data: mySocials = {} } = useQuery({
    queryKey: ['my-socials', user?.id],
    enabled: !!user,
    staleTime: Infinity,
    queryFn: async () => {
      if (!user) return {};
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: myProfile } = await (supabase
        .from('profiles')
        .select('social_media')
        .eq('user_id', user.id)
        .single() as unknown as Promise<{ data: { social_media?: string } | null }>);

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
    }
  });

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
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
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
                  // Only mark as read if user has read receipts enabled
                  if (privacySettings?.show_read_receipts !== false) {
                    supabase
                      .from('messages')
                      .update({ is_read: true, read_at: new Date().toISOString() })
                      .eq('id', newMsg.id)
                      .then(() => { });
                  }
                });
            }
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
      toast.error('Erro ao enviar mensagem');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !matchId || !user) return;

    stopTyping();
    const content = newMessage.trim();
    setNewMessage('');

    // Não esperar com setSending(true) se isso causar a desativação e perda de foco do input
    // Em vez disso, enviar imediatamente e manter o foco
    sendMediaMessage(content);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
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
          "Fazer chamadas de vídeo",
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
      toast.error('Imagem muito grande (máx 10MB)');
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
      toast.success('Imagem enviada!');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Erro ao subir imagem');
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
          "Fazer chamadas de vídeo",
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
      toast.error('Seu navegador não suporta gravação de áudio.');
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
          "Fazer chamadas de vídeo",
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
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Error starting recording:', err);
      const error = err as { name?: string };
      if (error.name === 'NotAllowedError') {
        toast.error('Acesso ao microfone negado. Ative as permissões nas configurações do seu navegador.');
      } else if (error.name === 'NotFoundError') {
        toast.error('Nenhum microfone encontrado no seu dispositivo.');
      } else {
        toast.error('Erro ao acessar microfone. Verifique se ele está sendo usado por outro app.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
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
      const fileName = `${user.id}/${Date.now()}.webm`;
      const filePath = `chat/${matchId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      await sendMediaMessage(`[audio:${publicUrl}]`);
      toast.success('Áudio enviado!');
    } catch (err) {
      console.error('Audio upload error:', err);
      toast.error('Erro ao enviar áudio');
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
      toast.success(`${platform} compartilhado!`);
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

      toast.success('Rede social salva no seu perfil!');
      await sendMediaMessage(`[profile-card:${JSON.stringify({ [socialModal.platform]: valueToSave })}]`);
      setSocialModal({ isOpen: false, platform: null });
      setShowSocialBadges(false);
    } catch (err) {
      console.error('Error saving social:', err);
      toast.error('Erro ao salvar rede social');
    }
  };

  const renderMessageContent = (content: string) => {
    if (content.startsWith('[image:')) {
      const url = content.replace('[image:', '').replace(']', '');
      return (
        <img
          src={url}
          alt="Imagem enviada"
          className="rounded-lg max-w-full h-auto mt-1 border border-border/10"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
        />
      );
    }
    if (content.startsWith('[audio:')) {
      const url = content.replace('[audio:', '').replace(']', '');
      return (
        <div className="flex items-center gap-2 py-1 min-w-[160px]">
          <audio src={url} controls className="h-8 w-full custom-audio-player" />
        </div>
      );
    }
    if (content.startsWith('[profile-card:')) {
      let socials: SocialMediaLinks = {};
      try {
        socials = JSON.parse(content.substring(14, content.length - 1));
      } catch (e) { return <p>Erro ao ver cartão</p>; }

      return (
        <div className="flex flex-col gap-2 min-w-[200px]">
          {Object.entries(socials).map(([platform, value]) => (
            <div key={platform} className="p-3 bg-card rounded-xl border flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <i className={`ri-${platform}-line`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase">{platform}</p>
                <p className="text-sm font-bold truncate">{value as string}</p>
              </div>
            </div>
          ))}
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
      className="flex flex-col w-full h-[100dvh] bg-background overflow-hidden font-sans pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] touch-pan-y overscroll-contain"
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0 h-16 bg-background/80 backdrop-blur">
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
          <p className="text-[10px] text-muted-foreground uppercase">Online</p>
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
                  "Fazer chamadas de vídeo",
                  "Comunidade cristã no WhatsApp"
                ],
                icon: <i className="ri-video-line text-4xl" />,
                price: 29.90,
                planId: 'silver'
              });
              setShowUpgradeDialog(true);
            } else {
              toast.info("Chamada de vídeo em desenvolvimento");
            }
          }}
          className="p-2 text-primary/80 hover:text-primary transition-colors"
        >
          <Video className="w-6 h-6" />
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
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="space-y-4">
            <div className="flex justify-center"><span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded-full">{date}</span></div>
            {msgs.map((m, index) => {
              const isOwn = m.sender_id === user?.id;
              return (
                <div key={m.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[80%] p-3 rounded-2xl shadow-sm relative overflow-hidden',
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
                    {renderMessageContent(m.content)}
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
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-background shrink-0">
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
            <div className="flex-1 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center px-4 animate-pulse justify-between">
              <div className="flex items-center gap-2">
                <i className="ri-mic-fill" />
                <span className="font-bold text-sm">Gravando... {formatDuration(recordingTime)}</span>
              </div>
              <button type="button" onClick={stopRecording} className="text-xs font-bold uppercase underline">Parar</button>
            </div>
          ) : (
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => { setNewMessage(e.target.value); broadcastTyping(true); }}
              onBlur={stopTyping}
              placeholder="Sua mensagem..."
              className="rounded-full bg-muted border-none"
            />
          )}
          <Button type="submit" size="icon" className="rounded-full shrink-0 gradient-button" disabled={!newMessage.trim() || sending || isRecording}>
            {sending ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-send-plane-fill" />}
          </Button>
        </form>
        <div className="flex gap-4 mt-3">
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
              dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
              dragElastic={{ top: 0, bottom: 0.7, left: 0.1, right: 0.8 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500 || info.offset.x > 100 || info.velocity.x > 500) {
                  closeProfile();
                }
              }}
              className="fixed inset-0 z-[100] bg-background overflow-hidden flex flex-col"
            >
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pb-44 scrollbar-hide relative">

                {/* Hero Image Section */}
                <div className="relative w-full h-[65vh] shrink-0 touch-none">
                  {/* Photo Stories Progress Bar */}
                  {matchProfile.photos && matchProfile.photos.length > 1 && (
                    <div className="absolute top-[calc(0.75rem+env(safe-area-inset-top))] left-3 right-3 z-40 flex gap-1.5 h-1">
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

                  {/* Hero Drag Handle Area */}
                  <div
                    className="absolute inset-x-0 top-0 bottom-0 z-20 cursor-grab active:cursor-grabbing"
                    onPointerDown={(e) => dragControls.start(e)}
                  />

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
                    className="fixed top-[calc(1rem+env(safe-area-inset-top))] right-4 z-[110] rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-black/60 shadow-2xl active:scale-90 transition-all"
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                        <i className="ri-heart-2-fill text-xl" />
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
    </SlideTransition>
  );
}
