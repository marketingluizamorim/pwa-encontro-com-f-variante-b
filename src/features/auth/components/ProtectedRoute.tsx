import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { PlanExpiredModal } from '@/features/discovery/components/PlanExpiredModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
    <div className="text-center text-white">
      <i className="ri-loader-4-line text-4xl animate-spin mb-4" />
      <p className="font-display text-xl">Carregando...</p>
    </div>
  </div>
);

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const location = useLocation();

  // 1. Auth ainda resolvendo — aguarda
  if (authLoading) return <LoadingScreen />;

  // 2. Sem usuário — redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Subscription ainda carregando — renderiza children imediatamente
  if (subLoading) {
    return <>{children}</>;
  }

  // 4. Nunca teve plano — redireciona para o funil de vendas
  if (!subscription || subscription.tier === 'none') {
    return <Navigate to="/v1/planos" replace />;
  }

  // 5. Plano expirado (tier resolvido mas isActive = false) 
  // → Mostra modal de renovação sobre o conteúdo atual
  if (!subscription.isActive) {
    return (
      <>
        {children}
        <PlanExpiredModal open previousTier={subscription.tier} />
      </>
    );
  }

  return <>{children}</>;
}
