/// <reference path="../deno.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_NAMES: Record<string, string> = {
    bronze: "Plano Bronze (Semanal)",
    silver: "Plano Prata (Mensal)",
    gold: "Plano Ouro (Mensal)",
    weekly: "Plano Semanal",
    monthly: "Plano Mensal",
    annual: "Plano Anual",
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

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const body = await req.json();
        const charge = body.charge;
        const event = body.event;

        if (!charge || (event && event !== "OPENPIX:CHARGE_COMPLETED" && event !== "OPENPIX:CHARGE_CONFIRMED")) {
            return new Response(JSON.stringify({ success: true, message: "Ignored" }), {
                status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const paymentId = charge.correlationID;
        if (!paymentId) throw new Error("No correlationID found in charge");

        const isTestPayment = paymentId.startsWith("dev-test-") || paymentId.startsWith("mock-payment-id-");

        const { data: purchase, error: purchaseError } = await supabase
            .from("purchases").update({ payment_status: "PAID", updated_at: new Date().toISOString() })
            .eq("payment_id", paymentId).select().maybeSingle();

        if (purchaseError) throw purchaseError;
        if (!purchase) return new Response(JSON.stringify({ success: false, error: "Purchase not found" }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

        if (purchase.user_id) {
            const now = new Date();
            let expiresAt: Date | null = null;
            switch (purchase.plan_id) {
                case "bronze": case "weekly": expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); break;
                case "silver": case "monthly": case "gold": expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); break;
                case "annual": expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); break;
                default: expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            }

            const orderBumps = Array.isArray(purchase.order_bumps) ? purchase.order_bumps : [];
            const hasLifetime = orderBumps.includes("lifetime") || ["lifetime", "special"].includes(purchase.plan_id);

            await supabase.from("user_subscriptions").upsert({
                user_id: purchase.user_id,
                purchase_id: purchase.id,
                plan_id: purchase.plan_id,
                plan_name: purchase.plan_name,
                starts_at: now.toISOString(),
                expires_at: hasLifetime ? null : expiresAt?.toISOString(),
                is_active: true,
                is_lifetime: hasLifetime,
                has_all_regions: orderBumps.includes("allRegions"),
                daily_swipes_limit: ["bronze", "weekly"].includes(purchase.plan_id) ? 20 : 9999,
                can_see_who_liked: !["bronze", "weekly"].includes(purchase.plan_id),
                is_profile_boosted: ["gold", "annual"].includes(purchase.plan_id) || hasLifetime,
                can_video_call: !["bronze", "weekly"].includes(purchase.plan_id),
                can_use_advanced_filters: !["bronze", "weekly"].includes(purchase.plan_id),
            }, { onConflict: "user_id" });
        }

        const isTestUser = purchase.user_email?.includes("@test.com") || purchase.user_email?.includes("@temporario.com") ||
            purchase.user_name?.toLowerCase().includes("dev") || purchase.plan_name?.toLowerCase().includes("dev");

        if (!isTestPayment && !isTestUser && !DISABLE_WEBHOOKS) {
            try {
                const now = new Date();
                const approvedDate = formatDateForWebhook(now);
                const createdAtFormatted = formatDateForWebhook(new Date(purchase.created_at));
                const orderBumps = Array.isArray(purchase.order_bumps) ? purchase.order_bumps : [];

                const products = [{ id: purchase.plan_id, name: purchase.plan_name, price: Number(purchase.plan_price), quantity: 1 }];
                for (const bumpId of orderBumps) {
                    products.push({ id: bumpId, name: BUMP_NAMES[bumpId] || bumpId, price: BUMP_PRICE, quantity: 1 });
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

        return new Response(JSON.stringify({ success: true }), {
            status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Webhook error:", error);
        return new Response(JSON.stringify({ success: false, error: message }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
