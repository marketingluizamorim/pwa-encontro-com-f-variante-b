/// <reference path="../deno.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Função Otimizada: link-purchase
 * Objetivo: Vincular compras órfãs ao usuário recém-cadastrado.
 * Nota: O trigger handle_new_user já faz o grosso do trabalho. 
 * Esta função serve como garantia se houver atraso no processamento.
 */
Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const body = await req.json();
        const email = body.email?.toLowerCase();

        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), {
                status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log(`Verificando vínculos pendentes para: ${email}`);

        // 1. Localizar o usuário no Auth
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const user = users?.find(u => u.email?.toLowerCase() === email);

        if (!user) {
            console.log("Usuário ainda não encontrado no Auth. Saindo rápido.");
            return new Response(JSON.stringify({ success: false, message: "User not found yet" }), {
                status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Localizar compras PAID que não possuem user_id
        const { data: purchases } = await supabase
            .from("purchases")
            .select("id, plan_id, plan_name")
            .eq("user_email", email)
            .eq("payment_status", "PAID")
            .is("user_id", null);

        if (!purchases || purchases.length === 0) {
            console.log("Nenhuma compra órfã encontrada.");
            return new Response(JSON.stringify({ success: true, linked: 0 }), {
                status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 3. Vincular (O trigger handle_new_user cuidará do resto assim que o user_id for atualizado ou inserido)
        let linked = 0;
        for (const p of purchases) {
            const { error } = await supabase
                .from("purchases")
                .update({ user_id: user.id })
                .eq("id", p.id);

            if (!error) linked++;
        }

        console.log(`${linked} compras vinculadas com sucesso.`);

        return new Response(JSON.stringify({ success: true, linked }), {
            status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("link-purchase error:", err);
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
