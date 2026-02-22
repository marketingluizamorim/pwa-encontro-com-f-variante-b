/// <reference path="../deno.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_DURATION_DAYS: Record<string, number> = {
    bronze: 7, silver: 30, gold: 30,
    "special-offer": 36500, // won't really be used (is_lifetime=true)
};

const TIER: Record<string, number> = {
    bronze: 1, silver: 2, gold: 3,
};

/**
 * link-purchase
 * Called from Register.tsx after the user creates an account.
 * Links orphan PAID purchases (user_id IS NULL) to the new user
 * and activates the correct subscription type:
 *   - PIX         → re-confirms via Woovi /charge API
 *   - PIX_AUTOMATIC → activates directly from the purchase data
 *                     (webhook already set payment_status=PAID)
 */
Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const wooviApiKey = Deno.env.get("WOOVI_API_KEY") ?? "";

        // Authenticated client for JWT validation
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const authHeader = req.headers.get("Authorization") ?? "";
        const userClient = createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: authHeader } },
        });
        const { data: { user }, error: userErr } = await userClient.auth.getUser();
        if (userErr || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Service-role client for DB writes (bypasses RLS)
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const { email } = await req.json();
        const lookupEmail = email || user.email;

        // ── Find all PAID orphan purchases for this email ───────────────────────
        const { data: purchases, error: purchasesErr } = await supabase
            .from("purchases")
            .select("*")
            .eq("user_email", lookupEmail)
            .eq("payment_status", "PAID")
            .is("user_id", null);

        if (purchasesErr) throw purchasesErr;
        if (!purchases || purchases.length === 0) {
            return new Response(JSON.stringify({ linked: 0, message: "No pending purchases" }), {
                status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        let linked = 0;

        for (const purchase of purchases) {
            // 1. Link purchase to user
            await supabase.from("purchases").update({ user_id: user.id }).eq("id", purchase.id);

            const planId = purchase.plan_id as string;
            const days = PLAN_DURATION_DAYS[planId] ?? 30;
            const now = new Date();
            const expiresAt = new Date(now.getTime() + days * 86_400_000);
            const orderBumps: string[] = Array.isArray(purchase.order_bumps) ? purchase.order_bumps : [];

            // 2. Get previous subscription for renewal tracking
            const { data: prevSub } = await supabase
                .from("user_subscriptions")
                .select("plan_id, expires_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            const isRenewal = !!prevSub;
            const prevPlanId = prevSub?.plan_id ?? null;
            const isGold = planId === "gold";
            const isSilver = planId === "silver";
            const isBronze = planId === "bronze";
            const isLifetime = planId === "special-offer" || orderBumps.includes("specialOffer") || orderBumps.includes("lifetime");
            const hasSpecialOffer = isLifetime || planId === "special-offer";
            const isPixAutomatic = purchase.payment_method === "PIX_AUTOMATIC";

            // 3a. PIX AUTOMÁTICO — activate directly (webhook already confirmed payment)
            if (isPixAutomatic) {
                await supabase.from("user_subscriptions").upsert({
                    user_id: user.id,
                    purchase_id: purchase.id,
                    plan_id: hasSpecialOffer ? "gold" : planId,
                    plan_name: purchase.plan_name,
                    starts_at: now.toISOString(),
                    expires_at: expiresAt.toISOString(),
                    is_active: true,
                    is_lifetime: isLifetime,
                    subscription_type: "pix_automatic",
                    woovi_subscription_id: purchase.payment_id ?? null,
                    auto_renew: true,
                    failed_charges_count: 0,
                    next_charge_at: expiresAt.toISOString(),
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

                linked++;

                // 3b. ONE-TIME PIX — confirm via Woovi API then activate
            } else {
                const paymentId = purchase.payment_id;
                let isConfirmed = false;

                if (wooviApiKey && paymentId) {
                    try {
                        const wooviRes = await fetch(
                            `https://api.openpix.com.br/api/openpix/v1/charge/${paymentId}`,
                            { headers: { "Authorization": wooviApiKey, "Content-Type": "application/json" } },
                        );
                        if (wooviRes.ok) {
                            const wooviData = await wooviRes.json();
                            const status = wooviData?.charge?.status ?? wooviData?.status;
                            isConfirmed = status === "COMPLETED" || status === "PAID";
                        }
                    } catch (e) {
                        console.error("Woovi check failed:", e);
                        // Fallback: trust the DB (purchase is already PAID)
                        isConfirmed = true;
                    }
                } else {
                    // No API key or no paymentId — trust the DB
                    isConfirmed = true;
                }

                if (isConfirmed) {
                    await supabase.from("user_subscriptions").upsert({
                        user_id: user.id,
                        purchase_id: purchase.id,
                        plan_id: hasSpecialOffer ? "gold" : planId,
                        plan_name: purchase.plan_name,
                        starts_at: now.toISOString(),
                        expires_at: expiresAt.toISOString(),
                        is_active: true,
                        is_lifetime: isLifetime,
                        subscription_type: "one_time",
                        auto_renew: false,
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

                    linked++;
                }
            }

            // 4. Renewal tracking
            if (isRenewal && linked > 0) {
                await supabase.from("purchases").update({ is_renewal: true, previous_plan_id: prevPlanId }).eq("id", purchase.id);
                await supabase.from("subscription_renewals").insert({
                    user_id: user.id,
                    purchase_id: purchase.id,
                    previous_plan_id: prevPlanId,
                    new_plan_id: planId,
                    previous_expires_at: prevSub?.expires_at ?? null,
                    new_expires_at: hasSpecialOffer ? null : expiresAt.toISOString(),
                    revenue: Number(purchase.total_price),
                    is_upgrade: (TIER[planId] ?? 0) > (TIER[prevPlanId ?? ""] ?? 0),
                    is_downgrade: (TIER[planId] ?? 0) < (TIER[prevPlanId ?? ""] ?? 0),
                });
            }
        }

        return new Response(JSON.stringify({ linked, total: purchases.length }), {
            status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("link-purchase error:", msg);
        return new Response(JSON.stringify({ error: msg }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
