# 🔍 Troubleshooting - Denúncia não está funcionando

## ✅ Correções Aplicadas

1. **Perfil agora fecha corretamente** após denunciar
2. **Logs detalhados** adicionados no console para debug

## 📋 Checklist de Verificação

### 1. Abra o Console do Navegador
- Pressione **F12** no navegador
- Vá na aba **Console**
- Deixe aberto enquanto testa

### 2. Teste a Denúncia
1. Faça login no app
2. Vá para um perfil
3. Clique nos 3 pontinhos → **Denunciar**
4. Escolha um motivo
5. Clique em **Enviar Denúncia**

### 3. Verifique os Logs no Console

Você deve ver mensagens como:

```
✅ SUCESSO:
Tentando enviar email de denúncia...
Resultado do envio de email: { data: {...}, error: null }
Email enviado com sucesso!
```

```
❌ ERRO - Função não encontrada:
Error sending report email: FunctionsHttpError: Edge Function not found
```

```
❌ ERRO - Secret não configurado:
Error sending report email: ...RESEND_API_KEY not configured...
```

## 🔧 Soluções para Problemas Comuns

### Problema 1: "Edge Function not found"

**Causa:** A função `send-report-email` não foi deployada no Supabase

**Solução:**
1. Acesse: https://supabase.com/dashboard/project/cpqsfixvpbtbqoaarcjq/functions
2. Verifique se `send-report-email` aparece na lista
3. Se não aparecer:
   - Clique em "Deploy a new function"
   - Escolha "Via Editor"
   - Nome: `send-report-email`
   - Cole o código do arquivo `supabase/functions/send-report-email/index.ts`
   - Clique em Deploy

### Problema 2: "RESEND_API_KEY not configured"

**Causa:** O secret não foi configurado corretamente

**Solução:**
1. Acesse: https://supabase.com/dashboard/project/cpqsfixvpbtbqoaarcjq/settings/functions
2. Vá em **Secrets** ou **Environment Variables**
3. Verifique se existe `RESEND_API_KEY`
4. Se não existir, adicione:
   - Nome: `RESEND_API_KEY`
   - Valor: `re_5d5LWg54_J42ATgdUCW4d7pnnHSFKztfz`
5. **IMPORTANTE:** Após adicionar o secret, você precisa fazer **redeploy** da função!

### Problema 3: Email não chega (mas sem erros no console)

**Possíveis causas:**

1. **Email na caixa de spam**
   - Verifique a pasta de spam em `suporte.encontrocomfe@gmail.com`

2. **Domínio não verificado no Resend**
   - Acesse: https://resend.com/emails
   - Verifique se o email foi enviado
   - Se aparecer erro de domínio, você precisa verificar o domínio

3. **Limite de emails atingido**
   - Plano gratuito: 100 emails/dia
   - Verifique em: https://resend.com/overview

### Problema 4: Perfil não fecha após denunciar

**Solução:** Já corrigido! Recarregue a página (F5) e teste novamente.

## 🧪 Teste Rápido da Edge Function

Para testar se a função está funcionando, você pode chamá-la diretamente:

1. Acesse: https://supabase.com/dashboard/project/cpqsfixvpbtbqoaarcjq/functions/send-report-email
2. Vá na aba **Invoke**
3. Cole este JSON de teste:

```json
{
  "reporterId": "test-reporter-id",
  "reportedId": "test-reported-id",
  "reportedName": "Usuário Teste",
  "reason": "fake_profile",
  "description": "Este é um teste do sistema de denúncias"
}
```

4. Clique em **Invoke**
5. Verifique se o email chegou em `suporte.encontrocomfe@gmail.com`

## 📊 Verificar Logs da Edge Function

1. Acesse: https://supabase.com/dashboard/project/cpqsfixvpbtbqoaarcjq/functions/send-report-email
2. Vá na aba **Logs**
3. Você verá todos os erros e sucessos da função

## ✅ Checklist Final

- [ ] Edge Function `send-report-email` está deployada
- [ ] Secret `RESEND_API_KEY` está configurado
- [ ] Função foi re-deployada após adicionar o secret
- [ ] Console do navegador não mostra erros
- [ ] Testei com o JSON de teste acima
- [ ] Verifiquei a caixa de spam do Gmail

## 📧 Formato do Email que Deve Chegar

Assunto: **🚨 Nova Denúncia - [Motivo]**

Conteúdo:
- Motivo da denúncia
- Data/hora
- Nome e ID do usuário denunciado
- Nome e ID do denunciante
- Detalhes adicionais (se fornecidos)

---

**Se ainda não funcionar após todas essas verificações, me envie:**
1. Screenshot do console do navegador (com os logs)
2. Screenshot dos logs da Edge Function no Supabase
3. Screenshot da lista de secrets configurados
