import { useNavigate, useParams } from 'react-router-dom';
import { QuizFlow } from '@/features/funnel/components/QuizFlow';

export default function Quiz() {
    const navigate = useNavigate();
    const { step } = useParams();

    return (
        <QuizFlow
            step={step}
            onComplete={() => navigate('/v1/analise')}
            onBack={() => navigate('/v1/genero')}
        />
    );
}
