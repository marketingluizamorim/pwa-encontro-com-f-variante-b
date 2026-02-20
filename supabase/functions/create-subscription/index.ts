/// <reference path="../deno.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Plan config ───────────────────────────────────────────────────────────────
const PLAN_NAMES: Record<string, string> = {
    bronze: "Plano Bronze (Semanal)",
    silver: "Plano Prata (Mensal)",
    gold: "Plano Ouro (Mensal)",
};

const PLAN_PRICES: Record<string, number> = {
    bronze: 12.90,
    silver: 29.90,
    gold: 49.90,
};

// Frequency and billing cycle per plan
const PLAN_FREQUENCY: Record<string, { frequency: string; dayGenerateCharge: number; dayDue: number; daysAccess: number }> = {
    bronze: { frequency: "WEEKLY", dayGenerateCharge: 1, dayDue: 3, daysAccess: 7 },
    silver: { frequency: "MONTHLY", dayGenerateCharge: 1, dayDue: 5, daysAccess: 30 },
    gold: { frequency: "MONTHLY", dayGenerateCharge: 1, dayDue: 5, daysAccess: 30 },
};

const BUMP_PRICE = 5;

interface CreateSubscriptionRequest {
    planId: string;
    userName: string;
    userEmail: string;
    userPhone?: string;
    userCpf?: string;
    userAddress?: {
        street: string; number: string; neighborhood: string;
        city: string; state: string; zipCode: string; country?: string;
    };
    orderBumps?: { allRegions: boolean; grupoEvangelico: boolean; grupoCatolico: boolean; };
    quizData?: Record<string, unknown>;
    purchaseSource?: string;
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const body: CreateSubscriptionRequest = await req.json();
        const { planId, userName, userEmail, userPhone, userCpf, userAddress, orderBumps, quizData, purchaseSource } = body;

        // ── Validate plan ──────────────────────────────────────────────────────────
        const planConfig = PLAN_FREQUENCY[planId];
        if (!planConfig) throw new Error(`Plano inválido: ${planId}`);

        const basePlanPrice = PLAN_PRICES[planId];
        let totalPrice = basePlanPrice;
        const orderBumpsList: string[] = [];

        if (orderBumps?.allRegions) { totalPrice += BUMP_PRICE; orderBumpsList.push("allRegions"); }
        if (orderBumps?.grupoEvangelico) { totalPrice += BUMP_PRICE; orderBumpsList.push("grupoEvangelico"); }
        if (orderBumps?.grupoCatolico) { totalPrice += BUMP_PRICE; orderBumpsList.push("grupoCatolico"); }

        const amountInCents = Math.round(totalPrice * 100);
        const correlationID = crypto.randomUUID();

        // ── Test user bypass ───────────────────────────────────────────────────────
        const isTestUser = userEmail.includes("@test.com") || userEmail.includes("@temporario.com") ||
            userName.toLowerCase().includes("dev");

        let pixCode = "";
        let qrCodeImage = "";
        let paymentLinkUrl = "";
        let wooviSubscriptionId = correlationID;

        if (!isTestUser) {
            const wooviApiKey = Deno.env.get("WOOVI_API_KEY");
            if (!wooviApiKey) throw new Error("Woovi API key not configured");

            // ── Create PIX charge via standard Woovi endpoint ──────────────────────
            // NOTE: PIX Automático (PIX_RECURRING) requires special Woovi account activation.
            // Using standard one-time charge until it is enabled.
            const chargePayload = {
                correlationID,
                value: amountInCents,
                comment: PLAN_NAMES[planId] || `Plano ${planId}`,
                expiresIn: planConfig.daysAccess * 24 * 60 * 60, // seconds
                customer: {
                    name: userName,
                    email: userEmail,
                    phone: userPhone?.replace(/\D/g, "") || "",
                    ...(userCpf ? { taxID: userCpf.replace(/\D/g, "") } : {}),
                },
            };

            console.log("Woovi charge payload:", JSON.stringify(chargePayload, null, 2));

            const wooviResponse = await fetch("https://api.openpix.com.br/api/v1/charge", {
                method: "POST",
                headers: { "Authorization": wooviApiKey, "Content-Type": "application/json" },
                body: JSON.stringify(chargePayload),
            });

            if (!wooviResponse.ok) {
                const err = await wooviResponse.text();
                console.error("Woovi charge error:", wooviResponse.status, err);
                throw new Error(`Woovi API error: ${wooviResponse.status} - ${err}`);
            }

            const wooviData = await wooviResponse.json();
            const charge = wooviData.charge || wooviData;

            wooviSubscriptionId = charge.correlationID || charge.globalID || correlationID;
            pixCode = charge.brCode || "";
            qrCodeImage = charge.qrCodeImage || "";
            paymentLinkUrl = charge.paymentLinkUrl || "";
        }

        // ── Save purchase row ──────────────────────────────────────────────────────
        const { data: purchase, error: purchaseError } = await supabase
            .from("purchases")
            .insert({
                plan_id: planId,
                plan_name: PLAN_NAMES[planId] || planId,
                plan_price: basePlanPrice,
                total_price: totalPrice,
                user_name: userName,
                user_email: userEmail,
                user_phone: userPhone,
                user_cpf: userCpf,
                payment_id: wooviSubscriptionId,
                payment_status: "PENDING",
                payment_method: "PIX_AUTOMATIC",
                order_bumps: orderBumpsList,
                quiz_data: quizData || {},
                source_platform: purchaseSource ?? "funnel",
            })
            .select()
            .single();

        if (purchaseError) console.error("Error saving purchase:", purchaseError);

        return new Response(
            JSON.stringify({
                success: true,
                subscriptionId: wooviSubscriptionId,
                pixCode,
                qrCodeImage,
                totalAmount: totalPrice,
                purchaseId: purchase?.id,
                checkoutUrl: paymentLinkUrl,
                isPixAutomatic: true,
                planCycle: planConfig.frequency,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    } catch (error) {
        console.error("Error creating subscription:", error);
        return new Response(
            JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    }
});
