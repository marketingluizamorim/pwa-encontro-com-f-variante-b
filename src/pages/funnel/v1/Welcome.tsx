import { useNavigate } from 'react-router-dom';
import { WelcomeScreen } from '@/components/funnel/WelcomeScreen';

export default function Welcome() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/v1/genero');
  };

  return <WelcomeScreen onStart={handleStart} />;
}
