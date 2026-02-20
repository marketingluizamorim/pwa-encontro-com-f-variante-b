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

const SPECIAL_BENEFITS = [
  'Ver quem curtiu você',
  'Curtidas ilimitadas',
  'Fotos, áudios e chamadas',
  'Filtros avançados',
  'Desbloquear região',
  'Grupos no WhatsApp',
];

const TIMER_DURATION = 5 * 60;

export function ExitIntentDialog({ open, onOpenChange, onAccept, onDecline }: ExitIntentDialogProps) {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);

  useEffect(() => {
    if (open) setTimeLeft(TIMER_DURATION);
  }, [open]);

  useEffect(() => {
    if (!open || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { onDecline(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, timeLeft, onDecline]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm mx-auto px-4 py-4 rounded-[1.5rem] bg-[#0f172a]/95 backdrop-blur-2xl border-white/10 text-white shadow-2xl">

        {/* ── Badge + Título (linha única, compacto) ── */}
        <div className="flex flex-col items-center gap-1 mb-3">
          <div className="inline-flex items-center gap-1.5 bg-[#fcd34d]/10 text-[#fcd34d] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#fcd34d]/20 animate-pulse">
            <Clock className="w-3 h-3" />
            Oferta Relâmpago
          </div>
          <h2 className="font-serif font-bold text-xl text-white tracking-tight text-center leading-tight">
            Espere! Não vá embora
          </h2>
          <p className="text-white/55 text-xs text-center">
            Desbloqueie <span className="text-[#fcd34d] font-semibold">tudo do Plano Ouro</span> por 3 meses.
          </p>
        </div>

        {/* ── Card da oferta ── */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-3 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent skew-x-12 translate-x-[-150%] animate-shine" />

          {/* Produto */}
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
              <img src={bumpLifetime} alt="Ouro 3 Meses" className="w-9 h-9 object-contain drop-shadow-md" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold tracking-widest text-[#fcd34d] bg-[#fcd34d]/10 px-1.5 py-0.5 rounded uppercase border border-[#fcd34d]/20">
                Última Chance
              </span>
              <h3 className="font-serif font-bold text-base text-white leading-tight mt-0.5">
                Plano Ouro · 3 Meses
              </h3>
            </div>
          </div>

          {/* Benefícios — 2 colunas, compacto */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mb-3 relative z-10">
            {SPECIAL_BENEFITS.map((benefit, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-green-400" />
                </div>
                <span className="text-[11px] text-white/80 leading-tight">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Preço — horizontal inline */}
          <div className="flex items-center justify-between pt-2.5 border-t border-white/10 relative z-10">
            <div className="flex flex-col leading-tight">
              <span className="text-white/35 line-through text-[10px]">R$ 49,90/mês</span>
              <span className="text-white/55 text-[10px]">3 meses por apenas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-sans font-bold text-[#fcd34d] drop-shadow-[0_2px_8px_rgba(252,211,77,0.3)]">
                R$ 15,90
              </span>
              <span className="text-[9px] font-black text-[#0f172a] bg-[#fcd34d] px-1.5 py-0.5 rounded-full shadow-md">
                3 MESES
              </span>
            </div>
          </div>
        </div>

        {/* ── CTA + Timer ── */}
        <div className="mt-3 space-y-2">
          <Button
            onClick={onAccept}
            className="w-full h-12 rounded-xl gradient-button text-white transition-all uppercase tracking-wide text-sm font-bold border-0 hover:opacity-90 flex items-center justify-center gap-2"
          >
            <Gift className="w-4 h-4 animate-bounce" />
            Sim! Quero desbloquear agora
          </Button>

          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] text-white/40">
              Oferta expira em{' '}
              <span className="font-mono font-bold text-red-400">{formatTime(timeLeft)}</span>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}