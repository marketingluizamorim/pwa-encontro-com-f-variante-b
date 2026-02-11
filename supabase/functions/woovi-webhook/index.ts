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

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const body = await req.json();
        console.log("Woovi webhook received:", JSON.stringify(body));

        // Woovi/OpenPix sends event type in 'event' or check for 'charge'
        const charge = body.charge;
        const event = body.event;

        if (!charge || (event && event !== "OPENPIX:CHARGE_COMPLETED" && event !== "OPENPIX:CHARGE_CONFIRMED")) {
            console.log("Ignoring event:", event);
            return new Response(JSON.stringify({ success: true, message: "Ignored" }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const paymentId = charge.correlationID;
        if (!paymentId) {
            throw new Error("No correlationID found in charge");
        }

        // 1. Update purchase status
        const { data: purchase, error: purchaseError } = await supabase
            .from("purchases")
            .update({
                payment_status: "PAID",
                updated_at: new Date().toISOString(),
            })
            .eq("payment_id", paymentId)
            .select()
            .maybeSingle();

        if (purchaseError) {
            console.error("Error updating purchase:", purchaseError);
            throw purchaseError;
        }

        if (!purchase) {
            console.error("Purchase not found for payment_id:", paymentId);
            return new Response(JSON.stringify({ success: false, error: "Purchase not found" }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log("Purchase updated to PAID:", purchase.id);

        // 2. Create subscription if user_id exists
        if (purchase.user_id) {
            const now = new Date();
            let expiresAt: Date | null = null;

            switch (purchase.plan_id) {
                case "bronze":
                case "weekly":
                    expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    break;
                case "silver":
                case "monthly":
                case "gold":
                    expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                    break;
                case "annual":
                    expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            }

            const orderBumps = Array.isArray(purchase.order_bumps) ? purchase.order_bumps : [];
            const hasAllRegions = orderBumps.includes("allRegions");
            const hasLifetime = orderBumps.includes("lifetime") || purchase.plan_id === "lifetime" || purchase.plan_id === "special";

            const { error: subError } = await supabase
                .from("user_subscriptions")
                .upsert(
                    {
                        user_id: purchase.user_id,
                        purchase_id: purchase.id,
                        plan_id: purchase.plan_id,
                        plan_name: purchase.plan_name,
                        starts_at: now.toISOString(),
                        expires_at: hasLifetime ? null : expiresAt?.toISOString(),
                        is_active: true,
                        is_lifetime: hasLifetime,
                        has_all_regions: hasAllRegions,
                        daily_swipes_limit: (purchase.plan_id === 'bronze' || purchase.plan_id === 'weekly') ? 20 : 9999,
                        can_see_who_liked: purchase.plan_id !== 'bronze' && purchase.plan_id !== 'weekly',
                        is_profile_boosted: purchase.plan_id === 'gold' || purchase.plan_id === 'annual' || hasLifetime,
                        can_video_call: purchase.plan_id !== 'bronze' && purchase.plan_id !== 'weekly',
                        can_use_advanced_filters: purchase.plan_id !== 'bronze' && purchase.plan_id !== 'weekly',
                    },
                    { onConflict: "user_id" }
                );

            if (subError) console.error("Error creating subscription:", subError);
            else console.log("Subscription created for user:", purchase.user_id);
        }

        // 3. Send confirmation webhook to n8n
        try {
            const now = new Date();
            const approvedDate = formatDateForWebhook(now);
            const createdAtFormatted = formatDateForWebhook(new Date(purchase.created_at));

            const orderBumps = Array.isArray(purchase.order_bumps) ? purchase.order_bumps : [];

            const products = [
                {
                    id: purchase.plan_id,
                    name: purchase.plan_name,
                    price: Number(purchase.plan_price),
                    quantity: 1,
                }
            ];

            for (const bumpId of orderBumps) {
                products.push({
                    id: bumpId,
                    name: BUMP_NAMES[bumpId] || bumpId,
                    price: BUMP_PRICE,
                    quantity: 1,
                });
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
                    planId: purchase.plan_id,
                    planPrice: Number(purchase.plan_price),
                    orderBumps: orderBumps,
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

            await fetch("https://n8n.srv1093629.hstgr.cloud/webhook/woovi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(webhookPayload),
            });
            console.log("Confirmation webhook sent to n8n");
        } catch (e) {
            console.error("Error sending webhook to n8n:", e);
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Webhook error:", error);
        return new Response(
            JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Internal error" }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
