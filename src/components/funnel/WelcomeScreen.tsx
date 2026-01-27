import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import avatar1 from '@/assets/avatar-1.jpg';
import avatar2 from '@/assets/avatar-2.jpg';
import avatar3 from '@/assets/avatar-3.jpg';

const HERO_PROFILES = [
  {
    id: 1,
    name: 'Ana, 24',
    location: 'São Paulo, SP',
    image: avatar1,
    rotation: -6,
  },
  {
    id: 2,
    name: 'Júlia, 26',
    location: 'Rio de Janeiro, RJ',
    image: avatar2,
    rotation: 6,
  },
  {
    id: 3,
    name: 'Beatriz, 23',
    location: 'Belo Horizonte, MG',
    image: avatar3,
    rotation: 0,
  },
];

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [onlineCount, setOnlineCount] = useState(10847);
  const [currentCardIndex, setCurrentCardIndex] = useState(HERO_PROFILES.length - 1);

  // Simulate live online users count
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const change = Math.floor(Math.random() * 51) - 25; // -25 to +25
        return Math.max(9000, Math.min(12000, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-swipe effect for the hero cards
  useEffect(() => {
    const swipeInterval = setInterval(() => {
      setCurrentCardIndex(prev => (prev < 0 ? HERO_PROFILES.length - 1 : prev - 1));
    }, 4000);
    return () => clearInterval(swipeInterval);
  }, []);

  return (
    <div className="min-h-screen gradient-welcome relative overflow-hidden flex flex-col items-center justify-between px-4 py-8">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl -top-20 -left-20"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-primary/20 blur-3xl top-1/2 -right-20"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Header / Logo Area */}
      <div className="relative z-10 w-full flex flex-col items-center pt-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-2"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
            <i className="ri-heart-3-fill text-white text-lg" />
          </div>
          <span className="text-white font-bold tracking-wide uppercase text-xs">Encontro com Fé</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-dark px-4 py-1.5 rounded-full flex items-center gap-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-white/90 text-xs font-semibold">
            {onlineCount.toLocaleString()} online
          </span>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto my-8">

        {/* Mock Swipe Cards */}
        <div className="relative w-full aspect-[3/4] max-h-[420px] mb-8">
          <AnimatePresence mode='popLayout'>
            {HERO_PROFILES.map((profile, index) => {
              const isTop = index === currentCardIndex;
              // Only render the top few cards for performance
              if (index > currentCardIndex + 2) return null;

              return (
                <motion.div
                  key={profile.id}
                  className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white/10"
                  style={{
                    zIndex: index,
                  }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{
                    scale: isTop ? 1 : 1 - (currentCardIndex - index) * 0.05,
                    y: isTop ? 0 : (currentCardIndex - index) * 15,
                    rotate: isTop ? 0 : profile.rotation,
                    opacity: index > currentCardIndex ? 0 : 1 - (currentCardIndex - index) * 0.2,
                  }}
                  exit={{
                    x: Math.random() > 0.5 ? 400 : -400,
                    rotate: Math.random() > 0.5 ? 20 : -20,
                    opacity: 0
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Card Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                  {/* Card Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-2xl">{profile.name}</h3>
                      <i className="ri-verified-badge-fill text-blue-400" />
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80 text-sm">
                      <i className="ri-map-pin-line" />
                      <span>{profile.location}</span>
                    </div>
                  </div>

                  {/* Mock Action Buttons (Visual Only) */}
                  <div className="absolute bottom-5 right-5 flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <i className="ri-heart-fill text-xl" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Floating 'Match' Badge Decor */}
          <motion.div
            className="absolute -right-4 top-10 glass px-4 py-2 rounded-xl flex items-center gap-3 shadow-xl z-20"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
              <i className="ri-chat-heart-fill text-pink-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Novo Match!</p>
              <p className="text-[10px] text-gray-500">Acabou de acontecer</p>
            </div>
          </motion.div>

        </div>

        {/* Text Content */}
        <div className="text-center space-y-2 mb-8 relative z-20">
          <motion.h1
            className="text-4xl md:text-5xl font-display font-bold text-white shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Encontre o <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
              Amor de Verdade
            </span>
          </motion.h1>
          <motion.p
            className="text-white/80 text-lg px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Conecte-se com pessoas que compartilham seus valores e sua fé.
          </motion.p>
        </div>

      </div>

      {/* Bottom Action Area */}
      <motion.div
        className="relative z-10 w-full max-w-md space-y-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: 'spring' }}
      >
        <Button
          onClick={onStart}
          size="lg"
          className="w-full bg-white text-primary hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] font-bold text-lg h-14 rounded-2xl shadow-xl transition-all"
        >
          Começar Agora
        </Button>

        <p className="text-center text-white/50 text-xs text-balance px-8">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
        </p>
      </motion.div>
    </div>
  );
}
