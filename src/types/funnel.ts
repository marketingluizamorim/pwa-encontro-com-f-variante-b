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
    specialOffer: boolean;
}

export interface CheckoutInfo {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export interface UTMData {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
}
