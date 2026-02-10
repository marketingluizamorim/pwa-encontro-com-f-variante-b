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
import { AlertTriangle, Ban } from 'lucide-react';

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
  social_media?: string | any;
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
  const [recordingTime, setRecordingTime] = useState(0);
  const [showSocialBadges, setShowSocialBadges] = useState(false);

  const [mySocials, setMySocials] = useState<SocialMediaLinks>({});
  const [socialModal, setSocialModal] = useState<{ isOpen: boolean; platform: keyof SocialMediaLinks | null }>({ isOpen: false, platform: null });
  const [socialInputValue, setSocialInputValue] = useState('');

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

  useEffect(() => {
    if (!matchId || !user) return;

    const fetchData = async () => {
      setLoading(true);
      const { supabase } = await import('@/integrations/supabase/client');

      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        setLoading(false);
        return;
      }

      const matchedOtherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
      setOtherUserId(matchedOtherUserId);

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, photos, bio, birth_date, city, state, religion, church_frequency, looking_for, occupation, show_distance, christian_interests, interests, last_active_at, show_online_status, show_last_active')
        .eq('user_id', matchedOtherUserId)
        .single();

      if (profile) {
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

      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      setMessages(messagesData || []);
      setTimeout(scrollToBottom, 50); // Double check scroll after messages are set

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

  useEffect(() => {
    if (!matchId) return;

    let channel: any = null;
    let supabaseClient: any = null;

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
              supabase
                .from('messages')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', newMsg.id)
                .then(() => { });
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

    // Do not wait with setSending(true) if it causes the input to disable and lose focus
    // Instead, send immediately and keep focus
    sendMediaMessage(content);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !matchId) return;

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

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Seu navegador não suporta gravação de áudio.');
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
    } catch (err: any) {
      console.error('Error starting recording:', err);
      if (err.name === 'NotAllowedError') {
        toast.error('Acesso ao microfone negado. Ative as permissões nas configurações do seu navegador.');
      } else if (err.name === 'NotFoundError') {
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
    let valueToSave = socialInputValue.trim();
    const updatedSocials = { ...mySocials, [socialModal.platform]: valueToSave };
    setMySocials(updatedSocials);
    setSocialModal({ isOpen: false, platform: null });

    // social_media column not available, store locally
    localStorage.setItem(`social_media_${user.id}`, JSON.stringify(updatedSocials));

    await sendMediaMessage(`[profile-card:${JSON.stringify({ [socialModal.platform]: valueToSave })}]`);
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
    <SlideTransition className="flex flex-col w-full h-[100dvh] bg-background overflow-hidden font-sans">
      <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0 h-16 bg-background/80 backdrop-blur">
        <Link to="/app/chat" className="text-muted-foreground"><i className="ri-arrow-left-line text-xl" /></Link>
        <div className="w-10 h-10 rounded-full overflow-hidden" onClick={() => setShowProfileInfo(true)}>
          <img src={matchProfile.photos?.[0] || matchProfile.avatar_url || '/placeholder.svg'} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0" onClick={() => setShowProfileInfo(true)}>
          <p className="font-semibold truncate">{matchProfile.display_name}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Online</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><button className="p-2"><i className="ri-more-2-fill text-xl" /></button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowReport(true)} className="text-amber-600">Denunciar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowBlock(true)} className="text-destructive">Bloquear</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="space-y-4">
            <div className="flex justify-center"><span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded-full">{date}</span></div>
            {msgs.map((m) => {
              const isOwn = m.sender_id === user?.id;
              return (
                <div key={m.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[80%] p-3 rounded-2xl shadow-sm', isOwn ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none')}>
                    {renderMessageContent(m.content)}
                    <p className={cn('text-[9px] mt-1 text-right opacity-70', isOwn ? 'text-primary-foreground' : 'text-muted-foreground')}>{formatTime(m.created_at)}</p>
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
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="flex gap-2 overflow-x-auto pb-3">
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
          <button onClick={() => imageInputRef.current?.click()} className="text-primary opacity-70 hover:opacity-100"><i className="ri-camera-line text-xl" /></button>
          <button onClick={handleRecordAudio} className={cn("transition-all", isRecording ? "text-red-500 scale-110" : "text-primary opacity-70 hover:opacity-100")}><i className="ri-mic-line text-xl" /></button>
          <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
        </div>
      </div>

      {otherUserId && (
        <>
          <ReportDialog open={showReport} onOpenChange={setShowReport} userId={otherUserId} userName={matchProfile.display_name} />
          <BlockDialog open={showBlock} onOpenChange={setShowBlock} userId={otherUserId} userName={matchProfile.display_name} onBlocked={() => navigate('/app/chat')} />
        </>
      )}

      {/* Profile Info Overlay */}
      {showProfileInfo && matchProfile && createPortal(
        <div className="fixed inset-0 z-[100] bg-background overflow-y-auto">
          <div className="relative h-96 w-full">
            <img src={matchProfile.photos?.[0] || matchProfile.avatar_url || '/placeholder.svg'} className="h-full w-full object-cover" />
            <Button onClick={() => setShowProfileInfo(false)} variant="secondary" size="icon" className="absolute top-4 right-4 rounded-full"><i className="ri-close-line" /></Button>
          </div>
          <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">{matchProfile.display_name}</h1>
            <p className="text-muted-foreground">{matchProfile.bio}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted rounded-xl">
                <p className="text-[10px] text-muted-foreground uppercase">Localização</p>
                <p className="font-bold">{matchProfile.city || 'Não informado'}</p>
              </div>
              <div className="p-3 bg-muted rounded-xl">
                <p className="text-[10px] text-muted-foreground uppercase">Religião</p>
                <p className="font-bold">{matchProfile.religion || 'Cristão'}</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </SlideTransition>
  );
}
