import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlansSection } from '@/features/funnel/components/PlansSection';
import { CheckoutDialog } from '@/features/funnel/components/CheckoutDialog';
import { PixPaymentDialog } from '@/features/funnel/components/PixPaymentDialog';
import { ThankYouDialog } from '@/features/funnel/components/ThankYouDialog';
import { ExitIntentDialog } from '@/features/funnel/components/ExitIntentDialog';
import { SpecialOfferCheckoutDialog } from '@/features/funnel/components/SpecialOfferCheckoutDialog';
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';

import { funnelService } from '../services/funnel.service';
import type { SelectedBumps } from '@/features/funnel/components/OrderBumpDialog';

const SPECIAL_OFFER_PRICE = 9.90;
const SPECIAL_OFFER_PLAN_ID = 'special-offer-lifetime';
const GOLD_PLAN_PRICE = 49.90;
const GOLD_PLAN_ID = 'gold';
const DEV_MODE = true; // Set to false for real payments

const PLAN_NAMES: Record<string, string> = {
  bronze: "Plano Bronze",
  silver: "Plano Prata",
  gold: "Plano Ouro",
};

export default function Plans() {
  const navigate = useNavigate();


  const {
    quizAnswers,
    checkoutInfo,
    setCheckoutInfo,
    setOrderBumps,
  } = useFunnelStore();

  const currentBumpsRef = useRef<SelectedBumps>({
    allRegions: false,
    grupoEvangelico: false,
    grupoCatolico: false,
    lifetime: false,
  });

  const [selectedPlanPrice, setSelectedPlanPrice] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [showSpecialOfferCheckout, setShowSpecialOfferCheckout] = useState(false);
  const [hasShownExitIntent, setHasShownExitIntent] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [pixQrCode, setPixQrCode] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [pixTotalAmount, setPixTotalAmount] = useState(0);
  const [isUpgradeFlow, setIsUpgradeFlow] = useState(false);

  const handleSelectPlan = (planId: string, price: number, bumps: SelectedBumps) => {
    setSelectedPlanId(planId);
    setSelectedPlanPrice(price);
    currentBumpsRef.current = bumps;
    setOrderBumps(bumps);
    setShowCheckout(true);
  };

  // Handle Plan Ouro auto-open from URL (Upgrade Strategy)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('plan') === 'gold' || params.get('plan') === 'plus') {
      setIsUpgradeFlow(true);
      const bumps = { allRegions: true, grupoEvangelico: true, grupoCatolico: true, lifetime: true };
      handleSelectPlan(GOLD_PLAN_ID, GOLD_PLAN_PRICE, bumps);
      // Clean URL to avoid reopening on refresh
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleCheckoutOpenChange = (open: boolean) => {
    if (!open) {
      setShowCheckout(false);
      // Removed forced navigation to keep user context
      // if (!hasShownExitIntent && !isProcessing) {
      //   setShowExitIntent(true);
      //   setHasShownExitIntent(true);
      // }
    } else {
      setShowCheckout(open);
    }
  };

  const handleAcceptSpecialOffer = () => {
    setShowExitIntent(false);
    setShowSpecialOfferCheckout(true);
    setOrderBumps({ allRegions: true, grupoEvangelico: true, grupoCatolico: true, lifetime: true });
  };

  const handleDeclineSpecialOffer = () => {
    setShowExitIntent(false);
    setShowCheckout(true);
  };

  const createPayment = async (
    planId: string,
    planPrice: number,
    data: { name: string; email: string; phone: string },
    isSpecialOffer: boolean = false,
    explicitBumps?: SelectedBumps
  ) => {
    setIsProcessing(true);
    setCheckoutInfo(data);

    try {
      const currentOrderBumps = explicitBumps
        || (isSpecialOffer ? { allRegions: true, grupoEvangelico: true, grupoCatolico: true, lifetime: true } : currentBumpsRef.current);

      if (DEV_MODE) {
        // --- MOCK PAYMENT FOR FREE TESTING (REQUESTED BY USER) ---
        setPixCode('00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-42661417400052040000530398654040.005802BR5913EncontroComFe6008Brasilia62070503***6304E2CA');
        setPixQrCode('https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg/1200px-Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg.png');
        setPaymentId('mock-payment-id-' + Date.now());
        setPixTotalAmount(0.00);
        return true;
      }

      const paymentData = await funnelService.createPayment({
        planId,
        planPrice,
        userName: data.name,
        userEmail: data.email,
        userPhone: data.phone,
        orderBumps: currentOrderBumps,
        quizData: quizAnswers,
        isSpecialOffer,
        planName: PLAN_NAMES[planId]
      });

      setPixCode(paymentData.pixCode || '');
      setPixQrCode(paymentData.qrCode || ''); // Corrected from qrCodeImage to qrCode
      setPaymentId(paymentData.paymentId || '');
      setPixTotalAmount(paymentData.totalAmount || planPrice);
      return true;
    } catch (error) {
      console.error('Error creating payment:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckoutSubmit = async (data: { name: string; email: string; phone: string }) => {
    const success = await createPayment(selectedPlanId, selectedPlanPrice, data, false, currentBumpsRef.current);
    if (success) {
      setShowCheckout(false);
      setShowPixPayment(true);
    }
  };

  const handleSpecialOfferSubmit = async (data: { name: string; email: string; phone: string }) => {
    const success = await createPayment(SPECIAL_OFFER_PLAN_ID, SPECIAL_OFFER_PRICE, data, true);
    if (success) {
      setShowSpecialOfferCheckout(false);
      setShowPixPayment(true);
    }
  };

  const checkPaymentStatus = useCallback(async () => {
    if (DEV_MODE) return Promise.resolve('PAID' as const);
    return funnelService.checkPaymentStatus(paymentId);
  }, [paymentId]);

  const handlePaymentConfirmed = () => {
    setShowPixPayment(false);
    setShowThankYou(true);
  };

  const handleThankYouClose = () => {
    setShowThankYou(false);
    navigate(`/register?email=${encodeURIComponent(checkoutInfo.email)}&name=${encodeURIComponent(checkoutInfo.name)}`, {
      state: { fromCheckout: true }
    });
  };

  return (
    <div className="bg-[#0f172a]">
      <PlansSection
        onSelectPlan={handleSelectPlan}
        onBack={() => navigate('/v1/quiz')}
        isDialogOpen={showCheckout || showPixPayment || showThankYou || showExitIntent || showSpecialOfferCheckout}
      />

      <CheckoutDialog
        open={showCheckout}
        onOpenChange={handleCheckoutOpenChange}
        planPrice={selectedPlanPrice}
        onSubmit={handleCheckoutSubmit}
        isLoading={isProcessing}
        planName={PLAN_NAMES[selectedPlanId] || 'Plano Gold'}
        orderBumps={currentBumpsRef.current}
      />

      <SpecialOfferCheckoutDialog
        open={showSpecialOfferCheckout}
        onOpenChange={setShowSpecialOfferCheckout}
        onSubmit={handleSpecialOfferSubmit}
        isLoading={isProcessing}
      />

      <ExitIntentDialog
        open={showExitIntent}
        onOpenChange={setShowExitIntent}
        onAccept={handleAcceptSpecialOffer}
        onDecline={handleDeclineSpecialOffer}
      />

      <PixPaymentDialog
        open={showPixPayment}
        onOpenChange={setShowPixPayment}
        pixCode={pixCode}
        pixQrCode={pixQrCode}
        paymentId={paymentId}
        totalAmount={pixTotalAmount}
        onPaymentConfirmed={handlePaymentConfirmed}
        checkPaymentStatus={checkPaymentStatus}
      />

      <ThankYouDialog
        open={showThankYou}
        email={checkoutInfo.email}
        name={checkoutInfo.name}
        onRedirect={handleThankYouClose}
      />
    </div>
  );
}
