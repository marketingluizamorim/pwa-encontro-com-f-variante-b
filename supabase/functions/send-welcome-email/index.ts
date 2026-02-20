/// <reference path="../deno.d.ts" />

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface WelcomeEmailRequest {
    userName: string;
    userEmail: string;
    planName: string;
}

function buildWelcomeEmail(userName: string, planName: string): string {
    const firstName = userName.split(" ")[0];

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bem-vindo ao Encontro com Fé</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f172a;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;background:linear-gradient(160deg,#1e293b 0%,#0f172a 100%);border:1px solid rgba(212,175,55,0.2);">

          <!-- HERO -->
          <tr>
            <td style="padding:40px 32px 24px;text-align:center;background:linear-gradient(135deg,rgba(212,175,55,0.12) 0%,rgba(20,184,166,0.06) 100%);">
              <img src="https://encontrocomfe.site/3logo-nova1080x1080.png" alt="Encontro com Fé" width="72" height="72"
                   style="border-radius:50%;object-fit:contain;margin-bottom:20px;filter:drop-shadow(0 0 20px rgba(212,175,55,0.5));"/>

              <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Bem-vindo(a), <span style="color:#d4af37;">${firstName}!</span>
              </h1>
              <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
                Seu acesso ao <strong style="color:#d4af37;">${planName}</strong> foi ativado.
                <br/>Você está a um passo de encontrar sua pessoa especial.
              </p>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.4),transparent);"></div>
            </td>
          </tr>

          <!-- URGENCY MESSAGE -->
          <tr>
            <td style="padding:28px 32px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.25);border-radius:14px;padding:20px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px;font-size:17px;font-weight:700;color:#fcd34d;">
                      Pessoas cristãs do Brasil inteiro já estão te esperando
                    </p>
                    <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.75);line-height:1.7;">
                      Mais de <strong style="color:#fff;">8.000 pessoas</strong> encontraram seus relacionamentos através
                      do Encontro com Fé. Cada dia que você fica de fora, é uma conexão que pode passar.
                      <strong style="color:#d4af37;">Instale o app agora e comece hoje.</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- INSTALL STEPS TITLE -->
          <tr>
            <td style="padding:8px 32px 16px;text-align:center;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">
                Instale o App em <span style="color:#14b8a6;">30 segundos</span>
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.55);">
                Melhor experiência, notificações e acesso rápido — sem ocupar espaço extra.
              </p>
            </td>
          </tr>

          <!-- INSTALL STEPS: iOS -->
          <tr>
            <td style="padding:0 32px 12px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:14px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#fcd34d;">iPhone / iPad (Safari)</p>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:6px 0;vertical-align:top;">
                          <span style="display:inline-block;width:24px;height:24px;background:#d4af37;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#0f172a;margin-right:10px;">1</span>
                        </td>
                        <td style="padding:6px 0;">
                          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">
                            Abra <strong>encontrocomfe.site/v1</strong> no <strong>Safari</strong>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;vertical-align:top;">
                          <span style="display:inline-block;width:24px;height:24px;background:#d4af37;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#0f172a;margin-right:10px;">2</span>
                        </td>
                        <td style="padding:6px 0;">
                          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">
                            Toque no ícone <strong>Compartilhar</strong> (quadrado com seta ↑) na barra inferior
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;vertical-align:top;">
                          <span style="display:inline-block;width:24px;height:24px;background:#d4af37;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#0f172a;margin-right:10px;">3</span>
                        </td>
                        <td style="padding:6px 0;">
                          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">
                            Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;vertical-align:top;">
                          <span style="display:inline-block;width:24px;height:24px;background:#d4af37;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#0f172a;margin-right:10px;">4</span>
                        </td>
                        <td style="padding:6px 0;">
                          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">
                            Toque em <strong>"Adicionar"</strong> — pronto! 🎉
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- INSTALL STEPS: Android -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:14px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#34d399;">Android (Chrome)</p>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:6px 0;vertical-align:top;">
                          <span style="display:inline-block;width:24px;height:24px;background:#14b8a6;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#0f172a;margin-right:10px;">1</span>
                        </td>
                        <td style="padding:6px 0;">
                          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">
                            Abra <strong>encontrocomfe.site/v1</strong> no <strong>Chrome</strong>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;vertical-align:top;">
                          <span style="display:inline-block;width:24px;height:24px;background:#14b8a6;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#0f172a;margin-right:10px;">2</span>
                        </td>
                        <td style="padding:6px 0;">
                          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">
                            Toque nos <strong>3 pontos ⋮</strong> no canto superior direito
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;vertical-align:top;">
                          <span style="display:inline-block;width:24px;height:24px;background:#14b8a6;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#0f172a;margin-right:10px;">3</span>
                        </td>
                        <td style="padding:6px 0;">
                          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);">
                            Toque em <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar app"</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="https://encontrocomfe.site/login"
                 style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#d4af37,#b8860b);color:#0f172a;font-weight:800;font-size:15px;text-decoration:none;border-radius:50px;letter-spacing:0.5px;box-shadow:0 4px 24px rgba(212,175,55,0.35);">
                Acessar minha conta →
              </a>
              <p style="margin:16px 0 0;font-size:12px;color:rgba(255,255,255,0.4);">
                Ou acesse diretamente: encontrocomfe.site/login
              </p>
            </td>
          </tr>

          <!-- SOCIAL PROOF -->
          <tr>
            <td style="padding:0 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:rgba(20,184,166,0.07);border:1px solid rgba(20,184,166,0.2);border-radius:14px;padding:20px;">
                <tr>
                  <td style="padding:18px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:22px;">🙏</p>
                    <p style="margin:0;font-size:13px;font-style:italic;color:rgba(255,255,255,0.7);line-height:1.7;">
                      "Encontrei meu marido pelo Encontro com Fé há 8 meses.
                      Nunca imaginei que seria tão fácil encontrar alguém com os mesmos valores."
                    </p>
                    <p style="margin:10px 0 0;font-size:12px;color:#14b8a6;font-weight:600;">
                      — Ana Paula, 34 anos · São Paulo
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 32px;text-align:center;background:rgba(0,0,0,0.2);border-top:1px solid rgba(255,255,255,0.06);">
              <img src="https://encontrocomfe.site/3logo-nova1080x1080.png" alt="Logo" width="32" height="32"
                   style="border-radius:50%;margin-bottom:10px;opacity:0.7;"/>
              <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.5);letter-spacing:1px;text-transform:uppercase;">
                Encontro com Fé
              </p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">
                Você está recebendo este email porque realizou uma compra.<br/>
                Em caso de dúvidas: <a href="mailto:suporte.encontrocomfe@gmail.com" style="color:#d4af37;text-decoration:none;">suporte.encontrocomfe@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const body: WelcomeEmailRequest = await req.json();
        const { userName, userEmail, planName } = body;

        if (!userName || !userEmail || !planName) {
            return new Response(
                JSON.stringify({ success: false, error: "Missing required fields" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (!resendApiKey) {
            console.error("RESEND_API_KEY not configured");
            return new Response(
                JSON.stringify({ success: false, error: "Email service not configured" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const html = buildWelcomeEmail(userName, planName);
        const firstName = userName.split(" ")[0];

        const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "Encontro com Fé <noreply@encontrocomfe.site>",
                to: [userEmail],
                subject: `${firstName}, seu acesso está ativo — instale o app agora`,
                html,
            }),
        });

        if (!emailRes.ok) {
            const errText = await emailRes.text();
            console.error("Resend error:", emailRes.status, errText);
            return new Response(
                JSON.stringify({ success: false, error: `Resend error: ${emailRes.status}` }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const data = await emailRes.json();
        console.log("Welcome email sent:", data.id, "→", userEmail);

        return new Response(
            JSON.stringify({ success: true, emailId: data.id }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (err) {
        console.error("Fatal error in send-welcome-email:", err);
        return new Response(
            JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
