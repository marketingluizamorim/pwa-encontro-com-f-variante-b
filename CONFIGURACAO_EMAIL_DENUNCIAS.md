# 🔑 Configuração da API Key do Resend - PASSO A PASSO

## ✅ Sua API Key do Resend
```
re_5d5LWg54_J42ATgdUCW4d7pnnHSFKztfz
```

## 📋 Configuração Manual via Dashboard do Supabase

### Passo 1: Acessar o Dashboard
1. Acesse: https://supabase.com/dashboard/project/cpqsfixvpbtbqoaarcjq
2. Faça login se necessário

### Passo 2: Configurar o Secret
1. No menu lateral esquerdo, clique em **⚙️ Settings** (Configurações)
2. Clique em **Edge Functions** (ou **Functions**)
3. Role até a seção **Secrets** ou **Environment Variables**
4. Clique em **Add new secret** ou **New variable**
5. Preencha:
   - **Name (Nome):** `RESEND_API_KEY`
   - **Value (Valor):** `re_5d5LWg54_J42ATgdUCW4d7pnnHSFKztfz`
6. Clique em **Save** ou **Add**

### Passo 3: Deploy da Edge Function

#### Opção A: Via Dashboard (Mais Fácil)
1. No menu lateral, vá em **Edge Functions**
2. Clique em **Deploy new function**
3. Selecione a função `send-report-email`
4. Clique em **Deploy**

#### Opção B: Via Supabase CLI (Se tiver instalado)
```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Linkar o projeto
supabase link --project-ref cpqsfixvpbtbqoaarcjq

# Configurar o secret
supabase secrets set RESEND_API_KEY=re_5d5LWg54_J42ATgdUCW4d7pnnHSFKztfz

# Deploy da função
supabase functions deploy send-report-email
```

## ✅ Verificação

Após configurar, teste enviando uma denúncia no app:

1. Faça login no app
2. Vá para qualquer perfil
3. Clique nos 3 pontinhos (⋮)
4. Selecione **Denunciar**
5. Preencha e envie
6. Verifique o email em: **suporte.encontrocomfe@gmail.com**

## 🔍 Troubleshooting

### Email não chegou?

1. **Verifique a caixa de spam** do Gmail
2. **Verifique os logs da função:**
   - Dashboard → Edge Functions → send-report-email → Logs
3. **Verifique se o secret foi salvo:**
   - Settings → Edge Functions → Secrets
   - Deve aparecer `RESEND_API_KEY` na lista

### Erro ao enviar denúncia?

1. Abra o Console do navegador (F12)
2. Vá na aba **Network** (Rede)
3. Envie uma denúncia
4. Procure pela requisição `send-report-email`
5. Verifique a resposta de erro

## 📧 Configuração de Domínio (Opcional)

Para emails mais profissionais (sem "via resend.com"):

1. No Resend: https://resend.com/domains
2. Adicione `encontrocomfe.com`
3. Configure os registros DNS:
   - SPF
   - DKIM
   - DMARC
4. Após verificação, atualize o `from` na função para:
   ```typescript
   from: "Suporte <suporte@encontrocomfe.com>"
   ```

## 🎉 Pronto!

Agora toda denúncia enviada no app chegará automaticamente no email com:
- ✅ Motivo da denúncia
- ✅ Data e hora
- ✅ ID do usuário denunciado
- ✅ ID do denunciante
- ✅ Detalhes adicionais

---

**Projeto ID:** `cpqsfixvpbtbqoaarcjq`
**Email de Suporte:** `suporte.encontrocomfe@gmail.com`
**API Key:** `re_5d5LWg54_J42ATgdUCW4d7pnnHSFKztfz`
