import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizAnswers, OrderBumps, CheckoutInfo, PaymentStatus } from '@/types/funnel';

export interface FunnelState {
  gender: 'male' | 'female' | null;
  quizAnswers: QuizAnswers;
  currentStep: number;
  selectedPlan: string | null;
  orderBumps: OrderBumps;
  checkoutInfo: CheckoutInfo;
  paymentId: string | null;
  paymentStatus: PaymentStatus;


  // Actions
  setGender: (gender: 'male' | 'female') => void;
  setQuizAnswer: (key: keyof QuizAnswers, value: string | undefined) => void;
  setCurrentStep: (step: number) => void;
  setSelectedPlan: (planId: string) => void;
  setOrderBumps: (bumps: Partial<FunnelState['orderBumps']>) => void;
  setCheckoutInfo: (info: Partial<FunnelState['checkoutInfo']>) => void;
  setPaymentId: (id: string) => void;
  setPaymentStatus: (status: FunnelState['paymentStatus']) => void;
  reset: () => void;
}

const initialState = {
  gender: null,
  quizAnswers: {},
  currentStep: 0,
  selectedPlan: null,
  orderBumps: {
    allRegions: false,
    grupoEvangelico: false,
    grupoCatolico: false,
    lifetime: false,
  },
  checkoutInfo: {
    name: '',
    email: '',
    phone: '',
  },
  paymentId: null,
  paymentStatus: 'idle' as const,
};

export const useFunnelStore = create<FunnelState>()(
  persist(
    (set) => ({
      ...initialState,

      setGender: (gender) => set({ gender }),
      setQuizAnswer: (key, value) => set((state) => ({
        quizAnswers: { ...state.quizAnswers, [key]: value }
      })),
      setCurrentStep: (step) => set({ currentStep: step }),
      setSelectedPlan: (planId) => set({ selectedPlan: planId }),
      setOrderBumps: (bumps) => set((state) => ({
        orderBumps: { ...state.orderBumps, ...bumps }
      })),
      setCheckoutInfo: (info) => set((state) => ({
        checkoutInfo: { ...state.checkoutInfo, ...info }
      })),
      setPaymentId: (id) => set({ paymentId: id }),
      setPaymentStatus: (status) => set({ paymentStatus: status }),
      reset: () => set(initialState),
    }),
    {
      name: 'encontro-funnel-storage',
    }
  )
);
