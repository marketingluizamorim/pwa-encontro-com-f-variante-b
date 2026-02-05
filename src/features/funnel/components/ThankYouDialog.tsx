import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

interface ThankYouDialogProps {
  open: boolean;
  email: string;
  name: string;
  onRedirect: () => void;
}

export function ThankYouDialog({ open, email, name, onRedirect }: ThankYouDialogProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!open) return;
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
  }, [open, onRedirect]);

  return (
    <Dialog open={open} onOpenChange={() => { }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto border-none bg-transparent shadow-none p-0 overflow-hidden [&>button]:hidden">
        <div className="relative bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl overflow-hidden ring-1 ring-white/5">

          {/* Animated Background Effects */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-[#14b8a6]/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-[#f59e0b]/15 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Success Icon Animation */}
            <div className="relative mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 p-[3px] shadow-[0_0_40px_rgba(16,185,129,0.4)]"
              >
                <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-transparent" />
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Check className="w-10 h-10 text-green-400 stroke-[3]" />
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
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight drop-shadow-md">
                Pagamento <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Confirmado!</span>
              </h2>

              <p className="text-white/80 text-lg font-light leading-relaxed max-w-[280px] mx-auto">
                Tudo certo, <strong>{name}</strong>! <br />
                Sua jornada começa agora.
              </p>
            </motion.div>

            {/* Countdown Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10 w-full max-w-[200px]"
            >
              <div className="flex justify-between text-xs text-white/40 uppercase font-bold tracking-widest mb-2">
                <span>Redirecionando</span>
                <span>{countdown}s</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-300"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
