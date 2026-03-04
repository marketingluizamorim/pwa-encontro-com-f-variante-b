import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PlansSection } from '@/features/funnel/components/PlansSection';
import { CheckoutDialog } from '@/features/funnel/components/CheckoutDialog';
import { PixPaymentDialog } from '@/features/funnel/components/PixPaymentDialog';
import { ThankYouDialog } from '@/features/funnel/components/ThankYouDialog';
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';

import { funnelService } from '../services/funnel.service';
import { getStoredUTMParams } from '@/hooks/useUTMTracking';
import type { SelectedBumps } from '@/features/funnel/components/OrderBumpDialog';

const GOLD_PLAN_ID = 'gold_3d';
const GOLD_PLAN_PRICE = 6.00;
const DEV_MODE = false;

const PLAN_NAMES: Record<string, string> = {
  bronze_3d: "Plano Bronze · 3 Dias",
  silver_3d: "Plano Prata · 3 Dias",
  gold_3d: "Plano Ouro · 3 Dias",
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
  });

  const [selectedPlanPrice, setSelectedPlanPrice] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isPixAutomatic, setIsPixAutomatic] = useState(false);
  const [planCycle, setPlanCycle] = useState('MONTHLY');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
    };
    setOrderBumps(bumps);
    setShowCheckout(true);
  };

  // Auto-open Plan Ouro from URL ?plan=gold (Upgrade Strategy)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('plan') === 'gold' || params.get('plan') === 'plus') {
      setIsUpgradeFlow(true);
      const bumps: SelectedBumps = {
        allRegions: true, grupoEvangelico: true, grupoCatolico: true, filtrosAvancados: true,
      };
      handleSelectPlan(GOLD_PLAN_ID, GOLD_PLAN_PRICE, bumps);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleCheckoutOpenChange = (open: boolean) => {
    setShowCheckout(open);
  };

  const handleExitIntent = () => {
    setShowCheckout(false);
  };

  const createPayment = async (
    planId: string,
    planPrice: number,
    data: { name: string; email: string; phone: string; cpf: string },
    explicitBumps?: SelectedBumps
  ) => {
    setIsProcessing(true);
    setCheckoutInfo(data);

    try {
      const bumps = explicitBumps ?? currentBumpsRef.current;

      if (DEV_MODE) {
        setPixCode('00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-42661417400052040000530398654040.005802BR5913EncontroComFe6008Brasilia62070503***6304E2CA');
        setPixQrCode('https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg/1200px-Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg.png');
        setPaymentId('mock-payment-id-' + Date.now());
        setPixTotalAmount(0.00);
        setIsPixAutomatic(false);
        return true;
      }

      const utms = getStoredUTMParams();

      const subData = await funnelService.createPayment({
        planId,
        planPrice,
        userName: data.name,
        userEmail: data.email,
        userPhone: data.phone,
        userCpf: data.cpf,
        gender,
        orderBumps: {
          allRegions: bumps.allRegions ?? false,
          grupoEvangelico: bumps.grupoEvangelico ?? false,
          grupoCatolico: bumps.grupoCatolico ?? false,
          filtrosAvancados: bumps.filtrosAvancados ?? false,
        },
        quizData: quizAnswers,
        purchaseSource: 'funnel_b',
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
      setPaymentId(subData.paymentId || '');
      setPixTotalAmount(subData.totalAmount || planPrice);
      setIsPixAutomatic(false);
      setPlanCycle('ONE_TIME');

      return true;
    } catch (error) {
      console.error('Error creating payment:', error);
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('CPF') || msg.includes('CNPJ')) {
        toast.error('CPF inválido. Verifique os dados e tente novamente.');
      } else {
        toast.error('Erro ao processar pagamento. Tente novamente.');
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckoutSubmit = async (data: { name: string; email: string; phone: string; cpf: string }) => {
    const success = await createPayment(selectedPlanId, selectedPlanPrice, data, currentBumpsRef.current);
    if (success) {
      setShowCheckout(false);
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
    navigate(
      `/register?email=${encodeURIComponent(checkoutInfo.email)}&name=${encodeURIComponent(checkoutInfo.name)}`,
      { state: { fromCheckout: true } }
    );
  };

  return (
    <div className="bg-[#0f172a] relative">
      <PlansSection
        onSelectPlan={handleSelectPlan}
        onBack={() => navigate('/quiz')}
        isDialogOpen={showCheckout || showPixPayment || showThankYou}
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
