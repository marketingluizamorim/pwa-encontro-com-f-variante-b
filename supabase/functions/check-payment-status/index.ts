/// <reference path="../deno.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { notifyUtmify, fmtDate, calcCommission } from "../_shared/utmify.ts";
import type { UtmifyProduct } from "../_shared/utmify.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUMP_PRICE = 5;
const BUMP_NAMES: Record<string, string> = {
  allRegions: "Desbloquear Regiões",
  grupoEvangelico: "Grupo Evangélico",
  grupoCatolico: "Grupo Católico",
  filtrosAvancados: "Filtros de Idade e Distância",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { paymentId } = await req.json();
    if (!paymentId) throw new Error("paymentId é obrigatório");

    // ── 1. Verifica no banco primeiro (fast path) ─────────────────────
    const { data: purchase } = await supabase
      .from("purchases")
      .select("*")
      .eq("payment_id", paymentId)
      .maybeSingle();

    if (purchase?.payment_status === "PAID") {
      console.log(`[check-payment] Já PAID no DB: ${paymentId}`);
      return new Response(
        JSON.stringify({ success: true, status: "PAID", paymentId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 2. Consulta Woovi — apenas endpoints de cobrança Pix único ────
    const wooviApiKey = Deno.env.get("WOOVI_API_KEY");
    if (!wooviApiKey) throw new Error("WOOVI_API_KEY não configurada");

    let status: "PENDING" | "PAID" | "FAILED" = "PENDING";
    let wooviData: any = null;

    // Projeto B usa apenas Pix único — sem endpoint de subscription
    const endpoints = [
      `https://api.openpix.com.br/api/openpix/v1/charge/${paymentId}`,
      `https://api.openpix.com.br/api/openpix/v1/charge?correlationID=${paymentId}`,
    ];

    for (const url of endpoints) {
      const resp = await fetch(url, { headers: { Authorization: wooviApiKey } });
      if (resp.ok) {
        const json = await resp.json();
        if (url.includes("correlationID=")) {
          if (json.charges?.length > 0) {
            wooviData = { charge: json.charges[0] };
            break;
          }
        } else {
          wooviData = json;
          break;
        }
      }
    }

    // ── 3. Interpreta status da Woovi ─────────────────────────────────
    if (wooviData?.charge) {
      const charge = wooviData.charge;
      if (charge.status === "COMPLETED" || charge.status === "CONFIRMED") {
        status = "PAID";
      } else if (charge.status === "EXPIRED" || charge.status === "ERROR") {
        status = "FAILED";
      }
    }

    // ── 4. Se PAID — atualiza DB + notifica UTMify ────────────────────
    if (status === "PAID" && purchase) {
      await supabase
        .from("purchases")
        .update({ payment_status: "PAID", updated_at: new Date().toISOString() })
        .eq("id", purchase.id);

      // UTMify — identificado como "EncontroComFe_FunilB" para separar do projeto A
      const utmifyToken = Deno.env.get("UTMIFY_API_TOKEN");
      if (utmifyToken) {
        try {
          const bumps = purchase.order_bumps || [];
          const bumpItems = bumps.map((b: string) => ({
            id: `bump_${b}`,
            name: BUMP_NAMES[b] || b,
            planId: `bump_${b}`,
            planName: BUMP_NAMES[b] || b,
            quantity: 1,
            priceInCents: BUMP_PRICE * 100,
          }));

          const products: UtmifyProduct[] = [
            {
              id: purchase.plan_id,
              name: purchase.plan_name,
              planId: purchase.plan_id,
              planName: purchase.plan_name,
              quantity: 1,
              priceInCents: Math.round(Number(purchase.plan_price) * 100),
            },
            ...bumpItems,
          ];

          await notifyUtmify(utmifyToken, {
            orderId: purchase.id,
            platform: "EncontroComFe_FunilB", // ← diferencia do projeto A
            paymentMethod: "pix",
            status: "paid",
            createdAt: fmtDate(new Date(purchase.created_at)),
            approvedDate: fmtDate(new Date()),
            customer: {
              name: purchase.user_name,
              email: purchase.user_email,
              phone: purchase.user_phone?.replace(/\D/g, "") || null,
              document: null,
              country: "BR",
            },
            products,
            trackingParameters: {
              src: purchase.src || null,
              sck: purchase.sck || null,
              utm_source: purchase.utm_source || null,
              utm_campaign: purchase.utm_campaign || null,
              utm_medium: purchase.utm_medium || null,
              utm_content: purchase.utm_content || null,
              utm_term: purchase.utm_term || null,
            },
            commission: calcCommission(Math.round(Number(purchase.total_price) * 100)),
            refundedAt: null,
          });
        } catch (e) {
          console.error("[check-payment] UTMify error:", e);
        }
      }

      console.log(`[check-payment] ✅ PAID processado: ${purchase.id}`);
    }

    return new Response(
      JSON.stringify({ success: true, status, paymentId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[check-payment] Erro:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error), status: "PENDING" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
