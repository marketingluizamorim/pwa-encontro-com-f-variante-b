import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// New dedicated male photos for notifications
import notifGabriel from '@/assets/notifications/gabriel.jpg';
import notifLucas from '@/assets/notifications/lucas.jpg';
import notifMarcos from '@/assets/notifications/marcos.jpg';
import notifPedro from '@/assets/notifications/pedro.jpg';
import notifRicardo from '@/assets/notifications/ricardo.jpg';
import notifThiago from '@/assets/notifications/thiago.jpg';

// New dedicated female photos for notifications (different from testimonials)
import notifFernanda from '@/assets/notifications/fernanda.jpg';
import notifJuliana from '@/assets/notifications/juliana.jpg';
import notifLarissa from '@/assets/notifications/larissa.jpg';
import notifMariana from '@/assets/notifications/mariana.jpg';
import notifPatricia from '@/assets/notifications/patricia.jpg';
import notifRafaela from '@/assets/notifications/rafaela.jpg';

interface NotificationData {
  name: string;
  image: string;
}

const FEMALE_NOTIFICATIONS: NotificationData[] = [
  { name: 'Rafaela', image: notifRafaela },
  { name: 'Fernanda', image: notifFernanda },
  { name: 'Juliana', image: notifJuliana },
  { name: 'Mariana', image: notifMariana },
  { name: 'Larissa', image: notifLarissa },
  { name: 'Patrícia', image: notifPatricia },
  { name: 'Carolina', image: notifRafaela },
  { name: 'Amanda', image: notifFernanda },
  { name: 'Beatriz', image: notifJuliana },
  { name: 'Camila', image: notifMariana },
];

const MALE_NOTIFICATIONS: NotificationData[] = [
  { name: 'Ricardo', image: notifRicardo },
  { name: 'Gabriel', image: notifGabriel },
  { name: 'Lucas', image: notifLucas },
  { name: 'Marcos', image: notifMarcos },
  { name: 'Pedro', image: notifPedro },
  { name: 'Thiago', image: notifThiago },
  { name: 'Fernando', image: notifRicardo },
  { name: 'André', image: notifGabriel },
  { name: 'Bruno', image: notifLucas },
  { name: 'Carlos', image: notifMarcos },
];

const MESSAGES = [
  'está online agora',
  'acabou de entrar',
  'está respondendo',
  'iniciou nova conversa',
  'encontrou nova conexão',
  'está buscando encontros',
  'virou novo membro',
  'está no seu estado',
  'está próximo de você',
  'entrou na plataforma',
];

interface PushNotificationProps {
  gender?: 'masculino' | 'feminino';
  baseInterval?: number;
  paused?: boolean;
}

export function PushNotification({ 
  gender = 'feminino', 
  baseInterval = 8,
  paused = false,
}: PushNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<{
    name: string;
    image: string;
    message: string;
  } | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const getRandomNotification = useCallback(() => {
    // Show opposite gender notifications
    const notifications = gender === 'masculino' ? FEMALE_NOTIFICATIONS : MALE_NOTIFICATIONS;
    const randomPerson = notifications[Math.floor(Math.random() * notifications.length)];
    const randomMessage = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    
    return {
      name: randomPerson.name,
      image: randomPerson.image,
      message: randomMessage,
    };
  }, [gender]);

  const showNotification = useCallback(() => {
    if (isDismissed || paused) return;
    
    const notification = getRandomNotification();
    setCurrentNotification(notification);
    setIsVisible(true);

    // Hide after 7 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 7000);
  }, [getRandomNotification, isDismissed, paused]);

  // Hide notification immediately when paused
  useEffect(() => {
    if (paused) {
      setIsVisible(false);
    }
  }, [paused]);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('pushNotificationsDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Calculate interval with exponential progression
    const interval = baseInterval * Math.pow(2, notificationCount) * 1000;
    
    const timer = setTimeout(() => {
      showNotification();
      setNotificationCount(prev => prev + 1);
    }, interval);

    return () => clearTimeout(timer);
  }, [notificationCount, baseInterval, showNotification]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('pushNotificationsDismissed', 'true');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && currentNotification && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed top-3 right-3 z-50"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border border-gray-100 flex items-center gap-2">
            {/* Avatar with online indicator */}
            <div className="relative flex-shrink-0">
              <img
                src={currentNotification.image}
                alt={currentNotification.name}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  // Fallback gradient if image fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
            </div>

            {/* Text content */}
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-gray-900 text-xs truncate">
                {currentNotification.name}
              </span>
              <span className="text-gray-500 text-xs truncate">
                {currentNotification.message}
              </span>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-1 flex-shrink-0"
              aria-label="Fechar notificação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
