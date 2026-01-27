import { useNavigate } from 'react-router-dom';
import { GenderSelection } from '@/components/funnel/GenderSelection';
import { useFunnelStore, QuizAnswers } from '@/hooks/useFunnelStore';

export default function Gender() {
  const navigate = useNavigate();
  const { setGender, setQuizAnswer, quizAnswers } = useFunnelStore();

  const handleGenderSelect = (selectedGender: 'male' | 'female') => {
    setGender(selectedGender);
    // Reset quiz answers to start fresh
    Object.keys(quizAnswers).forEach(key => {
      setQuizAnswer(key as keyof QuizAnswers, undefined as any);
    });
    navigate('/v1/quiz');
  };

  const handleBack = () => {
    navigate('/v1');
  };

  return <GenderSelection onSelect={handleGenderSelect} onBack={handleBack} />;
}
