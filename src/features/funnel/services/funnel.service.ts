import { supabaseRuntime as supabase } from '@/integrations/supabase/runtimeClient';
import type { QuizAnswers } from '@/types/funnel';

export interface PaymentRequest {
    planId: string;
    planPrice: number;
    userName: string;
    userEmail: string;
    userPhone: string;
    userCpf: string;
    orderBumps: unknown;
    quizData: QuizAnswers;
    gender: 'male' | 'female' | null;
    isSpecialOffer?: boolean;
    planName?: string;
    purchaseSource?: 'funnel' | 'backredirect' | 'in_app_upgrade' | 'in_app_renewal';
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmContent?: string | null;
    utmTerm?: string | null;
    src?: string | null;
    sck?: string | null;
}

export interface SubscriptionRequest {
    planId: string;
    userName: string;
    userEmail: string;
    gender: 'male' | 'female' | null;
    userCpf: string;
    userPhone?: string;
    orderBumps?: { allRegions: boolean; grupoEvangelico: boolean; grupoCatolico: boolean; filtrosAvancados: boolean };
    quizData?: QuizAnswers;
    purchaseSource?: string;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmContent?: string | null;
    utmTerm?: string | null;
    src?: string | null;
    sck?: string | null;
}

export const funnelService = {
    /** One-time PIX — used for special offers / legacy */
    async createPayment(request: PaymentRequest) {
        const { data, error } = await supabase.functions.invoke('create-payment', {
            body: {
                planId: request.planId,
                planPrice: request.planPrice,
                userName: request.userName,
                userEmail: request.userEmail,
                userPhone: request.userPhone,
                userCpf: request.userCpf,
                orderBumps: request.orderBumps,
                quizData: request.quizData,
                gender: request.gender,
                isSpecialOffer: request.isSpecialOffer,
                planName: request.planName,
                purchaseSource: request.purchaseSource ?? 'funnel',
                utmSource: request.utmSource ?? null,
                utmMedium: request.utmMedium ?? null,
                utmCampaign: request.utmCampaign ?? null,
                utmContent: request.utmContent ?? null,
                utmTerm: request.utmTerm ?? null,
                src: request.src ?? null,
                sck: request.sck ?? null,
            },
        });
        if (error) throw error;
        return data;
    },

    /** Pix Automático — recurring subscription, Journey 3 */
    async createSubscription(request: SubscriptionRequest) {
        const { data, error } = await supabase.functions.invoke('create-subscription', {
            body: {
                planId: request.planId,
                userName: request.userName,
                userEmail: request.userEmail,
                userPhone: request.userPhone,
                userCpf: request.userCpf,
                orderBumps: request.orderBumps,
                quizData: request.quizData,
                gender: request.gender,
                purchaseSource: request.purchaseSource ?? 'funnel',
                utmSource: request.utmSource ?? null,
                utmMedium: request.utmMedium ?? null,
                utmCampaign: request.utmCampaign ?? null,
                utmContent: request.utmContent ?? null,
                utmTerm: request.utmTerm ?? null,
                src: request.src ?? null,
                sck: request.sck ?? null,
            },
        });
        if (error) throw error;
        return data as {
            success: boolean;
            subscriptionId: string;
            pixCode: string;
            qrCodeImage: string;
            totalAmount: number;
            purchaseId: string;
            checkoutUrl: string;
            isPixAutomatic: boolean;
            planCycle: string;
        };
    },

    async checkPaymentStatus(paymentId: string) {
        const { data, error } = await supabase.functions.invoke('check-payment-status', {
            body: { paymentId },
        });
        if (error) throw error;
        return (data.status || 'PENDING') as 'PENDING' | 'PAID' | 'FAILED';
    },
};
