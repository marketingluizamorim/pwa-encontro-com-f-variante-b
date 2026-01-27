import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlansHeader } from './plans/PlansHeader';
import { VideoSection } from './plans/VideoSection';
import { PlansGrid, PLANS } from './plans/PlansGrid';
import { GuaranteeSection } from './plans/GuaranteeSection';
import { TestimonialsCarousel } from './plans/TestimonialsCarousel';
import { CommunityStats } from './plans/CommunityStats';
import { PlansFooter } from './plans/PlansFooter';
import { OrderBumpDialog, SelectedBumps } from './OrderBumpDialog';
import { PushNotification } from './plans/PushNotification';
import { useFunnelStore } from '@/hooks/useFunnelStore';

interface PlansProps {
  onSelectPlan: (planId: string, price: number, bumps: SelectedBumps) => void;
  onBack: () => void;
  isDialogOpen?: boolean;
}

export function PlansSection({ onSelectPlan, onBack, isDialogOpen = false }: PlansProps) {
  const gender = useFunnelStore((state) => state.gender);
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [showOrderBump, setShowOrderBump] = useState(false);

  const handleSelectPlan = (planId: string, price: number) => {
    const plan = PLANS.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setShowOrderBump(true);
    }
  };

  const handleOrderBumpComplete = (extraAmount: number, bumps: SelectedBumps) => {
    if (selectedPlan) {
      onSelectPlan(selectedPlan.id, selectedPlan.price + extraAmount, bumps);
    }
  };

  // Pause notifications when any dialog is open
  const notificationsPaused = showOrderBump || isDialogOpen;

  return (
    <>
      {/* Push Notifications */}
      <PushNotification gender={gender === 'male' ? 'masculino' : 'feminino'} paused={notificationsPaused} />

      <div className="min-h-screen gradient-welcome p-4 pb-24 relative overflow-hidden">
        {/* Animated background bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-white/5 blur-3xl"
            style={{ top: '10%', left: '10%' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-white/5 blur-3xl"
            style={{ bottom: '10%', right: '5%' }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto pt-2 relative z-10">
          <PlansHeader />
          <VideoSection />
          <PlansGrid onSelectPlan={handleSelectPlan} />
          <TestimonialsCarousel />
          <GuaranteeSection />
          <CommunityStats />
          <PlansFooter />
        </div>
      </div>

      <OrderBumpDialog
        open={showOrderBump}
        onOpenChange={setShowOrderBump}
        onComplete={handleOrderBumpComplete}
        selectedPlan={selectedPlan}
      />
    </>
  );
}
