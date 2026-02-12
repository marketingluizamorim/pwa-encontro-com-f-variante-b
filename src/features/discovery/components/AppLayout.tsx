import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
// import { motion } from 'framer-motion';

const navItems = [
  { to: '/app/discover', icon: 'ri-compass-3-fill', inactiveIcon: 'ri-compass-3-line', label: 'Descobrir' },
  { to: '/app/explore', icon: 'ri-magic-line', inactiveIcon: 'ri-magic-line', label: 'Explorar' },
  { to: '/app/matches', icon: 'ri-heart-3-fill', inactiveIcon: 'ri-heart-3-line', label: 'Curtidas' },
  { to: '/app/chat', icon: 'ri-chat-3-fill', inactiveIcon: 'ri-chat-3-line', label: 'Mensagens' },
  { to: '/app/profile', icon: 'ri-user-3-fill', inactiveIcon: 'ri-user-3-line', label: 'Perfil' },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    // Use theme-aware background colors
    <div className={cn("relative w-full h-[100dvh] overflow-hidden bg-background text-foreground flex flex-col font-sans transition-colors duration-500")}>

      {/* Background Ambience (Global - Clean & Premium) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Main ambient light - Top Center (Teal/Blue mix) */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500/10 dark:from-teal-900/30 via-background/0 to-transparent blur-[80px]" />

        {/* Bottom warm light - (Amber/Gold mix) for grounding */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[100%] h-[40%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 dark:from-amber-900/15 via-background/0 to-transparent blur-[100px]" />

        {/* Global Noise Texture for cinematic feel */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide">
        <Outlet />
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="relative z-50 py-6 shrink-0 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto bg-background/80 dark:bg-[#0f172a]/95 backdrop-blur-xl dark:backdrop-blur-2xl border border-border/40 dark:border-white/10 rounded-full px-4 py-2 shadow-lg dark:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_15px_rgba(255,255,255,0.03)] flex items-center justify-between w-full max-w-[360px] ring-1 ring-black/5 dark:ring-white/10 transition-colors duration-500">
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
                    : 'text-muted-foreground group-hover:text-foreground'
                )}>
                  <i className={isActive ? item.icon : item.inactiveIcon} />
                </div>

                <span className={cn(
                  "text-[10px] font-medium tracking-wide transition-all duration-300",
                  isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
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
