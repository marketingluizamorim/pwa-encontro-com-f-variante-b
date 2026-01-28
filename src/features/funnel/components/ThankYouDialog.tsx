import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';

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
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm [&>button]:hidden">
        <div className="py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <i className="ri-check-line text-4xl text-primary" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-display font-bold text-foreground mb-2"
          >
            Pagamento Recebido!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-6"
          >
            Bem-vindo(a), {name}!
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground"
          >
            Redirecionando em <span className="font-bold text-primary">{countdown}</span> segundos...
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
