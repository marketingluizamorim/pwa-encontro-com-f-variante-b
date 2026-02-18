import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useEffect, useRef, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const LoadingScreen = () => (
  <div className="min-h-screen gradient-welcome flex items-center justify-center">
    <div className="text-center text-white">
      <i className="ri-loader-4-line text-4xl animate-spin mb-4" />
      <p className="font-display text-xl">Carregando...</p>
    </div>
  </div>
);

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const {
    data: subscription,
    isLoading: subLoading,
    isError: subError,
    fetchStatus,
  } = useSubscription();
  const location = useLocation();

  // Safety timeout: if subscription query hangs for more than 8s, stop waiting
  const [subTimedOut, setSubTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Start timeout only when auth is resolved and user exists
    if (!authLoading && user && subLoading && fetchStatus === 'fetching') {
      timerRef.current = setTimeout(() => setSubTimedOut(true), 8000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [authLoading, user, subLoading, fetchStatus]);

  // Reset timeout flag when subscription resolves
  useEffect(() => {
    if (!subLoading) setSubTimedOut(false);
  }, [subLoading]);

  // 1. Auth still resolving — wait
  if (authLoading) return <LoadingScreen />;

  // 2. No user at all — go to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Subscription query in-flight — wait (but not forever)
  if (subLoading && fetchStatus === 'fetching' && !subTimedOut) {
    return <LoadingScreen />;
  }

  // 4. Query errored or timed out — treat as no subscription to avoid
  //    infinite loading, but DO NOT redirect (let user stay on current page)
  if (subError || subTimedOut) {
    // Render children anyway; individual pages handle missing subscription
    return <>{children}</>;
  }

  // 5. Query resolved but user has no active plan — redirect to plans
  if (!subscription || subscription.tier === 'none') {
    return <Navigate to="/v1/planos" replace />;
  }

  return <>{children}</>;
}
