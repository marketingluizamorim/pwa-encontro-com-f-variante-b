import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@/features/funnel/components/LoadingScreen';
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';

export default function Analysis() {
    const navigate = useNavigate();
    const { gender } = useFunnelStore();

    const handleLoadingComplete = () => {
        navigate('/v1/perfis');
    };

    return <LoadingScreen gender={gender} onComplete={handleLoadingComplete} />;
}
