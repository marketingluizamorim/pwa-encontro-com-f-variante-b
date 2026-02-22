/// <reference path="../deno.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const PLAN_DURATION_DAYS: Record<string, number> = {
    bronze: 7, silver: 30, gold: 30,
    "special-offer": 36500,
};

const TIER: Record<string, number> = {
    bronze: 1, silver: 2, gold: 3,
};

/**
 * process-orphan-purchases
 * Cron Job function to link orphaned PAID purchases to users.
 * Runs every 5-10 minutes.
 */
Deno.serve(async (_req: Request) => {
    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        console.log("Starting Cron Job: Processing orphan purchases...");

        // 1. Find all PAID purchases that don't have a user_id linked yet
        // We limit to 50 per run to keep it fast and safe
        const { data: orphanPurchases, error: orphanErr } = await supabase
            .from("purchases")
            .select("*")
            .eq("payment_status", "PAID")
            .is("user_id", null)
            .order("created_at", { ascending: true })
            .limit(50);

        if (orphanErr) throw orphanErr;

        if (!orphanPurchases || orphanPurchases.length === 0) {
            console.log("No orphan purchases found. System clean.");
            return new Response(JSON.stringify({ message: "No orphan purchases" }), {
                status: 200, headers: { "Content-Type": "application/json" }
            });
        }

        console.log(`Found ${orphanPurchases.length} orphan purchases. Listing users to find matches...`);

        // 2. Optimized lookup: Get all users to match in-memory
        const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers();
        if (usersErr) throw usersErr;

        let linkedCount = 0;

        // 3. Process each orphan
        for (const purchase of orphanPurchases) {
            const foundUser = users?.find(u => u.email === purchase.user_email);

            if (foundUser) {
                console.log(`Found match for purchase ${purchase.id} -> User ${foundUser.id} (${purchase.user_email})`);

                // ── Linking Logic (Mirrors link-purchase) ───────────────────────
                // 1. Link purchase to user
                await supabase.from("purchases").update({ user_id: foundUser.id }).eq("id", purchase.id);

                const planId = purchase.plan_id as string;
                const days = PLAN_DURATION_DAYS[planId] ?? 30;
                const now = new Date();
                const expiresAt = new Date(now.getTime() + days * 86_400_000);
                const orderBumps: string[] = Array.isArray(purchase.order_bumps) ? purchase.order_bumps : [];

                // 2. Get previous subscription
                const { data: prevSub } = await supabase
                    .from("user_subscriptions")
                    .select("plan_id, expires_at")
                    .eq("user_id", foundUser.id)
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

                // 3. Upsert subscription
                const subscriptionData = {
                    user_id: foundUser.id,
                    purchase_id: purchase.id,
                    plan_id: hasSpecialOffer ? "gold" : planId,
                    plan_name: purchase.plan_name,
                    starts_at: now.toISOString(),
                    expires_at: expiresAt.toISOString(),
                    is_active: true,
                    is_lifetime: isLifetime,
                    subscription_type: isPixAutomatic ? "pix_automatic" : "one_time",
                    woovi_subscription_id: purchase.payment_id ?? null,
                    auto_renew: isPixAutomatic,
                    failed_charges_count: 0,
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
                };

                await supabase.from("user_subscriptions").upsert(subscriptionData, { onConflict: "user_id" });

                // 4. Renewal tracking
                if (isRenewal) {
                    await supabase.from("purchases").update({ is_renewal: true, previous_plan_id: prevPlanId }).eq("id", purchase.id);
                    await supabase.from("subscription_renewals").insert({
                        user_id: foundUser.id,
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

                linkedCount++;
            }
        }

        console.log(`Cron Job finished. ${linkedCount} purchases linked successfully.`);

        return new Response(JSON.stringify({ success: true, processed: orphanPurchases.length, linked: linkedCount }), {
            status: 200, headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Cron Job Error:", msg);
        return new Response(JSON.stringify({ error: msg }), {
            status: 500, headers: { "Content-Type": "application/json" }
        });
    }
});
