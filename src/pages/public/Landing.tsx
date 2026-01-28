import React from 'react';
import { motion } from 'framer-motion';
import { Heart, BadgeCheck, LockKeyhole } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [onlineCount, setOnlineCount] = React.useState(12437);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        // Trend upwards (70% chance), but sometimes drop (30%) to look natural
        const isGrowth = Math.random() > 0.3;

        const change = isGrowth
          ? Math.floor(Math.random() * 15) + 5  // Grow by 5-20
          : -(Math.floor(Math.random() * 10) + 3); // Drop by 3-13

        const newValue = prev + change;
        // Keep strictly between 12,000 and 14,000
        return Math.max(12000, Math.min(14000, newValue));
      });
    }, 2500); // Slightly faster updates (2.5s)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-[#0f9b8e] to-[#1e3a8a] flex flex-col items-center justify-center gap-6 md:gap-12 py-8 px-4 md:py-16 md:px-6 font-sans overflow-hidden relative">

      {/* Background Ambience - Animated */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] bg-[#14b8a6] rounded-full blur-[100px] md:blur-[130px] opacity-20 animate-pulse-slow" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-[#1e3a8a] rounded-full blur-[100px] md:blur-[130px] opacity-30 animate-pulse-slow" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        {/* Adds a subtle noise texture overlay for professional feel */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      </div>

      {/* Top Section: Logo & Brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 md:gap-8 z-10 shrink-0"
      >
        <div className="relative group cursor-pointer">
          {/* Divine Halo Effect */}
          <div className="absolute inset-0 bg-[#d4af37]/40 blur-3xl md:blur-[40px] rounded-full scale-150 animate-pulse-slow" style={{ animationDuration: '4s' }} />
          <div className="relative w-16 h-16 md:w-28 md:h-28 rounded-full p-[3px] bg-gradient-to-tr from-[#d4af37] via-[#fcd34d] to-[#b45309] shadow-[0_0_40px_rgba(212,175,55,0.3)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-black/10 backdrop-blur-3xl flex items-center justify-center border border-white/30 shadow-inner overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-shine pointer-events-none" />
              <Heart className="w-8 h-8 md:w-14 md:h-14 text-white fill-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-1 md:space-y-2">
          <h1 className="text-3xl md:text-6xl font-serif text-white font-bold tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]">
            Encontro <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fcd34d] to-[#d4af37] drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]">com Fé</span>
          </h1>
          <p className="text-white/90 text-sm md:text-xl font-light tracking-wide drop-shadow-md">
            Conexões que transformam vidas
          </p>
        </div>
      </motion.div>

      {/* Center Section: Social Proof Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
        className="w-full max-w-sm z-10 shrink-0"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] md:rounded-[48px] p-5 md:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] flex flex-col items-center relative overflow-hidden group hover:bg-white/10 transition-all duration-700 ring-1 ring-white/5">

          {/* Enhanced Glass Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* User Avatars Cloud (12 avatars) - "Power Pair" Center Layout */}
          <div className="relative w-full max-w-[340px] h-28 flex items-center justify-center mb-2 mt-4 mx-auto">

            {/* -- Layer 1: The Crown Arch (Backdrop) -- */}
            {/* Far Left Arch */}
            <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%+115px)] -translate-y-[calc(50%+15px)] w-8 h-8 rounded-full border border-white/20 ring-1 ring-white/5 overflow-hidden shadow-sm z-0 bg-gray-200">
              <img src="/avatars/m5.jpg" alt="User" className="w-full h-full object-cover opacity-60 grayscale-[0.3]" />
            </div>
            {/* Mid Left Arch */}
            <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%+80px)] -translate-y-[calc(50%+35px)] w-8 h-8 rounded-full border border-white/20 ring-1 ring-white/5 overflow-hidden shadow-sm z-0 bg-gray-200">
              <img src="/avatars/f4.jpg" alt="User" className="w-full h-full object-cover opacity-60 grayscale-[0.3]" />
            </div>
            {/* Center Left Arch */}
            <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%+35px)] -translate-y-[calc(50%+48px)] w-9 h-9 rounded-full border border-white/30 ring-1 ring-white/10 overflow-hidden shadow-sm z-10 bg-gray-300">
              <img src="/avatars/m3.jpg" alt="User" className="w-full h-full object-cover opacity-80" />
            </div>
            {/* Center Right Arch */}
            <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%-35px)] -translate-y-[calc(50%+48px)] w-9 h-9 rounded-full border border-white/30 ring-1 ring-white/10 overflow-hidden shadow-sm z-10 bg-gray-300">
              <img src="/avatars/f3.jpg" alt="User" className="w-full h-full object-cover opacity-80" />
            </div>
            {/* Mid Right Arch */}
            <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%-80px)] -translate-y-[calc(50%+35px)] w-8 h-8 rounded-full border border-white/20 ring-1 ring-white/5 overflow-hidden shadow-sm z-0 bg-gray-200">
              <img src="/avatars/m4.jpg" alt="User" className="w-full h-full object-cover opacity-60 grayscale-[0.3]" />
            </div>
            {/* Far Right Arch */}
            <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%-115px)] -translate-y-[calc(50%+15px)] w-8 h-8 rounded-full border border-white/20 ring-1 ring-white/5 overflow-hidden shadow-sm z-0 bg-gray-200">
              <img src="/avatars/f5.jpg" alt="User" className="w-full h-full object-cover opacity-60 grayscale-[0.3]" />
            </div>

            {/* -- Layer 2: The Core Wings (Mid-Ground) -- */}
            {/* Left Wing */}
            <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%+90px)] -translate-y-[calc(50%+5px)] w-11 h-11 rounded-full border-2 border-white/60 ring-1 ring-white/20 overflow-hidden shadow-md z-20 bg-gray-300">
              <img src="/avatars/m2.jpg" alt="User" className="w-full h-full object-cover" />
            </div>
            {/* Right Wing */}
            <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%-90px)] -translate-y-[calc(50%+5px)] w-11 h-11 rounded-full border-2 border-white/60 ring-1 ring-white/20 overflow-hidden shadow-md z-20 bg-gray-300">
              <img src="/avatars/f2.jpg" alt="User" className="w-full h-full object-cover" />
            </div>

            {/* -- Layer 3: The Flanks (Shoulders) -- */}
            {/* Left Shoulder */}
            <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%+55px)] -translate-y-[calc(50%-5px)] w-14 h-14 rounded-full border-[2.5px] border-white/90 overflow-hidden shadow-lg z-30 transform hover:scale-105 transition-transform ring-1 ring-black/10">
              <img src="/avatars/f1.jpg" alt="User" className="w-full h-full object-cover" />
            </div>
            {/* Right Shoulder */}
            <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%-55px)] -translate-y-[calc(50%-5px)] w-14 h-14 rounded-full border-[2.5px] border-white/90 overflow-hidden shadow-lg z-30 transform hover:scale-105 transition-transform ring-1 ring-black/10">
              <img src="/avatars/m1.jpg" alt="User" className="w-full h-full object-cover" />
            </div>

            {/* -- Layer 4: POWER PAIR (Center Heroes) -- */}
            {/* Female Hero (Center Left) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%+18px)] -translate-y-[60%] w-[72px] h-[72px] rounded-full border-[3px] border-white overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.3)] z-50 ring-[3px] ring-white/20 transform hover:scale-110 transition-transform duration-300 hover:z-[60]">
              <img src="/avatars/hero_f.jpg" alt="User" className="w-full h-full object-cover" />
            </div>
            {/* Male Hero (Center Right) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%-18px)] -translate-y-[60%] w-[72px] h-[72px] rounded-full border-[3px] border-white overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.3)] z-50 ring-[3px] ring-white/20 transform hover:scale-110 transition-transform duration-300 hover:z-[60]">
              <img src="/avatars/hero_m.jpg" alt="User" className="w-full h-full object-cover" />
            </div>

          </div>

          <p className="text-white/90 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] mb-0.5 md:mb-1 drop-shadow-sm">
            Usuários no aplicativo
          </p>
          <h2 className="text-4xl md:text-6xl font-black !font-sans text-white tracking-tighter drop-shadow-md">
            92.000+
          </h2>
        </div>

        <div className="flex items-center justify-center gap-2 mt-3 md:mt-6">
          <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] border border-white/20"></span>
          </span>
          <span className="text-white/95 font-medium text-xs md:text-sm tracking-wide drop-shadow-sm">
            {onlineCount.toLocaleString('pt-BR')} pessoas online agora
          </span>
        </div>
      </motion.div>

      {/* Bottom Section: CTA & Trust Badges */}
      <div className="w-full max-w-sm flex flex-col gap-5 md:gap-8 z-10 shrink-0">
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 20px 30px -5px rgba(245, 158, 11, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/v1/genero')}
          className="w-full h-14 md:h-20 bg-gradient-to-r from-[#14b8a6] via-[#0d9488] to-[#f59e0b] rounded-[24px] md:rounded-[30px] shadow-2xl shadow-orange-500/25 flex items-center justify-center gap-3 md:gap-4 text-white font-bold text-lg md:text-xl group transition-all relative overflow-hidden border border-white/20"
        >
          {/* Button Shine Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 translate-x-[-150%] animate-shine" />

          <span className="relative drop-shadow-md">Encontrar Meu Par Ideal</span>
          <Heart className="w-5 h-5 md:w-7 md:h-7 fill-white/20 group-hover:fill-white transition-colors relative drop-shadow-md" />
        </motion.button>

        {/* Improved Trust Badges - Text Style */}
        <div className="flex justify-between items-center px-2 md:px-4">
          <div className="flex items-center gap-2 group cursor-default">
            <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-[#fcd34d] fill-[#fcd34d]/10 group-hover:scale-110 transition-transform" />
            <span className="text-white/90 text-xs md:text-sm font-medium tracking-wide">Seguro</span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <LockKeyhole className="w-4 h-4 md:w-5 md:h-5 text-[#fcd34d] fill-[#fcd34d]/10 group-hover:scale-110 transition-transform" />
            <span className="text-white/90 text-xs md:text-sm font-medium tracking-wide">Privado</span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            {/* Christian Cross - Thicker Stroke */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 md:w-5 md:h-5 text-[#fcd34d] group-hover:scale-110 transition-transform"
            >
              <path d="M12 2v20" />
              <path d="M8 8h8" />
            </svg>
            <span className="text-white/90 text-xs md:text-sm font-medium tracking-wide">Cristão</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
