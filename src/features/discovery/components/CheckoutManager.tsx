import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CheckoutDialog } from '@/features/funnel/components/CheckoutDialog';
import { PixPaymentDialog } from '@/features/funnel/components/PixPaymentDialog';
import { ThankYouDialog } from '@/features/funnel/components/ThankYouDialog';
import { funnelService } from '@/features/funnel/services/funnel.service';
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';

import { useAuth } from '@/features/auth/hooks/useAuth';
import type { SelectedBumps } from '@/features/funnel/components/OrderBumpDialog';

const DEV_MODE = false; // Simular pagamento para testes

interface CheckoutManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    planId: string;
    planPrice: number;
    planName: string;
    /** Where this purchase originated. Default: 'in_app_upgrade' */
    purchaseSource?: 'funnel' | 'in_app_upgrade' | 'in_app_renewal';
}

export function CheckoutManager({ open, onOpenChange, planId, planPrice, planName, purchaseSource = 'in_app_upgrade' }: CheckoutManagerProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { quizAnswers, setCheckoutInfo, setOrderBumps } = useFunnelStore();

    const [isProcessing, setIsProcessing] = useState(false);
    const [showPixPayment, setShowPixPayment] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);
    const [pixCode, setPixCode] = useState('');
    const [pixQrCode, setPixQrCode] = useState('');
    const [paymentId, setPaymentId] = useState('');
    const [pixTotalAmount, setPixTotalAmount] = useState(0);
    const [initialData, setInitialData] = useState({ name: '', email: '', phone: '' });
    const [isPixAutomatic, setIsPixAutomatic] = useState(false);
    const [planCycle, setPlanCycle] = useState('MONTHLY');

    // Puxar dados do perfil automaticamente
    useEffect(() => {
        if (open && user) {
            const fetchProfile = async () => {
                const { supabase } = await import('@/integrations/supabase/client');
                const { data } = await (supabase.from('profiles').select('display_name, phone').eq('user_id', user.id).maybeSingle() as unknown as Promise<{ data: { display_name: string; phone: string } | null, error: unknown }>);

                setInitialData({
                    name: data?.display_name || user.user_metadata?.display_name || '',
                    email: user.email || '',
                    phone: data?.phone || ''
                });
            };
            fetchProfile();
        }
    }, [open, user]);

    // Bumps reflect what each plan includes natively — in-app upgrades don't
    // show the OrderBump dialog, so only built-in features are activated.
    // Special rule: Silver/Gold both unlock grupos automatically in-app (free).
    const bumpsForPlan = useMemo<SelectedBumps>(() => ({
        allRegions: planId === 'gold' || planId === 'silver',
        grupoEvangelico: planId === 'gold' || planId === 'silver',
        grupoCatolico: planId === 'gold' || planId === 'silver',
        filtrosAvancados: planId === 'gold',
        specialOffer: false,
    }), [planId]);
    const currentBumps = useRef<SelectedBumps>(bumpsForPlan);
    currentBumps.current = bumpsForPlan; // keep in sync when planId changes

    const createPayment = async (data: { name: string; email: string; phone: string }) => {
        setIsProcessing(true);
        setCheckoutInfo(data);
        setOrderBumps(currentBumps.current);

        try {
            if (DEV_MODE) {
                setPixCode('00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-42661417400052040000530398654040.005802BR5913EncontroComFe6008Brasilia62070503***6304E2CA');
                setPixQrCode('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example');
                setPaymentId('mock-payment-id-' + Date.now());
                setPixTotalAmount(planPrice);
                setIsPixAutomatic(false);
                return true;
            }

            // In-app upgrades use Pix Automático (Journey 3)
            const subData = await funnelService.createSubscription({
                planId,
                userName: data.name,
                userEmail: data.email,
                userPhone: data.phone,
                orderBumps: {
                    allRegions: currentBumps.current.allRegions,
                    grupoEvangelico: currentBumps.current.grupoEvangelico,
                    grupoCatolico: currentBumps.current.grupoCatolico,
                    filtrosAvancados: currentBumps.current.filtrosAvancados,
                },
                quizData: quizAnswers,
                purchaseSource,
            });

            setPixCode(subData.pixCode || '');
            setPixQrCode(subData.qrCodeImage || '');
            setPaymentId(subData.subscriptionId || '');
            setPixTotalAmount(subData.totalAmount || planPrice);
            setIsPixAutomatic(true);
            setPlanCycle(subData.planCycle || 'MONTHLY');
            return true;
        } catch (error) {
            console.error('Error creating subscription:', error);
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckoutSubmit = async (data: { name: string; email: string; phone: string }) => {
        const success = await createPayment(data);
        if (success) {
            onOpenChange(false);
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

    return (
        <>
            <CheckoutDialog
                open={open}
                onOpenChange={onOpenChange}
                planPrice={planPrice}
                onSubmit={handleCheckoutSubmit}
                isLoading={isProcessing}
                planName={planName}
                orderBumps={currentBumps.current}
                initialData={initialData}
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
                onOpenChange={setShowThankYou}
                email={initialData.email}
                name={initialData.name}
                onRedirect={() => {
                    setShowThankYou(false);
                    // Invalidate all queries to refresh UI with new subscription status
                    queryClient.invalidateQueries();
                    navigate('/app/discover');
                }}
            />
        </>
    );
}
