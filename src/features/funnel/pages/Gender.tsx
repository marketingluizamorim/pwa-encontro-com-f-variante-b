import { useNavigate } from 'react-router-dom';
import { GenderSelection } from '@/features/funnel/components/GenderSelection';
import { QuizAnswers } from "@/types/funnel";
import { useFunnelStore } from "@/features/funnel/hooks/useFunnelStore";

export default function Gender() {
  const navigate = useNavigate();
  const { setGender, setQuizAnswer, quizAnswers } = useFunnelStore();

  const handleGenderSelect = (selectedGender: 'male' | 'female') => {
    setGender(selectedGender);
    // Reset quiz answers to start fresh
    Object.keys(quizAnswers).forEach(key => {
      setQuizAnswer(key as keyof QuizAnswers, undefined);
    });
    navigate('/v1/quiz');
  };

  const handleBack = () => {
    navigate('/v1');
  };

  return <GenderSelection onSelect={handleGenderSelect} onBack={handleBack} />;
}
