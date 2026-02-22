/// <reference path="../deno.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { notifyUtmify, fmtDate, calcCommission } from "../_shared/utmify.ts";
import type { UtmifyProduct } from "../_shared/utmify.ts";

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

        let paymentId = charge.correlationID;
        if (!paymentId) throw new Error("No correlationID found in charge");

        // RENEWAL HANDLING: If this is a subscription charge, Woovi might send the original correlationID 
        // inside the subscription object, while the charge itself has a new one.
        const subscriptionCorrelationID = charge.subscription?.correlationID;

        const isTestPayment = paymentId.startsWith("dev-test-") || paymentId.startsWith("mock-payment-id-");

        // 1. Try to find the purchase by charge correlationID first
        let { data: purchase, error: purchaseError } = await supabase
            .from("purchases").update({ payment_status: "PAID", updated_at: new Date().toISOString() })
            .eq("payment_id", paymentId).select().maybeSingle();

        // 2. If not found and it's a subscription charge, try the original subscription correlationID
        if (!purchase && subscriptionCorrelationID) {
            console.log(`Charge ${paymentId} not found, trying subscription ID: ${subscriptionCorrelationID}`);
            const { data: subPurchase, error: subError } = await supabase
                .from("purchases").update({ payment_status: "PAID", updated_at: new Date().toISOString() })
                .eq("payment_id", subscriptionCorrelationID).select().maybeSingle();

            purchase = subPurchase;
            purchaseError = subError;
            if (purchase) paymentId = subscriptionCorrelationID; // Use the matched one for consistency
        }

        if (purchaseError) throw purchaseError;
        if (!purchase) return new Response(JSON.stringify({ success: false, error: "Purchase not found" }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

        // Try to find the user_id by email if it's missing in the purchase record
        let targetId = purchase.user_id;
        if (!targetId && purchase.user_email) {
            const { data: { users } } = await supabase.auth.admin.listUsers();
            const foundUser = users?.find(u => u.email === purchase.user_email);
            if (foundUser) {
                targetId = foundUser.id;
                // Update purchase for future consistency
                await supabase.from("purchases").update({ user_id: targetId }).eq("id", purchase.id);
            }
        }

        if (targetId) {
            const now = new Date();
            let expiresAt: Date;
            switch (purchase.plan_id) {
                case "bronze": expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); break; // 7 days
                case "silver":
                case "gold": expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); break; // 30 days
                case "special-offer": expiresAt = new Date(now.getTime() + 99 * 365 * 24 * 60 * 60 * 1000); break; // Lifetime
                default: expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            }

            const orderBumps = Array.isArray(purchase.order_bumps) ? purchase.order_bumps as string[] : [];
            const isGold = purchase.plan_id === "gold";
            const isSilver = purchase.plan_id === "silver";
            const isBronze = purchase.plan_id === "bronze";
            const hasSpecialOffer = orderBumps.includes("specialOffer") || purchase.plan_id === "special-offer";
            const isPixAutomatic = purchase.payment_method === "PIX_AUTOMATIC";

            await supabase.from("user_subscriptions").upsert({
                user_id: targetId,
                purchase_id: purchase.id,
                plan_id: hasSpecialOffer ? "gold" : purchase.plan_id,
                plan_name: purchase.plan_name,
                starts_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
                is_active: true,
                is_lifetime: hasSpecialOffer || purchase.plan_id === "special-offer",
                subscription_type: isPixAutomatic ? "pix_automatic" : "one_time",
                woovi_subscription_id: purchase.payment_id ?? null,
                auto_renew: isPixAutomatic,
                next_charge_at: isPixAutomatic ? expiresAt.toISOString() : null,
                acquisition_source: purchase.source_platform ?? "funnel",
                has_all_regions: isGold || isSilver || hasSpecialOffer || orderBumps.includes("allRegions"),
                has_grupo_evangelico: isGold || isSilver || hasSpecialOffer || orderBumps.includes("grupoEvangelico"),
                has_grupo_catolico: isGold || isSilver || hasSpecialOffer || orderBumps.includes("grupoCatolico"),
                can_use_advanced_filters: isGold || hasSpecialOffer || orderBumps.includes("filtrosAvancados"),
                daily_swipes_limit: isBronze ? 20 : 9999,
                can_see_who_liked: !isBronze || hasSpecialOffer,
                can_video_call: !isBronze || hasSpecialOffer,
                is_profile_boosted: isGold || hasSpecialOffer,
                can_see_recently_online: isGold || hasSpecialOffer,
                updated_at: now.toISOString(),
            }, { onConflict: "user_id" });
        }

        const isTestUser = purchase.user_email?.includes("@test.com") || purchase.user_email?.includes("@temporario.com") ||
            purchase.user_name?.toLowerCase().includes("dev") || purchase.plan_name?.toLowerCase().includes("dev");

        // ── Notify UTMify: paid ───────────────────────────────────────
        if (!isTestPayment && !isTestUser) {
            const utmifyToken = Deno.env.get("UTMIFY_API_TOKEN");
            if (utmifyToken) {
                const nowPaid = new Date();
                const orderBumpsArr = Array.isArray(purchase.order_bumps) ? purchase.order_bumps as string[] : [];
                const products: UtmifyProduct[] = [{
                    id: purchase.plan_id,
                    name: purchase.plan_name,
                    planId: purchase.plan_id,
                    planName: purchase.plan_name,
                    quantity: 1,
                    priceInCents: Math.round(Number(purchase.plan_price) * 100),
                }];
                for (const bumpId of orderBumpsArr) {
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
                const totalInCents = Math.round(Number(purchase.total_price) * 100);
                const p = purchase as Record<string, unknown>;
                await notifyUtmify(utmifyToken, {
                    orderId: purchase.id,
                    platform: "EncontroComFe",
                    paymentMethod: "pix",
                    status: "paid",
                    createdAt: fmtDate(new Date(purchase.created_at as string)),
                    approvedDate: fmtDate(nowPaid),
                    refundedAt: null,
                    customer: {
                        name: purchase.user_name as string,
                        email: purchase.user_email as string,
                        phone: (purchase.user_phone as string | null)?.replace(/\D/g, "") || null,
                        document: null,
                        country: "BR",
                    },
                    products,
                    trackingParameters: {
                        src: (p.src as string | null) ?? null,
                        sck: (p.sck as string | null) ?? null,
                        utm_source: (p.utm_source as string | null) ?? null,
                        utm_campaign: (p.utm_campaign as string | null) ?? null,
                        utm_medium: (p.utm_medium as string | null) ?? null,
                        utm_content: (p.utm_content as string | null) ?? null,
                        utm_term: (p.utm_term as string | null) ?? null,
                    },
                    commission: calcCommission(totalInCents),
                });
            }
        }
        // ───────────────────────────────────────────────────────────────

        // ── Send welcome email (fire-and-forget) ─────────────────────
        fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
                userName: purchase.user_name,
                userEmail: purchase.user_email,
                planName: purchase.plan_name,
            }),
        }).catch((e) => console.error("Welcome email error:", e));
        // ─────────────────────────────────────────────────────────────

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
