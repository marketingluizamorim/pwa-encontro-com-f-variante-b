import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckPaymentRequest {
  paymentId: string;
}

const PLAN_NAMES: Record<string, string> = {
  plus: "Plano Plus (Combo Ilimitado)",
  bronze: "Plano Bronze (Semanal)",
  silver: "Plano Prata (Mensal)",
  gold: "Plano Ouro (Mensal)",
  weekly: "Plano Semanal",
  monthly: "Plano Mensal",
  annual: "Plano Anual",
  lifetime: "Plano Vitalício",
  special: "Oferta Especial",
  "special-offer-lifetime": "Oferta Especial Vitalícia",
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

    const body: CheckPaymentRequest = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      throw new Error("Payment ID is required");
    }

    let status: "PENDING" | "PAID" | "FAILED" = "PENDING";
    let wooviStatus = "PENDING";

    // BREAKPOINT: Handle Dev Test payments without calling Woovi
    if (paymentId.startsWith("dev-test-")) {
      status = "PAID";
      wooviStatus = "COMPLETED";
      console.log("Processing DEV TEST payment:", paymentId);
    } else {
      // Check charge status on Woovi/OpenPix
      const wooviResponse = await fetch(
        `https://api.openpix.com.br/api/openpix/v1/charge/${paymentId}`,
        {
          method: "GET",
          headers: {
            "Authorization": wooviApiKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (!wooviResponse.ok) {
        const errorText = await wooviResponse.text();
        console.error("Woovi error:", errorText);
        throw new Error(`Woovi API error: ${wooviResponse.status}`);
      }

      const wooviData = await wooviResponse.json();
      console.log("Woovi status response:", JSON.stringify(wooviData));

      // Map Woovi status to our status
      const charge = wooviData.charge || wooviData;
      wooviStatus = charge.status;

      if (wooviStatus === "COMPLETED" || wooviStatus === "CONFIRMED") {
        status = "PAID";
      } else if (wooviStatus === "EXPIRED" || wooviStatus === "ERROR") {
        status = "FAILED";
      } else {
        status = "PENDING";
      }
    }

    // Update purchase status in database if not pending
    if (status !== "PENDING") {
      const { error: updateError } = await supabase
        .from("purchases")
        .update({
          payment_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("payment_id", paymentId);

      if (updateError) {
        console.error("Error updating purchase:", updateError);
      }

      // If paid, create subscription and send webhook
      if (status === "PAID") {
        // Get purchase details
        const { data: purchase, error: purchaseError } = await supabase
          .from("purchases")
          .select("*")
          .eq("payment_id", paymentId)
          .maybeSingle();

        if (purchaseError) {
          console.error("Error fetching purchase:", purchaseError);
        }

        if (purchase) {
          // Calculate expiry based on plan
          let expiresAt: Date | null = null;
          const now = new Date();

          switch (purchase.plan_id) {
            case "bronze":
            case "weekly":
              expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
              break;
            case "silver":
            case "monthly":
              expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
              break;
            case "gold":
            case "annual":
              expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Gold is monthly too
              break;
            case "lifetime":
            case "special":
            case "special-offer-lifetime":
              expiresAt = null; // Never expires
              break;
            default:
              expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          }

          // Parse order bumps - handle both array and object formats
          let orderBumpsArray: string[] = [];
          const rawOrderBumps = purchase.order_bumps;

          if (Array.isArray(rawOrderBumps)) {
            orderBumpsArray = rawOrderBumps;
          } else if (rawOrderBumps && typeof rawOrderBumps === 'object') {
            orderBumpsArray = Object.entries(rawOrderBumps)
              .filter(([_, value]) => value === true)
              .map(([key]) => key);
          }

          console.log("Parsed order bumps:", orderBumpsArray);

          const hasAllRegions = orderBumpsArray.includes("allRegions");
          const hasLifetime = orderBumpsArray.includes("lifetime");
          const isLifetimePlan = purchase.plan_id === "lifetime" || purchase.plan_id === "special" || purchase.plan_id === "special-offer-lifetime";

          // Create subscription only for authenticated users
          if (purchase.user_id) {
            const { error: subError } = await supabase
              .from("user_subscriptions")
              .upsert(
                {
                  user_id: purchase.user_id,
                  purchase_id: purchase.id,
                  plan_id: purchase.plan_id,
                  plan_name: purchase.plan_name,
                  starts_at: now.toISOString(),
                  expires_at: hasLifetime || isLifetimePlan ? null : expiresAt?.toISOString(),
                  is_active: true,
                  is_lifetime: hasLifetime || isLifetimePlan,
                  has_all_regions: hasAllRegions,
                  daily_swipes_limit: (purchase.plan_id === 'bronze' || purchase.plan_id === 'weekly') ? 20 : 9999,
                  can_see_who_liked: purchase.plan_id !== 'bronze' && purchase.plan_id !== 'weekly',
                  is_profile_boosted: purchase.plan_id === 'gold' || purchase.plan_id === 'annual' || isLifetimePlan || purchase.plan_id === 'plus',
                  can_video_call: purchase.plan_id !== 'bronze' && purchase.plan_id !== 'weekly',
                  can_use_advanced_filters: purchase.plan_id !== 'bronze' && purchase.plan_id !== 'weekly',
                },
                { onConflict: "user_id" }
              );

            if (subError) {
              console.error("Error creating subscription:", subError);
            } else {
              console.log("Subscription created successfully for user:", purchase.user_id);
            }
          } else {
            console.log("Skipping subscription creation - no user_id associated with purchase");
          }

          // Send webhook to n8n for payment confirmation
          try {
            const approvedDate = formatDateForWebhook(now);
            const createdAtFormatted = formatDateForWebhook(new Date(purchase.created_at));

            // Check if this is a special offer purchase
            const isSpecialOfferPurchase = purchase.plan_id === "special" || purchase.plan_id === "special-offer-lifetime";

            // Build products array - for special offer, send single bundled product
            let products: { id: string; name: string; price: number; quantity: number }[];

            if (isSpecialOfferPurchase) {
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
                  id: purchase.plan_id,
                  name: PLAN_NAMES[purchase.plan_id] || purchase.plan_name,
                  price: Number(purchase.plan_price),
                  quantity: 1,
                },
              ];

              // Add order bumps as products
              for (const bumpId of orderBumpsArray) {
                products.push({
                  id: bumpId,
                  name: BUMP_NAMES[bumpId] || bumpId,
                  price: BUMP_PRICE,
                  quantity: 1,
                });
              }
            }

            const webhookPayload = {
              orderId: purchase.id,
              platform: "encontrocomfe",
              status: "paid",
              createdAt: createdAtFormatted,
              approvedDate: approvedDate,
              customer: {
                name: purchase.user_name,
                email: purchase.user_email,
                phone: purchase.user_phone || null,
              },
              products: products,
              totalPrice: Number(purchase.total_price),
              paymentMethod: "PIX",
              tracking: {
                planId: isSpecialOfferPurchase ? "special-offer-lifetime" : purchase.plan_id,
                planPrice: isSpecialOfferPurchase ? 9.90 : Number(purchase.plan_price),
                orderBumps: isSpecialOfferPurchase ? [] : orderBumpsArray,
              },
              utm: {
                source: purchase.utm_source || null,
                medium: purchase.utm_medium || null,
                campaign: purchase.utm_campaign || null,
                content: purchase.utm_content || null,
                term: purchase.utm_term || null,
                src: purchase.src || null,
                sck: purchase.sck || null,
              },
            };

            console.log("Sending payment confirmation webhook:", JSON.stringify(webhookPayload));

            const webhookResponse = await fetch("https://n8n.srv1093629.hstgr.cloud/webhook/woovi", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(webhookPayload),
            });

            console.log("Webhook response status:", webhookResponse.status);
            const webhookResponseText = await webhookResponse.text();
            console.log("Webhook response body:", webhookResponseText);

            if (!webhookResponse.ok) {
              console.error("Webhook error - status:", webhookResponse.status, "body:", webhookResponseText);
            } else {
              console.log("Payment confirmation webhook sent successfully");
            }
          } catch (webhookError) {
            console.error("Error sending payment confirmation webhook:", webhookError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status,
        paymentId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error checking payment:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        status: "PENDING",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
