import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ThankYouDialogProps {
  open: boolean;
  email: string;
  name: string;
  onRedirect: () => void;
  onOpenChange?: (open: boolean) => void;
  type?: 'checkout' | 'upgrade';
  planId?: string;
}

const PLAN_NAMES: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
};

export function ThankYouDialog({
  open,
  email,
  name,
  onRedirect,
  onOpenChange,
  type = 'checkout',
  planId
}: ThankYouDialogProps) {
  const [countdown, setCountdown] = useState(5);
  const isUpgrade = type === 'upgrade';
  const planName = planId ? PLAN_NAMES[planId] || planId : '';

  useEffect(() => {
    if (!open || isUpgrade) return;
    setCountdown(5); // Reset countdown on open

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, onRedirect, isUpgrade]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="w-[calc(100%-2rem)] max-w-md mx-auto border-none bg-transparent shadow-none p-0 overflow-hidden">
        <div className="relative bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl overflow-hidden ring-1 ring-white/5">

          {/* Animated Background Effects */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-[#14b8a6]/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-[#f59e0b]/15 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Success Icon Animation */}
            <div className="relative mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#14b8a6] to-[#f59e0b] p-[3px] shadow-[0_0_40px_rgba(20,184,166,0.4)]"
              >
                <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#14b8a6]/20 to-transparent" />
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Check className="w-8 h-8 text-white stroke-[3]" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Floating Sparkles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <Sparkles className="absolute top-0 right-0 w-6 h-6 text-[#fcd34d] fill-[#fcd34d] animate-pulse" style={{ animationDelay: '0.2s' }} />
                <Sparkles className="absolute bottom-2 left-0 w-4 h-4 text-[#fcd34d] fill-[#fcd34d] animate-pulse" style={{ animationDelay: '1.5s' }} />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-3xl md:text-3xl font-serif font-bold text-white tracking-tight drop-shadow-md leading-tight">
                {isUpgrade ? (
                  <>Upgrade <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14b8a6] to-[#f59e0b]">Concluído!</span></>
                ) : (
                  <>Pagamento <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14b8a6] to-[#f59e0b]">Confirmado!</span></>
                )}
              </h2>

              <p className="text-white/80 text-base md:text-lg font-light leading-relaxed max-w-[280px] mx-auto">
                {isUpgrade ? (
                  <>Parabéns, <strong>{name.split(' ')[0]}</strong>! Você agora é plano <strong>{planName}</strong> e já pode usufruir de todos os novos benefícios.</>
                ) : (
                  <>Tudo certo, <strong>{name.split(' ')[0]}</strong>! Sua jornada começa agora.</>
                )}
              </p>
            </motion.div>

            {isUpgrade ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 w-full"
              >
                <Button
                  onClick={onRedirect}
                  className="w-full h-14 rounded-2xl gradient-button text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 group"
                >
                  Conhecer mais benefícios
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            ) : (
              /* Countdown Bar */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 w-full max-w-[200px]"
              >
                <div className="flex justify-between text-[10px] text-white/40 uppercase font-bold tracking-widest mb-2">
                  <span>Redirecionando</span>
                  <span>{countdown}s</span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-[#14b8a6] to-[#f59e0b]"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
