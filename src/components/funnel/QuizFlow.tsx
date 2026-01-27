import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuizAnswers } from '@/hooks/useFunnelStore';
import { BRAZIL_STATES, BRAZIL_CITIES } from '@/data/brazilCities';

interface QuizFlowProps {
  onComplete: (answers: QuizAnswers) => void;
  onBack: () => void;
  initialAnswers: QuizAnswers;
}

interface Question {
  key: keyof QuizAnswers;
  title: string;
  type: 'options' | 'select';
  options?: string[];
  placeholder?: string;
  dependsOn?: keyof QuizAnswers;
}

const BASE_QUESTIONS: Question[] = [
  {
    key: 'age',
    title: 'Em qual fase da vida você está?',
    type: 'options',
    options: ['18-25', '26-35', '36-45', '46-55', '56+']
  },
  {
    key: 'state',
    title: 'Qual seu estado?',
    type: 'select',
    options: BRAZIL_STATES,
    placeholder: 'Selecione seu estado'
  },
  {
    key: 'city',
    title: 'Qual sua cidade?',
    type: 'select',
    placeholder: 'Selecione sua cidade',
    dependsOn: 'state'
  },
  {
    key: 'religion',
    title: 'Qual sua religião?',
    type: 'options',
    options: ['Evangélica', 'Católica', 'Protestante', 'Adventista']
  },
  {
    key: 'churchFrequency',
    title: 'Você frequenta igreja regularmente?',
    type: 'options',
    options: ['Sim, sempre', 'Às vezes', 'Raramente', 'Não frequento']
  },
  {
    key: 'lookingFor',
    title: 'O que você busca?',
    type: 'options',
    options: ['Casamento', 'Namoro sério', 'Conhecer pessoas', 'Amizade']
  },
  {
    key: 'valuesImportance',
    title: 'Conhecer pessoas com valores iguais ao seu é importante?',
    type: 'options',
    options: ['Muito importante', 'Importante', 'Pouco importante', 'Indiferente']
  },
  {
    key: 'children',
    title: 'Sobre ter filhos:',
    type: 'options',
    options: ['Tenho filhos', 'Quero ter', 'Talvez futuramente', 'Não quero']
  }
];

export function QuizFlow({
  onComplete,
  onBack
}: Omit<QuizFlowProps, 'initialAnswers'>) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  // Build questions with dynamic city options based on selected state
  const questions = useMemo(() => {
    return BASE_QUESTIONS.map(q => {
      if (q.key === 'city' && answers.state) {
        return {
          ...q,
          options: BRAZIL_CITIES[answers.state] || []
        };
      }
      return q;
    });
  }, [answers.state]);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isNearEnd = currentQuestion >= questions.length - 3;

  const handleAnswer = (value: string) => {
    const newAnswers = {
      ...answers,
      [question.key]: value
    };

    // If state changed, clear city selection
    if (question.key === 'state' && answers.state !== value) {
      newAnswers.city = undefined;
    }

    setAnswers(newAnswers);

    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        onComplete(newAnswers);
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="h-screen gradient-gender relative overflow-hidden flex flex-col px-4 py-6">
      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-primary-foreground hover:bg-white/20"
          >
            <i className="ri-arrow-left-line text-xl" />
          </Button>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-primary-foreground/80 text-sm font-medium">
              Etapa 2 de 3
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-white/20" />
        <div className="text-center mt-2">
          <span className="text-primary-foreground/60 text-xs">
            Pergunta {currentQuestion + 1} de {questions.length}
          </span>
        </div>
      </div>

      {/* Question - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <h2 className="md:text-3xl font-display font-bold text-primary-foreground text-center mb-8 text-3xl">
              {question.title}
            </h2>

            {question.type === 'select' ? (
              <Select
                onValueChange={handleAnswer}
                value={answers[question.key] ?? undefined}
              >
                <SelectTrigger className="w-full glass text-primary-foreground border-white/30 h-14 text-lg">
                  <SelectValue placeholder={question.placeholder || 'Selecione uma opção'} />
                </SelectTrigger>
                <SelectContent side="bottom" align="start" className="max-h-[300px] bg-card z-50">
                  {question.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex flex-col gap-3">
                {question.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`w-full py-4 px-6 rounded-xl text-left font-medium transition-all duration-200 focus:outline-none active:scale-[0.98] ${
                      answers[question.key] === option
                        ? 'gradient-button text-primary-foreground shadow-lg'
                        : 'glass text-primary-foreground hover:bg-white/20'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Motivational text near the end */}
        {isNearEnd && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-amber-light text-sm mt-8 font-medium flex items-center justify-center gap-2 animate-pulse"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              {/* Two people with heart - union symbol */}
              <circle cx="6" cy="6" r="2.5" />
              <ellipse cx="6" cy="13" rx="3" ry="4" />
              <circle cx="18" cy="6" r="2.5" />
              <ellipse cx="18" cy="13" rx="3" ry="4" />
              {/* Heart in center representing union */}
              <path d="M12 10.5 C11 9.5 9.5 9.5 9.5 11 C9.5 12.5 12 14.5 12 14.5 C12 14.5 14.5 12.5 14.5 11 C14.5 9.5 13 9.5 12 10.5" />
            </svg>
            Falta pouco para encontrar seu par ideal!
          </motion.p>
        )}
      </div>
    </div>
  );
}
