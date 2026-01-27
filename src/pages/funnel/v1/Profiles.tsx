import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/funnel/LoadingScreen';
import { ProfilesDisplay } from '@/components/funnel/ProfilesDisplay';
import { useFunnelStore } from '@/hooks/useFunnelStore';
import { useState } from 'react';

export default function Profiles() {
  const navigate = useNavigate();
  const { gender } = useFunnelStore();
  const [showProfiles, setShowProfiles] = useState(false);

  const handleLoadingComplete = () => {
    setShowProfiles(true);
  };

  const handleViewPlans = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/v1/planos');
  };

  const handleBack = () => {
    navigate('/v1/quiz');
  };

  if (!showProfiles) {
    return <LoadingScreen gender={gender} onComplete={handleLoadingComplete} />;
  }

  return <ProfilesDisplay gender={gender} onViewPlans={handleViewPlans} onBack={handleBack} />;
}
