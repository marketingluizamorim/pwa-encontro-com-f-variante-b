import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
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
        <img
          src="/3logo-nova1080x1080.png"
          alt="Encontro com Fé"
          className="w-10 h-10 object-contain logo-blend"
        />

        <h1 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight">
          <span>Encontro</span>{' '}
          <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">com Fé</span>
        </h1>
      </div>
    </div>
  );
}
