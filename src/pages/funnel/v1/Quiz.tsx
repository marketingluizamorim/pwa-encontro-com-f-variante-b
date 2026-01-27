import { useNavigate } from 'react-router-dom';
import { QuizFlow } from '@/components/funnel/QuizFlow';
import { useFunnelStore, QuizAnswers } from '@/hooks/useFunnelStore';

export default function Quiz() {
  const navigate = useNavigate();
  const { setQuizAnswer } = useFunnelStore();

  const handleQuizComplete = (answers: QuizAnswers) => {
    Object.entries(answers).forEach(([key, value]) => {
      if (value) setQuizAnswer(key as keyof QuizAnswers, value);
    });
    navigate('/v1/perfis');
  };

  const handleBack = () => {
    navigate('/v1/genero');
  };

  return <QuizFlow onComplete={handleQuizComplete} onBack={handleBack} />;
}
