# ✅ CHECKLIST FINAL - Sistema de Denúncia

## 📋 O que fazer AGORA (passo a passo):

### **1. Verificar Secret no Supabase**

1. No dashboard do Supabase, clique em **"Secrets"** (menu lateral esquerdo, abaixo de "Functions")
2. Verifique se `RESEND_API_KEY` aparece na lista
3. **Se NÃO aparecer:**
   - Clique em **"Add new secret"** ou **"New secret"**
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_5d5LWg54_J42ATgdUCW4d7pnnHSFKztfz`
   - Clique em **"Save"** ou **"Add"**
4. **IMPORTANTE:** Após adicionar o secret, volte para **Functions** → **send-report-email** → Clique em **"Redeploy"**

---

### **2. Limpar Cache do Navegador COMPLETAMENTE**

1. Feche TODAS as abas do app
2. Pressione **Ctrl + Shift + Delete**
3. Selecione:
   - ✅ **Cookies e outros dados de sites**
   - ✅ **Imagens e arquivos em cache**
   - ✅ **Dados de aplicativos hospedados**
4. Período: **Últimas 24 horas** (ou "Tudo")
5. Clique em **"Limpar dados"**

---

### **3. Teste em Janela Anônima**

1. Abra uma **janela anônima** (Ctrl + Shift + N)
2. Acesse: `http://localhost:8080`
3. Faça login
4. Abra o **Console** (F12)
5. Vá para um perfil
6. Clique nos 3 pontinhos → **Denunciar**
7. Preencha e envie

---

### **4. Verifique os Logs no Console**

Você deve ver:

```
=== DEBUG EMAIL SENDING ===
Supabase URL: https://cpqsfixvpbtbqoaarcjq.supabase.co
Tentando enviar email de denúncia...
Payload: { reporterId: "...", reportedId: "...", ... }
Chamando função: send-report-email
Resultado do envio de email: { data: {...}, error: null }
✅ Email enviado com sucesso!
```

---

### **5. Possíveis Resultados**

#### ✅ **SUCESSO:**
```
✅ Email enviado com sucesso! { success: true, emailId: "..." }
```
→ Verifique o email em `suporte.encontrocomfe@gmail.com`

#### ❌ **Erro: "Email service not configured"**
```
error: "Email service not configured"
```
→ O secret `RESEND_API_KEY` NÃO foi configurado ou a função precisa de redeploy

#### ❌ **Erro: CORS / localhost**
```
Access to fetch at 'http://localhost:...'
```
→ Cache do navegador não foi limpo. Tente em janela anônima.

#### ❌ **Erro: "Failed to send email"**
```
error: "Failed to send email: 403"
```
→ A API Key do Resend está inválida ou expirou

---

## 🎯 Checklist Rápido

- [ ] Secret `RESEND_API_KEY` está configurado no Supabase
- [ ] Fiz redeploy da função após adicionar o secret
- [ ] Limpei o cache do navegador (Ctrl + Shift + Delete)
- [ ] Testei em janela anônima
- [ ] Abri o console (F12) para ver os logs
- [ ] Enviei uma denúncia de teste
- [ ] Vi a mensagem "✅ Email enviado com sucesso!" no console
- [ ] Verifiquei o email em suporte.encontrocomfe@gmail.com

---

## 📸 Se ainda não funcionar

Me envie screenshot de:
1. **Aba "Secrets"** no Supabase (mostrando que RESEND_API_KEY está lá)
2. **Console do navegador** após enviar denúncia (mostrando os logs)
3. **Aba Network** (F12 → Network) mostrando a requisição para send-report-email

---

**Comece pela verificação do Secret!** É o mais provável. 🔑
