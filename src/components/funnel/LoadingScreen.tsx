import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
  gender: 'male' | 'female' | null;
}

const STAGES = [
  { icon: 'ri-loader-4-line', text: 'Processando suas respostas...', spin: true },
  { icon: 'ri-map-pin-line', text: 'Localizando pessoas próximas...', spin: false },
  { icon: 'ri-group-line', text: 'Analisando compatibilidade...', spin: false },
  { icon: 'ri-heart-3-line', text: 'Preparando suas conexões...', spin: false },
];

// Names that match the profiles shown (opposite gender)
const NAMES_MALE = ['Lucas', 'Gabriel', 'Pedro', 'Mateus', 'Rafael', 'João'];
const NAMES_FEMALE = ['Ana', 'Maria', 'Julia', 'Beatriz', 'Fernanda', 'Camila'];

export function LoadingScreen({ onComplete, gender }: LoadingScreenProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [foundPeople, setFoundPeople] = useState<string[]>([]);
  const [finalCount, setFinalCount] = useState(0);
  const [showFinalMessage, setShowFinalMessage] = useState(false);

  useEffect(() => {
    // Show names of the opposite gender (these are the profiles they'll see)
    const namesPool = gender === 'female' ? NAMES_MALE : NAMES_FEMALE;
    // Shuffle the names to avoid repetition
    const shuffledNames = [...namesPool].sort(() => Math.random() - 0.5);
    let nameIndex = 0;

    const nameInterval = setInterval(() => {
      if (nameIndex < shuffledNames.length) {
        const name = shuffledNames[nameIndex];
        setFoundPeople(prev => [...prev.slice(-4), name]);
        nameIndex++;
      }
    }, 800);

    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= STAGES.length - 1) {
          clearInterval(stageInterval);
          clearInterval(nameInterval);
          
          // Show final message
          setFinalCount(6); // Match the number of profiles displayed
          setShowFinalMessage(true);
          
          setTimeout(onComplete, 1500);
          return prev;
        }
        return prev + 1;
      });
    }, 1250);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
      clearInterval(nameInterval);
    };
  }, [onComplete]);

  const stage = STAGES[currentStage];

  return (
    <div className="h-screen gradient-welcome relative overflow-hidden flex flex-col items-center justify-center px-4">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-amber/10 blur-3xl"
          style={{ top: '20%', left: '50%', x: '-50%' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm mx-auto text-center pb-24">
        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-primary-foreground/80 text-sm font-medium">
              Etapa 3 de 3
            </span>
          </div>
        </motion.div>

        {/* Animated icon */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-8 shadow-lg shadow-amber/20"
          >
            <i
              className={`${stage.icon} text-6xl text-amber-light ${
                stage.spin ? 'animate-spin' : ''
              }`}
            />
          </motion.div>
        </AnimatePresence>

        {/* Stage text */}
        <AnimatePresence mode="wait">
          {!showFinalMessage ? (
            <motion.p
              key={currentStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl font-medium text-primary-foreground mb-4"
            >
              {stage.text}
            </motion.p>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4"
            >
              <p className="text-2xl font-bold text-amber-light mb-2">
                🎉 Encontramos {finalCount} pessoas
              </p>
              <p className="text-lg text-primary-foreground">
                Seu perfil tem novas conexões
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Found people names */}
        {!showFinalMessage && foundPeople.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap justify-center gap-2 mb-6 min-h-[32px]"
          >
            {foundPeople.slice(-3).map((name, idx) => (
              <motion.span
                key={`${name}-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/20 backdrop-blur-sm text-primary-foreground text-sm px-3 py-1 rounded-full"
              >
                {name} {gender === 'female' ? 'encontrado' : 'encontrada'}
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="h-3 rounded-full bg-white/20 overflow-hidden">
            <motion.div
              className="h-full gradient-button rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between mt-3 text-sm text-primary-foreground/60">
            <span>Passo {currentStage + 1} de {STAGES.length}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
