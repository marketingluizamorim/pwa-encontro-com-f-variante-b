# 🚀 DEPLOY DA EDGE FUNCTION - PASSO A PASSO

## ⚠️ PROBLEMA IDENTIFICADO

O erro no console mostra:
```
FunctionsFetchError: Failed to send a request to the Edge Function
CORS policy error
```

**Causa:** A função `send-report-email` NÃO está deployada no Supabase em produção.

---

## ✅ SOLUÇÃO: Deploy Manual via Dashboard

### **Passo 1: Acessar o Dashboard**
1. Acesse: https://supabase.com/dashboard/project/cpqsfixvpbtbqoaarcjq/functions
2. Faça login se necessário

### **Passo 2: Criar Nova Função**
1. Clique no botão verde **"Deploy a new function"**
2. Escolha **"Via Editor"** (primeira opção)

### **Passo 3: Configurar a Função**
1. **Function name (Nome):** Digite exatamente: `send-report-email`
2. **Code (Código):** Cole o código abaixo (COPIE TUDO)

---

## 📋 CÓDIGO COMPLETO PARA COPIAR

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendReportEmailRequest {
  reporterId: string;
  reportedId: string;
  reportedName: string;
  reason: string;
  description?: string;
}

const REASON_LABELS: Record<string, string> = {
  fake_profile: "Perfil falso",
  harassment: "Assédio",
  inappropriate: "Conteúdo inapropriado",
  scam: "Golpe/Fraude",
  other: "Outro",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: SendReportEmailRequest = await req.json();
    const { reporterId, reportedId, reportedName, reason, description } = body;

    // Get reporter info
    const { data: reporter } = await supabase
      .from("profiles")
      .select("display_name, user_id")
      .eq("user_id", reporterId)
      .single();

    const reasonLabel = REASON_LABELS[reason] || reason;
    const timestamp = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      dateStyle: "full",
      timeStyle: "long",
    });

    // Prepare email content
    const emailSubject = `🚨 Nova Denúncia - ${reasonLabel}`;
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #dc2626; }
    .label { font-weight: bold; color: #374151; }
    .value { color: #6b7280; }
    .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🚨 Nova Denúncia Recebida</h1>
    </div>
    <div class="content">
      <p>Uma nova denúncia foi registrada no sistema Encontro com Fé.</p>
      
      <div class="info-box">
        <p><span class="label">Motivo:</span> <span class="value">${reasonLabel}</span></p>
        <p><span class="label">Data/Hora:</span> <span class="value">${timestamp}</span></p>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0;">👤 Usuário Denunciado</h3>
        <p><span class="label">Nome:</span> <span class="value">${reportedName}</span></p>
        <p><span class="label">ID:</span> <span class="value">${reportedId}</span></p>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0;">👮 Denunciante</h3>
        <p><span class="label">Nome:</span> <span class="value">${reporter?.display_name || "Não disponível"}</span></p>
        <p><span class="label">ID:</span> <span class="value">${reporterId}</span></p>
      </div>

      ${description ? `
      <div class="info-box">
        <h3 style="margin-top: 0;">📝 Detalhes Adicionais</h3>
        <p style="white-space: pre-wrap;">${description}</p>
      </div>
      ` : ""}

      <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <p style="margin: 0;"><strong>⚠️ Ação Necessária:</strong></p>
        <p style="margin: 5px 0 0 0;">Acesse o painel administrativo para revisar esta denúncia e tomar as medidas apropriadas.</p>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">Encontro com Fé - Sistema de Moderação</p>
      <p style="margin: 5px 0 0 0;">Este é um email automático, não responda.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Send email using Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Email service not configured");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Encontro com Fé <noreply@encontrocomfe.com>",
        to: ["suporte.encontrocomfe@gmail.com"],
        subject: emailSubject,
        html: emailBody,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${emailResponse.status}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailData.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending report email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

---

### **Passo 4: Deploy**
1. Após colar o código, clique no botão **"Deploy"** ou **"Create function"**
2. Aguarde alguns segundos (vai aparecer uma mensagem de sucesso)

### **Passo 5: Verificar Secret**
1. Vá em **Settings** → **Edge Functions** → **Secrets**
2. Verifique se `RESEND_API_KEY` está na lista
3. Se NÃO estiver:
   - Clique em **Add new secret**
   - Nome: `RESEND_API_KEY`
   - Valor: `re_5d5LWg54_J42ATgdUCW4d7pnnHSFKztfz`
   - Clique em **Save**
4. **IMPORTANTE:** Se você acabou de adicionar o secret, volte para a função e clique em **Redeploy**

---

## 🧪 Teste Após Deploy

1. Recarregue a página do app (F5)
2. Faça login
3. Vá para um perfil
4. Clique nos 3 pontinhos → Denunciar
5. Envie a denúncia
6. Verifique o console (F12) - Agora deve mostrar: **"Email enviado com sucesso!"**
7. Verifique o email em: `suporte.encontrocomfe@gmail.com`

---

## ✅ Checklist Final

- [ ] Acessei o dashboard do Supabase
- [ ] Cliquei em "Deploy a new function"
- [ ] Escolhi "Via Editor"
- [ ] Nome da função: `send-report-email`
- [ ] Colei o código completo acima
- [ ] Cliquei em Deploy
- [ ] Verifiquei que `RESEND_API_KEY` está configurado nos Secrets
- [ ] Testei enviando uma denúncia
- [ ] Email chegou em suporte.encontrocomfe@gmail.com

---

**Se tiver qualquer dúvida ou erro, me avise!** 🚀
