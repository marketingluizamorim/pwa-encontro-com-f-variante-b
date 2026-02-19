import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Heart, MessageCircle, Star, Users, Zap, Shield, Bell, Sparkles } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const MESSAGES = [
    {
        id: 1,
        text: '👋 Bem-vindo(a) ao aplicativo de relacionamentos cristãos!',
    },
    {
        id: 2,
        text: 'Para a melhor experiência, instale o app no seu celular e tenha acesso direto com notificações em tempo real!',
    },
    {
        id: 3,
        type: 'tip',
        icon: <Download className="w-5 h-5 text-emerald-400" />,
        title: 'Como instalar',
        bullets: [
            '📱 iPhone: toque em "Compartilhar" e selecione "Adicionar à Tela Inicial"',
            '🤖 Android: toque no menu (⋯) e selecione "Adicionar à Tela Inicial"',
        ],
    },
    {
        id: 4,
        text: 'VEJA COMO FUNCIONA:',
    },
    {
        id: 5,
        type: 'section',
        icon: <Heart className="w-5 h-5 text-rose-400" />,
        title: 'Descobrir',
        text: 'Encontre pessoas próximas. Deslize para direita para curtir, esquerda para passar. Dois likes = uma Conexão!',
    },
    {
        id: 6,
        type: 'section',
        icon: <Star className="w-5 h-5 text-amber-400" />,
        title: 'Super Like',
        text: 'Deslize para cima para demonstrar um interesse especial com mensagem direta.',
    },
    {
        id: 7,
        type: 'section',
        icon: <Users className="w-5 h-5 text-blue-400" />,
        title: 'Curtidas',
        text: 'Veja quem já curtiu o seu perfil e saia na frente para novas Conexões!',
    },
    {
        id: 8,
        type: 'section',
        icon: <MessageCircle className="w-5 h-5 text-teal-400" />,
        title: 'Mensagens',
        text: 'Converse com suas Conexões via texto, áudio, foto e chamadas de voz ou vídeo.',
    },
    {
        id: 9,
        type: 'section',
        icon: <Zap className="w-5 h-5 text-yellow-400" />,
        title: 'Perfil',
        text: 'Adicione fotos, bio e interesses. Perfis completos tem mais chances de Conexões!',
    },
    {
        id: 9.5,
        type: 'section',
        icon: <Sparkles className="w-5 h-5 text-amber-400" />,
        title: 'Perfil em Destaque',
        text: 'Seu perfil aparece em primeiro para mais pessoas — aumentando em até 3x suas chances de novas Conexões!',
    },
    {
        id: 10,
        type: 'tip',
        icon: <Bell className="w-5 h-5 text-indigo-400" />,
        title: 'Ative as notificações',
        text: 'Seja avisado(a) em tempo real sobre curtidas e mensagens.',
    },
    {
        id: 11,
        type: 'tip',
        icon: <Shield className="w-5 h-5 text-emerald-400" />,
        title: 'Segurança em primeiro lugar',
        text: 'Exclua, denuncie ou bloqueie qualquer usuário pelos 3 pontos (⋯) em uma conversa ou perfil.',
    },
    {
        id: 12,
        text: 'Felizes em ter você aqui! Que você encontre a pessoa certa. 🙏',
    },
];

export default function WelcomeChat() {
    const navigate = useNavigate();

    const handleDelete = () => {
        localStorage.setItem('welcome-chat-hidden', '1');
        localStorage.setItem('welcome-chat-read', '1');
        navigate(-1);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 border-b border-border/30 bg-background/95 backdrop-blur-md sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/70 hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/40 shadow-md flex-shrink-0">
                    <img src="/pwa-512x512.png" alt="App" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15px] leading-tight">Bem-vindo(a) ao aplicativo</p>
                    <p className="text-xs text-emerald-500 font-medium">Equipe do App</p>
                </div>

                {/* 3-dots menu — igual ao ChatRoom */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-2">
                            <i className="ri-more-2-fill text-xl" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                            Excluir conversa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-8">
                {MESSAGES.map((msg, i) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                        {(msg.type === 'section' || msg.type === 'tip') ? (
                            <div className={`rounded-2xl p-4 border ${msg.type === 'tip'
                                ? 'bg-emerald-500/[0.07] border-emerald-500/20'
                                : 'bg-muted/60 border-border/30'
                                } max-w-[88%]`}>
                                <div className="flex items-center gap-2 mb-1.5">
                                    {msg.icon}
                                    <span className="font-bold text-[14px]">{msg.title}</span>
                                </div>
                                {'bullets' in msg && msg.bullets ? (
                                    <ul className="space-y-1.5">
                                        {msg.bullets.map((b, bi) => (
                                            <li key={bi} className="text-[13.5px] text-muted-foreground leading-relaxed">
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-[13.5px] text-muted-foreground leading-relaxed">{msg.text}</p>
                                )}
                            </div>
                        ) : (
                            <div className="bg-muted/70 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[88%]">
                                <p className="text-[14px] leading-relaxed">{msg.text}</p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Bottom note */}
            <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 border-t border-border/20 text-center">
                <p className="text-xs text-muted-foreground">Esta é uma mensagem automática de boas-vindas.</p>
            </div>
        </div>
    );
}
