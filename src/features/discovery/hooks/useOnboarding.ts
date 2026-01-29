import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const ONBOARDING_KEY = 'onboarding_completed';

export function useOnboarding() {
  const { user } = useAuth();
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Check localStorage with user-specific key
    const userKey = `${ONBOARDING_KEY}_${user.id}`;
    const completed = localStorage.getItem(userKey) === 'true';
    setIsCompleted(completed);
    setIsLoading(false);
  }, [user]);

  const completeOnboarding = () => {
    if (!user) return;
    const userKey = `${ONBOARDING_KEY}_${user.id}`;
    localStorage.setItem(userKey, 'true');
    setIsCompleted(true);
  };

  const resetOnboarding = () => {
    if (!user) return;
    const userKey = `${ONBOARDING_KEY}_${user.id}`;
    localStorage.removeItem(userKey);
    setIsCompleted(false);
  };

  return {
    isCompleted,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
}
