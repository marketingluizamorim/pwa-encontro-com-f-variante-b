import { motion, AnimatePresence } from 'framer-motion';

interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
}

export function TypingIndicator({ isTyping, userName }: TypingIndicatorProps) {
  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-4 py-2"
        >
          <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-muted">
            <motion.span
              className="w-2 h-2 rounded-full bg-muted-foreground/60"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className="w-2 h-2 rounded-full bg-muted-foreground/60"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
            />
            <motion.span
              className="w-2 h-2 rounded-full bg-muted-foreground/60"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {userName ? `${userName} está digitando...` : 'Digitando...'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
