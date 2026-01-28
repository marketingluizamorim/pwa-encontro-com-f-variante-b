import { useNavigate } from 'react-router-dom';
import { ProfilesDisplay } from '@/features/funnel/components/ProfilesDisplay';
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';

export default function Profiles() {
  const navigate = useNavigate();
  const { gender } = useFunnelStore();

  const handleViewPlans = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/v1/planos');
  };

  const handleBack = () => {
    navigate('/v1/quiz');
  };

  return <ProfilesDisplay gender={gender} onViewPlans={handleViewPlans} onBack={handleBack} />;
}
