import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/app/AppLayout";
import SplashScreen from "@/components/app/SplashScreen";
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
import WelcomeV1 from "./pages/funnel/v1/Welcome";
import GenderV1 from "./pages/funnel/v1/Gender";
import QuizV1 from "./pages/funnel/v1/Quiz";
import ProfilesV1 from "./pages/funnel/v1/Profiles";
import PlansV1 from "./pages/funnel/v1/Plans";

// Protected app pages
import Discover from "./pages/app/Discover";
import Matches from "./pages/app/Matches";
import Chat from "./pages/app/Chat";
import ChatRoom from "./pages/app/ChatRoom";
import Profile from "./pages/app/Profile";
import ProfileSetup from "./pages/app/ProfileSetup";
import ProfileEdit from "./pages/app/ProfileEdit";
import Onboarding from "./pages/app/Onboarding";
import Settings from "./pages/app/Settings";

const queryClient = new QueryClient();

const AppContent = () => {
  const { showSplash, completeSplash } = useSplashScreen();

  return (
    <>
      {showSplash && <SplashScreen onComplete={completeSplash} />}
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Landing />} />

            {/* Funnel V1 routes */}
            <Route path="/v1" element={<WelcomeV1 />} />
            <Route path="/v1/genero" element={<GenderV1 />} />
            <Route path="/v1/quiz" element={<QuizV1 />} />
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
