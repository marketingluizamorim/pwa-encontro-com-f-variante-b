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

function formatDateForWebhook(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const DISABLE_WEBHOOKS = true;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CheckPaymentRequest = await req.json();
    const { paymentId } = body;

    if (!paymentId) throw new Error("Payment ID is required");

    let status: "PENDING" | "PAID" | "FAILED" = "PENDING";
    let wooviStatus = "PENDING";

    const isTestPayment = paymentId.startsWith("dev-test-") || paymentId.startsWith("mock-payment-id-");

    const { data: earlyPurchase } = await supabase
      .from("purchases")
      .select("user_email, user_name, plan_name")
      .eq("payment_id", paymentId)
      .maybeSingle();

    const isTestUser = earlyPurchase?.user_email?.includes("@test.com") ||
      earlyPurchase?.user_email?.includes("@temporario.com") ||
      earlyPurchase?.user_name?.toLowerCase().includes("dev") ||
      earlyPurchase?.plan_name?.toLowerCase().includes("dev");

    const isActuallyTest = isTestPayment || isTestUser;

    if (isActuallyTest) {
      status = "PAID";
      wooviStatus = "COMPLETED";
    } else {
      const wooviApiKey = Deno.env.get("WOOVI_API_KEY");
      if (!wooviApiKey) {
        throw new Error("Woovi API key not configured for production payments");
      }

      const wooviResponse = await fetch(`https://api.openpix.com.br/api/openpix/v1/charge/${paymentId}`, {
        method: "GET",
        headers: { "Authorization": wooviApiKey, "Content-Type": "application/json" },
      });

      if (!wooviResponse.ok) throw new Error(`Woovi API error: ${wooviResponse.status}`);

      const wooviData = await wooviResponse.json();
      const charge = wooviData.charge || wooviData;
      wooviStatus = charge.status;

      if (wooviStatus === "COMPLETED" || wooviStatus === "CONFIRMED") status = "PAID";
      else if (wooviStatus === "EXPIRED" || wooviStatus === "ERROR") status = "FAILED";
      else status = "PENDING";
    }

    if (status !== "PENDING") {
      await supabase.from("purchases").update({ payment_status: status, updated_at: new Date().toISOString() }).eq("payment_id", paymentId);

      if (status === "PAID") {
        const { data: purchase } = await supabase.from("purchases").select("*").eq("payment_id", paymentId).maybeSingle();

        if (purchase) {
          const now = new Date();
          let expiresAt: Date | null = null;

          switch (purchase.plan_id) {
            case "bronze": case "weekly": expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); break;
            case "silver": case "monthly": case "gold": case "annual": expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); break;
            default: expiresAt = null;
          }

          const orderBumpsArray: string[] = Array.isArray(purchase.order_bumps) ? purchase.order_bumps : [];
          const hasAllRegions = orderBumpsArray.includes("allRegions");
          const hasGrupoEvangelico = orderBumpsArray.includes("grupoEvangelico");
          const hasGrupoCatolico = orderBumpsArray.includes("grupoCatolico");
          const hasLifetime = orderBumpsArray.includes("lifetime") || ["lifetime", "special", "special-offer-lifetime"].includes(purchase.plan_id);

          if (purchase.user_id) {
            await supabase.from("user_subscriptions").upsert({
              user_id: purchase.user_id,
              purchase_id: purchase.id,
              plan_id: purchase.plan_id,
              plan_name: purchase.plan_name,
              starts_at: now.toISOString(),
              expires_at: hasLifetime ? null : expiresAt?.toISOString(),
              is_active: true,
              is_lifetime: hasLifetime,
              has_all_regions: hasAllRegions,
              has_grupo_evangelico: hasGrupoEvangelico,
              has_grupo_catolico: hasGrupoCatolico,
              daily_swipes_limit: (purchase.plan_id === 'bronze' || purchase.plan_id === 'weekly') ? 20 : 9999,
              can_see_who_liked: purchase.plan_id !== 'bronze' && purchase.plan_id !== 'weekly',
              is_profile_boosted: ["gold", "annual", "plus"].includes(purchase.plan_id) || hasLifetime,
              can_video_call: purchase.plan_id !== 'bronze' && purchase.plan_id !== 'weekly',
              can_use_advanced_filters: purchase.plan_id !== 'bronze' && purchase.plan_id !== 'weekly',
            }, { onConflict: "user_id" });
          }

          if (!isActuallyTest && !DISABLE_WEBHOOKS) {
            try {
              const createdAtFormatted = formatDateForWebhook(new Date(purchase.created_at));
              const approvedDate = formatDateForWebhook(now);
              const products = [{ id: purchase.plan_id, name: PLAN_NAMES[purchase.plan_id] || purchase.plan_name, price: Number(purchase.plan_price), quantity: 1 }];

              if (!purchase.plan_id.includes("special")) {
                for (const bumpId of orderBumpsArray) {
                  products.push({ id: bumpId, name: BUMP_NAMES[bumpId] || bumpId, price: BUMP_PRICE, quantity: 1 });
                }
              }

              const webhookPayload = {
                orderId: purchase.id,
                platform: "encontrocomfe",
                status: "paid",
                createdAt: createdAtFormatted,
                approvedDate: approvedDate,
                customer: { name: purchase.user_name, email: purchase.user_email, phone: purchase.user_phone || null },
                products,
                totalPrice: Number(purchase.total_price),
                paymentMethod: "PIX",
              };

              await fetch("https://n8n.srv1093629.hstgr.cloud/webhook/woovi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(webhookPayload),
              });
            } catch (e) {
              console.error("Webhook error:", e);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, status, paymentId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking payment:", error);
    return new Response(JSON.stringify({ success: false, error: error.message, status: "PENDING" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
