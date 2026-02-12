import { motion } from 'framer-motion';
import { Heart, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlansHeaderProps {
  onBack?: () => void;
}

export function PlansHeader({ onBack }: PlansHeaderProps) {
  return (
    <div className="relative w-full flex items-center justify-center py-4 px-4 overflow-visible h-14">
      {onBack && (
        <div className="absolute left-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2 fade-in-fast opacity-40 select-none">
        <div className="relative">
          <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#d4af37] via-[#fcd34d] to-[#b45309] shadow-[0_0_20px_rgba(212,175,55,0.2)] relative z-10">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-black/10 backdrop-blur-xl flex items-center justify-center border border-white/20 overflow-hidden">
              <Heart className="w-5 h-5 text-white fill-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            </div>
          </div>
        </div>

        <h1 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight">
          <span>Encontro</span>{' '}
          <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">com Fé</span>
        </h1>
      </div>
    </div>
  );
}
