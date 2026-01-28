import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface GenderSelectionProps {
  onSelect: (gender: 'male' | 'female') => void;
  onBack: () => void;
}

export function GenderSelection({ onSelect, onBack }: GenderSelectionProps) {
  // Animation variants for smooth entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0f9b8e] to-[#1e3a8a] relative overflow-hidden flex flex-col font-sans">

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] bg-[#14b8a6] rounded-full blur-[100px] md:blur-[130px] opacity-20 animate-pulse-slow" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-[#1e3a8a] rounded-full blur-[100px] md:blur-[130px] opacity-30 animate-pulse-slow" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </div>

      {/* Header: Progress & Back */}
      <div className="relative z-10 w-full px-6 py-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex flex-col items-end gap-1">
          <span className="text-white/60 text-xs font-medium tracking-widest uppercase">Passo 1 de 3</span>
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '33%' }}
              className="h-full bg-amber-400 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center justify-center px-6 pb-40 w-full max-w-md mx-auto z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-10 space-y-3">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white drop-shadow-md leading-tight">
            Seja bem-vindo(a).<br />
            <span className="text-amber-400">Qual o seu gênero?</span>
          </h1>
          <p className="text-white/80 text-base md:text-lg font-medium leading-relaxed max-w-[280px] mx-auto">
            Precisamos dessa informação para encontrar as conexões mais compatíveis com você.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full grid grid-cols-2 gap-3 md:gap-6">

          {/* Male Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect('male')}
            className="group relative w-full aspect-[4/5] md:aspect-square bg-gradient-to-br from-sky-500/90 to-blue-600/90 backdrop-blur-xl border border-white/20 rounded-[32px] overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col items-center justify-center gap-4"
          >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/30">
              <div className="w-full h-full rounded-full bg-[#1e3a8a] flex items-center justify-center border border-white/20">
                {/* Male Icon SVG */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white">
                  <circle cx="10" cy="14" r="6" />
                  <path d="M16 10 L20 6" />
                  <path d="M20 10 L20 6 L16 6" />
                </svg>
              </div>
            </div>
            <span className="text-2xl font-bold text-white tracking-wide">Sou Homem</span>
          </motion.button>

          {/* Female Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect('female')}
            className="group relative w-full aspect-[4/5] md:aspect-square bg-gradient-to-br from-rose-500/90 to-pink-600/90 backdrop-blur-xl border border-white/20 rounded-[32px] overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col items-center justify-center gap-4"
          >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 p-[2px] shadow-lg shadow-pink-500/30">
              <div className="w-full h-full rounded-full bg-[#831843] flex items-center justify-center border border-white/20">
                {/* Female Icon SVG */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white">
                  <circle cx="12" cy="10" r="6" />
                  <path d="M12 16 L12 21" />
                  <path d="M9 18 L15 18" />
                </svg>
              </div>
            </div>
            <span className="text-2xl font-bold text-white tracking-wide">Sou Mulher</span>
          </motion.button>

        </motion.div>
      </motion.div>
    </div>
  );
}
