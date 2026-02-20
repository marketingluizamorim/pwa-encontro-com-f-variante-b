import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, Users, MessageCircle, Shield, ChevronRight, ChevronLeft } from 'lucide-react';
import { useOnboarding } from '@/features/discovery/hooks/useOnboarding';

interface Slide {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const slides: Slide[] = [
  {
    id: 1,
    icon: <Heart className="w-16 h-16" />,
    title: "Bem-vindo ao Encontro com Fé",
    description: "Encontre pessoas que compartilham seus valores e sua fé. Um espaço seguro para conexões verdadeiras.",
    gradient: "from-primary/20 to-primary/5"
  },
  {
    id: 2,
    icon: <Users className="w-16 h-16" />,
    title: "Descubra Perfis",
    description: "Deslize para a direita para curtir, para a esquerda para passar ou para cima para enviar um Super Like com mensagem direta. Quando o interesse é mútuo, uma conexão é criada!",
    gradient: "from-rose-500/20 to-rose-500/5"
  },
  {
    id: 3,
    icon: <MessageCircle className="w-16 h-16" />,
    title: "Converse com Matches",
    description: "Após um conexão, vocês podem trocar mensagens e conhecer melhor um ao outro em um ambiente respeitoso.",
    gradient: "from-sky-500/20 to-sky-500/5"
  },
  {
    id: 4,
    icon: <Shield className="w-16 h-16" />,
    title: "Sua Segurança Importa",
    description: "Verificamos todos os perfis e você tem controle total sobre suas conversas. Denuncie qualquer comportamento inadequado.",
    gradient: "from-emerald-500/20 to-emerald-500/5"
  }
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9
  })
};

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
      delay: 0.2
    }
  }
};

const textVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.4, duration: 0.5 }
  }
};

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCompleted, isLoading, completeOnboarding } = useOnboarding();
  const [[currentSlide, direction], setCurrentSlide] = useState([0, 0]);

  // Forward fromConvite state so ProfileSetup can skip the PWA modal
  const fromConvite = (location.state as { fromConvite?: boolean } | null)?.fromConvite === true;

  // Redirect if already completed onboarding
  useEffect(() => {
    if (!isLoading && isCompleted) {
      navigate('/app/profile/setup', { replace: true });
    }
  }, [isLoading, isCompleted, navigate]);

  const paginate = (newDirection: number) => {
    const newSlide = currentSlide + newDirection;
    if (newSlide >= 0 && newSlide < slides.length) {
      setCurrentSlide([newSlide, newDirection]);
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    navigate('/app/profile/setup', { state: { fromConvite } });
  };

  const handleSkip = () => {
    completeOnboarding();
    navigate('/app/profile/setup', { state: { fromConvite } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <i className="ri-loader-4-line text-4xl text-primary animate-spin" />
      </div>
    );
  }

  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip button */}
      <div className="absolute top-[calc(1rem+env(safe-area-inset-top))] right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Pular
        </Button>
      </div>

      {/* Slides container */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            initial={false}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-b ${slides[currentSlide].gradient} pointer-events-none`} />

            {/* Content */}
            <div className="relative z-10 text-center max-w-sm">
              {/* Animated icon */}
              <motion.div
                initial={false}
                animate={{ scale: 1, rotate: 0 }}
                className="mx-auto mb-8 w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center text-primary"
              >
                {slides[currentSlide].icon}
              </motion.div>

              {/* Text content */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="font-display text-2xl font-bold text-foreground mb-4">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  {slides[currentSlide].description}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-8 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-colors ${index === currentSlide
                ? 'bg-primary w-8'
                : 'bg-muted w-2'
                }`}
              animate={{
                width: index === currentSlide ? 32 : 8
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => paginate(-1)}
            disabled={isFirstSlide}
            className={`rounded-full ${isFirstSlide ? 'opacity-0' : ''}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {isLastSlide ? (
            <Button
              onClick={handleComplete}
              className="flex-1 rounded-full"
              size="lg"
            >
              Começar
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => paginate(1)}
              className="flex-1 rounded-full"
              size="lg"
            >
              Próximo
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}

          {/* Spacer for alignment */}
          <div className={`w-10 h-10 ${isLastSlide ? 'opacity-0' : ''}`} />
        </div>
      </div>
    </div>
  );
}
