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
  const { data: subscription, isLoading: subLoading, isError } = useSubscription();
  const location = useLocation();

  const isProfileSetupRoute =
    location.pathname.startsWith('/app/onboarding') ||
    location.pathname.startsWith('/app/profile/setup') ||
    location.pathname.startsWith('/app/profile/edit');

  // 1. Auth ou Subscription ainda resolvendo — aguarda
  if (authLoading || subLoading) return <LoadingScreen />;

  // 2. Sem usuário — redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Nunca teve plano — redireciona para o funil de vendas (EXCETO se estiver configurando perfil)
  if ((!subscription || subscription.tier === 'none') && !isProfileSetupRoute) {
    return <Navigate to="/v1/planos" replace />;
  }

  // 4. Plano expirado ou inativo — Mostra modal de renovação e BLOQUEIA acesso (EXCETO se estiver configurando perfil)
  if (!subscription?.isActive && !isProfileSetupRoute) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <PlanExpiredModal open previousTier={subscription?.tier} />
      </div>
    );
  }

  return <>{children}</>;
}
