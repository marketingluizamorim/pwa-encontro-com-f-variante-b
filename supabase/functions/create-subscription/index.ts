/// <reference path="../deno.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Plan config ───────────────────────────────────────────────────────────────
const PLAN_NAMES: Record<string, string> = {
    bronze: "Plano Bronze Semanal",
    silver: "Plano Prata Mensal",
    gold: "Plano Ouro Mensal",
};

const PLAN_PRICES: Record<string, number> = {
    bronze: 1.00,
    silver: 2.00,
    gold: 3.00,
};

// Woovi PIX_RECURRING config
// dayGenerateCharge = today (required for PAYMENT_ON_APPROVAL journey)
const PLAN_FREQUENCY: Record<string, { frequency: string; daysAccess: number }> = {
    bronze: { frequency: "WEEKLY", daysAccess: 7 },
    silver: { frequency: "MONTHLY", daysAccess: 30 },
    gold: { frequency: "MONTHLY", daysAccess: 30 },
};

const BUMP_PRICE = 5;

// ── CPF Generator (valid check digits — never a real person's CPF) ─────────────
function generateFakeCPF(): string {
    function calcDigit(digits: number[], factor: number): number {
        const sum = digits.reduce((acc, d) => { acc += d * factor--; return acc; }, 0);
        const rem = sum % 11;
        return rem < 2 ? 0 : 11 - rem;
    }

    let base: number[];
    do {
        base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
    } while (new Set(base).size === 1); // reject all-same (111.111.111-xx)

    const d1 = calcDigit(base, 10);
    const d2 = calcDigit([...base, d1], 11);
    return [...base, d1, d2].join("");
}

// ── Fake BR address (required by Woovi PIX_RECURRING) ─────────────────────────
function generateFakeAddress() {
    // Generic Brasília address — avoids revealing real user location
    return {
        zipcode: "74840360",
        street: "R. Cananeia",
        number: "1",
        neighborhood: "Jardim Goias",
        city: "Goiania",
        state: "GO",
        complement: "",
    };
}

interface CreateSubscriptionRequest {
    planId: string;
    userName: string;
    userEmail: string;
    userPhone?: string;
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
        const { planId, userName, userEmail, userPhone, orderBumps, quizData, purchaseSource } = body;

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

        // ── Generate CPF + address for Woovi (never collected from user) ──────────
        const generatedCpf = generateFakeCPF();
        const generatedAddress = generateFakeAddress();

        // dayGenerateCharge must be today for PAYMENT_ON_APPROVAL journey
        const today = new Date();
        const dayGenerateCharge = today.getDate();

        // ── Test user bypass ───────────────────────────────────────────────────────
        const isTestUser = userEmail === "test@test.com"; // Strict test user only

        let pixCode = "";
        let qrCodeImage = "";
        let paymentLinkUrl = "";
        let wooviSubscriptionId = correlationID;

        if (!isTestUser) {
            const wooviApiKey = Deno.env.get("WOOVI_API_KEY");
            if (!wooviApiKey) throw new Error("Woovi API key not configured");

            // ── Woovi PIX Automático — Jornada 3 (PAYMENT_ON_APPROVAL) ────────────
            // Docs: https://developers.woovi.com/en/docs/pix-automatic/pix-automatic-how-to-create
            // IMPORTANT: customer.address is REQUIRED for PIX_RECURRING
            // name/comment must be ≤ 30 chars (Woovi validation)
            const shortName = (PLAN_NAMES[planId] || `Plano ${planId}`).slice(0, 30);
            const additionalInfo = [];
            if (orderBumps?.allRegions) additionalInfo.push({ key: "Adicional", value: "Desbloquear Região" });
            if (orderBumps?.grupoEvangelico) additionalInfo.push({ key: "Adicional", value: "Acesso Grupo Evangélico" });
            if (orderBumps?.grupoCatolico) additionalInfo.push({ key: "Adicional", value: "Acesso Grupo Católico" });

            const subscriptionPayload = {
                name: shortName,
                correlationID,
                value: amountInCents,
                comment: shortName,
                additionalInfo,
                type: "PIX_RECURRING",
                frequency: planConfig.frequency,
                dayGenerateCharge,    // today — required for journey 3
                dayDue: 3,            // 3 days to expire the charge
                customer: {
                    name: userName.slice(0, 30),
                    email: userEmail,
                    taxID: generatedCpf,
                    phone: (userPhone || "").replace(/\D/g, "") || "00000000000",
                    address: generatedAddress,  // REQUIRED by Woovi for PIX_RECURRING
                },
                pixRecurringOptions: {
                    journey: "PAYMENT_ON_APPROVAL",
                    retryPolicy: "NON_PERMITED",
                },
            };

            // Log payload with masked CPF for debugging
            console.log("Woovi PIX Automático payload:", JSON.stringify({
                ...subscriptionPayload,
                customer: { ...subscriptionPayload.customer, taxID: "***" },
            }, null, 2));

            const wooviResponse = await fetch("https://api.openpix.com.br/api/v1/subscriptions", {
                method: "POST",
                headers: {
                    "Authorization": wooviApiKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(subscriptionPayload),
            });

            const wooviRaw = await wooviResponse.text();

            if (!wooviResponse.ok) {
                console.error("Woovi error body:", wooviRaw);
                throw new Error(`Woovi API error: ${wooviResponse.status} - ${wooviRaw}`);
            }

            const wooviData = JSON.parse(wooviRaw);
            console.log("Woovi response:", JSON.stringify(wooviData));

            // Response shape per docs:
            // { subscription: { pixRecurring: { emv, recurrencyId, journey, status }, paymentLinkUrl, correlationID, globalID, ... } }
            const sub = wooviData.subscription || wooviData;

            wooviSubscriptionId = sub.correlationID || sub.globalID || correlationID;
            paymentLinkUrl = sub.paymentLinkUrl || "";

            // PIX code is in pixRecurring.emv for journey 3
            const pixRecurring = sub.pixRecurring;
            if (pixRecurring?.emv) {
                pixCode = pixRecurring.emv;
                // qrCodeImage is typically generated from the EMV — return paymentLinkUrl as fallback
                qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixRecurring.emv)}`;
            }
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
                user_cpf: generatedCpf,   // internal only — NEVER sent to frontend
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
