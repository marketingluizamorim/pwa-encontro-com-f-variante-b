import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, Share, MoreVertical, Download, CheckCircle2, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __pwaInstallPrompt: BeforeInstallPromptEvent | null;
  }
}

export default function Install() {
  const navigate = useNavigate();
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstalledPopup, setShowInstalledPopup] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
  });

  useEffect(() => {
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
    }

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as { MSStream?: unknown }).MSStream;
    const isAndroid = /Android/.test(ua);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isChrome = /Chrome/.test(ua) && !/Edge/.test(ua);

    setDeviceInfo({ isIOS, isAndroid, isSafari, isChrome });

    // Late capture — if browser fires event after React loads
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.__pwaInstallPrompt = e as BeforeInstallPromptEvent;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // ── Install button handler ─────────────────────────────────────────────────
  const handleInstallClick = async () => {
    // Android / Chrome: use deferred prompt captured globally in index.html
    const prompt = window.__pwaInstallPrompt;
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstalledPopup(true);
        window.__pwaInstallPrompt = null;
      }
      return;
    }

    // iOS: no JS API opens the Safari share sheet — show visual guide
    if (deviceInfo.isIOS) {
      setShowIOSGuide(true);
      return;
    }

    // Android without prompt (already dismissed / criteria not met) — show guide
    if (deviceInfo.isAndroid) {
      setShowAndroidGuide(true);
      return;
    }

    // Generic fallback
    toast.info('Siga os passos acima para instalar o app.', {
      id: 'install-info',
      duration: 3000,
    });
  };

  // ── Installed Success Popup ──────────────────────────────────────────────
  const InstalledPopup = () => (
    <AnimatePresence>
      {showInstalledPopup && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Sheet */}
          <motion.div
            className="relative z-10 w-full max-w-sm mx-4 mb-6 bg-[#0f172a] border border-white/10 rounded-3xl p-6 shadow-2xl"
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          >
            {/* Success icon */}
            <motion.div
              className="w-20 h-20 rounded-full bg-green-500/15 border border-green-400/30 flex items-center justify-center mx-auto mb-5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', damping: 12 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.25, type: 'spring', damping: 10 }}
              >
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </motion.div>
            </motion.div>

            {/* Text */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white font-display mb-1">App Instalado! 🎉</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                O <span className="text-primary font-semibold">Encontro com Fé</span> foi adicionado à sua tela inicial.
              </p>
            </div>

            {/* Open button */}
            <Button
              onClick={() => navigate('/login')}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-amber-500 text-black font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
            >
              Abrir o App →
            </Button>

            <button
              onClick={() => setShowInstalledPopup(false)}
              className="w-full mt-3 text-white/30 text-sm hover:text-white/50 transition-colors"
            >
              Fechar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── iOS Guide Overlay ──────────────────────────────────────────────────────
  const IOSGuideOverlay = () => (
    <AnimatePresence>
      {showIOSGuide && (
        <motion.div
          className="fixed inset-0 z-[99999] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowIOSGuide(false)}
          />

          {/* Dismiss */}
          <button
            onClick={() => setShowIOSGuide(false)}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20"
            style={{ marginTop: 'env(safe-area-inset-top)' }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Instruction card */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pb-32 pointer-events-none">
            <motion.div
              className="bg-[#1e293b] border border-white/15 rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
                <Share className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="font-bold text-white text-lg font-display mb-2">
                Toque no botão abaixo
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Toque no ícone{' '}
                <span className="inline-flex items-center justify-center w-6 h-6 bg-white/10 rounded-md mx-0.5 border border-white/10 align-middle">
                  <Share className="w-3.5 h-3.5 text-blue-400" />
                </span>{' '}
                na barra do Safari e selecione{' '}
                <span className="text-blue-400 font-semibold">"Adicionar à Tela de Início"</span>
              </p>
            </motion.div>
          </div>

          {/* Arrow pointing to bottom Safari bar */}
          <div
            className="relative z-10 flex flex-col items-center pb-6 pointer-events-none"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-0.5 h-12 bg-gradient-to-b from-blue-400/0 to-blue-400" />
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '10px solid rgb(96 165 250)',
                }}
              />
            </motion.div>
            <motion.div
              className="mt-2 px-6 py-2 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center gap-2"
              animate={{
                boxShadow: [
                  '0 0 0px 0px rgba(96,165,250,0)',
                  '0 0 0px 8px rgba(96,165,250,0.3)',
                  '0 0 0px 0px rgba(96,165,250,0)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Share className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-semibold text-sm">Botão "Compartilhar" do Safari</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Android Guide Overlay ──────────────────────────────────────────────────
  const AndroidGuideOverlay = () => (
    <AnimatePresence>
      {showAndroidGuide && (
        <motion.div
          className="fixed inset-0 z-[99999] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAndroidGuide(false)}
          />

          {/* Arrow + label — TOP RIGHT pointing to Chrome ⋮ */}
          <div
            className="relative z-10 flex flex-col items-end pr-4 pointer-events-none"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
          >
            <motion.div
              className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-400/40 flex items-center gap-2"
              animate={{
                boxShadow: [
                  '0 0 0px 0px rgba(74,222,128,0)',
                  '0 0 0px 8px rgba(74,222,128,0.3)',
                  '0 0 0px 0px rgba(74,222,128,0)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <MoreVertical className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-semibold text-sm">Menu ⋮ do Chrome</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center mr-5 mt-1"
            >
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '10px solid rgb(74 222 128)',
                }}
              />
              <div className="w-0.5 h-10 bg-gradient-to-b from-green-400 to-green-400/0" />
            </motion.div>
          </div>

          {/* Instruction card */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pointer-events-none">
            <motion.div
              className="bg-[#1e293b] border border-white/15 rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-400/30 flex items-center justify-center mx-auto mb-4">
                <MoreVertical className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="font-bold text-white text-lg font-display mb-2">
                Toque no menu acima
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Toque nos três pontinhos{' '}
                <span className="inline-flex items-center justify-center w-6 h-6 bg-white/10 rounded-md mx-0.5 border border-white/10 align-middle">
                  <MoreVertical className="w-3.5 h-3.5 text-green-400" />
                </span>{' '}
                no canto superior direito do Chrome e selecione{' '}
                <span className="text-green-400 font-semibold">"Adicionar à tela inicial"</span>
              </p>
            </motion.div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setShowAndroidGuide(false)}
            className="relative z-10 mx-auto mb-10 px-6 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/20 transition-all"
          >
            Fechar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Instructions content ───────────────────────────────────────────────────
  const renderInstructions = () => {
    if (isInstalled) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center"
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-500/30">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1 font-display">App Instalado!</h2>
          <p className="text-white/60 mb-4 text-xs">O Encontro com Fé já está pronto na sua tela inicial.</p>
          <Button
            onClick={() => navigate('/app/discover')}
            className="w-full h-11 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-all shadow-lg shadow-white/5 text-sm"
          >
            Abrir Agora
          </Button>
        </motion.div>
      );
    }

    if (deviceInfo.isIOS) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-4 shadow-2xl"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 shrink-0">
              <i className="ri-apple-fill text-2xl text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg font-display tracking-tight">Instalação no iOS</h2>
              <p className="text-[11px] text-blue-400/60 uppercase tracking-widest font-bold">Usando o Safari</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5 mt-0.5">
                <span className="text-sm font-bold text-white/80">1</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                Toque no ícone de{' '}
                <span className="inline-flex items-center justify-center w-7 h-7 bg-white/10 rounded-md mx-0.5 border border-white/10">
                  <Share className="w-3.5 h-3.5" />
                </span>{' '}
                na barra inferior do Safari.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5 mt-0.5">
                <span className="text-sm font-bold text-white/80">2</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-sm text-white/80 leading-relaxed">
                  Procure por "Adicionar à tela inicial" ou
                </p>
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center justify-center gap-1.5 bg-primary/20 hover:bg-primary/40 text-primary px-3 py-2 rounded-lg border border-primary/30 transition-all active:scale-95 font-bold text-sm w-max"
                >
                  <Download className="w-4 h-4" />
                  Clique Aqui
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5 mt-0.5">
                <span className="text-sm font-bold text-white/80">3</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                Clique em <span className="text-blue-400 font-bold">Adicionar</span> no canto superior direito.
              </p>
            </div>

            {/* App list notice */}
            <div className="flex items-center gap-3 mt-2 p-3 rounded-xl bg-blue-500/10 border border-blue-400/20">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <i className="ri-apps-2-line text-base text-blue-400" />
              </div>
              <p className="text-xs text-blue-300/80 leading-relaxed">
                ✅ O app <span className="font-semibold text-blue-300">Encontro com Fé</span> aparecerá na sua lista de aplicativos e na tela inicial.
              </p>
            </div>
          </div>
        </motion.div>
      );
    }

    // Android / Default
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-4 shadow-2xl"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/20 shrink-0">
            <i className="ri-android-fill text-2xl text-green-400" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg font-display tracking-tight">Instalação no Android</h2>
            <p className="text-[11px] text-green-400/60 uppercase tracking-widest font-bold">Chrome e navegadores Android</p>
          </div>
        </div>

        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5 mt-0.5">
              <span className="text-sm font-bold text-white/80">1</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Toque nos três pontinhos{' '}
              <span className="inline-flex items-center justify-center w-7 h-7 bg-white/10 rounded-md mx-0.5 border border-white/10">
                <MoreVertical className="w-3.5 h-3.5" />
              </span>{' '}
              no canto superior.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5 mt-0.5">
              <span className="text-sm font-bold text-white/80">2</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm text-white/80 leading-relaxed">
                Procure por "Adicionar à tela inicial" ou
              </p>
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center justify-center gap-1.5 bg-primary/20 hover:bg-primary/40 text-primary px-3 py-2 rounded-lg border border-primary/30 transition-all active:scale-95 font-bold text-sm w-max"
              >
                <Download className="w-4 h-4" />
                Clique Aqui
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5 mt-0.5">
              <span className="text-sm font-bold text-white/80">3</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Confirme tocando em <span className="text-green-400 font-bold">Instalar</span> — o processo leva apenas alguns segundos.
            </p>
          </div>

          {/* App list notice */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-400/20">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
              <i className="ri-apps-2-line text-base text-green-400" />
            </div>
            <p className="text-xs text-green-300/80 leading-relaxed">
              ✅ O app <span className="font-semibold text-green-300">Encontro com Fé</span> aparecerá na sua lista de aplicativos e na tela inicial.
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="h-[100dvh] bg-[#020617] flex flex-col items-center px-5 relative overflow-x-hidden overflow-y-auto">
      {/* Overlays */}
      <InstalledPopup />
      <IOSGuideOverlay />
      <AndroidGuideOverlay />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[70%] bg-primary/10 blur-[150px] rounded-full opacity-40 animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full opacity-30" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 pointer-events-none mix-blend-overlay" />
      </div>

      {/* Back button */}
      <div
        className="fixed top-0 left-0 right-0 z-20 flex items-start px-5"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center justify-center text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 w-9 h-9 rounded-xl border border-white/5 active:scale-95 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center justify-center min-h-full gap-4 py-20">

        {/* Hero Branding */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 0.1 }}
        >
          <img
            src="/3logo-nova1080x1080.png"
            alt="Encontro com Fé"
            className="w-16 h-16 object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.5)] logo-blend"
          />
        </motion.div>

        {/* Title */}
        <div className="text-center -mt-2">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-display font-bold text-white tracking-tight"
          >
            Instale o App
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/40 leading-relaxed px-2 text-sm font-medium mt-1"
          >
            Adicione o <span className="text-primary font-bold">Encontro com Fé</span> para uma experiência premium.
          </motion.p>
        </div>

        {/* Instructions */}
        <div className="w-full">
          {renderInstructions()}
        </div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full grid grid-cols-3 gap-3"
        >
          {[
            { icon: 'ri-flashlight-line', color: 'text-[#d4af37]', glow: 'drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]', label: 'Acesso\nDireto' },
            { icon: 'ri-notification-3-line', color: 'text-white/60', glow: '', label: 'Notificações\nInteligentes' },
            { icon: 'ri-map-pin-2-line', color: 'text-white/60', glow: '', label: 'Localização\nExata' },
          ].map((item) => (
            <div key={item.icon} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                <i className={`${item.icon} text-2xl ${item.color} ${item.glow}`} />
              </div>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] text-center leading-relaxed whitespace-pre-line">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-1.5"
        >
          <div className="h-px w-8 bg-white/10" />
          <p className="text-[8px] text-white/20 uppercase tracking-[0.4em] font-bold">
            PWA Technology • 2025
          </p>
        </motion.div>
      </div>
    </div>
  );
}
