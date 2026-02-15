import { useState, useEffect } from 'react';

export function useSplashScreen() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
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
