import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Redirect to the main funnel version
const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/v1', { replace: true });
  }, [navigate]);

  return null;
};

export default Index;
