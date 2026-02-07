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
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect('male')}
            onMouseEnter={() => import('@/features/funnel/pages/Quiz')}
            className="group relative w-full aspect-[4/5] md:aspect-square bg-[#1e3a8a]/30 hover:bg-[#1e3a8a]/50 backdrop-blur-2xl border border-white/10 md:hover:border-[#fcd34d]/30 rounded-[32px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all flex flex-col items-center justify-center gap-5 ring-0 outline-none focus:outline-none focus:ring-0 active:scale-95"
          >
            {/* Subtle Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#1e3a8a] to-[#1e40af] p-[2px] shadow-[0_15px_30px_rgba(0,0,0,0.4),0_0_20px_rgba(30,58,138,0.3)] md:group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(252,211,77,0.2)] transition-all duration-500">
              <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center border border-white/20 md:group-hover:border-[#fcd34d]/50 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white/90 md:group-hover:text-[#fcd34d] transition-colors">
                  <path d="M16 3h5v5" />
                  <path d="M21 3L13.5 10.5" />
                  <circle cx="10" cy="14" r="6" />
                </svg>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-2xl font-serif font-bold text-white tracking-wide block md:group-hover:text-[#fcd34d] transition-colors">Sou Homem</span>
              <p className="text-white/40 text-xs font-medium tracking-widest uppercase opacity-0 md:group-hover:opacity-100 transform translate-y-2 md:group-hover:translate-y-0 transition-all duration-300">
                Selecionar
              </p>
            </div>
          </motion.button>

          {/* Female Card */}
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect('female')}
            onMouseEnter={() => import('@/features/funnel/pages/Quiz')}
            className="group relative w-full aspect-[4/5] md:aspect-square bg-[#831843]/30 hover:bg-[#831843]/50 backdrop-blur-2xl border border-white/10 md:hover:border-[#fcd34d]/30 rounded-[32px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all flex flex-col items-center justify-center gap-5 ring-0 outline-none focus:outline-none focus:ring-0 active:scale-95"
          >
            {/* Subtle Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#831843] to-[#be185d] p-[2px] shadow-[0_15px_30px_rgba(0,0,0,0.4),0_0_20px_rgba(131,24,67,0.3)] md:group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(252,211,77,0.2)] transition-all duration-500">
              <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center border border-white/20 md:group-hover:border-[#fcd34d]/50 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white/90 md:group-hover:text-[#fcd34d] transition-colors">
                  <path d="M12 15v7" />
                  <path d="M15 19H9" />
                  <circle cx="12" cy="9" r="6" />
                </svg>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-2xl font-serif font-bold text-white tracking-wide block md:group-hover:text-[#fcd34d] transition-colors">Sou Mulher</span>
              <p className="text-white/40 text-xs font-medium tracking-widest uppercase opacity-0 md:group-hover:opacity-100 transform translate-y-2 md:group-hover:translate-y-0 transition-all duration-300">
                Selecionar
              </p>
            </div>
          </motion.button>

        </motion.div>
      </motion.div>
    </div>
  );
}
