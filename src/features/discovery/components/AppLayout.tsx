import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/app/discover', icon: 'ri-compass-3-line', label: 'Descobrir' },
  { to: '/app/matches', icon: 'ri-heart-3-line', label: 'Matches' },
  { to: '/app/chat', icon: 'ri-chat-3-line', label: 'Chat' },
  { to: '/app/profile', icon: 'ri-user-3-line', label: 'Perfil' },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const { isMuted, toggleMute } = useSoundSettings();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <i className="ri-hearts-fill text-xl text-primary" />
            <span className="font-display font-semibold text-foreground">Encontro com Fé</span>
          </div>
          <button
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground transition-colors mr-2"
            aria-label={isMuted ? 'Ativar sons' : 'Silenciar'}
          >
            <i className={cn('text-xl', isMuted ? 'ri-volume-mute-line' : 'ri-volume-up-line')} />
          </button>
          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <i className="ri-logout-box-r-line text-xl" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container px-4 py-4">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-around px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <i className={cn(item.icon, 'text-2xl')} />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
