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

const BUMP_PRICE = 5;

const BUMP_NAMES: Record<string, string> = {
  allRegions: "Desbloquear Regiões",
  grupoEvangelico: "Grupo Evangélico",
  grupoCatolico: "Grupo Católico",
  filtrosAvancados: "Filtros de Idade e Distância",
  lifetime: "Acesso Vitalício",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CheckPaymentRequest = await req.json();
    const { paymentId } = body;

    if (!paymentId) throw new Error("Payment ID is required");

    // ── 1. CHECK DATABASE FIRST ───────────────────────────────────────────
    const { data: purchase } = await supabase
      .from("purchases")
      .select("*")
      .eq("payment_id", paymentId)
      .maybeSingle();

    if (purchase?.payment_status === "PAID") {
      console.log(`Payment ${paymentId} already PAID in DB. Ensuring welcome email.`);
      // Still try to send email if it's a manual verification
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: purchase.user_name, userEmail: purchase.user_email, planName: purchase.plan_name }),
        });
      } catch (e) {
        console.error("Manual email error:", e);
      }

      return new Response(JSON.stringify({ success: true, status: "PAID", paymentId }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let status: "PENDING" | "PAID" | "FAILED" = "PENDING";
    let wooviStatus = "PENDING";
    let wooviData: any = null;

    const wooviApiKey = Deno.env.get("WOOVI_API_KEY");
    if (!wooviApiKey) throw new Error("Woovi API key not configured");

    // Sequential lookups
    const endpoints = [
      `https://api.openpix.com.br/api/openpix/v1/charge/${paymentId}`,
      `https://api.openpix.com.br/api/v1/subscriptions/${paymentId}`,
      `https://api.openpix.com.br/api/openpix/v1/charge?correlationID=${paymentId}`
    ];

    for (const url of endpoints) {
      const resp = await fetch(url, { headers: { "Authorization": wooviApiKey } });
      if (resp.ok) {
        const json = await resp.json();
        if (url.includes("correlationID=")) {
          if (json.charges?.length > 0) { wooviData = { charge: json.charges[0] }; break; }
        } else { wooviData = json; break; }
      }
    }

    if (wooviData) {
      if (wooviData.subscription) {
        const sub = wooviData.subscription;
        const subCharge = sub.charge || sub.lastCharge;
        const rec = sub.pixRecurring?.status;
        const isPaid = (subCharge && (subCharge.status === "COMPLETED" || subCharge.status === "CONFIRMED")) ||
          (rec === "COMPLETED" || rec === "CONFIRMED" || rec === "APPROVED");
        if (sub.status === "ACTIVE" && isPaid) status = "PAID";
      } else if (wooviData.charge) {
        const charge = wooviData.charge;
        if (charge.status === "COMPLETED" || charge.status === "CONFIRMED") status = "PAID";
        else if (charge.status === "EXPIRED" || charge.status === "ERROR") status = "FAILED";
      }
    }

    if (status === "PAID" && purchase) {
      // ── 2. PROCESS PURCHASE ──────────────────────────────────────────
      await supabase.from("purchases").update({ payment_status: "PAID", updated_at: new Date().toISOString() }).eq("id", purchase.id);

      // Notify UTMify
      const utmifyToken = Deno.env.get("UTMIFY_API_TOKEN");
      if (utmifyToken) {
        try {
          const products: UtmifyProduct[] = [{ id: purchase.plan_id, name: purchase.plan_name, planId: purchase.plan_id, planName: purchase.plan_name, quantity: 1, priceInCents: Math.round(Number(purchase.plan_price) * 100) }];
          await notifyUtmify(utmifyToken, {
            orderId: purchase.id, platform: "EncontroComFe", paymentMethod: "pix", status: "paid",
            createdAt: fmtDate(new Date(purchase.created_at)), approvedDate: fmtDate(new Date()),
            customer: { name: purchase.user_name, email: purchase.user_email, phone: purchase.user_phone?.replace(/\D/g, "") || null, document: null, country: "BR" },
            products, trackingParameters: { src: purchase.src, sck: purchase.sck, utm_source: purchase.utm_source, utm_campaign: purchase.utm_campaign, utm_medium: purchase.utm_medium, utm_content: purchase.utm_content, utm_term: purchase.utm_term },
            commission: calcCommission(Math.round(Number(purchase.total_price) * 100)),
            refundedAt: null
          });
        } catch (e) { console.error("UTMify error:", e); }
      }

      // Send welcome email
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: purchase.user_name, userEmail: purchase.user_email, planName: purchase.plan_name }),
        });
      } catch (e) {
        console.error("Email error:", e);
      }
    }

    return new Response(JSON.stringify({ success: true, status, paymentId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Check status error:", error);
    return new Response(JSON.stringify({ success: false, error: String(error), status: "PENDING" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
