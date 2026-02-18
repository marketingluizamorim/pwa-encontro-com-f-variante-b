import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, Share, MoreVertical, Download, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
  });

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as { standalone?: boolean }).standalone === true) {
      setIsInstalled(true);
    }

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as { MSStream?: unknown }).MSStream;
    const isAndroid = /Android/.test(ua);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isChrome = /Chrome/.test(ua) && !/Edge/.test(ua);

    setDeviceInfo({ isIOS, isAndroid, isSafari, isChrome });

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.info("Use a opção 'Adicionar à tela inicial' no menu do seu navegador.", {
        id: 'install-info',
        duration: 4000
      });
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

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
            {/* Step 1 */}
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

            {/* Step 2 */}
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

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5 mt-0.5">
                <span className="text-sm font-bold text-white/80">3</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                Clique em <span className="text-blue-400 font-bold">Adicionar</span> no canto superior direito.
              </p>
            </div>
          </div>
        </motion.div>
      );
    }

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
          {/* Step 1 */}
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

          {/* Step 2 */}
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

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5 mt-0.5">
              <span className="text-sm font-bold text-white/80">3</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Confirme a instalação e o app aparecerá em sua lista de aplicativos.
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-[100dvh] bg-[#020617] flex flex-col items-center px-5 relative overflow-x-hidden overflow-y-auto">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[70%] bg-primary/10 blur-[150px] rounded-full opacity-40 animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full opacity-30" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 pointer-events-none mix-blend-overlay" />
      </div>

      {/* Back button — fixed, respects safe area */}
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

      {/* Main content — vertically centered */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center justify-center min-h-full gap-4 py-20">

        {/* Hero Branding */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, delay: 0.1 }}
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

