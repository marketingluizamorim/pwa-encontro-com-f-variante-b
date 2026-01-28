import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/features/discovery/components/AppLayout";
import SplashScreen from "@/features/discovery/components/SplashScreen";
import { useSplashScreen } from "@/hooks/useSplashScreen";

// Public pages
import Landing from "./pages/public/Landing";
import Install from "./pages/public/Install";
import NotFound from "./pages/public/NotFound";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Legal pages
import TermosDeUso from "./pages/legal/TermosDeUso";
import PoliticaDeReembolso from "./pages/legal/PoliticaDeReembolso";

// Funnel V1 pages

import GenderV1 from "@/features/funnel/pages/Gender";
import QuizV1 from "@/features/funnel/pages/Quiz";
import AnalysisV1 from "@/features/funnel/pages/Analysis";
import ProfilesV1 from "@/features/funnel/pages/Profiles";
import PlansV1 from "@/features/funnel/pages/Plans";

// Protected app pages (Discovery)
import Discover from "@/features/discovery/pages/Discover";
import Matches from "@/features/discovery/pages/Matches";
import Chat from "@/features/discovery/pages/Chat";
import ChatRoom from "@/features/discovery/pages/ChatRoom";
import Profile from "@/features/discovery/pages/Profile";
import ProfileSetup from "@/features/discovery/pages/ProfileSetup";
import ProfileEdit from "@/features/discovery/pages/ProfileEdit";
import Onboarding from "@/features/discovery/pages/Onboarding";
import Settings from "@/features/discovery/pages/Settings";

const queryClient = new QueryClient();

const AppContent = () => {
  const { showSplash, completeSplash } = useSplashScreen();
  console.log("AppContent rendering, showSplash:", showSplash);

  return (
    <>
      {showSplash && <SplashScreen onComplete={completeSplash} />}
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Landing />} />

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
              <Route path="chat/:matchId" element={<ChatRoom />} />
              <Route path="profile" element={<Profile />} />
            </Route>

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
        </AuthProvider>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
