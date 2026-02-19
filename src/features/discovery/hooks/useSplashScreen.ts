import { useState, useEffect } from 'react';

// Rotas onde o splash NUNCA deve aparecer
const NO_SPLASH_PREFIXES = [
  '/v1',
  '/login',
  '/register',
  '/install',
  '/termos-de-uso',
  '/politica-de-reembolso',
];

function isNoSplashPath(pathname: string): boolean {
  if (pathname === '/') return true;
  return NO_SPLASH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
  );
}

export function useSplashScreen() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Nunca mostrar splash nas rotas do funil e públicas
    if (isNoSplashPath(window.location.pathname)) return;

    // Only show splash screen if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    // Check if splash was already shown this session
    const splashShown = sessionStorage.getItem('splashShown');

    if (isStandalone && !splashShown) {
      setShowSplash(true);
    }
  }, []);

  const completeSplash = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  return { showSplash, completeSplash };
}
