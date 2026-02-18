import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Reduce total splash time for a snappier feel
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // 2 seconds total display

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b]"
        >
          {/* Main Logo Container - Simplified Animation */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            {/* App Icon */}
            <div className="w-24 h-24 rounded-3xl overflow-hidden mb-6 shadow-2xl shadow-black/50">
              <img
                src="/pwa-192x192.png"
                alt="Encontro com Fé"
                className="w-full h-full object-cover"
              />
            </div>

            {/* App Title - Simple Fade In */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="font-serif text-3xl font-bold text-white tracking-tight text-center"
            >
              Encontro <span className="text-amber-400 font-italic">com Fé</span>
            </motion.h1>

            {/* Tagline - Simple Fade In */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-3 text-white/50 text-sm tracking-wide font-medium"
            >
              Conexões que Transformam Vidas
            </motion.p>
          </motion.div>

          {/* Simple Loading Dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-16 flex gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/40"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
