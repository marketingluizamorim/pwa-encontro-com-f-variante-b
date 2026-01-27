import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
  orderBumps?: { allRegions: boolean; grupoEvangelico: boolean; grupoCatolico: boolean; lifetime: boolean };
  quizData?: Record<string, unknown>;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  src?: string;
  sck?: string;
  isSpecialOffer?: boolean;
}

const PLAN_NAMES: Record<string, string> = {
  weekly: "Plano Semanal",
  monthly: "Plano Mensal",
  annual: "Plano Anual",
  lifetime: "Plano Vitalício",
  special: "Oferta Especial",
};

// Fixed prices as source of truth (in BRL)
const PLAN_PRICES: Record<string, number> = {
  weekly: 9.90,
  monthly: 14.90,
  annual: 20,
  special: 9.90,
};

const BUMP_PRICE = 5;

const BUMP_NAMES: Record<string, string> = {
  allRegions: "Desbloquear Regiões",
  grupoEvangelico: "Grupo Evangélico",
  grupoCatolico: "Grupo Católico",
  lifetime: "Acesso Vitalício",
};

// Format date as "YYYY-MM-DD HH:mm:ss"
function formatDateForWebhook(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const wooviApiKey = Deno.env.get("WOOVI_API_KEY");
    if (!wooviApiKey) {
      throw new Error("Woovi API key not configured");
    }

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
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      src,
      sck,
      isSpecialOffer,
    } = body;

    // Use fixed backend prices as source of truth (ignore frontend price)
    const basePlanPrice = PLAN_PRICES[planId] ?? planPrice;
    
    // Calculate total price with order bumps
    // For special offer, bumps are already included in the price (R$ 9.90 fixed)
    let totalPrice = basePlanPrice;
    const orderBumpsList: string[] = [];

    if (!isSpecialOffer) {
      // Only add bump prices for regular checkout
      if (orderBumps?.allRegions) {
        totalPrice += 5;
        orderBumpsList.push("allRegions");
      }
      if (orderBumps?.grupoEvangelico) {
        totalPrice += 5;
        orderBumpsList.push("grupoEvangelico");
      }
      if (orderBumps?.grupoCatolico) {
        totalPrice += 5;
        orderBumpsList.push("grupoCatolico");
      }
      if (orderBumps?.lifetime) {
        totalPrice += 5;
        orderBumpsList.push("lifetime");
      }
    } else {
      // For special offer, just track the bumps without adding to price
      if (orderBumps?.allRegions) orderBumpsList.push("allRegions");
      if (orderBumps?.grupoEvangelico) orderBumpsList.push("grupoEvangelico");
      if (orderBumps?.grupoCatolico) orderBumpsList.push("grupoCatolico");
      if (orderBumps?.lifetime) orderBumpsList.push("lifetime");
    }

    console.log("Order bumps received:", JSON.stringify(orderBumps));
    console.log("Total price calculated:", totalPrice);

    // Convert to cents for Woovi (total price including bumps)
    const amountInCents = Math.round(totalPrice * 100);

    // Generate unique correlation ID
    const correlationID = crypto.randomUUID();

    // Create charge on Woovi/OpenPix (without additionalInfo to keep PIX clean)
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
    console.log("Woovi response:", JSON.stringify(wooviData));

    // Extract payment info from Woovi response
    const charge = wooviData.charge || wooviData;
    const paymentId = charge.correlationID || correlationID;
    const pixCode = charge.brCode || "";
    const qrCodeImage = charge.qrCodeImage || "";
    const paymentLinkUrl = charge.paymentLinkUrl || "";


    // Save purchase to database
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
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_term: utmTerm,
        src: src,
        sck: sck,
      })
      .select()
      .single();

    if (purchaseError) {
      console.error("Error saving purchase:", purchaseError);
      // Continue anyway - payment was created
    }

    // Send webhook to n8n with structured payload matching expected format
    try {
      const createdAt = formatDateForWebhook(new Date());
      
      // Build products array - for special offer, send single bundled product
      let products: { id: string; name: string; price: number; quantity: number }[];
      
      if (isSpecialOffer) {
        // Special offer (backredirect): single bundled product
        products = [
          {
            id: "special-offer-lifetime",
            name: "Oferta Especial Vitalícia",
            price: 9.90,
            quantity: 1,
          },
        ];
      } else {
        // Regular checkout: plan + individual bumps
        products = [
          {
            id: planId,
            name: PLAN_NAMES[planId] || planId,
            price: basePlanPrice,
            quantity: 1,
          },
        ];
        
        // Add order bumps as products
        for (const bumpId of orderBumpsList) {
          products.push({
            id: bumpId,
            name: BUMP_NAMES[bumpId] || bumpId,
            price: BUMP_PRICE,
            quantity: 1,
          });
        }
      }
      
      const webhookPayload = {
        orderId: purchase?.id || null,
        platform: "encontrocomfe",
        status: "waiting_payment",
        createdAt: createdAt,
        approvedDate: null,
        customer: {
          name: userName,
          email: userEmail,
          phone: userPhone || null,
        },
        products: products,
        totalPrice: totalPrice,
        paymentMethod: "PIX",
        tracking: {
          planId: isSpecialOffer ? "special-offer-lifetime" : planId,
          planPrice: isSpecialOffer ? 9.90 : basePlanPrice,
          orderBumps: isSpecialOffer ? [] : orderBumpsList,
          isSpecialOffer: isSpecialOffer || false,
          purchaseSource: isSpecialOffer ? "backredirect" : "checkout",
        },
        utm: {
          source: utmSource || null,
          medium: utmMedium || null,
          campaign: utmCampaign || null,
          content: utmContent || null,
          term: utmTerm || null,
          src: src || null,
          sck: sck || null,
        },
      };

      console.log("Sending webhook payload:", JSON.stringify(webhookPayload));

      const webhookResponse = await fetch("https://n8n.srv1093629.hstgr.cloud/webhook/woovi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!webhookResponse.ok) {
        console.error("Webhook error:", await webhookResponse.text());
      } else {
        console.log("Webhook sent successfully");
      }
    } catch (webhookError) {
      console.error("Error sending webhook:", webhookError);
      // Continue anyway - don't fail the payment because of webhook
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentId,
        pixCode,
        qrCodeImage,
        // Return totalPrice (the actual amount charged in Woovi including bumps)
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
