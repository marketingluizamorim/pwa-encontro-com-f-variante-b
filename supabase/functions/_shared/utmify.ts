/** Shared helper to notify the UTMify Orders API. */

const UTMIFY_ENDPOINT = "https://api.utmify.com.br/api-credentials/orders";

export interface UtmifyProduct {
    id: string;
    name: string;
    planId: string | null;
    planName: string | null;
    quantity: number;
    priceInCents: number;
}

export interface UtmifyTrackingParams {
    src: string | null;
    sck: string | null;
    utm_source: string | null;
    utm_campaign: string | null;
    utm_medium: string | null;
    utm_content: string | null;
    utm_term: string | null;
}

export interface UtmifyPayload {
    orderId: string;
    platform: string;
    paymentMethod: "pix";
    status: "waiting_payment" | "paid" | "refunded" | "chargedback";
    createdAt: string;       // "YYYY-MM-DD HH:MM:SS" UTC
    approvedDate: string | null;
    refundedAt: string | null;
    customer: {
        name: string;
        email: string;
        phone: string | null;
        document: string | null;
        country: string;
    };
    products: UtmifyProduct[];
    trackingParameters: UtmifyTrackingParams;
    commission: {
        totalPriceInCents: number;
        gatewayFeeInCents: number;
        userCommissionInCents: number;
        currency?: "BRL";
    };
}

/** Format a Date as "YYYY-MM-DD HH:MM:SS" (UTC) as required by UTMify. */
export function fmtDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return (
        `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
        `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
    );
}

/** Calculate commission: Woovi PIX ≈ 1% + R$0.15 per transaction. */
export function calcCommission(totalInCents: number) {
    const fee = Math.max(Math.round(totalInCents * 0.01 + 15), 1);
    return {
        totalPriceInCents: totalInCents,
        gatewayFeeInCents: fee,
        userCommissionInCents: totalInCents - fee,
        currency: "BRL" as const,
    };
}

/**
 * POST to UTMify Orders API. Fire-and-forget safe — errors are logged, never thrown.
 */
export async function notifyUtmify(
    apiToken: string,
    payload: UtmifyPayload,
): Promise<void> {
    try {
        const res = await fetch(UTMIFY_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-token": apiToken,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`UTMify [${payload.status}] error ${res.status}:`, text);
        } else {
            console.log(`UTMify [${payload.status}] ✓ orderId=${payload.orderId}`);
        }
    } catch (err) {
        console.error("UTMify request failed:", err);
    }
}
