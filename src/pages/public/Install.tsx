import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

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

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Divine Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#d4af37]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#14b8a6]/5 blur-[120px] rounded-full" />

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          {/* App Icon */}
          {/* App Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="relative group cursor-pointer">
              {/* Divine Halo Effect */}
              <div className="absolute inset-0 bg-[#d4af37]/40 blur-3xl rounded-full scale-150 animate-pulse-slow" style={{ animationDuration: '4s' }} />
              <div className="relative w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#d4af37] via-[#fcd34d] to-[#b45309] shadow-[0_0_40px_rgba(212,175,55,0.3)]">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-black/10 backdrop-blur-3xl flex items-center justify-center border border-white/30 shadow-inner overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-shine pointer-events-none" />
                  <Heart className="w-12 h-12 text-white fill-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
                </div>
              </div>
            </div>
          </motion.div>

          <h1 className="font-display text-3xl font-bold text-white mb-3">
            Instale o App
          </h1>
          <p className="text-white/80 mb-8">
            Adicione nosso aplicativo à sua tela inicial para acesso rápido e experiência completa.
          </p>

          {isInstalled ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white">
                <i className="ri-check-double-line text-4xl text-green-300 mb-2" />
                <h2 className="font-semibold text-xl mb-2">App Instalado!</h2>
                <p className="text-white/80">
                  O Encontro com Fé já está na sua tela inicial.
                </p>
              </div>
              <Button
                onClick={() => navigate('/')}
                className="w-full h-14 rounded-2xl bg-white text-primary font-bold uppercase tracking-wider text-sm shadow-none hover:bg-white/90 transition-all"
              >
                Abrir App
              </Button>
            </motion.div>
          ) : isIOS ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white text-left"
            >
              <h2 className="font-semibold text-lg mb-4 text-center">
                Como instalar no iPhone/iPad
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center shrink-0">
                    <span className="font-bold">1</span>
                  </div>
                  <p>
                    Toque no botão <i className="ri-share-line" /> Compartilhar na barra do Safari
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center shrink-0">
                    <span className="font-bold">2</span>
                  </div>
                  <p>
                    Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center shrink-0">
                    <span className="font-bold">3</span>
                  </div>
                  <p>Toque em <strong>"Adicionar"</strong> no canto superior direito</p>
                </div>
              </div>
            </motion.div>
          ) : deferredPrompt ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <Button
                onClick={handleInstall}
                className="w-full h-14 rounded-2xl gradient-button text-white font-bold uppercase tracking-wider text-sm border-0 shadow-none hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <i className="ri-download-line" />
                Instalar Agora
              </Button>
              <p className="text-white/60 text-sm">
                Grátis • Sem ocupar espaço • Funciona offline
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white"
            >
              <i className="ri-smartphone-line text-4xl mb-2" />
              <h2 className="font-semibold text-lg mb-2">Instalação Manual</h2>
              <p className="text-white/80 text-sm">
                Use o menu do seu navegador e procure por "Instalar app" ou "Adicionar à tela inicial".
              </p>
            </motion.div>
          )}


        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-md w-full mt-12 grid grid-cols-3 gap-4 text-center text-white"
        >
          <div>
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center">
              <i className="ri-flashlight-line text-xl" />
            </div>
            <p className="text-sm text-white/80">Acesso Rápido</p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center">
              <i className="ri-wifi-off-line text-xl" />
            </div>
            <p className="text-sm text-white/80">Funciona Offline</p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center">
              <i className="ri-notification-3-line text-xl" />
            </div>
            <p className="text-sm text-white/80">Notificações</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
