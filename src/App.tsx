import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { AppLayout } from "@/features/discovery/components/AppLayout";
import SplashScreen from "@/features/discovery/components/SplashScreen";
import { useSplashScreen } from "@/features/discovery/hooks/useSplashScreen";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";

// Static imports for critical path (Performance)
import Landing from "@/features/funnel/pages/Landing";
import GenderV1 from "@/features/funnel/pages/Gender";
import QuizV1 from "@/features/funnel/pages/Quiz";
import AnalysisV1 from "@/features/funnel/pages/Analysis";
import ProfilesV1 from "@/features/funnel/pages/Profiles";
import PlansV1 from "@/features/funnel/pages/Plans";

// Lazy load secondary public pages
const Install = lazy(() => import("./pages/public/Install"));
const Construction = lazy(() => import("./pages/public/Construction"));
const NotFound = lazy(() => import("./pages/public/NotFound"));

// Lazy load auth pages
const Login = lazy(() => import("@/features/auth/pages/Login"));
const Register = lazy(() => import("@/features/auth/pages/Register"));

// Lazy load legal pages
const TermosDeUso = lazy(() => import("./pages/legal/TermosDeUso"));
const PoliticaDeReembolso = lazy(() => import("./pages/legal/PoliticaDeReembolso"));



// Lazy load protected app pages (Discovery)
const Discover = lazy(() => import("@/features/discovery/pages/Discover"));
const Matches = lazy(() => import("@/features/discovery/pages/Matches"));
const Chat = lazy(() => import("@/features/discovery/pages/Chat"));
const ChatRoom = lazy(() => import("@/features/discovery/pages/ChatRoom"));
const Profile = lazy(() => import("@/features/discovery/pages/Profile"));
const ProfileSetup = lazy(() => import("@/features/discovery/pages/ProfileSetup"));
const ProfileEdit = lazy(() => import("@/features/discovery/pages/ProfileEdit"));
const Onboarding = lazy(() => import("@/features/discovery/pages/Onboarding"));
const Settings = lazy(() => import("@/features/discovery/pages/Settings"));

const queryClient = new QueryClient();

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">Carregando...</p>
    </div>
  </div>
);

const AppContent = () => {
  const { showSplash, completeSplash } = useSplashScreen();
  console.log("AppContent rendering, showSplash:", showSplash);

  return (
    <>
      {showSplash && <SplashScreen onComplete={completeSplash} />}
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<Construction />} />

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
                <Route path="matches" element={<Matches />} />
                <Route path="chat" element={<Chat />} />
                <Route path="profile" element={<Profile />} />
                <Route path="profile/:userId" element={<Profile />} />
              </Route>

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

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
