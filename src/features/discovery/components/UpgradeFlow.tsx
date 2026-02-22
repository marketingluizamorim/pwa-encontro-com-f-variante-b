import React from 'react';
import { FeatureGateDialog } from './FeatureGateDialog';
import { CheckoutManager } from './CheckoutManager';
import { PLANS } from '@/features/funnel/components/plans/PlansGrid';

interface UpgradeFlowProps {
    showUpgrade: boolean;
    setShowUpgrade: (open: boolean) => void;
    upgradeData: {
        title: string;
        description: string;
        features: string[];
        icon: React.ReactNode;
        price: number;
        planId: string;
    };
    showCheckout: boolean;
    setShowCheckout: (open: boolean) => void;
    selectedPlan: { id: string; name: string; price: number } | null;
    onUpgrade: (planData: any) => void;
}

export const UpgradeFlow: React.FC<UpgradeFlowProps> = ({
    showUpgrade,
    setShowUpgrade,
    upgradeData,
    showCheckout,
    setShowCheckout,
    selectedPlan,
    onUpgrade
}) => {
    return (
        <>
            <FeatureGateDialog
                open={showUpgrade}
                onOpenChange={setShowUpgrade}
                title={upgradeData.title}
                description={upgradeData.description}
                features={upgradeData.features}
                icon={upgradeData.icon}
                price={upgradeData.price}
                onUpgrade={onUpgrade}
            />

            {showCheckout && selectedPlan && (
                <CheckoutManager
                    open={showCheckout}
                    onOpenChange={setShowCheckout}
                    planId={selectedPlan.id}
                    planPrice={selectedPlan.price}
                    planName={selectedPlan.name}
                />
            )}
        </>
    );
};
