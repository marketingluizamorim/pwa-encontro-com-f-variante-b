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
  // TEMPORARIAMENTE DESATIVADO PARA DIAGNÓSTICO
  return false;
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

