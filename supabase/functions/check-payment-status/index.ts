/// <reference path="../deno.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { notifyUtmify, fmtDate, calcCommission } from "../_shared/utmify.ts";
import type { UtmifyProduct } from "../_shared/utmify.ts";

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
  "special-offer": "Oferta Especial Vitalícia",
};

const BUMP_PRICE = 5;

const BUMP_NAMES: Record<string, string> = {
  allRegions: "Desbloquear Regiões",
  grupoEvangelico: "Grupo Evangélico",
  grupoCatolico: "Grupo Católico",
  filtrosAvancados: "Filtros de Idade e Distância",
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

      console.log(`Checking payment status for ID: ${paymentId}`);

      // 1. Try Charge by ID
      let wooviResponse = await fetch(`https://api.openpix.com.br/api/openpix/v1/charge/${paymentId}`, {
        method: "GET",
        headers: { "Authorization": wooviApiKey, "Content-Type": "application/json" },
      });

      let wooviData;
      if (wooviResponse.ok) {
        wooviData = await wooviResponse.json();
        console.log("Found charge by ID:", wooviData.charge?.status);
      } else if (wooviResponse.status === 404) {
        // 2. Try Subscription by ID
        console.log("Charge not found by ID, trying subscription...");
        wooviResponse = await fetch(`https://api.openpix.com.br/api/v1/subscriptions/${paymentId}`, {
          method: "GET",
          headers: { "Authorization": wooviApiKey, "Content-Type": "application/json" },
        });

        if (wooviResponse.ok) {
          wooviData = await wooviResponse.json();
          console.log("Found subscription by ID:", wooviData.subscription?.status);
        } else {
          console.log(`Subscription check failed: ${wooviResponse.status}`);
          // 3. Try Charge by correlationID
          console.log("Trying charge by correlationID query...");
          wooviResponse = await fetch(`https://api.openpix.com.br/api/openpix/v1/charge?correlationID=${paymentId}`, {
            method: "GET",
            headers: { "Authorization": wooviApiKey, "Content-Type": "application/json" },
          });

          if (wooviResponse.ok) {
            const listData = await wooviResponse.json();
            if (listData.charges && listData.charges.length > 0) {
              wooviData = { charge: listData.charges[0] };
              console.log("Found charge by correlationID query:", wooviData.charge.status);
            }
          }
        }
      }

      if (!wooviData) {
        throw new Error(`Payment not found in Woovi for ID ${paymentId} (Status: ${wooviResponse.status})`);
      }

      const charge = wooviData.charge;
      const sub = wooviData.subscription;

      if (sub) {
        // For subscriptions, ACTIVE means the subscription started
        wooviStatus = sub.status;
        if (wooviStatus === "ACTIVE") status = "PAID";
        else if (wooviStatus === "EXPIRED" || wooviStatus === "CANCELED") status = "FAILED";
        else status = "PENDING";
      } else if (charge) {
        wooviStatus = charge.status;
        if (wooviStatus === "COMPLETED" || wooviStatus === "CONFIRMED") status = "PAID";
        else if (wooviStatus === "EXPIRED" || wooviStatus === "ERROR") status = "FAILED";
        else status = "PENDING";
      }
    }

    console.log(`Final status mapping: Woovi(${wooviStatus}) -> Internal(${status})`);

    if (status !== "PENDING") {
      await supabase.from("purchases").update({ payment_status: status, updated_at: new Date().toISOString() }).eq("payment_id", paymentId);

      if (status === "PAID") {
        const { data: purchase } = await supabase.from("purchases").select("*").eq("payment_id", paymentId).maybeSingle();

        if (purchase) {
          const now = new Date();
          let expiresAt: Date | null = null;

          switch (purchase.plan_id) {
            case "bronze": expiresAt = new Date(now.getTime() + 10 * 60 * 1000); break; // 10 mins testing
            case "silver": expiresAt = new Date(now.getTime() + 20 * 60 * 1000); break; // 20 mins testing
            case "gold": expiresAt = new Date(now.getTime() + 30 * 60 * 1000); break; // 30 mins testing
            case "special-offer": expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); break; // 3 months
            default: expiresAt = null;
          }

          const orderBumpsArray: string[] = Array.isArray(purchase.order_bumps) ? purchase.order_bumps as string[] : [];
          const isGold = purchase.plan_id === "gold";
          const isSilver = purchase.plan_id === "silver";
          const isBronze = purchase.plan_id === "bronze";
          const hasSpecialOffer = orderBumpsArray.includes("specialOffer") || purchase.plan_id === "special-offer";

          const PLAN_TIER_ORDER: Record<string, number> = { bronze: 1, silver: 2, gold: 3 };
          // ──────────────────────────────────────────────────────────────────

          if (purchase.user_id) {
            // ── Detectar renovação ─────────────────────────────────────────────
            const { data: prevSub } = await supabase
              .from("user_subscriptions")
              .select("plan_id, expires_at, is_active")
              .eq("user_id", purchase.user_id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            const isRenewal = !!prevSub;
            const prevPlanId = prevSub?.plan_id ?? null;
            const prevTier = PLAN_TIER_ORDER[prevPlanId ?? ""] ?? 0;
            const newTier = PLAN_TIER_ORDER[purchase.plan_id] ?? 0;

            await supabase.from("user_subscriptions").upsert({
              user_id: purchase.user_id,
              purchase_id: purchase.id,
              // special-offer is treated as Gold tier so frontend flags work correctly
              plan_id: hasSpecialOffer ? "gold" : purchase.plan_id,
              plan_name: purchase.plan_name,
              starts_at: now.toISOString(),
              expires_at: expiresAt?.toISOString() ?? null,
              is_active: true,
              is_lifetime: false,
              // special-offer = all Gold features (downsell)
              has_all_regions: isGold || isSilver || hasSpecialOffer || orderBumpsArray.includes("allRegions"),
              has_grupo_evangelico: isGold || hasSpecialOffer || orderBumpsArray.includes("grupoEvangelico"),
              has_grupo_catolico: isGold || hasSpecialOffer || orderBumpsArray.includes("grupoCatolico"),
              can_use_advanced_filters: isGold || hasSpecialOffer || orderBumpsArray.includes("filtrosAvancados"),
              daily_swipes_limit: isBronze ? 20 : 9999,
              can_see_who_liked: !isBronze || hasSpecialOffer,
              is_profile_boosted: isGold || hasSpecialOffer,
              can_video_call: !isBronze || hasSpecialOffer,
              can_see_recently_online: isGold || hasSpecialOffer,
            }, { onConflict: "user_id" });

            // ── Marcar purchase como renovação ─────────────────────────────────
            if (isRenewal) {
              await supabase
                .from("purchases")
                .update({ is_renewal: true, previous_plan_id: prevPlanId })
                .eq("id", purchase.id);

              // ── Registrar renovação para métricas ──────────────────────────
              await supabase.from("subscription_renewals").insert({
                user_id: purchase.user_id,
                purchase_id: purchase.id,
                previous_plan_id: prevPlanId,
                new_plan_id: purchase.plan_id,
                previous_expires_at: prevSub?.expires_at ?? null,
                new_expires_at: hasSpecialOffer ? null : expiresAt?.toISOString(),
                revenue: Number(purchase.total_price),
                is_upgrade: newTier > prevTier,
                is_downgrade: newTier < prevTier,
              });
              // ──────────────────────────────────────────────────────────────
            }


            // ── Seed Funnel Likes (MED reduction) ──────────────────────────────
            // Only seed on first purchase for this user
            const { count: existingSeeds } = await supabase
              .from("seed_likes")
              .select("id", { count: "exact", head: true })
              .eq("user_id", purchase.user_id);

            if ((existingSeeds ?? 0) === 0) {
              const { data: userProfile } = await supabase
                .from("profiles")
                .select("gender")
                .eq("user_id", purchase.user_id)
                .maybeSingle();

              const quiz = (purchase.quiz_data ?? {}) as Record<string, string>;
              const userGender = userProfile?.gender || "male";

              const seedRows = [0, 1, 2].map((idx) => ({
                user_id: purchase.user_id,
                profile_index: idx,
                age_range: quiz.age || "26-35",
                user_gender: userGender,
                city: quiz.city || "São Paulo",
                state_name: quiz.state || "São Paulo",
                looking_for: quiz.lookingFor || "Relacionamento sério",
                religion: quiz.religion || "Cristã",
                status: "pending",
              }));

              await supabase.from("seed_likes").insert(seedRows);

              // ── Seed Discover profiles (indices 3-5 → top of swipe stack) ──────
              // like_sequence_position: 1=no match, 2=match, 3=no match
              const discoverSeedRows = [3, 4, 5].map((idx, i) => ({
                user_id: purchase.user_id,
                profile_index: idx,
                like_sequence_position: i + 1, // 1, 2, 3
                age_range: quiz.age || "26-35",
                user_gender: userGender,
                city: quiz.city || "São Paulo",
                state_name: quiz.state || "São Paulo",
                looking_for: quiz.lookingFor || "Relacionamento sério",
                religion: quiz.religion || "Cristã",
                status: "pending",
              }));

              await supabase.from("seed_discover_profiles").insert(discoverSeedRows);
              // ────────────────────────────────────────────────────────────────────
            }
            // ───────────────────────────────────────────────────────────────────
          }


          // ── Notify UTMify: paid ───────────────────────────────────────────────
          if (!isActuallyTest) {
            const utmifyToken = Deno.env.get("UTMIFY_API_TOKEN");
            if (utmifyToken) {
              const products: UtmifyProduct[] = [{
                id: purchase.plan_id,
                name: purchase.plan_name,
                planId: purchase.plan_id,
                planName: purchase.plan_name,
                quantity: 1,
                priceInCents: Math.round(Number(purchase.plan_price) * 100),
              }];
              for (const bumpId of orderBumpsArray) {
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
                approvedDate: fmtDate(now),
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
          // ── Send welcome email (fire-and-forget) ────────────────────
          if (!isActuallyTest) {
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
          }
          // ─────────────────────────────────────────────────────────────
        }
      }
    }

    return new Response(JSON.stringify({ success: true, status, paymentId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking payment:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error), status: "PENDING" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
