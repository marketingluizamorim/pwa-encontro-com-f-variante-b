export interface QuizAnswers {
    age?: string;
    state?: string;
    city?: string;
    religion?: string;
    churchFrequency?: string;
    lookingFor?: string;
    valuesImportance?: string;
    children?: string;
}

export type PaymentStatus = 'idle' | 'pending' | 'paid' | 'failed';

export interface OrderBumps {
    allRegions: boolean;
    grupoEvangelico: boolean;
    grupoCatolico: boolean;
    filtrosAvancados: boolean;
    lifetime: boolean;
}

export interface CheckoutInfo {
    name: string;
    email: string;
    phone: string;
}
