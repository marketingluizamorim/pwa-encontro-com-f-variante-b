import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useUTMTracking } from "@/hooks/useUTMTracking";

// Funil
import Landing from "@/features/funnel/pages/Landing";
import Gender from "@/features/funnel/pages/Gender";
import Quiz from "@/features/funnel/pages/Quiz";
import Analysis from "@/features/funnel/pages/Analysis";
import Profiles from "@/features/funnel/pages/Profiles";
import Plans from "@/features/funnel/pages/Plans";
const Register = lazy(() => import("@/features/funnel/pages/Register"));

// Legal
const TermosDeUso = lazy(() => import("@/features/legal/pages/TermosDeUso"));
const PoliticaDeReembolso = lazy(() => import("@/features/legal/pages/PoliticaDeReembolso"));

// 404
const NotFound = lazy(() => import("@/features/shared/pages/public/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

function UTMGate({ children }: { children: React.ReactNode }) {
  useUTMTracking();
  return <>{children}</>;
}

function AppFallback() {
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f0f1a",
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "3px solid #7c3aed33",
        borderTopColor: "#7c3aed",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <UTMGate>
            <Suspense fallback={<AppFallback />}>
              <Routes>
                {/* Funil principal */}
                <Route path="/" element={<Landing />} />
                <Route path="/genero" element={<Gender />} />
                <Route path="/quiz/:step?" element={<Quiz />} />
                <Route path="/analise" element={<Analysis />} />
                <Route path="/perfis" element={<Profiles />} />
                <Route path="/planos" element={<Plans />} />

                {/* Legal */}
                <Route path="/termos-de-uso" element={<TermosDeUso />} />
                <Route path="/politica-de-reembolso" element={<PoliticaDeReembolso />} />

                {/* Redirects de URLs antigas */}
                <Route path="/v1" element={<Navigate to="/" replace />} />
                <Route path="/v1/genero" element={<Navigate to="/genero" replace />} />
                <Route path="/v1/quiz/:step?" element={<Navigate to="/quiz" replace />} />
                <Route path="/v1/analise" element={<Navigate to="/analise" replace />} />
                <Route path="/v1/perfis" element={<Navigate to="/perfis" replace />} />
                <Route path="/v1/planos" element={<Navigate to="/planos" replace />} />

                {/* Rotas removidas — redirect para início */}
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<Navigate to="/" replace />} />
                <Route path="/reset-password" element={<Navigate to="/" replace />} />
                <Route path="/convite" element={<Navigate to="/" replace />} />
                <Route path="/install" element={<Navigate to="/" replace />} />
                <Route path="/app/*" element={<Navigate to="/" replace />} />
                <Route path="/admin/*" element={<Navigate to="/" replace />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </UTMGate>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
