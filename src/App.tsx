import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { AppLayout } from "@/features/discovery/components/AppLayout";
import SplashScreen from "@/features/discovery/components/SplashScreen";
import { useSplashScreen } from "@/features/discovery/hooks/useSplashScreen";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { LocationModalProvider } from "@/contexts/LocationModalContext";

// Rotas onde o splash NUNCA deve aparecer
const NO_SPLASH_ROUTES = [
  '/v1',
  '/login',
  '/register',
  '/install',
  '/termos-de-uso',
  '/politica-de-reembolso',
];

function SplashGate() {
  const { showSplash, completeSplash } = useSplashScreen();
  const location = useLocation();

  // Splash ONLY on /app/* routes — never on funnel, public or root
  const isNoSplashRoute =
    location.pathname === '/' ||
    NO_SPLASH_ROUTES.some(
      (route) =>
        location.pathname === route ||
        location.pathname.startsWith(route + '/'),
    );

  if (!showSplash || isNoSplashRoute) return null;
  return <SplashScreen onComplete={completeSplash} />;
}


// Static imports for critical path (Performance)
import Landing from "@/features/funnel/pages/Landing";
import GenderV1 from "@/features/funnel/pages/Gender";
import QuizV1 from "@/features/funnel/pages/Quiz";
import AnalysisV1 from "@/features/funnel/pages/Analysis";
import ProfilesV1 from "@/features/funnel/pages/Profiles";
import PlansV1 from "@/features/funnel/pages/Plans";

// Auth pages — static so login appears instantly after HTML splash (no double loader)
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";

// Lazy load secondary public pages
const Install = lazy(() => import("./pages/public/Install"));
const Construction = lazy(() => import("./pages/public/Construction"));
const NotFound = lazy(() => import("./pages/public/NotFound"));


// Lazy load legal pages
const TermosDeUso = lazy(() => import("./pages/legal/TermosDeUso"));
const PoliticaDeReembolso = lazy(() => import("./pages/legal/PoliticaDeReembolso"));



// Lazy load protected app pages (Discovery)
const Discover = lazy(() => import("@/features/discovery/pages/Discover"));
const Matches = lazy(() => import("@/features/discovery/pages/Matches"));
const Chat = lazy(() => import("@/features/discovery/pages/Chat"));
const ChatRoom = lazy(() => import("@/features/discovery/pages/ChatRoom"));
const WelcomeChat = lazy(() => import("@/features/discovery/pages/WelcomeChat"));
const Profile = lazy(() => import("@/features/discovery/pages/Profile"));
const ProfileSetup = lazy(() => import("@/features/discovery/pages/ProfileSetup"));
const ProfileEdit = lazy(() => import("@/features/discovery/pages/ProfileEdit"));
const Onboarding = lazy(() => import("@/features/discovery/pages/Onboarding"));
const Settings = lazy(() => import("@/features/discovery/pages/Settings"));
const Explore = lazy(() => import("@/features/discovery/pages/Explore"));
const AdminPanel = lazy(() => import("./pages/admin/AdminPanel"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      <p className="text-sm text-white/80 animate-pulse">Carregando...</p>
    </div>
  </div>
);

const AppContent = () => {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <LocationModalProvider>
            <SplashGate />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Root redirect */}
                <Route path="/" element={<Login />} />

                {/* Funnel V1 routes */}
                <Route path="/v1" element={<Landing />} />
                <Route path="/v1/genero" element={<GenderV1 />} />
                <Route path="/v1/quiz/:step?" element={<QuizV1 />} />
                <Route path="/v1/analise" element={<AnalysisV1 />} />
                <Route path="/v1/perfis" element={<ProfilesV1 />} />
                <Route path="/v1/planos" element={<PlansV1 />} />

                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/install" element={<Install />} />
                <Route path="/termos-de-uso" element={<TermosDeUso />} />
                <Route path="/politica-de-reembolso" element={<PoliticaDeReembolso />} />

                {/* Protected app routes */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="discover" element={<Discover />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="matches" element={<Matches />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="profile/:userId" element={<Profile />} />
                </Route>

                {/* Welcome Chat — must be before :matchId to avoid route conflicts */}
                <Route
                  path="/app/chat/welcome"
                  element={
                    <ProtectedRoute>
                      <WelcomeChat />
                    </ProtectedRoute>
                  }
                />

                {/* Chat Room (Standalone layout to cover AppLayout) */}
                <Route
                  path="/app/chat/:matchId"
                  element={
                    <ProtectedRoute>
                      <ChatRoom />
                    </ProtectedRoute>
                  }
                />

                {/* Onboarding (protected but different layout) */}
                <Route
                  path="/app/onboarding"
                  element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  }
                />

                {/* Settings (protected but different layout) */}
                <Route
                  path="/app/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                {/* Profile edit (protected but different layout) */}
                <Route
                  path="/app/profile/edit"
                  element={
                    <ProtectedRoute>
                      <ProfileEdit />
                    </ProtectedRoute>
                  }
                />

                {/* Profile setup (protected but different layout) */}
                <Route
                  path="/app/profile/setup"
                  element={
                    <ProtectedRoute>
                      <ProfileSetup />
                    </ProtectedRoute>
                  }
                />

                {/* Admin panel (admin role only) */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </LocationModalProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <TooltipProvider>
        <Sonner position="top-center" closeButton />
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
