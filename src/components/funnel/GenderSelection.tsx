import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface GenderSelectionProps {
  onSelect: (gender: 'male' | 'female') => void;
  onBack: () => void;
}

export function GenderSelection({ onSelect, onBack }: GenderSelectionProps) {
  return (
    <div className="h-screen gradient-gender relative overflow-hidden flex flex-col px-4">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-4 z-20"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-primary-foreground hover:bg-white/20"
        >
          <i className="ri-arrow-left-line text-xl" />
        </Button>
      </motion.div>

      {/* Step indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 right-4 z-20"
      >
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="text-primary-foreground/80 text-sm font-medium">
            Etapa 1 de 3
          </span>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full pb-24">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:text-3xl font-display font-bold text-primary-foreground text-center mb-3 text-3xl"
        >
          Qual seu gênero?
        </motion.h1>

        {/* Micro-copy */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-primary-foreground/70 text-center text-sm mb-10"
        >
          Isso nos ajuda a encontrar pessoas compatíveis
        </motion.p>

        {/* Gender cards */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {/* Male */}
          <button
            onClick={() => onSelect('male')}
            className="group relative aspect-square rounded-2xl gradient-male p-6 flex flex-col items-center justify-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <i className="ri-men-line text-4xl text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-primary-foreground">Masculino</span>
          </button>

          {/* Female */}
          <button
            onClick={() => onSelect('female')}
            className="group relative aspect-square rounded-2xl gradient-female p-6 flex flex-col items-center justify-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <i className="ri-women-line text-4xl text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-primary-foreground">Feminino</span>
          </button>
        </div>
      </div>
    </div>
  );
}
