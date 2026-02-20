import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProfilesData } from '@/features/funnel/utils/profiles';
import { supabase } from '@/integrations/supabase/client';

interface SeedLikeRow {
    id: string;
    profile_index: number;
    age_range: string;
    user_gender: string;
    city: string | null;
    state_name: string | null;
    looking_for: string | null;
    religion: string | null;
}

interface ChatMessage {
    id: string;
    content: string;
    fromSeed: boolean;
}

const SEED_WELCOME_MESSAGES = [
    'Oi! Vi seu perfil e me identifico muito com seus valores ✨',
    'Que ótimo te encontrar aqui! Acredito muito em encontros guiados pela fé 🙏',
    'Olá! Adoro conhecer pessoas que compartilham da mesma fé. Como você está?',
];

export default function SeedChatRoom() {
    const { seedId } = useParams<{ seedId: string }>();
    const navigate = useNavigate();
    const [seedLike, setSeedLike] = useState<SeedLikeRow | null>(null);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!seedId) return;
        (async () => {
            const { data } = await supabase
                .from('seed_likes')
                .select('id, profile_index, age_range, user_gender, city, state_name, looking_for, religion')
                .eq('id', seedId)
                .maybeSingle();
            setSeedLike(data as SeedLikeRow | null);
            setLoading(false);
        })();
    }, [seedId]);

    // Add welcome message when profile loads
    useEffect(() => {
        if (!seedLike) return;
        const idx = seedLike.profile_index % SEED_WELCOME_MESSAGES.length;
        setMessages([
            { id: 'welcome', content: SEED_WELCOME_MESSAGES[idx], fromSeed: true },
        ]);
    }, [seedLike]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        const text = input.trim();
        if (!text) return;
        setMessages(prev => [
            ...prev,
            { id: Date.now().toString(), content: text, fromSeed: false },
        ]);
        setInput('');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!seedLike) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground">
                <p>Conversa não encontrada.</p>
                <button onClick={() => navigate(-1)} className="text-primary underline">Voltar</button>
            </div>
        );
    }

    const quizAnswers = {
        age: seedLike.age_range,
        city: seedLike.city ?? undefined,
        state: seedLike.state_name ?? undefined,
        religion: seedLike.religion ?? undefined,
        lookingFor: seedLike.looking_for ?? undefined,
    };

    const profiles = getProfilesData(
        seedLike.user_gender as 'male' | 'female',
        quizAnswers,
    );
    const profile = profiles[seedLike.profile_index] ?? profiles[0];
    const photo = profile.photo;
    const name = profile.name;

    return (
        <div className="fixed inset-0 z-[9999] bg-background flex flex-col">

            {/* Header */}
            <div
                className="flex items-center gap-3 px-4 border-b border-border/40 bg-background/95 backdrop-blur-md flex-shrink-0"
                style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))', paddingBottom: '0.75rem' }}
            >
                <button
                    onClick={() => navigate('/app/matches')}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary/30">
                    <img src={photo} alt={name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{name}</p>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] text-emerald-500 font-medium">Online agora</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-pink-500/10 border border-pink-500/20 rounded-full px-2.5 py-1">
                    <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                    <span className="text-[10px] font-semibold text-pink-400">Match</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">

                {/* Match notice */}
                <div className="flex flex-col items-center gap-2 py-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-primary/30">
                        <img src={photo} alt={name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-foreground text-lg">É um Match! 🎉</p>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Você e {name} curtiram um ao outro
                        </p>
                    </div>
                    <div className="h-px bg-border/40 w-full mt-2" />
                </div>

                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={cn(
                            'flex',
                            msg.fromSeed ? 'justify-start' : 'justify-end',
                        )}
                    >
                        {msg.fromSeed && (
                            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 self-end">
                                <img src={photo} alt={name} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div
                            className={cn(
                                'max-w-[75%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed',
                                msg.fromSeed
                                    ? 'bg-card border border-border/40 text-foreground rounded-bl-sm'
                                    : 'bg-primary text-primary-foreground rounded-br-sm',
                            )}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
                className="border-t border-border/40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center gap-3 flex-shrink-0"
                style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
            >
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder={`Enviar mensagem para ${name}...`}
                    className="flex-1 bg-muted border border-border/40 rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-10 h-10 rounded-full bg-primary disabled:opacity-30 flex items-center justify-center transition-opacity"
                >
                    <Send className="w-4 h-4 text-primary-foreground" />
                </button>
            </div>
        </div>
    );
}
