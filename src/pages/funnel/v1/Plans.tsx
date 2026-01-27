import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlansSection } from '@/components/funnel/PlansSection';
import { CheckoutDialog } from '@/components/funnel/CheckoutDialog';
import { PixPaymentDialog } from '@/components/funnel/PixPaymentDialog';
import { ThankYouDialog } from '@/components/funnel/ThankYouDialog';
import { ExitIntentDialog } from '@/components/funnel/ExitIntentDialog';
import { SpecialOfferCheckoutDialog } from '@/components/funnel/SpecialOfferCheckoutDialog';
import { useFunnelStore } from '@/hooks/useFunnelStore';
import { useUTMTracking } from '@/hooks/useUTMTracking';
import type { SelectedBumps } from '@/components/funnel/OrderBumpDialog';

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

  // Use ref to hold current bumps - avoids stale closure issues
  const currentBumpsRef = useRef<SelectedBumps>({
    allRegions: false,
    grupoEvangelico: false,
    grupoCatolico: false,
    lifetime: false,
  });

  const [selectedPlanPrice, setSelectedPlanPrice] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  
  // Dialog states
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Exit intent states
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [showSpecialOfferCheckout, setShowSpecialOfferCheckout] = useState(false);
  const [hasShownExitIntent, setHasShownExitIntent] = useState(false);
  
  // Payment data
  const [pixCode, setPixCode] = useState('');
  const [pixQrCode, setPixQrCode] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [pixTotalAmount, setPixTotalAmount] = useState(0);

  const handleSelectPlan = (planId: string, price: number, bumps: SelectedBumps) => {
    setSelectedPlanId(planId);
    setSelectedPlanPrice(price);
    // Store bumps in ref for payment creation
    currentBumpsRef.current = bumps;
    // Also update store for UI display
    setOrderBumps(bumps);
    setShowCheckout(true);
  };

  // Handle checkout dialog close with exit intent
  const handleCheckoutOpenChange = (open: boolean) => {
    if (!open && !hasShownExitIntent && !isProcessing) {
      // User is trying to close - show exit intent
      setShowCheckout(false);
      setShowExitIntent(true);
      setHasShownExitIntent(true);
    } else {
      setShowCheckout(open);
    }
  };

  // Accept special offer
  const handleAcceptSpecialOffer = () => {
    setShowExitIntent(false);
    setShowSpecialOfferCheckout(true);
    // Set all order bumps including lifetime
    setOrderBumps({
      allRegions: true,
      grupoEvangelico: true,
      grupoCatolico: true,
      lifetime: true,
    });
  };

  // Decline special offer - go back to regular checkout
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
      const { supabaseRuntime: supabase } = await import('@/integrations/supabase/runtimeClient');
      
      // Use explicit bumps if provided, otherwise use ref for regular checkout, or special offer bumps
      const currentOrderBumps = explicitBumps 
        ? explicitBumps
        : isSpecialOffer 
          ? { allRegions: true, grupoEvangelico: true, grupoCatolico: true, lifetime: true }
          : currentBumpsRef.current;
      
      const { data: paymentData, error } = await supabase.functions.invoke('create-payment', {
        body: {
          planId,
          planPrice,
          userName: data.name,
          userEmail: data.email,
          userPhone: data.phone,
          orderBumps: currentOrderBumps,
          quizData: quizAnswers,
          utmSource: utmParams.utm_source,
          utmMedium: utmParams.utm_medium,
          utmCampaign: utmParams.utm_campaign,
          utmContent: utmParams.utm_content,
          utmTerm: utmParams.utm_term,
          isSpecialOffer,
        },
      });

      if (error) throw error;

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
    // Pass bumps from ref explicitly
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

  const checkPaymentStatus = useCallback(async (): Promise<'PENDING' | 'PAID' | 'FAILED'> => {
    try {
      const { supabaseRuntime: supabase } = await import('@/integrations/supabase/runtimeClient');
      
      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: { paymentId },
      });
      if (error) throw error;
      return data.status || 'PENDING';
    } catch {
      return 'PENDING';
    }
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
