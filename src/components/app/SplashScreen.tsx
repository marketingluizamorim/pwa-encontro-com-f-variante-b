import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showTagline, setShowTagline] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show tagline after logo animation
    const taglineTimer = setTimeout(() => setShowTagline(true), 800);
    
    // Start fade out
    const fadeTimer = setTimeout(() => setFadeOut(true), 2200);
    
    // Complete splash screen
    const completeTimer = setTimeout(() => onComplete(), 2800);

    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gradient-welcome"
        >
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2.5, opacity: 0.1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: 0.08 }}
              transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white"
            />
          </div>

          {/* Logo container */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              duration: 0.8,
            }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* App icon with glow effect */}
            <motion.div
              initial={{ boxShadow: '0 0 0 rgba(255,255,255,0)' }}
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(255,255,255,0.3)',
                  '0 0 40px rgba(255,255,255,0.5)',
                  '0 0 20px rgba(255,255,255,0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-28 h-28 rounded-3xl overflow-hidden mb-8"
            >
              <img
                src="/pwa-192x192.png"
                alt="Encontro com Fé"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* App name with staggered letter animation */}
            <motion.h1
              className="font-display text-4xl font-bold text-white tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Encontro
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/80"
              >
                {' '}com{' '}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Fé
              </motion.span>
            </motion.h1>

            {/* Tagline */}
            <AnimatePresence>
              {showTagline && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4 text-white/70 text-lg tracking-wide"
                >
                  Conexões que Transformam
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.3 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2"
          >
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/60"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Cross icon decorative element */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.1, scale: 1, rotate: 15 }}
            transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
            className="absolute top-20 right-8 text-white"
          >
            <i className="ri-add-line text-8xl" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.08, scale: 1, rotate: -10 }}
            transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
            className="absolute bottom-32 left-8 text-white"
          >
            <i className="ri-heart-line text-7xl" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
