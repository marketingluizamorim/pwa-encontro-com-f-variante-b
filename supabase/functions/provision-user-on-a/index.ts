import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_A_URL = Deno.env.get("APP_A_SUPABASE_URL")!;
const SUPABASE_A_SERVICE_KEY = Deno.env.get("APP_A_SERVICE_KEY")!;
const SUPABASE_B_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_B_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const { email, name, password } = await req.json();

        if (!email || !password) {
            throw new Error("email e password são obrigatórios");
        }

        const supabaseB = createClient(SUPABASE_B_URL, SUPABASE_B_SERVICE_KEY);
        const supabaseA = createClient(SUPABASE_A_URL, SUPABASE_A_SERVICE_KEY);

        // ── 1. Busca purchase PAID no Supabase B ──────────────────────────
        const { data: purchase, error: purchaseErr } = await supabaseB
            .from("purchases")
            .select("*")
            .eq("user_email", email)
            .eq("payment_status", "PAID")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (purchaseErr || !purchase) {
            throw new Error("Compra não encontrada ou pagamento não confirmado.");
        }

        console.log("[provision] Purchase encontrada no B:", purchase.id);

        // ── 2. Verifica se usuário já existe no Supabase A ────────────────
        const { data: { users: existingUsers }, error: listErr } = await supabaseA.auth.admin.listUsers({
            perPage: 1000,
        });
        const existingUser = existingUsers?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

        if (existingUser) {
            console.log("[provision] Usuário já existe no A:", existingUser.id);

            // Marca purchase no B como provisionada
            await supabaseB
                .from("purchases")
                .update({
                    provisioned_at: new Date().toISOString(),
                    provision_status: "already_exists",
                    user_id_a: existingUser.id,
                })
                .eq("id", purchase.id);

            return new Response(
                JSON.stringify({ ok: true, user_id: existingUser.id, already_existed: true }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // ── 3. Insere purchase no Supabase A PRIMEIRO ─────────────────────
        // IMPORTANTE: a trigger handle_new_user() do A roda quando o usuário
        // é criado no auth. Ela busca a purchase pelo email para criar o perfil.
        // A purchase PRECISA existir no A antes do usuário ser criado.
        const { error: purchaseAErr } = await supabaseA
            .from("purchases")
            .insert({
                user_name: purchase.user_name,
                user_email: email,
                user_phone: purchase.user_phone,
                user_cpf: purchase.user_cpf,
                plan_id: purchase.plan_id,
                plan_name: purchase.plan_name,
                plan_price: purchase.plan_price,
                total_price: purchase.total_price,
                order_bumps: purchase.order_bumps,
                payment_status: "PAID",
                payment_method: purchase.payment_method || "PIX",
                payment_id: purchase.payment_id,
                quiz_data: purchase.quiz_data, // ← gender, age, state, city
                source_platform: "funnel_b",
                utm_source: purchase.utm_source || null,
                utm_medium: purchase.utm_medium || null,
                utm_campaign: purchase.utm_campaign || null,
                utm_content: purchase.utm_content || null,
                utm_term: purchase.utm_term || null,
            });

        if (purchaseAErr) {
            console.error("[provision] Erro ao inserir purchase no A:", purchaseAErr.message);
            // Não bloqueia — tenta criar o usuário mesmo assim
        } else {
            console.log("[provision] Purchase inserida no A com quiz_data:", purchase.quiz_data);
        }

        // ── 4. Cria usuário no Supabase A ─────────────────────────────────
        // Trigger handle_new_user() roda aqui e lê a purchase que acabamos de inserir
        const { data: newUser, error: createErr } = await supabaseA.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // pula verificação de email
            user_metadata: {
                full_name: name || purchase.user_name,
                phone: purchase.user_phone,
                source: "funnel_b",
            },
        });

        if (createErr || !newUser?.user) {
            throw new Error(`Erro ao criar usuário no A: ${createErr?.message}`);
        }

        const userId = newUser.user.id;
        console.log("[provision] Usuário criado no A:", userId);

        // ── 5. Marca purchase no B como provisionada ──────────────────────
        await supabaseB
            .from("purchases")
            .update({
                provisioned_at: new Date().toISOString(),
                provision_status: "success",
                user_id_a: userId,
            })
            .eq("id", purchase.id);

        console.log("[provision] ✅ Concluído! User:", userId);

        // ── 6. Envia email de boas-vindas ─────────────────────────────────
        try {
            await fetch(`${SUPABASE_B_URL}/functions/v1/send-welcome-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SUPABASE_B_SERVICE_KEY}`,
                },
                body: JSON.stringify({
                    userName: name || purchase.user_name,
                    userEmail: email,
                    planName: purchase.plan_name,
                }),
            });
            console.log("[provision] Email de boas-vindas enviado para:", email);
        } catch (emailErr) {
            // Email não bloqueia o fluxo
            console.error("[provision] Erro ao enviar email (non-fatal):", emailErr);
        }

        return new Response(
            JSON.stringify({ ok: true, user_id: userId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );


    } catch (err) {
        console.error("[provision] Erro fatal:", err);
        return new Response(
            JSON.stringify({ error: String(err) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
