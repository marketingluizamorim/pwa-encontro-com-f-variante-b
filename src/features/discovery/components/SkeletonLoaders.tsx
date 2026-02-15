import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Base skeleton with shimmer animation
function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        'bg-muted rounded-md relative overflow-hidden',
        className
      )}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
}

// Profile card skeleton for Discover page
export function ProfileCardSkeleton() {
  return (
    <div className="h-full rounded-3xl overflow-hidden shadow-2xl relative bg-muted">
      {/* Image placeholder */}
      <Skeleton className="absolute inset-0 rounded-none" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-10" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

// Stacked cards skeleton for Discover loading - Matches Discover.tsx layout strictly
export function DiscoverSkeleton() {
  return (
    <div className="relative w-full h-full flex flex-col items-center bg-background overflow-hidden">
      {/* Header Placeholder */}
      <div className="w-full h-16 flex items-center justify-between px-6 shrink-0 z-50">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Card Stack Container - Matches real page layout */}
      <div className="flex-1 w-full max-w-md relative flex items-center justify-center pb-24 px-4">

        {/* Background Card Preview */}
        <div className="absolute inset-x-4 top-4 bottom-28 z-0">
          <div className="w-full h-full bg-muted/40 rounded-[2rem] border border-border/10 scale-95 translate-y-2 opacity-60" />
        </div>

        {/* Main Card */}
        <div className="w-full h-full z-20 relative">
          <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-sm border border-border/5 bg-muted relative">
            <Skeleton className="absolute inset-0 rounded-none w-full h-full" />

            {/* Gradient & Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4 z-20">
              <div className="flex items-end gap-3">
                <Skeleton className="h-8 w-48 bg-white/20" />
                <Skeleton className="h-6 w-12 bg-white/20" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-white/20" />
                <Skeleton className="h-5 w-40 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Absolutely positioned to match real page */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center items-center gap-6 pb-2">
        <Skeleton className="w-14 h-14 rounded-full border border-red-500/20 bg-background/80" />
        <Skeleton className="w-11 h-11 rounded-full border border-blue-500/20 bg-background/80 mb-2" />
        <Skeleton className="w-14 h-14 rounded-full border border-green-500/20 bg-background/80" />

        {/* Filter Button Placeholder */}
        <div className="absolute right-6">
          <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

// Conversation item skeleton
export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3">
      <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

// Chat list skeleton
export function ChatListSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-8 w-32 mb-1" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <ConversationSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Match card skeleton (horizontal)
export function MatchCardSkeleton() {
  return (
    <div className="flex-shrink-0 text-center">
      <Skeleton className="w-20 h-20 rounded-full mx-auto mb-2" />
      <Skeleton className="h-4 w-16 mx-auto" />
    </div>
  );
}

// Matches page skeleton
export function MatchesListSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-24 mb-1" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* New Matches horizontal */}
      <div>
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* All Matches list */}
      <div>
        <Skeleton className="h-5 w-36 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="w-6 h-6 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Profile page skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="text-center">
        <Skeleton className="w-28 h-28 rounded-full mx-auto mb-4" />
        <Skeleton className="h-8 w-40 mx-auto mb-2" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>

      {/* Bio */}
      <Skeleton className="h-20 w-full rounded-xl" />

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl col-span-2" />
      </div>

      {/* Interests */}
      <div>
        <Skeleton className="h-5 w-24 mb-2" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2 pt-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
