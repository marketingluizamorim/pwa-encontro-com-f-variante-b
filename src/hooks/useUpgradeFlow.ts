import { useState } from 'react';

interface UpgradePlan {
    id: string;
    name: string;
    price: number;
}

export const useUpgradeFlow = () => {
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [showCheckoutManager, setShowCheckoutManager] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<UpgradePlan | null>(null);

    const startUpgrade = (plan: UpgradePlan) => {
        setSelectedPlan(plan);
        setShowUpgradeDialog(false);
        setShowCheckoutManager(true);
    };

    const openUpgradeModal = () => setShowUpgradeDialog(true);

    return {
        showUpgradeDialog,
        setShowUpgradeDialog,
        showCheckoutManager,
        setShowCheckoutManager,
        selectedPlan,
        setSelectedPlan,
        startUpgrade,
        openUpgradeModal
    };
};
