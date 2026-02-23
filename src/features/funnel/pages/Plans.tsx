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
import { getStoredUTMParams } from '@/hooks/useUTMTracking';
import type { SelectedBumps } from '@/features/funnel/components/OrderBumpDialog';


const SPECIAL_OFFER_PRICE = 14.90;
const SPECIAL_OFFER_PLAN_ID = 'special-offer';
const GOLD_PLAN_PRICE = 3.00;
const GOLD_PLAN_ID = 'gold';
const DEV_MODE = false; // Set to false for real payments

const PLAN_NAMES: Record<string, string> = {
  bronze: "Plano Bronze",
  silver: "Plano Prata",
  gold: "Plano Ouro",
  [SPECIAL_OFFER_PLAN_ID]: "Plano Ouro · 3 Meses",
};

export default function Plans() {
  const navigate = useNavigate();

  const {
    quizAnswers,
    gender,
    checkoutInfo,
    setCheckoutInfo,
    setOrderBumps,
  } = useFunnelStore();


  const currentBumpsRef = useRef<SelectedBumps>({
    allRegions: false,
    grupoEvangelico: false,
    grupoCatolico: false,
    filtrosAvancados: false,
    specialOffer: false,
  });

  const [selectedPlanPrice, setSelectedPlanPrice] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isPixAutomatic, setIsPixAutomatic] = useState(false);
  const [planCycle, setPlanCycle] = useState('MONTHLY');
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
    currentBumpsRef.current = {
      allRegions: bumps.allRegions,
      grupoEvangelico: bumps.grupoEvangelico,
      grupoCatolico: bumps.grupoCatolico,
      filtrosAvancados: bumps.filtrosAvancados,
      specialOffer: bumps.specialOffer,
    };
    setOrderBumps(bumps);
    setShowCheckout(true);
  };

  // Handle Plan Ouro auto-open from URL (Upgrade Strategy)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('plan') === 'gold' || params.get('plan') === 'plus') {
      setIsUpgradeFlow(true);
      const bumps: SelectedBumps = { allRegions: true, grupoEvangelico: true, grupoCatolico: true, filtrosAvancados: true, specialOffer: false };
      handleSelectPlan(GOLD_PLAN_ID, GOLD_PLAN_PRICE, bumps);
      // Clean URL to avoid reopening on refresh
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleCheckoutOpenChange = (open: boolean) => {
    if (!open) {
      // Let handleExitIntent handle it — don't close directly.
      // (Only called by Dialog's own onOpenChange, which we suppress via onExitIntent prop)
      setShowCheckout(false);
    } else {
      setShowCheckout(open);
    }
  };

  const handleExitIntent = () => {
    if (!isProcessing && !hasShownExitIntent) {
      setShowCheckout(false);
      setShowExitIntent(true);
      setHasShownExitIntent(true);
    } else {
      // Already shown exit-intent once → just close
      setShowCheckout(false);
    }
  };

  const handleAcceptSpecialOffer = () => {
    setShowExitIntent(false);
    // Use the standard CheckoutDialog for consistent UX, pre-configured for special offer
    setSelectedPlanId(SPECIAL_OFFER_PLAN_ID);
    setSelectedPlanPrice(SPECIAL_OFFER_PRICE);
    const specialBumps = { allRegions: true, grupoEvangelico: true, grupoCatolico: true, filtrosAvancados: false, specialOffer: true };
    currentBumpsRef.current = specialBumps;
    setOrderBumps(specialBumps);
    setShowCheckout(true);
  };

  const handleDeclineSpecialOffer = () => {
    setShowExitIntent(false);
    setShowCheckout(true);
  };

  const createPayment = async (
    planId: string,
    planPrice: number,
    data: { name: string; email: string; phone: string; cpf: string },
    isSpecialOffer: boolean = false,
    explicitBumps?: SelectedBumps
  ) => {
    setIsProcessing(true);
    setCheckoutInfo(data);

    try {
      const currentOrderBumps = explicitBumps
        || (isSpecialOffer ? { allRegions: true, grupoEvangelico: true, grupoCatolico: true, filtrosAvancados: false, specialOffer: true } : currentBumpsRef.current);

      if (DEV_MODE) {
        setPixCode('00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-42661417400052040000530398654040.005802BR5913EncontroComFe6008Brasilia62070503***6304E2CA');
        setPixQrCode('https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg/1200px-Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg.png');
        setPaymentId('mock-payment-id-' + Date.now());
        setPixTotalAmount(0.00);
        setIsPixAutomatic(false);
        return true;
      }

      if (isSpecialOffer) {
        // Special offer is a one-time PIX charge
        const utms = getStoredUTMParams();
        const paymentData = await funnelService.createPayment({
          planId,
          planPrice,
          userName: data.name,
          userEmail: data.email,
          userPhone: data.phone,
          userCpf: data.cpf,
          orderBumps: currentOrderBumps,
          quizData: quizAnswers,
          gender: gender,
          isSpecialOffer,
          planName: PLAN_NAMES[planId],
          purchaseSource: 'backredirect',
          utmSource: utms.utm_source ?? null,
          utmMedium: utms.utm_medium ?? null,
          utmCampaign: utms.utm_campaign ?? null,
          utmContent: utms.utm_content ?? null,
          utmTerm: utms.utm_term ?? null,
          src: utms.src ?? null,
          sck: utms.sck ?? null,
        });
        setPixCode(paymentData.pixCode || '');
        setPixQrCode(paymentData.qrCode || paymentData.qrCodeImage || '');
        setPaymentId(paymentData.paymentId || '');
        setPixTotalAmount(paymentData.totalAmount || planPrice);
        setIsPixAutomatic(false);
      } else {
        // Regular plans use Pix Automático (Journey 3)
        const utms = getStoredUTMParams();
        const subData = await funnelService.createSubscription({
          planId,
          userName: data.name,
          userEmail: data.email,
          userPhone: data.phone,
          userCpf: data.cpf,
          gender: gender,
          orderBumps: {
            allRegions: (currentOrderBumps as { allRegions?: boolean }).allRegions ?? false,
            grupoEvangelico: (currentOrderBumps as { grupoEvangelico?: boolean }).grupoEvangelico ?? false,
            grupoCatolico: (currentOrderBumps as { grupoCatolico?: boolean }).grupoCatolico ?? false,
            filtrosAvancados: (currentOrderBumps as { filtrosAvancados?: boolean }).filtrosAvancados ?? false,
          },
          quizData: quizAnswers,
          purchaseSource: 'funnel',
          utmSource: utms.utm_source ?? null,
          utmMedium: utms.utm_medium ?? null,
          utmCampaign: utms.utm_campaign ?? null,
          utmContent: utms.utm_content ?? null,
          utmTerm: utms.utm_term ?? null,
          src: utms.src ?? null,
          sck: utms.sck ?? null,
        });
        setPixCode(subData.pixCode || '');
        setPixQrCode(subData.qrCodeImage || '');
        setPaymentId(subData.subscriptionId || '');
        setPixTotalAmount(subData.totalAmount || planPrice);
        setIsPixAutomatic(true);
        setPlanCycle(subData.planCycle || 'MONTHLY');
      }

      return true;
    } catch (error) {
      console.error('Error creating payment:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckoutSubmit = async (data: { name: string; email: string; phone: string; cpf: string }) => {
    const isSpecialOffer = selectedPlanId === SPECIAL_OFFER_PLAN_ID;
    const success = await createPayment(selectedPlanId, selectedPlanPrice, data, isSpecialOffer, currentBumpsRef.current);
    if (success) {
      setShowCheckout(false);
      setShowPixPayment(true);
    }
  };

  const handleSpecialOfferSubmit = async (data: { name: string; email: string; phone: string; cpf: string }) => {
    const success = await createPayment(SPECIAL_OFFER_PLAN_ID, SPECIAL_OFFER_PRICE, data, true);
    if (success) {
      setShowSpecialOfferCheckout(false);
      setShowPixPayment(true);
    }
  };

  const checkPaymentStatus = useCallback(async () => {
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
    <div className="bg-[#0f172a] relative">
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
        onExitIntent={handleExitIntent}
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
        isPixAutomatic={isPixAutomatic}
        planCycle={planCycle}
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
