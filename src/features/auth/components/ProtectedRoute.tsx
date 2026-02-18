import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

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
    isFetching: subFetching,
    fetchStatus,
  } = useSubscription();
  const location = useLocation();

  // 1. Auth still resolving — wait
  if (authLoading) return <LoadingScreen />;

  // 2. No user at all — go to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Subscription query is in-flight (initial load or refetch) — wait
  //    fetchStatus === 'idle' means the query is disabled (no user), so we
  //    only block on 'fetching' to avoid a flash-redirect on page refresh.
  if (subLoading || (subFetching && fetchStatus === 'fetching')) {
    return <LoadingScreen />;
  }

  // 4. Query resolved but user has no active plan — redirect to plans
  if (!subscription || subscription.tier === 'none') {
    return <Navigate to="/v1/planos" replace />;
  }

  return <>{children}</>;
}
