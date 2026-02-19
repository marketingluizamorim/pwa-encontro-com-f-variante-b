import { useState } from 'react';

// Rotas onde o splash NUNCA deve aparecer
const NO_SPLASH_PREFIXES = [
  '/v1',
  '/login',
  '/register',
  '/install',
  '/termos-de-uso',
  '/politica-de-reembolso',
];

function shouldShowSplash(): boolean {
  // Bloqueia nas rotas públicas e do funil — verificação síncrona, antes do primeiro render
  const path = window.location.pathname;
  if (path === '/') return false;
  if (NO_SPLASH_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))) return false;

  // Só mostra em PWA instalado (standalone)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  // Não mostrar se já foi exibido nesta sessão
  const splashShown = sessionStorage.getItem('splashShown') === 'true';

  return isStandalone && !splashShown;
}

export function useSplashScreen() {
  // Inicializador síncrono: decide ANTES do primeiro render — zero janela de tempo
  const [showSplash, setShowSplash] = useState<boolean>(() => shouldShowSplash());

  const completeSplash = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  return { showSplash, completeSplash };
}

