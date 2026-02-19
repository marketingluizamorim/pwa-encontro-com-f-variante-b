import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Heart, MessageCircle, Star, Users, Zap, Shield, Bell } from 'lucide-react';

const MESSAGES = [
    {
        id: 1,
        text: '👋 Olá! Seja muito bem-vindo(a) ao nosso aplicativo de relacionamentos cristãos!',
    },
    {
        id: 2,
        text: '📲 Antes de qualquer coisa, te recomendamos instalar o app no seu celular para ter a melhor experiência possível — acesso rápido, notificações em tempo real e muito mais!',
    },
    {
        id: 3,
        type: 'tip',
        icon: <Download className="w-5 h-5 text-emerald-400" />,
        title: 'Como instalar o app',
        text: 'No seu navegador, toque em "Compartilhar" (iPhone) ou no ícone de menu (Android) e selecione "Adicionar à Tela Inicial". Pronto! O app abrirá como nativo.',
    },
    {
        id: 4,
        text: '🗺️ Agora veja o que cada aba do aplicativo faz:',
    },
    {
        id: 5,
        type: 'section',
        icon: <Heart className="w-5 h-5 text-rose-400" />,
        title: '❤️ Descobrir',
        text: 'Aqui você encontra pessoas próximas a você. Deslize para a direita para curtir e para a esquerda para passar. Quando dois usuários se curtem, é um Match!',
    },
    {
        id: 6,
        type: 'section',
        icon: <Star className="w-5 h-5 text-amber-400" />,
        title: '⭐ Super Like',
        text: 'Quer demonstrar um interesse especial? Use o Super Like! A outra pessoa saberá que você teve um destaque especial ao deslizá-la.',
    },
    {
        id: 7,
        type: 'section',
        icon: <Users className="w-5 h-5 text-blue-400" />,
        title: '💛 Curtidas',
        text: 'Veja quem já curtiu o seu perfil! Com o plano Prata ou Ouro, você consegue ver quem são todas as pessoas que curtiram você — sem precisar esperar um Match.',
    },
    {
        id: 8,
        type: 'section',
        icon: <MessageCircle className="w-5 h-5 text-teal-400" />,
        title: '💬 Mensagens',
        text: 'Aqui ficam todas as suas conversas com os seus Matches. Você pode enviar textos, áudios e fotos (planos Prata/Ouro), além de fazer chamadas de voz e vídeo.',
    },
    {
        id: 9,
        type: 'section',
        icon: <Zap className="w-5 h-5 text-yellow-400" />,
        title: '👤 Perfil',
        text: 'Complete seu perfil com fotos, bio, interesses e informações sobre você. Perfis completos têm até 3x mais chances de conseguir Matches!',
    },
    {
        id: 10,
        type: 'tip',
        icon: <Bell className="w-5 h-5 text-indigo-400" />,
        title: 'Ative as notificações',
        text: 'Não perca nenhum Match ou mensagem! Ative as notificações para ser avisado(a) em tempo real quando alguém curtir você ou enviar uma mensagem.',
    },
    {
        id: 11,
        type: 'tip',
        icon: <Shield className="w-5 h-5 text-emerald-400" />,
        title: 'Segurança em primeiro lugar',
        text: 'Você pode denunciar ou bloquear qualquer usuário a qualquer momento. Toque nos 3 pontos (⋯) dentro de uma conversa ou perfil para acessar essas opções.',
    },
    {
        id: 12,
        text: '✨ Estamos muito felizes em ter você aqui! Que essa jornada seja abençoada e que você encontre a pessoa certa. Qualquer dúvida, estamos sempre aqui. 🙏',
    },
];

export default function WelcomeChat() {
    const navigate = useNavigate();

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
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/40 shadow-md">
                    <img src="/pwa-512x512.png" alt="App" className="w-full h-full object-cover" />
                </div>
                <div>
                    <p className="font-bold text-[15px] leading-tight">Bem-vindo(a) ao aplicativo</p>
                    <p className="text-xs text-emerald-500 font-medium">Equipe do App</p>
                </div>
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
                        {msg.type === 'section' || msg.type === 'tip' ? (
                            <div className={`rounded-2xl p-4 border ${msg.type === 'tip'
                                ? 'bg-emerald-500/[0.07] border-emerald-500/20'
                                : 'bg-muted/60 border-border/30'
                                } max-w-[88%]`}>
                                <div className="flex items-center gap-2 mb-1.5">
                                    {msg.icon}
                                    <span className="font-bold text-[14px]">{msg.title}</span>
                                </div>
                                <p className="text-[13.5px] text-muted-foreground leading-relaxed">{msg.text}</p>
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
                <p className="text-xs text-muted-foreground">Esta é uma mensagem automática de boas-vindas 🙏</p>
            </div>
        </div>
    );
}
