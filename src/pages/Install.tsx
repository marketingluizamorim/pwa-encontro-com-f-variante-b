import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen gradient-welcome flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        {/* App Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden shadow-xl"
        >
          <img
            src="/pwa-192x192.png"
            alt="Encontro com Fé"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <h1 className="font-display text-3xl font-bold text-white mb-3">
          Instale o App
        </h1>
        <p className="text-white/80 mb-8">
          Adicione o Encontro com Fé à sua tela inicial para acesso rápido e experiência completa.
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
              className="w-full bg-white text-primary hover:bg-white/90"
              size="lg"
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
              className="w-full bg-white text-primary hover:bg-white/90"
              size="lg"
            >
              <i className="ri-download-line mr-2" />
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

        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mt-6 text-white/70 hover:text-white hover:bg-white/10"
        >
          <i className="ri-arrow-left-line mr-2" />
          Voltar para o site
        </Button>
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
  );
}
