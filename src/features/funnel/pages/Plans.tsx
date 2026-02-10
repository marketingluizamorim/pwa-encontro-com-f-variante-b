import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlansSection } from '@/features/funnel/components/PlansSection';
import { CheckoutDialog } from '@/features/funnel/components/CheckoutDialog';
import { PixPaymentDialog } from '@/features/funnel/components/PixPaymentDialog';
import { ThankYouDialog } from '@/features/funnel/components/ThankYouDialog';
import { ExitIntentDialog } from '@/features/funnel/components/ExitIntentDialog';
import { SpecialOfferCheckoutDialog } from '@/features/funnel/components/SpecialOfferCheckoutDialog';
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';
import { useUTMTracking } from '@/hooks/useUTMTracking';
import { funnelService } from '../services/funnel.service';
import type { SelectedBumps } from '@/features/funnel/components/OrderBumpDialog';

const SPECIAL_OFFER_PRICE = 9.90;
const SPECIAL_OFFER_PLAN_ID = 'special-offer-lifetime';

export default function Plans() {
  const navigate = useNavigate();
  const utmParams = useUTMTracking();

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

  const handleSelectPlan = (planId: string, price: number, bumps: SelectedBumps) => {
    setSelectedPlanId(planId);
    setSelectedPlanPrice(price);
    currentBumpsRef.current = bumps;
    setOrderBumps(bumps);
    setShowCheckout(true);
  };

  const handleCheckoutOpenChange = (open: boolean) => {
    if (!open && !hasShownExitIntent && !isProcessing) {
      setShowCheckout(false);
      setShowExitIntent(true);
      setHasShownExitIntent(true);
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

      // --- MOCK PAYMENT FOR FREE TESTING (REQUESTED BY USER) ---
      // We simulate a successful API response
      const paymentData = {
        pixCode: '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-42661417400052040000530398654040.005802BR5913EncontroComFe6008Brasilia62070503***6304E2CA',
        qrCodeImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg/1200px-Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg.png',
        paymentId: 'mock-payment-id-' + Date.now(),
        totalAmount: 0.00 // Free for testing
      };

      // In real scenario we would call:
      /*
      const paymentData = await funnelService.createPayment({
        planId,
        planPrice,
        userName: data.name,
        userEmail: data.email,
        userPhone: data.phone,
        orderBumps: currentOrderBumps,
        quizData: quizAnswers,
        utmParams: utmParams as any,
        isSpecialOffer
      });
      */

      setPixCode(paymentData.pixCode || '');
      setPixQrCode(paymentData.qrCodeImage || '');
      setPaymentId(paymentData.paymentId || '');
      setPixTotalAmount(paymentData.totalAmount); // Expecting 0.00

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

  // Always return PAID for testing purposes
  const checkPaymentStatus = useCallback(async () => {
    // return funnelService.checkPaymentStatus(paymentId);
    return Promise.resolve('PAID' as const);
  }, [paymentId]);

  const handlePaymentConfirmed = () => {
    setShowPixPayment(false);
    setShowThankYou(true);
  };

  const handleRedirectToRegister = () => {
    navigate(`/register?email=${encodeURIComponent(checkoutInfo.email)}&name=${encodeURIComponent(checkoutInfo.name)}`);
  };

  const handleBack = () => {
    navigate('/v1/perfis');
  };

  const isAnyDialogOpen = showCheckout || showPixPayment || showThankYou || showExitIntent || showSpecialOfferCheckout;

  return (
    <>
      <PlansSection onSelectPlan={handleSelectPlan} onBack={handleBack} isDialogOpen={isAnyDialogOpen} />

      <CheckoutDialog
        open={showCheckout}
        onOpenChange={handleCheckoutOpenChange}
        planPrice={selectedPlanPrice}
        onSubmit={handleCheckoutSubmit}
        isLoading={isProcessing}
        planName={selectedPlanId === 'bronze' ? 'Plano Bronze' : selectedPlanId === 'silver' ? 'Plano Prata' : 'Plano Ouro'}
        orderBumps={currentBumpsRef.current}
      />

      <ExitIntentDialog
        open={showExitIntent}
        onOpenChange={setShowExitIntent}
        onAccept={handleAcceptSpecialOffer}
        onDecline={handleDeclineSpecialOffer}
      />

      <SpecialOfferCheckoutDialog
        open={showSpecialOfferCheckout}
        onOpenChange={setShowSpecialOfferCheckout}
        onSubmit={handleSpecialOfferSubmit}
        isLoading={isProcessing}
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
        onRedirect={handleRedirectToRegister}
      />
    </>
  );
}
