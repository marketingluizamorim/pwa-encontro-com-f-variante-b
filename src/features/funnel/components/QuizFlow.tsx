import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuizAnswers } from "@/types/funnel";
import { useFunnelStore } from "@/features/funnel/hooks/useFunnelStore";
import { BRAZIL_STATES, BRAZIL_CITIES } from '@/config/brazil-cities';
import { ArrowLeft, Sparkles, ChevronRight, Heart } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

interface QuizFlowProps {
  onComplete: (answers: QuizAnswers) => void;
  onBack: () => void;
  step?: string;
}

interface Question {
  key: keyof QuizAnswers;
  slug: string;
  title: string;
  type: 'options' | 'select';
  options?: string[];
  placeholder?: string;
  dependsOn?: keyof QuizAnswers;
}

const BASE_QUESTIONS: Question[] = [
  {
    key: 'age',
    slug: 'idade',
    title: 'Qual a sua idade atual?',
    type: 'options',
    options: ['18-25', '26-35', '36-45', '46-55', '56+']
  },
  {
    key: 'state',
    slug: 'estado',
    title: 'Em qual estado você reside?',
    type: 'select',
    options: BRAZIL_STATES,
    placeholder: 'Selecione seu estado'
  },
  {
    key: 'city',
    slug: 'cidade',
    title: 'E qual a sua cidade?',
    type: 'select',
    placeholder: 'Selecione sua cidade',
    dependsOn: 'state'
  },
  {
    key: 'religion',
    slug: 'religiao',
    title: 'Qual o pilar da sua fé?',
    type: 'options',
    options: ['Evangélica', 'Católica', 'Protestante', 'Outra']
  },
  {
    key: 'churchFrequency',
    slug: 'frequencia',
    title: 'Você frequenta a igreja regularmente?',
    type: 'options',
    options: ['Sim, sou ativo(a)', 'Às vezes', 'Raramente', 'Não frequento']
  },
  {
    key: 'lookingFor',
    slug: 'objetivo',
    title: 'O que você busca em um relacionamento?',
    type: 'options',
    options: ['Um compromisso sério', 'Construir uma família', 'Conhecer pessoas novas', 'Amizade verdadeira']
  },
  {
    key: 'valuesImportance',
    slug: 'valores',
    title: 'É fundamental encontrar alguém com os mesmos valores?',
    type: 'options',
    options: ['Sim, é essencial', 'Muito importante', 'Não é prioridade', 'Indiferente']
  },
  {
    key: 'children',
    slug: 'filhos',
    title: 'Qual o seu pensamento sobre filhos?',
    type: 'options',
    options: ['Já sou pai/mãe', 'Desejo ter filhos', 'Talvez no futuro', 'Não pretendo ter']
  }
];

export function QuizFlow({ onComplete, onBack, step: forcedStep }: QuizFlowProps) {
  const { step: paramStep } = useParams();
  const navigate = useNavigate();
  const { quizAnswers, setQuizAnswer } = useFunnelStore();
  const [isNavigating, setIsNavigating] = useState(false);

  // Determine current question from URL or prop
  const currentIndex = useMemo(() => {
    const currentSlug = forcedStep || paramStep;
    if (!currentSlug) return 0;
    const idx = BASE_QUESTIONS.findIndex(q => q.slug === currentSlug);
    return idx >= 0 ? idx : 0;
  }, [forcedStep, paramStep]);

  // Handle initial redirect if no step provided
  useEffect(() => {
    if (!paramStep && !forcedStep) {
      navigate(`/v1/quiz/${BASE_QUESTIONS[0].slug}`, { replace: true });
    }
  }, [paramStep, forcedStep, navigate]);

  const question = BASE_QUESTIONS[currentIndex];

  const currentOptions = useMemo(() => {
    if (question.key === 'city' && quizAnswers.state) {
      return BRAZIL_CITIES[quizAnswers.state] || [];
    }
    return question.options;
  }, [question, quizAnswers.state]);

  const progressPercent = ((currentIndex + 1) / BASE_QUESTIONS.length) * 100;

  const handleAnswer = (value: string) => {
    // Immediate state update
    setQuizAnswer(question.key as keyof QuizAnswers, value);

    // Clear city if state changes
    if (question.key === 'state') {
      setQuizAnswer('city', undefined);
    }

    // Navigate immediately - relying on React Router's transition
    if (currentIndex < BASE_QUESTIONS.length - 1) {
      const nextSlug = BASE_QUESTIONS[currentIndex + 1].slug;
      navigate(`/v1/quiz/${nextSlug}`);
    } else {
      onComplete({ ...quizAnswers, [question.key]: value });
    }
  };

  const handleManualBack = () => {
    if (currentIndex > 0) {
      const prevSlug = BASE_QUESTIONS[currentIndex - 1].slug;
      navigate(`/v1/quiz/${prevSlug}`);
    } else {
      onBack();
    }
  };

  if (!question) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0f9b8e] to-[#1e3a8a] relative overflow-hidden flex flex-col font-sans px-4 py-4 fixed inset-0">
      {/* Mesh Gradient Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Optimized Static Background for Mobile Performance */}
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[60%] bg-teal-500/10 rounded-full blur-[40px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[50%] bg-amber-500/10 rounded-full blur-[40px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col h-full">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleManualBack}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex flex-col items-end gap-1.5">
            <span className="text-white/50 text-[9px] font-bold tracking-[0.2em] uppercase">
              Progresso
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-amber-400 rounded-full"
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <span className="text-amber-400 font-mono text-[10px] font-bold">{Math.round(progressPercent)}%</span>
            </div>
          </div>
        </div>

        {/* Content Area - Centered */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-6 w-full mt-12 fade-in-fast">
            <div className="text-center space-y-3 mb-2">
              <div
                className="inline-flex items-center gap-2 bg-[#fcd34d]/10 backdrop-blur-md px-5 py-1.5 rounded-full border border-[#fcd34d]/20 mb-2"
              >
                <span className="text-[#fcd34d] text-xs font-bold tracking-widest uppercase">
                  {currentIndex + 1} / {BASE_QUESTIONS.length}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight drop-shadow-2xl px-2">
                {question.title}
              </h2>
            </div>

            {/* Input Area */}
            <div className="w-full">
              {question.type === 'select' ? (
                <Select onValueChange={handleAnswer} value={quizAnswers[question.key] || ''}>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white h-16 text-lg rounded-2xl px-5 shadow-sm backdrop-blur-md focus:ring-1 focus:ring-[#fcd34d]/50 focus:border-[#fcd34d]/50 transition-all">
                    <SelectValue placeholder={question.placeholder || 'Toque para selecionar...'} />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={5} className="bg-[#0f172a] border-white/10 text-white rounded-xl shadow-xl max-h-[40vh] overflow-y-auto z-[60]">
                    {currentOptions?.map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        className="py-3 pl-4 pr-12 text-base focus:bg-white/10 focus:text-[#fcd34d] data-[state=checked]:text-[#fcd34d] data-[state=checked]:bg-white/5 border-b border-white/5 last:border-0 !text-white relative cursor-pointer font-medium"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {currentOptions?.map((option, idx) => {
                    const isActive = quizAnswers[question.key] === option;
                    return (
                      <div
                        key={option}
                        onClick={() => handleAnswer(option)}
                        onMouseEnter={() => { if (currentIndex === BASE_QUESTIONS.length - 1) import('@/features/funnel/pages/Analysis'); }}
                        className={`
                            group relative w-full overflow-hidden py-4 px-6 rounded-2xl text-center transition-all duration-300 border cursor-pointer active:scale-[0.98] outline-none focus:outline-none focus:ring-0
                            ${isActive
                            ? 'bg-[#fcd34d]/20 text-white border-[#fcd34d] shadow-[0_0_20px_rgba(252,211,77,0.2)]'
                            : 'bg-white/5 border-white/10 md:hover:bg-white/10 md:hover:border-[#fcd34d]/30 text-white/90'
                          }
                          `}
                      >
                        <div className="flex items-center justify-center relative z-10 w-full">
                          <span className={`text-lg font-bold tracking-wide transition-colors ${isActive ? 'text-[#fcd34d]' : 'text-white/80 group-hover:text-white'}`}>
                            {option}
                          </span>
                          {isActive && <div className="absolute right-0 w-2 h-2 rounded-full bg-[#fcd34d] shadow-[0_0_10px_#fcd34d] mr-2" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
