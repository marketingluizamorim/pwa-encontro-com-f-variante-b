import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, Share, PlusSquare, MoreVertical, Download, CheckCircle2 } from 'lucide-react';

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
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    // Detect Device and Browser
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroid = /Android/.test(ua);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isChrome = /Chrome/.test(ua) && !/Edge/.test(ua);

    setDeviceInfo({ isIOS, isAndroid, isSafari, isChrome });

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
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
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const renderInstructions = () => {
    if (isInstalled) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 font-display">App Instalado!</h2>
          <p className="text-white/60 mb-6 text-sm">O Encontro com Fé já está pronto na sua tela inicial.</p>
          <Button
            onClick={() => navigate('/app/discover')}
            className="w-full h-12 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-all shadow-lg shadow-white/5"
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
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl"
        >
          <div className="flex items-center gap-4 pb-4 border-b border-white/5">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <i className="ri-apple-fill text-2xl text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg font-display tracking-tight">Instalação no iOS</h2>
              <p className="text-[10px] text-blue-400/60 uppercase tracking-widest font-bold">Usando o Safari</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                <span className="text-sm font-bold text-white/80">1</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed pt-1">
                Toque no ícone de <span className="inline-flex items-center justify-center w-7 h-7 bg-white/10 rounded-lg mx-1 border border-white/10"><Share className="w-3.5 h-3.5" /></span> na barra inferior do Safari.
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                <span className="text-sm font-bold text-white/80">2</span>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <p className="text-sm text-white/80 leading-relaxed">
                  Procure por "Adicionar à tela inicial" ou
                </p>
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center justify-center gap-2 bg-primary/20 hover:bg-primary/40 text-primary px-4 py-2 rounded-xl border border-primary/30 transition-all active:scale-95 font-bold text-sm w-max"
                >
                  <Download className="w-4 h-4" />
                  Clique Aqui
                </button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                <span className="text-sm font-bold text-white/80">3</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed pt-1">
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
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl"
      >
        <div className="flex items-center gap-4 pb-4 border-b border-white/5">
          <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-500/20">
            <i className="ri-android-fill text-2xl text-green-400" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg font-display tracking-tight">Instalação no Android</h2>
            <p className="text-[10px] text-green-400/60 uppercase tracking-widest font-bold">Chrome e navegadores Android</p>
          </div>
        </div>

        <div className="space-y-6 text-left">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
              <span className="text-sm font-bold text-white/80">1</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed pt-1">
              Toque nos três pontinhos <span className="inline-flex items-center justify-center w-7 h-7 bg-white/10 rounded-lg mx-1 border border-white/10"><MoreVertical className="w-3.5 h-3.5" /></span> no canto superior.
            </p>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-primary/20 transition-all">
              <span className="text-sm font-bold text-white/80">2</span>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-sm text-white/80 leading-relaxed">
                Procure por "Adicionar à tela inicial" ou
              </p>
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center justify-center gap-2 bg-primary/20 hover:bg-primary/40 text-primary px-4 py-2 rounded-xl border border-primary/30 transition-all active:scale-95 font-bold text-sm w-max"
              >
                <Download className="w-4 h-4" />
                Clique Aqui
              </button>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
              <span className="text-sm font-bold text-white/80">3</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed pt-1">
              Confirme a instalação e o app aparecerá em sua lista de aplicativos.
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center px-6 pt-2 pb-6 relative overflow-x-hidden">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[70%] bg-primary/10 blur-[150px] rounded-full opacity-40 animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full opacity-30" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 pointer-events-none mix-blend-overlay" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Navigation */}
        <header className="w-full flex items-center mt-4 mb-0">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center justify-center text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 w-10 h-10 rounded-xl border border-white/5 active:scale-95 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </header>

        {/* Hero Branding */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, delay: 0.1 }}
          className="relative -mt-4 mb-1"
        >
          <img
            src="/3logo-nova1080x1080.png"
            alt="Encontro com Fé"
            className="relative w-12 h-12 object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.5)] logo-blend"
          />
        </motion.div>

        {/* Main Content */}
        <div className="text-center space-y-0.5 mb-6">
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
            className="text-white/40 leading-relaxed px-4 text-[13px] font-medium"
          >
            Adicione o <span className="text-primary font-bold">Encontro com Fé</span> para uma experiência premium e personalizada.
          </motion.p>
        </div>

        {/* Component to render based on device */}
        <div className="w-full relative px-1">
          {renderInstructions()}
        </div>

        {/* Feature Highlights Group */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full mt-6 grid grid-cols-3 gap-6"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
              <i className="ri-flashlight-line text-2xl text-[#d4af37] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
            </div>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] text-center leading-relaxed">Acesso<br />Direto</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
              <i className="ri-notification-3-line text-2xl text-white/60" />
            </div>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] text-center leading-relaxed">Notificações<br />Inteligentes</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
              <i className="ri-map-pin-2-line text-2xl text-white/60" />
            </div>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] text-center leading-relaxed">Localização<br />Exata</span>
          </div>
        </motion.div>

        {/* Legal Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex flex-col items-center gap-2"
        >
          <div className="h-px w-8 bg-white/10" />
          <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-bold">
            PWA Technology • 2025
          </p>
        </motion.div>
      </div>
    </div>
  );
}
