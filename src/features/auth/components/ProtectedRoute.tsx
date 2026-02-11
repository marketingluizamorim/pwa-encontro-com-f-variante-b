import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const location = useLocation();

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen gradient-welcome flex items-center justify-center">
        <div className="text-center text-white">
          <i className="ri-loader-4-line text-4xl animate-spin mb-4" />
          <p className="font-display text-xl">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce "No Guest" rule: Logged in users must have a plan
  if (!subscription || subscription.tier === 'none') {
    return <Navigate to="/v1/planos" replace />;
  }

  return <>{children}</>;
}
