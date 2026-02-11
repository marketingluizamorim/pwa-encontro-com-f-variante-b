import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutDialog } from '@/features/funnel/components/CheckoutDialog';
import { PixPaymentDialog } from '@/features/funnel/components/PixPaymentDialog';
import { ThankYouDialog } from '@/features/funnel/components/ThankYouDialog';
import { funnelService } from '@/features/funnel/services/funnel.service';
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';

import { useAuth } from '@/features/auth/hooks/useAuth';
import type { SelectedBumps } from '@/features/funnel/components/OrderBumpDialog';

const DEV_MODE = true; // Simular pagamento para testes

interface CheckoutManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    planId: string;
    planPrice: number;
    planName: string;
}

export function CheckoutManager({ open, onOpenChange, planId, planPrice, planName }: CheckoutManagerProps) {
    const navigate = useNavigate();
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

    // Puxar dados do perfil automaticamente
    useEffect(() => {
        if (open && user) {
            const fetchProfile = async () => {
                const { supabase } = await import('@/integrations/supabase/client');
                const { data } = await (supabase.from('profiles').select('display_name, phone').eq('user_id', user.id).maybeSingle() as any);

                setInitialData({
                    name: data?.display_name || user.user_metadata?.display_name || '',
                    email: user.email || '',
                    phone: data?.phone || ''
                });
            };
            fetchProfile();
        }
    }, [open, user]);

    const currentBumps = useRef<SelectedBumps>({
        allRegions: true,
        grupoEvangelico: true,
        grupoCatolico: true,
        lifetime: true,
    });

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
                return true;
            }

            const paymentData = await funnelService.createPayment({
                planId: planId,
                planPrice: planPrice,
                userName: data.name,
                userEmail: data.email,
                userPhone: data.phone,
                orderBumps: currentBumps.current,
                quizData: quizAnswers,
                planName: planName
            });

            setPixCode(paymentData.pixCode || '');
            setPixQrCode(paymentData.qrCode || '');
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
            />

            <ThankYouDialog
                open={showThankYou}
                email={initialData.email}
                name={initialData.name}
                onRedirect={() => {
                    setShowThankYou(false);
                    window.location.reload();
                }}
            />
        </>
    );
}
