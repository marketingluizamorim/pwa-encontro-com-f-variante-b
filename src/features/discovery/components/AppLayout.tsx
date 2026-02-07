import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
// import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { SafetyToolkitDrawer } from './SafetyToolkitDrawer';
import { HelpDrawer } from './HelpDrawer';

const navItems = [
  { to: '/app/discover', icon: 'ri-compass-3-fill', inactiveIcon: 'ri-compass-3-line', label: 'Descobrir' },
  { to: '/app/matches', icon: 'ri-heart-3-fill', inactiveIcon: 'ri-heart-3-line', label: 'Matches' },
  { to: '/app/chat', icon: 'ri-chat-3-fill', inactiveIcon: 'ri-chat-3-line', label: 'Chat' },
  { to: '/app/profile', icon: 'ri-user-3-fill', inactiveIcon: 'ri-user-3-line', label: 'Perfil' },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [showSafety, setShowSafety] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Check if we are in the Discover page to apply special layout rules
  const isDiscover = location.pathname.includes('/discover');

  // Track and update user activity
  useEffect(() => {
    if (!user) return;

    const updateActivity = async () => {
      try {
        const lastUpdate = localStorage.getItem(`last_active_update_${user.id}`);
        const now = Date.now();

        // Só atualiza se passou mais de 2 minutos desde a última atualização no banco
        if (lastUpdate && (now - parseInt(lastUpdate)) < 120000) {
          return;
        }

        const { supabase } = await import('@/integrations/supabase/client');
        await supabase
          .from('profiles')
          .update({ last_active_at: new Date().toISOString() })
          .eq('user_id', user.id);

        localStorage.setItem(`last_active_update_${user.id}`, now.toString());
      } catch (error) {
        console.error('Failed to update activity status:', error);
      }
    };

    updateActivity();
  }, [user, location.pathname]);

  return (
    // Force dark mode for premium feel and use 100dvh for mobile browsers
    <div className={cn("relative w-full h-[100dvh] overflow-hidden bg-background text-foreground flex flex-col font-sans")}>

      {/* Background Ambience (Global) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Modern Top Header */}
      <header className="relative z-50 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo Brand from Landing Page - Scaled Down */}
          <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#d4af37] via-[#fcd34d] to-[#b45309] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-black/10 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner overflow-hidden relative">
              <Heart className="w-5 h-5 text-white fill-white drop-shadow-md" />
            </div>
          </div>

          <h1 className="font-serif font-bold text-xl text-foreground drop-shadow-md tracking-tight">
            Encontro <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fcd34d] to-[#d4af37]">com Fé</span>
          </h1>

          {isDiscover && (
            <div className="hidden xs:flex items-center gap-2 px-2 py-1 rounded-full bg-background/40 backdrop-blur-md border border-border/50 ml-2">
              <i className="ri-fire-fill text-accent text-xs" />
              <span className="text-[10px] font-bold text-accent tracking-wider uppercase">Premium</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {location.pathname.includes('/app/chat') && (
            <button
              onClick={() => setShowSafety(true)}
              className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md border border-border/10 flex items-center justify-center text-foreground/80 hover:bg-background/30 active:scale-95 transition-all outline-none"
            >
              <i className="ri-shield-check-line text-xl" />
            </button>
          )}

          {location.pathname.includes('/app/matches') && (
            <button
              onClick={() => setShowHelp(true)}
              className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md border border-border/10 flex items-center justify-center text-foreground/80 hover:bg-background/30 active:scale-95 transition-all outline-none"
            >
              <i className="ri-question-line text-xl" />
            </button>
          )}

          {isDiscover && (
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md border border-border/10 flex items-center justify-center text-foreground/80 hover:bg-background/30 active:scale-95 transition-all"
            >
              <i className={cn('text-lg', isDarkMode ? 'ri-moon-line' : 'ri-sun-line text-amber-500')} />
            </button>
          )}

          {location.pathname.includes('/profile') && !location.pathname.includes('/edit') && !location.pathname.includes('/setup') && (
            <button
              onClick={() => navigate('/app/settings')}
              className="w-11 h-11 rounded-full bg-background/20 backdrop-blur-md border border-border/10 flex items-center justify-center text-foreground/80 hover:bg-background/30 active:scale-95 transition-all outline-none"
            >
              <i className="ri-settings-3-line text-xl" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide">
        <SafetyToolkitDrawer open={showSafety} onOpenChange={setShowSafety} />
        <HelpDrawer open={showHelp} onOpenChange={setShowHelp} />
        <Outlet />
      </main>

      {/* Floating Bottom Navigation */}
      {/* Floating Bottom Navigation */}
      <nav className="relative z-50 py-6 shrink-0 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto bg-[#0f172a]/90 dark:bg-[#0f172a]/95 backdrop-blur-xl dark:backdrop-blur-2xl border border-white/10 rounded-full px-4 py-2 shadow-lg dark:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_15px_rgba(255,255,255,0.03)] flex items-center justify-between w-full max-w-[320px] ring-1 ring-black/5 dark:ring-white/10">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative group flex flex-col items-center justify-center p-2 min-w-[4rem]"
              >
                <div className={cn(
                  'text-2xl transition-all duration-300 flex items-center justify-center mb-0.5',
                  isActive
                    ? 'text-accent drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]'
                    : 'text-muted-foreground group-hover:text-white/80'
                )}>
                  <i className={isActive ? item.icon : item.inactiveIcon} />
                </div>

                <span className={cn(
                  "text-[10px] font-medium tracking-wide transition-all duration-300",
                  isActive ? "text-accent" : "text-muted-foreground group-hover:text-white/80"
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
