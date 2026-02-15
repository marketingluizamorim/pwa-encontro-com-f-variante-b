import { motion, Transition, HTMLMotionProps } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';

interface PageTransitionProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -8,
  },
};

const pageTransition: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.25,
};

export const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(({ children, className = '', ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      // animation disabled for performance
      initial={undefined}
      animate={undefined}
      exit={undefined}
      variants={undefined}
      transition={{ duration: 0 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});

PageTransition.displayName = 'PageTransition';

// Slide from right variant for navigation forward
export function SlideTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, x: 0 }}
      exit={undefined}
      transition={{ duration: 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale fade for modals/overlays
export function ScaleTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      exit={undefined}
      transition={{ duration: 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
