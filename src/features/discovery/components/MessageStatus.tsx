import { cn } from '@/lib/utils';

interface MessageStatusProps {
  isRead: boolean;
  isSending?: boolean;
  className?: string;
}

export function MessageStatus({ isRead, isSending, className }: MessageStatusProps) {
  if (isSending) {
    // Sending - clock icon
    return (
      <i className={cn('ri-time-line ml-1 opacity-70', className)} />
    );
  }

  if (isRead) {
    // Read - blue double check
    return (
      <i className={cn('ri-check-double-line ml-1 text-sky-400', className)} />
    );
  }

  // Delivered - gray double check
  return (
    <i className={cn('ri-check-double-line ml-1 opacity-70', className)} />
  );
}
