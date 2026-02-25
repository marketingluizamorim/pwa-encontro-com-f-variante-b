import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect, useState, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/features/discovery/hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocationModal } from '@/contexts/LocationModalContext';
import { WifiOff } from 'lucide-react';

const navItems = [
  { to: '/app/discover', icon: 'ri-compass-3-fill', inactiveIcon: 'ri-compass-3-line', label: 'Descobrir', notificationKey: 'discover' as const },
  { to: '/app/explore', icon: 'ri-star-fill', inactiveIcon: 'ri-star-line', label: 'Explorar', notificationKey: 'explore' as const },
  { to: '/app/matches', icon: 'ri-heart-3-fill', inactiveIcon: 'ri-heart-3-line', label: 'Curtidas', notificationKey: 'matches' as const },
  { to: '/app/chat', icon: 'ri-chat-3-fill', inactiveIcon: 'ri-chat-3-line', label: 'Mensagens', notificationKey: 'chat' as const },
  { to: '/app/profile', icon: 'ri-user-3-fill', inactiveIcon: 'ri-user-3-line', label: 'Perfil', notificationKey: null },
];

const TabDiscover = lazy(() => import('../pages/Discover'));
const TabExplore = lazy(() => import('../pages/Explore'));
const TabMatches = lazy(() => import('../pages/Matches'));
const TabChat = lazy(() => import('../pages/Chat'));
const TabProfile = lazy(() => import('../pages/Profile'));

export function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, clearNotification } = useNotifications();
  const queryClient = useQueryClient();
  const { showLocationModal, shakeModal } = useLocationModal();
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOnline(window.navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // Prefetch critical queries so child pages render instantly (no skeleton)
  useEffect(() => {
    if (!user) return;

    // Only prefetch if not already cached
    const prefetchIfMissing = async (key: unknown[], fetcher: () => Promise<unknown>) => {
      const cached = queryClient.getQueryData(key);
      if (cached !== undefined) return; // already in cache
      try {
        await queryClient.prefetchQuery({ queryKey: key, queryFn: fetcher, staleTime: 1000 * 60 * 5 });
      } catch {
        // Non-critical — pages handle their own error states
      }
    };

    // Prefetch conversations (Chat page)
    prefetchIfMissing(['conversations', user.id], async () => {
      const { data: matches } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id, created_at')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_active', true);
      if (!matches || matches.length === 0) return [];
      const otherIds = matches.map(m => m.user1_id === user.id ? m.user2_id : m.user1_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, photos, birth_date, bio, occupation, city, state, looking_for, christian_interests, religion, gender, pets, drink, smoke, physical_activity, church_frequency, about_children, education, languages, social_media, last_active_at, show_online_status, show_last_active')
        .in('user_id', otherIds);
      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]));
      const matchIds = matches.map(m => m.id);
      const { data: msgs } = await supabase
        .from('messages')
        .select('match_id, content, created_at, sender_id, is_read')
        .in('match_id', matchIds)
        .order('created_at', { ascending: false });
      const lastMsgByMatch = new Map<string, typeof msgs extends (infer T)[] | null ? T : never>();
      for (const msg of (msgs || [])) {
        if (!lastMsgByMatch.has(msg.match_id)) lastMsgByMatch.set(msg.match_id, msg);
      }
      return matches.map(m => {
        const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
        const profile = profilesMap.get(otherId);
        if (!profile) return null;
        const lastMsg = lastMsgByMatch.get(m.id);
        return {
          id: 'conv-' + m.id, match_id: m.id, created_at: m.created_at,
          profile: { id: profile.user_id, display_name: profile.display_name || 'Usuário', avatar_url: profile.avatar_url, photos: profile.photos || [], ...profile },
          last_message: lastMsg ? { content: lastMsg.content, created_at: lastMsg.created_at, is_read: lastMsg.is_read, sender_id: lastMsg.sender_id } : undefined
        };
      }).filter(Boolean);
    });

    // Prefetch profile (Profile page)
    prefetchIfMissing(['profile', user.id], async () => {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      return data;
    });

    // Prefetch likes count (Matches page)
    prefetchIfMissing(['likes', user.id], async () => {
      const { data: mySwipes } = await supabase.from('swipes').select('swiped_id').eq('swiper_id', user.id);
      const mySwipedIds = new Set(mySwipes?.map(s => s.swiped_id));
      const { data: swipesData } = await supabase
        .from('swipes').select('created_at, swiper_id, message, direction')
        .eq('swiped_id', user.id).in('direction', ['like', 'super_like'])
        .order('created_at', { ascending: false });
      const pendingIds = (swipesData || []).map(s => s.swiper_id).filter(id => !mySwipedIds.has(id));
      if (pendingIds.length === 0) return [];
      const { data: profiles } = await supabase.from('profiles')
        .select('user_id, display_name, birth_date, avatar_url, photos, bio, city, state, religion, looking_for, gender')
        .in('user_id', pendingIds);
      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]));
      return (swipesData || []).filter(s => pendingIds.includes(s.swiper_id)).map(s => {
        const profile = profilesMap.get(s.swiper_id);
        if (!profile) return null;
        return { id: s.swiper_id, user_id: s.swiper_id, liked_at: s.created_at, message: s.message, is_super_like: s.direction === 'super_like', profile };
      }).filter(Boolean);
    });

  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Check if we are in the Discover page to apply special layout rules
  const isDiscover = location.pathname.includes('/discover');

  // Reset notification when user visits a section
  useEffect(() => {
    if (location.pathname.includes('/discover')) {
      clearNotification('discover');
    } else if (location.pathname.includes('/explore')) {
      clearNotification('explore');
    } else if (location.pathname.includes('/matches')) {
      clearNotification('matches');
    } else if (location.pathname.includes('/chat')) {
      clearNotification('chat');
    }
  }, [location.pathname]);

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
        <AnimatePresence mode="wait">
          {!isOnline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-center gap-2 sticky top-0 z-50 backdrop-blur-md"
            >
              <WifiOff className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Você está offline · Algumas funções podem estar limitadas</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Suspense fallback={
          <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
          </div>
        }>
          <div className={cn("h-full w-full", location.pathname !== '/app/discover' && "hidden")}>
            <TabDiscover />
          </div>
          <div className={cn("h-full w-full", location.pathname !== '/app/explore' && "hidden")}>
            <TabExplore />
          </div>
          <div className={cn("h-full w-full", location.pathname !== '/app/matches' && "hidden")}>
            <TabMatches />
          </div>
          <div className={cn("h-full w-full", location.pathname !== '/app/chat' && "hidden")}>
            <TabChat />
          </div>
          <div className={cn("h-full w-full", location.pathname !== '/app/profile' && "hidden")}>
            <TabProfile />
          </div>

          <div className={cn("h-full w-full", ![
            '/app/discover',
            '/app/explore',
            '/app/matches',
            '/app/chat',
            '/app/profile'
          ].includes(location.pathname) ? "block" : "hidden")}>
            <Outlet />
          </div>
        </Suspense>
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="relative z-50 pt-2 shrink-0 flex justify-center px-4 pointer-events-none" style={{ paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom) * 0.8)' }}>
        <div className="pointer-events-auto bg-[#1e293b]/95 backdrop-blur-2xl border border-white/10 rounded-full px-5 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_15px_rgba(255,255,255,0.03)] flex items-center justify-between w-full max-w-[calc(min(450px,94vw))] gap-1 ring-1 ring-white/10 transition-all duration-500">
          {navItems.map((item) => {
            {/* 
               IMPORTANT: isActive check using strict segment matching to prevent multiple highlights.
               We check the 3rd segment of the path (e.g., 'discover', 'explore') to ensure precision.
            */}
            const pathSegments = location.pathname.split('/');
            const itemSegments = item.to.split('/');
            const isActive = pathSegments[2] === itemSegments[2];

            // Determinar se há notificação para este item usando a chave direta
            const hasNotification = item.notificationKey ? notifications[item.notificationKey] : false;

            return (
              <Link
                key={item.to}
                to={item.to}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                onClick={(e) => {
                  // If location modal is open, block navigation and shake the modal
                  if (showLocationModal && !isActive) {
                    e.preventDefault();
                    shakeModal();
                  }
                }}
                className={cn(
                  "relative group flex flex-col items-center justify-center flex-1 py-1 outline-none ring-0 focus:ring-0 focus:outline-none select-none active:bg-transparent touch-none transition-transform active:scale-90",
                  isActive && "pointer-events-none"
                )}
              >
                {/* Indicador de Notificação */}
                {item.notificationKey === 'matches' && notifications && notifications.likesCount > 0 ? (
                  <div className="absolute top-0 right-[22%] min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] leading-none font-bold rounded-full flex items-center justify-center border border-[#1e293b] z-20 shadow-sm px-1 animate-in zoom-in duration-300">
                    {notifications.likesCount > 99 ? '99+' : notifications.likesCount}
                  </div>
                ) : hasNotification && !isActive && (
                  <div className="absolute top-0 right-[28%] w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse z-10" />
                )}

                {/* Container do Ícone com Destaque Circular Móvel */}
                <div className="relative flex items-center justify-center mb-1">
                  {/* 
                     Highlight Único: Usamos layoutId para "mover" o brilho entre os ícones.
                     Isso garante que apenas UM destaque exista no DOM ao mesmo tempo.
                  */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-highlight"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                        mass: 1
                      }}
                      className="absolute inset-x-[-8px] inset-y-[-8px] bg-amber-500/15 rounded-full blur-lg z-0 pointer-events-none"
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-circle"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                        mass: 1
                      }}
                      className="absolute inset-x-[-1px] inset-y-[-1px] bg-gradient-to-br from-amber-500/40 to-amber-600/20 rounded-full z-0 pointer-events-none shadow-[0_0_15px_rgba(251,191,36,0.15)] ring-1 ring-white/10"
                    />
                  )}

                  {/* Ícone */}
                  <div className={cn(
                    'relative text-2xl transition-all duration-300 flex items-center justify-center w-10 h-10',
                    isActive
                      ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] scale-105'
                      : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-105'
                  )}>
                    <i className={isActive ? item.icon : item.inactiveIcon} />
                  </div>
                </div>

                {/* Label */}
                <span className={cn(
                  "text-[9px] font-medium tracking-wide transition-all duration-300",
                  isActive
                    ? "text-amber-400 font-semibold"
                    : "text-slate-400 group-hover:text-slate-200"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div >
  );
}
