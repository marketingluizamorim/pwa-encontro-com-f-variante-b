import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

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

  // 1. Auth ainda resolvendo — aguarda (é rápido, vem do localStorage)
  if (authLoading) return <LoadingScreen />;

  // 2. Sem usuário — redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Subscription ainda carregando — renderiza children imediatamente
  //    As páginas individuais já têm seus próprios skeletons e tratam
  //    subscription ausente graciosamente. Não bloquear aqui evita
  //    o double-mount que causava o skeleton infinito.
  if (subLoading) {
    return <>{children}</>;
  }

  // 4. Subscription resolvida sem plano ativo — redireciona para planos
  if (!subscription || subscription.tier === 'none') {
    return <Navigate to="/v1/planos" replace />;
  }

  return <>{children}</>;
}
