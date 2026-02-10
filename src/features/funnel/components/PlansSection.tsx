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

      <div className="min-h-screen bg-[#0f172a] relative overflow-hidden pb-32 flex flex-col items-center w-full">
        {/* Premium Dark Background with Subtle Lighting */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Main ambient light - Top Center (Teal/Blue mix) */}
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/40 via-[#0f172a]/0 to-transparent blur-[80px]" />

          {/* Bottom warm light - (Amber/Gold mix) for grounding */}
          <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[100%] h-[40%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-[#0f172a]/0 to-transparent blur-[100px]" />

          {/* Global Noise Texture for cinematic feel */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        </div>

        <div className="w-full max-w-md mx-auto relative z-10 px-4">
          <div className="pt-6 mb-6">
            <PlansHeader onBack={onBack} />
          </div>

          <div className="space-y-12">
            <VideoSection />
            <PlansGrid onSelectPlan={handleSelectPlan} />

            {/* Trust Building Section - Clean Layout */}
            <div className="space-y-12 pt-4">
              <CommunityStats />
              <TestimonialsCarousel />
              <GuaranteeSection />
            </div>

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
