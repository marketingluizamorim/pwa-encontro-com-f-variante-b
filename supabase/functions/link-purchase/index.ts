/// <reference path="../deno.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_DURATION_DAYS: Record<string, number> = {
    bronze: 7, silver: 30, gold: 30,
    "special-offer": 36500,
};

const TIER: Record<string, number> = {
    bronze: 1, silver: 2, gold: 3,
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const wooviApiKey = Deno.env.get("WOOVI_API_KEY") ?? "";
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const { email: bodyEmail } = await req.json();

        let jwtUser = null;
        try {
            const authHeader = req.headers.get("Authorization") ?? "";
            const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
            const userClient = createClient(supabaseUrl, anonKey, {
                global: { headers: { Authorization: authHeader } },
            });
            const { data } = await userClient.auth.getUser();
            jwtUser = data?.user;
        } catch (e) {
            console.log("JWT Auth skipped or failed:", e instanceof Error ? e.message : String(e));
        }

        const lookupEmail = bodyEmail || jwtUser?.email;
        if (!lookupEmail) {
            return new Response(JSON.stringify({ error: "Missing email" }), {
                status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log(`Starting link-purchase for: ${lookupEmail}`);

        let targetUser = jwtUser;
        let linked = 0;
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
            attempts++;
            console.log(`Attempt ${attempts}/${maxAttempts}`);

            if (!targetUser) {
                const { data: { users } } = await supabase.auth.admin.listUsers();
                targetUser = (users?.find(u => u.email === lookupEmail) as any);
            }

            if (targetUser) {
                const { data: purchases, error: purchasesErr } = await supabase
                    .from("purchases")
                    .select("*")
                    .eq("user_email", lookupEmail)
                    .in("payment_status", ["PAID", "PENDING"])
                    .is("user_id", null);

                if (!purchasesErr && purchases && purchases.length > 0) {
                    for (let purchaseItem of purchases) {
                        let purchase = purchaseItem;

                        // Check Woovi API if PENDING
                        if (purchase.payment_status === "PENDING" && wooviApiKey) {
                            try {
                                const pid = purchase.payment_id;
                                let resp = await fetch(`https://api.openpix.com.br/api/openpix/v1/charge/${pid}`, {
                                    headers: { Authorization: wooviApiKey }
                                });
                                let data = await resp.json();
                                let status = data?.charge?.status;

                                if (!status) { // Try correlationID
                                    resp = await fetch(`https://api.openpix.com.br/api/openpix/v1/charge?correlationID=${pid}`, {
                                        headers: { Authorization: wooviApiKey }
                                    });
                                    data = await resp.json();
                                    status = data?.charges?.[0]?.status;
                                }

                                if (status === "COMPLETED" || status === "CONFIRMED") {
                                    const { data: updated } = await supabase
                                        .from("purchases")
                                        .update({ payment_status: "PAID", updated_at: new Date().toISOString() })
                                        .eq("id", purchase.id).select().single();
                                    if (updated) purchase = updated;
                                }
                            } catch (e) {
                                console.error(`Woovi check failed for ${purchase.id}:`, e);
                            }
                        }

                        if (purchase.payment_status === "PAID") {
                            // 1. Link purchase
                            await supabase.from("purchases").update({ user_id: targetUser.id }).eq("id", purchase.id);

                            const planId = purchase.plan_id as string;
                            const days = PLAN_DURATION_DAYS[planId] ?? 30;
                            const now = new Date();
                            const expiresAt = new Date(now.getTime() + days * 86_400_000);
                            const orderBumps: string[] = Array.isArray(purchase.order_bumps) ? purchase.order_bumps : [];

                            // 2. Renewal info
                            const { data: prevSub } = await supabase
                                .from("user_subscriptions")
                                .select("plan_id, expires_at")
                                .eq("user_id", targetUser.id)
                                .order("created_at", { ascending: false })
                                .limit(1).maybeSingle();

                            const isRenewal = !!prevSub;
                            const prevPlanId = prevSub?.plan_id ?? null;
                            const isLifetime = planId === "special-offer" || orderBumps.includes("specialOffer") || orderBumps.includes("lifetime");
                            const hasSpecialOffer = isLifetime || planId === "special-offer";
                            const isPixAutomatic = purchase.payment_method === "PIX_AUTOMATIC";

                            // 3. Upsert subscription
                            const subData = {
                                user_id: targetUser.id,
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
                                next_charge_at: isPixAutomatic ? expiresAt.toISOString() : null,
                                acquisition_source: purchase.source_platform ?? "funnel",
                                has_all_regions: planId === "gold" || planId === "silver" || hasSpecialOffer || orderBumps.includes("allRegions"),
                                has_grupo_evangelico: planId === "gold" || planId === "silver" || hasSpecialOffer || orderBumps.includes("grupoEvangelico"),
                                has_grupo_catolico: planId === "gold" || planId === "silver" || hasSpecialOffer || orderBumps.includes("grupoCatolico"),
                                can_use_advanced_filters: planId === "gold" || hasSpecialOffer || orderBumps.includes("filtrosAvancados"),
                                daily_swipes_limit: planId === "bronze" ? 20 : 9999,
                                can_see_who_liked: planId !== "bronze" || hasSpecialOffer,
                                can_video_call: planId !== "bronze" || hasSpecialOffer,
                                is_profile_boosted: planId === "gold" || hasSpecialOffer,
                                can_see_recently_online: planId === "gold" || hasSpecialOffer,
                                updated_at: now.toISOString(),
                            };

                            await supabase.from("user_subscriptions").upsert(subData, { onConflict: "user_id" });
                            linked++;

                            if (isRenewal) {
                                await supabase.from("purchases").update({ is_renewal: true, previous_plan_id: prevPlanId }).eq("id", purchase.id);
                                await supabase.from("subscription_renewals").insert({
                                    user_id: targetUser.id, purchase_id: purchase.id,
                                    previous_plan_id: prevPlanId, new_plan_id: planId,
                                    previous_expires_at: prevSub?.expires_at ?? null,
                                    new_expires_at: hasSpecialOffer ? null : expiresAt.toISOString(),
                                    revenue: Number(purchase.total_price),
                                    is_upgrade: (TIER[planId] ?? 0) > (TIER[prevPlanId ?? ""] ?? 0),
                                });
                            }
                        }
                    }
                }
                if (linked > 0) break;
            }

            if (attempts < maxAttempts) {
                await delay(3000);
            }
        }

        return new Response(JSON.stringify({ linked, success: linked > 0 }), {
            status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("link-purchase error:", err);
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
