import { useState, useRef, ReactNode, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;
// Safety timeout: force-reset if onRefresh hangs for more than 10s
const REFRESH_TIMEOUT_MS = 10_000;

export function PullToRefresh({ children, onRefresh, className = '' }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isPullingRef = useRef(false);
  const startYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pullDistance = useMotionValue(0);
  const indicatorOpacity = useTransform(pullDistance, [0, 40], [0, 1]);
  const indicatorScale = useTransform(pullDistance, [0, PULL_THRESHOLD], [0.5, 1]);
  // Arrow rotates as you pull — stops at 180° (pointing up = "release to refresh")
  const arrowRotation = useTransform(pullDistance, [0, PULL_THRESHOLD], [0, 180]);

  const resetPull = useCallback(() => {
    isPullingRef.current = false;
    pullDistance.set(0);
  }, [pullDistance]);

  const finishRefresh = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    setIsRefreshing(false);
    triggerHaptic('success');
    // Animate the indicator back up smoothly before hiding
    pullDistance.set(0);
  }, [pullDistance]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    if (scrollTop > 0) return;
    startYRef.current = e.touches[0].clientY;
    isPullingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return;

    const scrollTop = containerRef.current?.scrollTop ?? 0;
    if (scrollTop > 0) {
      resetPull();
      return;
    }

    const diff = e.touches[0].clientY - startYRef.current;
    if (diff <= 0) {
      pullDistance.set(0);
      return;
    }

    // Resistance curve: feels natural, harder to pull past MAX_PULL
    const pull = Math.min(diff * 0.5, MAX_PULL);
    pullDistance.set(pull);

    // Haptic when crossing threshold
    if (pull >= PULL_THRESHOLD) {
      triggerHaptic('light');
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;

    const pull = pullDistance.get();

    if (pull >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic('medium');
      // Hold indicator at a fixed position while refreshing
      pullDistance.set(60);

      // Safety timeout — prevents infinite spinner if onRefresh never resolves
      safetyTimerRef.current = setTimeout(() => {
        finishRefresh();
      }, REFRESH_TIMEOUT_MS);

      try {
        await onRefresh();
      } catch {
        // Swallow errors — the UI should still recover
      } finally {
        finishRefresh();
      }
    } else {
      // Not enough pull — snap back
      pullDistance.set(0);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pull / Refresh Indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center pointer-events-none"
        style={{
          top: useTransform(pullDistance, (v) => v - 48),
          opacity: indicatorOpacity,
          scale: indicatorScale,
        }}
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center shadow-sm">
          {isRefreshing ? (
            /* Spinner: pure CSS animation — no framer-motion conflict */
            <i
              className="ri-loader-4-line text-xl text-primary"
              style={{ animation: 'spin 0.8s linear infinite' }}
            />
          ) : (
            /* Arrow: rotates with pull distance */
            <motion.i
              className="ri-arrow-down-line text-xl text-primary"
              style={{ rotate: arrowRotation }}
            />
          )}
        </div>
      </motion.div>

      {/* Scrollable Content */}
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

      {/* CSS keyframe for spinner — avoids framer-motion animate conflict */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
