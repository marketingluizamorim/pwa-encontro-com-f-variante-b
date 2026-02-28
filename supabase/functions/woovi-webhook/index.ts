import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const payload = await req.json();
        console.log("[woovi-webhook] Payload recebido:", JSON.stringify(payload));

        // Eventos aceitos — cobrança Pix única confirmada
        const event = payload.event || payload.type || "";
        const isChargeCompleted =
            event === "OPENPIX:CHARGE_COMPLETED" ||
            event === "OPENPIX:TRANSACTION_RECEIVED" ||
            event === "charge.completed";

        if (!isChargeCompleted) {
            console.log("[woovi-webhook] Evento ignorado:", event);
            return new Response(
                JSON.stringify({ ok: true, ignored: true, event }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Extrai correlationID do payload
        const charge = payload.charge || payload.data?.charge || {};
        const correlationID = charge.correlationID || charge.identifier || payload.correlationID;

        if (!correlationID) {
            console.error("[woovi-webhook] correlationID não encontrado no payload");
            return new Response(
                JSON.stringify({ ok: true, warning: "correlationID_missing" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log("[woovi-webhook] correlationID:", correlationID);

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Busca a purchase pelo payment_id (correlationID da Woovi)
        const { data: purchase, error: purchaseErr } = await supabase
            .from("purchases")
            .select("*")
            .eq("payment_id", correlationID)
            .single();

        if (purchaseErr || !purchase) {
            console.error("[woovi-webhook] Purchase não encontrada:", correlationID);
            // Retorna 200 para Woovi não retentar
            return new Response(
                JSON.stringify({ ok: true, warning: "purchase_not_found", correlationID }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Evita processar duas vezes
        if (purchase.payment_status === "PAID") {
            console.log("[woovi-webhook] Purchase já processada:", purchase.id);
            return new Response(
                JSON.stringify({ ok: true, duplicate: true }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Atualiza payment_status para PAID no Supabase B
        const { error: updateErr } = await supabase
            .from("purchases")
            .update({
                payment_status: "PAID",
                updated_at: new Date().toISOString(),
            })
            .eq("id", purchase.id);

        if (updateErr) {
            throw new Error(`Erro ao atualizar purchase: ${updateErr.message}`);
        }

        console.log("[woovi-webhook] ✅ Purchase atualizada para PAID:", purchase.id);

        return new Response(
            JSON.stringify({
                ok: true,
                purchase_id: purchase.id,
                email: purchase.user_email,
                plan_id: purchase.plan_id,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (err) {
        console.error("[woovi-webhook] Erro:", err);
        return new Response(
            JSON.stringify({ error: String(err) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
