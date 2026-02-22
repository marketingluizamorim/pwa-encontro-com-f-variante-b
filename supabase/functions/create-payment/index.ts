/// <reference path="../deno.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { notifyUtmify, fmtDate, calcCommission } from "../_shared/utmify.ts";
import type { UtmifyProduct } from "../_shared/utmify.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreatePaymentRequest {
  planId: string;
  planPrice: number;
  userName: string;
  userEmail: string;
  userPhone?: string;
  orderBumps?: { allRegions: boolean; grupoEvangelico: boolean; grupoCatolico: boolean; filtrosAvancados: boolean; specialOffer: boolean };
  quizData?: Record<string, unknown>;
  isSpecialOffer?: boolean;
  planName?: string;
  purchaseSource?: string;
  // UTM fields
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  src?: string | null;
  sck?: string | null;
}

const PLAN_NAMES: Record<string, string> = {
  bronze: "Plano Bronze (Semanal)",
  silver: "Plano Prata (Mensal)",
  gold: "Plano Ouro (Mensal)",
  "special-offer": "Oferta Especial (3 Meses)",
};

const PLAN_PRICES: Record<string, number> = {
  bronze: 1.00,
  silver: 2.00,
  gold: 3.00,
  "special-offer": 15.90,
  special: 15.90,
};

const BUMP_NAMES: Record<string, string> = {
  allRegions: "Desbloquear Região",
  grupoEvangelico: "Grupo Evangélico",
  grupoCatolico: "Grupo Católico",
  filtrosAvancados: "Filtros Avançados",
  specialOffer: "Oferta Especial",
};

const BUMP_PRICE = 5;


// Format date as "YYYY-MM-DD HH:mm:ss"
function formatDateForWebhook(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const DISABLE_WEBHOOKS = true; // Set to false to enable n8n integration

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CreatePaymentRequest = await req.json();
    const {
      planId,
      planPrice,
      userName,
      userEmail,
      userPhone,
      orderBumps,
      quizData,
      isSpecialOffer,
      planName,
      purchaseSource,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      src,
      sck,
    } = body;

    const isTestUser = userEmail.includes("@test.com") ||
      userEmail.includes("@temporario.com") ||
      userName.toLowerCase().includes("dev") ||
      planName?.toLowerCase().includes("dev");

    // Use fixed backend prices as source of truth (ignore frontend price)
    const basePlanPrice = PLAN_PRICES[planId] ?? planPrice;

    // Calculate total price with order bumps
    let totalPrice = basePlanPrice;
    const orderBumpsList: string[] = [];

    if (!isSpecialOffer) {
      if (orderBumps?.allRegions) { totalPrice += 5; orderBumpsList.push("allRegions"); }
      if (orderBumps?.grupoEvangelico) { totalPrice += 5; orderBumpsList.push("grupoEvangelico"); }
      if (orderBumps?.grupoCatolico) { totalPrice += 5; orderBumpsList.push("grupoCatolico"); }
      if (orderBumps?.filtrosAvancados) { totalPrice += 5; orderBumpsList.push("filtrosAvancados"); }
    } else {
      if (orderBumps?.allRegions) orderBumpsList.push("allRegions");
      if (orderBumps?.grupoEvangelico) orderBumpsList.push("grupoEvangelico");
      if (orderBumps?.grupoCatolico) orderBumpsList.push("grupoCatolico");
      orderBumpsList.push("specialOffer");
    }

    const amountInCents = Math.round(totalPrice * 100);
    const correlationID = crypto.randomUUID();

    let pixCode = "";
    let qrCodeImage = "";
    let paymentLinkUrl = "";
    let paymentId = correlationID;

    if (!isTestUser) {
      const wooviApiKey = Deno.env.get("WOOVI_API_KEY");
      if (!wooviApiKey) {
        throw new Error("Woovi API key not configured for production payments");
      }

      const wooviResponse = await fetch("https://api.openpix.com.br/api/openpix/v1/charge", {
        method: "POST",
        headers: {
          "Authorization": wooviApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correlationID,
          value: amountInCents,
          comment: PLAN_NAMES[planId] || `Plano ${planId}`,
          customer: {
            name: userName,
            email: userEmail,
            phone: userPhone?.replace(/\D/g, ""),
          },
        }),
      });

      if (!wooviResponse.ok) {
        const errorText = await wooviResponse.text();
        console.error("Woovi error:", errorText);
        throw new Error(`Woovi API error: ${wooviResponse.status}`);
      }

      const wooviData = await wooviResponse.json();
      const charge = wooviData.charge || wooviData;
      paymentId = charge.correlationID || correlationID;
      pixCode = charge.brCode || "";
      qrCodeImage = charge.qrCodeImage || "";
      paymentLinkUrl = charge.paymentLinkUrl || "";
    }

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
        payment_id: paymentId,
        payment_status: "PENDING",
        payment_method: "PIX",
        order_bumps: orderBumpsList,
        quiz_data: quizData || {},
        source_platform: purchaseSource ?? 'funnel',
        // UTM tracking
        utm_source: utmSource ?? null,
        utm_medium: utmMedium ?? null,
        utm_campaign: utmCampaign ?? null,
        utm_content: utmContent ?? null,
        utm_term: utmTerm ?? null,
        src: src ?? null,
        sck: sck ?? null,
      })
      .select()
      .single();

    if (purchaseError) {
      console.error("Error saving purchase:", purchaseError);
    }

    // ── Notify UTMify: waiting_payment ───────────────────────────────────
    if (!isTestUser && purchase) {
      const utmifyToken = Deno.env.get("UTMIFY_API_TOKEN");
      if (utmifyToken) {
        const products: UtmifyProduct[] = [{
          id: planId,
          name: PLAN_NAMES[planId] || planId,
          planId: planId,
          planName: PLAN_NAMES[planId] || null,
          quantity: 1,
          priceInCents: Math.round(basePlanPrice * 100),
        }];
        for (const bumpId of orderBumpsList) {
          if (bumpId === 'specialOffer') continue;
          products.push({
            id: bumpId,
            name: BUMP_NAMES[bumpId] || bumpId,
            planId: null,
            planName: null,
            quantity: 1,
            priceInCents: Math.round(BUMP_PRICE * 100),
          });
        }
        const now = new Date();
        const totalInCents = Math.round(totalPrice * 100);
        await notifyUtmify(utmifyToken, {
          orderId: purchase.id,
          platform: "EncontroComFe",
          paymentMethod: "pix",
          status: "waiting_payment",
          createdAt: fmtDate(now),
          approvedDate: null,
          refundedAt: null,
          customer: {
            name: userName,
            email: userEmail,
            phone: userPhone?.replace(/\D/g, "") || null,
            document: null,
            country: "BR",
          },
          products,
          trackingParameters: {
            src: src ?? null,
            sck: sck ?? null,
            utm_source: utmSource ?? null,
            utm_campaign: utmCampaign ?? null,
            utm_medium: utmMedium ?? null,
            utm_content: utmContent ?? null,
            utm_term: utmTerm ?? null,
          },
          commission: calcCommission(totalInCents),
        });
      }
    }
    // ────────────────────────────────────────────────────────────────────

    return new Response(
      JSON.stringify({
        success: true,
        paymentId,
        pixCode,
        qrCodeImage,
        totalAmount: totalPrice,
        purchaseId: purchase?.id,
        checkoutUrl: paymentLinkUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
