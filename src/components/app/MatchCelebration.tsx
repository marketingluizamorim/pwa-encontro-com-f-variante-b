import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  velocityX: number;
  velocityY: number;
  gravity: number;
  drag: number;
  color: string;
  size: number;
  shape: 'square' | 'circle' | 'heart';
}

interface MatchCelebrationProps {
  show: boolean;
  matchName?: string;
  matchPhoto?: string;
  onComplete?: () => void;
}

const COLORS = [
  '#FF6B6B', // Coral red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#95E1D3', // Mint
  '#F38181', // Pink
  '#AA96DA', // Lavender
  '#FCBAD3', // Light pink
  '#A8D8EA', // Light blue
];

export function MatchCelebration({ show, matchName, matchPhoto, onComplete }: MatchCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<ConfettiPiece[]>([]);
  const animationRef = useRef<number>();

  const createConfetti = useCallback(() => {
    const pieces: ConfettiPiece[] = [];
    const count = 150;

    for (let i = 0; i < count; i++) {
      const side = Math.random() > 0.5 ? 'left' : 'right';
      pieces.push({
        x: side === 'left' ? -20 : window.innerWidth + 20,
        y: window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        velocityX: side === 'left' 
          ? Math.random() * 15 + 5 
          : -(Math.random() * 15 + 5),
        velocityY: -(Math.random() * 20 + 10),
        gravity: 0.3 + Math.random() * 0.2,
        drag: 0.97 + Math.random() * 0.02,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 10 + 6,
        shape: ['square', 'circle', 'heart'][Math.floor(Math.random() * 3)] as 'square' | 'circle' | 'heart',
      });
    }

    return pieces;
  }, []);

  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const width = size;
    const height = size;
    
    ctx.beginPath();
    ctx.moveTo(x, y + height / 4);
    ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + height / 4);
    ctx.bezierCurveTo(x - width / 2, y + height / 2, x, y + height * 0.75, x, y + height);
    ctx.bezierCurveTo(x, y + height * 0.75, x + width / 2, y + height / 2, x + width / 2, y + height / 4);
    ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + height / 4);
    ctx.closePath();
    ctx.fill();
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeCount = 0;

    confettiRef.current.forEach((piece) => {
      // Update physics
      piece.velocityY += piece.gravity;
      piece.velocityX *= piece.drag;
      piece.velocityY *= piece.drag;
      piece.x += piece.velocityX;
      piece.y += piece.velocityY;
      piece.rotation += piece.rotationSpeed;

      // Check if still visible
      if (piece.y < canvas.height + 50) {
        activeCount++;
      }

      // Draw piece
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate((piece.rotation * Math.PI) / 180);
      ctx.fillStyle = piece.color;

      if (piece.shape === 'square') {
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
      } else if (piece.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawHeart(ctx, 0, -piece.size / 2, piece.size);
      }

      ctx.restore();
    });

    if (activeCount > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, []);

  useEffect(() => {
    if (!show) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create and start confetti
    confettiRef.current = createConfetti();
    animate();

    // Auto-complete after animation
    const timeout = setTimeout(() => {
      onComplete?.();
    }, 4000);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(timeout);
    };
  }, [show, createConfetti, animate, onComplete]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onComplete}
        >
          {/* Confetti Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
          />

          {/* Match Content */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.1 
            }}
            className="relative z-10 text-center px-8"
          >
            {/* Hearts animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <div className="relative inline-block">
                <motion.i 
                  className="ri-hearts-fill text-8xl text-primary"
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>

            {/* Match photo */}
            {matchPhoto && (
              <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mb-4"
              >
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-primary ring-offset-4 ring-offset-black/60">
                  <img
                    src={matchPhoto}
                    alt={matchName || 'Match'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            )}

            {/* Match text */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-display text-4xl font-bold text-white mb-2"
            >
              É um Match! 💕
            </motion.h2>

            {matchName && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white/80 text-lg mb-6"
              >
                Você e <span className="font-semibold text-white">{matchName}</span> combinaram!
              </motion.p>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-white/60 text-sm"
            >
              Toque para continuar
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
