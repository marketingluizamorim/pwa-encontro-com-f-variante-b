import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Check, Clock } from 'lucide-react';
import bumpLifetime from '@/assets/bump-lifetime.png';
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
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8 rounded-xl">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
            <Clock className="w-4 h-4 animate-pulse" />
            Ei, espere!       
          </div>
          <h2 className="font-display text-2xl text-foreground">
            Antes de sair...
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Seu perfil tem um grande potencial e desbloqueou uma oferta exclusiva
          </p>
        </div>

        {/* Special Offer Card */}
        <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
          {/* Product Row */}
          <div className="flex items-center gap-4 mb-4">
            <img src={bumpLifetime} alt="Acesso Completo" className="w-16 h-16 object-contain" />
            <div className="flex-1">
              <span className="text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                OFERTA ESPECIAL
              </span>
              <h3 className="font-bold text-lg text-foreground mt-1">
                Pacote Completo
              </h3>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {SPECIAL_BENEFITS.map((benefit, index) => <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>)}
          </div>

          {/* Price - Clean and Clear */}
          <div className="flex items-center justify-center gap-3 pt-3 border-t border-border/50">
            <span className="text-muted-foreground line-through text-sm">R$ 24,90</span>
            <span className="text-3xl font-bold text-primary">R$ 9,90</span>
            <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded">
              -60%
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <Button onClick={onAccept} className="w-full h-12 gradient-button text-primary-foreground text-base font-semibold">
            <Gift className="w-5 h-5 mr-2" />
            Sim! Quero essa oferta
          </Button>
        </div>

        {/* Scarcity Timer */}
        <div className="flex items-center justify-center gap-2 pt-3">
          <Clock className="w-4 h-4 text-destructive" />
          <span className="text-sm text-muted-foreground">
            Válido por apenas{' '}
            <span className="font-bold text-destructive tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </span>
        </div>
      </DialogContent>
    </Dialog>;
}