import { supabaseRuntime as supabase } from '@/integrations/supabase/runtimeClient';
import type { QuizAnswers } from '@/types/funnel';

export interface PaymentRequest {
    planId: string;
    planPrice: number;
    userName: string;
    userEmail: string;
    userPhone: string;
    orderBumps: unknown;
    quizData: QuizAnswers;
    isSpecialOffer?: boolean;
    planName?: string;
    purchaseSource?: 'funnel' | 'in_app_upgrade' | 'in_app_renewal';
}

export const funnelService = {
    async createPayment(request: PaymentRequest) {
        const { data, error } = await supabase.functions.invoke('create-payment', {
            body: {
                planId: request.planId,
                planPrice: request.planPrice,
                userName: request.userName,
                userEmail: request.userEmail,
                userPhone: request.userPhone,
                orderBumps: request.orderBumps,
                quizData: request.quizData,
                isSpecialOffer: request.isSpecialOffer,
                planName: request.planName,
                purchaseSource: request.purchaseSource ?? 'funnel',
            },
        });

        if (error) throw error;
        return data;
    },

    async checkPaymentStatus(paymentId: string) {
        const { data, error } = await supabase.functions.invoke('check-payment-status', {
            body: { paymentId },
        });

        if (error) throw error;
        return data.status || 'PENDING';
    }
};
