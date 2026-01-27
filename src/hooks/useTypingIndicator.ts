import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseTypingIndicatorOptions {
  matchId: string;
  userId: string;
  otherUserId: string;
}

export function useTypingIndicator({ matchId, userId, otherUserId }: UseTypingIndicatorOptions) {
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingBroadcastRef = useRef<number>(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Clear other user typing after 3 seconds of no updates
  const clearTypingTimeout = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsOtherUserTyping(false);
    }, 3000);
  }, []);

  // Subscribe to typing events
  useEffect(() => {
    const channel = supabase.channel(`typing:${matchId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, is_typing } = payload.payload as { user_id: string; is_typing: boolean };
        
        if (user_id === otherUserId) {
          setIsOtherUserTyping(is_typing);
          if (is_typing) {
            clearTypingTimeout();
          }
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [matchId, otherUserId, clearTypingTimeout]);

  // Broadcast typing status (throttled to once per second)
  const broadcastTyping = useCallback((isTyping: boolean) => {
    const now = Date.now();
    
    // Throttle broadcasts to once per second for "is typing" events
    if (isTyping && now - lastTypingBroadcastRef.current < 1000) {
      return;
    }
    
    lastTypingBroadcastRef.current = now;
    
    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: userId,
        is_typing: isTyping,
      },
    });
  }, [userId]);

  // Stop typing broadcast
  const stopTyping = useCallback(() => {
    broadcastTyping(false);
  }, [broadcastTyping]);

  return {
    isOtherUserTyping,
    broadcastTyping,
    stopTyping,
  };
}
