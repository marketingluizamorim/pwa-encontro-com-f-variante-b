import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_NAMES: Record<string, string> = {
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
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const wooviApiKey = Deno.env.get("WOOVI_API_KEY");
    if (!wooviApiKey) throw new Error("Woovi API key not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: pendingPurchases, error: fetchError } = await supabase
      .from("purchases").select("*").eq("payment_status", "PENDING")
      .gte("created_at", twentyFourHoursAgo).not("payment_id", "is", null);

    if (fetchError) throw fetchError;

    const results = { checked: 0, paid: 0, failed: 0, stillPending: 0, errors: 0 };

    for (const purchase of pendingPurchases || []) {
      try {
        results.checked++;
        const wooviResponse = await fetch(`https://api.openpix.com.br/api/openpix/v1/charge/${purchase.payment_id}`, {
          method: "GET", headers: { "Authorization": wooviApiKey, "Content-Type": "application/json" }
        });

        if (!wooviResponse.ok) { results.errors++; continue; }

        const wooviData = await wooviResponse.json();
        const charge = wooviData.charge || wooviData;
        const wooviStatus = charge.status;
        const isTestPayment = (purchase.payment_id && (purchase.payment_id.startsWith("dev-test-") || purchase.payment_id.startsWith("mock-payment-id-")));

        let status: "PENDING" | "PAID" | "FAILED";
        if (wooviStatus === "COMPLETED" || wooviStatus === "CONFIRMED") status = "PAID";
        else if (wooviStatus === "EXPIRED" || wooviStatus === "ERROR") status = "FAILED";
        else status = "PENDING";

        if (status === "PENDING") { results.stillPending++; continue; }

        await supabase.from("purchases").update({ payment_status: status, updated_at: new Date().toISOString() }).eq("id", purchase.id);

        if (status === "PAID") {
          results.paid++;
          const now = new Date();
          let expiresAt: Date | null = null;
          switch (purchase.plan_id) {
            case "weekly": expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); break;
            case "monthly": expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); break;
            case "annual": expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); break;
            default: expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          }

          const orderBumpsArray: string[] = Array.isArray(purchase.order_bumps) ? purchase.order_bumps : [];
          const hasLifetime = orderBumpsArray.includes("lifetime") || ["lifetime", "special", "special-offer-lifetime"].includes(purchase.plan_id);

          if (purchase.user_id) {
            await supabase.from("user_subscriptions").upsert({
              user_id: purchase.user_id, purchase_id: purchase.id, plan_id: purchase.plan_id, plan_name: purchase.plan_name,
              starts_at: now.toISOString(), expires_at: hasLifetime ? null : expiresAt?.toISOString(),
              is_active: true, is_lifetime: hasLifetime, has_all_regions: orderBumpsArray.includes("allRegions"),
              daily_swipes_limit: ["annual", purchase.plan_id].some(p => p === "annual" || hasLifetime) ? 999 : 50,
              can_see_who_liked: ["annual", purchase.plan_id].some(p => p === "annual" || hasLifetime),
              is_profile_boosted: ["annual", purchase.plan_id].some(p => p === "annual" || hasLifetime),
              can_video_call: hasLifetime, can_use_advanced_filters: true,
            }, { onConflict: "user_id" });
          }

          const isTestUser = purchase.user_email?.includes("@test.com") || purchase.user_email?.includes("@temporario.com") ||
            purchase.user_name?.toLowerCase().includes("dev") || purchase.plan_name?.toLowerCase().includes("dev");

          if (!isTestPayment && !isTestUser && !DISABLE_WEBHOOKS) {
            try {
              const approvedDate = formatDateForWebhook(now);
              const createdAtFormatted = formatDateForWebhook(new Date(purchase.created_at));
              const products = [{ id: purchase.plan_id, name: PLAN_NAMES[purchase.plan_id] || purchase.plan_name, price: Number(purchase.plan_price), quantity: 1 }];

              if (!purchase.plan_id.includes("special")) {
                for (const bumpId of orderBumpsArray) {
                  products.push({ id: bumpId, name: BUMP_NAMES[bumpId] || bumpId, price: BUMP_PRICE, quantity: 1 });
                }
              }

              const webhookPayload = {
                orderId: purchase.id, platform: "encontrocomfe", status: "paid",
                createdAt: createdAtFormatted, approvedDate,
                customer: { name: purchase.user_name, email: purchase.user_email, phone: purchase.user_phone || null },
                products, totalPrice: Number(purchase.total_price), paymentMethod: "PIX"
              };

              await fetch("https://n8n.srv1093629.hstgr.cloud/webhook/woovi", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(webhookPayload)
              });
            } catch (e) {
              console.error("Webhook error:", e);
            }
          }
        } else if (status === "FAILED") {
          results.failed++;
        }
      } catch (e) {
        results.errors++;
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
