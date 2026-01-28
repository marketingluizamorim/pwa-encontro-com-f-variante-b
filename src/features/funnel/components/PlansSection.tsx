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
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';

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
      <PushNotification gender={gender === 'male' ? 'masculino' : 'feminino'} paused={notificationsPaused} />

      <div className="min-h-screen bg-gradient-to-b from-[#0f9b8e] to-[#1e3a8a] relative overflow-hidden pb-32 flex flex-col items-center w-full">
        {/* Mesh Gradient Background Blobs for Premium Feel */}
        {/* Optimized Static Background for Mobile Performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-5%] left-[-5%] w-[80%] h-[60%] bg-teal-400/20 rounded-full blur-[60px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[50%] bg-amber-400/15 rounded-full blur-[60px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        <div className="w-full max-w-md mx-auto relative z-10 px-4">
          <div className="pt-4 mb-4">
            <PlansHeader onBack={onBack} />
          </div>

          <div className="space-y-10">
            <VideoSection />
            <PlansGrid onSelectPlan={handleSelectPlan} />
            <TestimonialsCarousel />
            <GuaranteeSection />
            <CommunityStats />
            <PlansFooter />
          </div>
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
