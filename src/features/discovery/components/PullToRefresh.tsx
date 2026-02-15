import { useState, useRef, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

export function PullToRefresh({ children, onRefresh, className = '' }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  
  const pullDistance = useMotionValue(0);
  const pullProgress = useTransform(pullDistance, [0, PULL_THRESHOLD], [0, 1]);
  const indicatorOpacity = useTransform(pullDistance, [0, 40], [0, 1]);
  const indicatorScale = useTransform(pullDistance, [0, PULL_THRESHOLD], [0.5, 1]);
  const indicatorRotation = useTransform(pullDistance, [0, PULL_THRESHOLD, MAX_PULL], [0, 180, 360]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop > 0) {
      setIsPulling(false);
      return;
    }
    
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop > 0) {
      setIsPulling(false);
      pullDistance.set(0);
      return;
    }
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0) {
      // Apply resistance
      const resistance = 0.5;
      const pull = Math.min(diff * resistance, MAX_PULL);
      pullDistance.set(pull);
      
      // Haptic feedback when reaching threshold
      if (pull >= PULL_THRESHOLD && pullDistance.get() < PULL_THRESHOLD) {
        triggerHaptic('light');
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);
    
    const pull = pullDistance.get();
    
    if (pull >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic('medium');
      
      // Keep indicator visible during refresh
      pullDistance.set(60);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        pullDistance.set(0);
        triggerHaptic('success');
      }
    } else {
      pullDistance.set(0);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pull indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center"
        style={{
          top: useTransform(pullDistance, (v) => v - 50),
          opacity: indicatorOpacity,
          scale: indicatorScale,
        }}
      >
        <motion.div
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
          style={{ rotate: isRefreshing ? undefined : indicatorRotation }}
          animate={isRefreshing ? { rotate: 360 } : undefined}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : undefined}
        >
          {isRefreshing ? (
            <i className="ri-loader-4-line text-xl text-primary" />
          ) : (
            <i className="ri-arrow-down-line text-xl text-primary" />
          )}
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        className="h-full overflow-y-auto"
        style={{ y: pullDistance }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}
