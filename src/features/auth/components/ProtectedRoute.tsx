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
  if (authLoading || (subLoading && !isError)) return <LoadingScreen />;

  // 2. Erro Crítico no Carregamento
  if (isError && !subscription && user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-center">
        <div className="max-w-xs space-y-4">
          <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-3xl text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Ops! Algo deu errado</h2>
          <p className="text-sm text-white/60">
            Não conseguimos validar seu acesso. Verifique sua conexão e tente novamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold active:scale-95 transition-transform"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // 3. Sem usuário — redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Nunca teve plano — redireciona para o funil de vendas (EXCETO se estiver configurando perfil)
  if ((!subscription || subscription.tier === 'none') && !isProfileSetupRoute) {
    return <Navigate to="/v1/planos" replace />;
  }

  // 5. Plano expirado ou inativo — Mostra modal de renovação e BLOQUEIA acesso (EXCETO se estiver configurando perfil)
  if (!subscription?.isActive && !isProfileSetupRoute) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <PlanExpiredModal open previousTier={subscription?.tier} />
      </div>
    );
  }

  return <>{children}</>;
}
