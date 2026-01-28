import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Check, Clock } from 'lucide-react';
import bumpLifetime from '@/assets/bump-lifetime-premium.png';
interface ExitIntentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
}
const SPECIAL_BENEFITS = ['Desbloquear Região', 'Grupo Evangélico', 'Grupo Católico', 'Acesso Vitalício'];
const TIMER_DURATION = 5 * 60; // 5 minutes in seconds

export function ExitIntentDialog({
  open,
  onOpenChange,
  onAccept,
  onDecline
}: ExitIntentDialogProps) {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);

  // Reset timer when dialog opens
  useEffect(() => {
    if (open) {
      setTimeLeft(TIMER_DURATION);
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (!open || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onDecline(); // Auto-decline when timer expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, timeLeft, onDecline]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8 rounded-[2rem] bg-[#0f172a]/95 backdrop-blur-2xl border-white/10 text-white shadow-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-[#fcd34d]/10 text-[#fcd34d] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-[#fcd34d]/20 shadow-[0_0_15px_rgba(252,211,77,0.15)] animate-pulse">
          <Clock className="w-4 h-4" />
          Oferta Relâmpago
        </div>
        <h2 className="font-serif font-bold text-3xl md:text-4xl text-white tracking-tight drop-shadow-md">
          Espere! Não vá embora
        </h2>
        <p className="text-white/60 text-sm md:text-base mt-2 font-light leading-relaxed px-4">
          Seu perfil desbloqueou uma <span className="text-[#fcd34d] font-semibold">oportunidade única</span> antes de encerrarmos.
        </p>
      </div>

      {/* Special Offer Card */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] animate-shine opacity-50" />

        {/* Product Row */}
        <div className="flex items-center gap-5 mb-5 relative z-10">
          <div className="w-20 h-20 rounded-xl bg-black/30 p-2 border border-white/10 flex items-center justify-center shadow-lg">
            <img src={bumpLifetime} alt="Acesso Completo" className="w-full h-full object-contain drop-shadow-md" />
          </div>

          <div className="flex-1">
            <span className="text-[10px] font-bold tracking-widest text-[#fcd34d] bg-[#fcd34d]/10 px-2 py-1 rounded-md uppercase border border-[#fcd34d]/20">
              Última Chance
            </span>
            <h3 className="font-serif font-bold text-2xl text-white mt-2 leading-none">
              Pacote Completo
            </h3>
            <p className="text-white/50 text-xs mt-1">Benefícios Premium Inclusos</p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
          {SPECIAL_BENEFITS.map((benefit, index) => <div key={index} className="flex items-center gap-2.5 text-xs md:text-sm group/item">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 group-hover:border-green-400 transition-colors">
              <Check className="w-3 h-3 text-green-400" />
            </div>
            <span className="text-white/80 group-hover:text-white transition-colors">{benefit}</span>
          </div>)}
        </div>

        {/* Price - Clean and Clear */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 relative z-10">
          <div className="flex flex-col">
            <span className="text-white/40 line-through text-xs font-medium">De R$ 24,90</span>
            <span className="text-white/60 text-xs">por apenas</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-serif font-bold text-[#fcd34d] drop-shadow-[0_2px_10px_rgba(252,211,77,0.3)]">R$ 9,90</span>
            <span className="text-[10px] font-bold text-[#0f172a] bg-[#fcd34d] px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/20">
              -60% OFF
            </span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-6 space-y-4">
        <Button onClick={onAccept} className="w-full h-14 rounded-xl gradient-button text-white shadow-[0_8px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_10px_40px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all uppercase tracking-wide text-sm font-bold border border-white/20 group relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 backdrop-blur-[1px]" />
          <div className="relative flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 animate-bounce" />
            Sim! Quero desbloquear agora
          </div>
        </Button>

        {/* Scarcity Timer */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-white/40 font-medium">
            Oferta expira em{' '}
            <span className="font-mono font-bold text-red-400">
              {formatTime(timeLeft)}
            </span>
          </span>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}