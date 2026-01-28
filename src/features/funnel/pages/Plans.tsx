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

      setPixCode(paymentData.pixCode || '');
      setPixQrCode(paymentData.qrCodeImage || '');
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

  const checkPaymentStatus = useCallback(() => funnelService.checkPaymentStatus(paymentId), [paymentId]);

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
        planName={selectedPlanId === 'weekly' ? 'Plano Semanal' : selectedPlanId === 'monthly' ? 'Plano Mensal' : 'Plano Anual'}
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
