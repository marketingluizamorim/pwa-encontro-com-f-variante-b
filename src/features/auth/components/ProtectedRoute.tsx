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

// Detect if running as installed PWA (standalone) or in browser
function isPWAInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const location = useLocation();

  // 1. If accessed via browser (not installed PWA), redirect to install page
  if (!isPWAInstalled()) {
    return <Navigate to="/install" replace />;
  }

  // 2. Auth ainda resolvendo — aguarda (é rápido, vem do localStorage)
  if (authLoading) return <LoadingScreen />;

  // 3. Sem usuário — redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Subscription ainda carregando — renderiza children imediatamente
  if (subLoading) {
    return <>{children}</>;
  }

  // 5. Subscription resolvida sem plano ativo — redireciona para planos
  if (!subscription || subscription.tier === 'none') {
    return <Navigate to="/v1/planos" replace />;
  }

  return <>{children}</>;
}

