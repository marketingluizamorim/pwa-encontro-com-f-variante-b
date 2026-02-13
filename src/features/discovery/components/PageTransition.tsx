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
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 } as Transition}
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
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 } as Transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
