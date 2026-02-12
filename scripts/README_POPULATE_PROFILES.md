# 🚀 Script de População de Perfis de Teste

Este script cria 15 perfis realistas de teste que interagem apenas com o seu perfil (`marketing.luizamorim@gmail.com`).

## 📋 O que o script faz:

- ✅ Cria 15 perfis brasileiros realistas (nomes, cidades, ocupações, etc.)
- ✅ ~12 perfis curtem você (80% de chance)
- ✅ ~6-8 matches criados automaticamente (50% de chance)
- ✅ Mensagens enviadas nos matches (1-4 mensagens por match)
- ✅ Perfis com fotos de avatar (usando pravatar.cc)
- ✅ Dados realistas: bio, interesses cristãos, cidade, ocupação, etc.

---

## 🔑 Passo 1: Obter a Service Role Key

1. Acesse: https://supabase.com/dashboard/project/cpqsfixvpbtbqoaarcjq/settings/api
2. Na seção **Project API keys**, copie a **`service_role` key** (secret)
3. ⚠️ **ATENÇÃO:** Esta chave é secreta! Não compartilhe nem faça commit dela.

---

## 💻 Passo 2: Executar o Script

### No PowerShell (Windows):

```powershell
# 1. Definir a variável de ambiente com a Service Role Key
$env:SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key_aqui"

# 2. Executar o script
npx tsx scripts/populate-test-profiles-admin.ts
```

### Exemplo completo:

```powershell
# Navegar até a pasta do app
cd c:\Users\Meu-PC\Downloads\pwa-encontro-com-f-main\app

# Definir a chave (substitua pela sua chave real)
$env:SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Executar
npx tsx scripts/populate-test-profiles-admin.ts
```

---

## 📊 Resultado Esperado:

```
🚀 POPULAÇÃO DO BANCO DE DADOS

============================================================
📧 Usuário alvo: marketing.luizamorim@gmail.com
✅ Usuário encontrado: abc123...
============================================================

📝 [1/15] Criando: Gabriel Santos...
   💖 Curtida enviada
   🎉 Match criado
   💬 3 mensagens enviadas
   ✅ Concluído

📝 [2/15] Criando: Mariana Oliveira...
   💖 Curtida enviada
   ✅ Concluído

... (continua para os 15 perfis)

============================================================

🎉 POPULAÇÃO CONCLUÍDA!

📊 Resumo:
   - 15 perfis criados
   - ~12 curtidas recebidas
   - ~6-8 matches criados
   - Mensagens enviadas nos matches

✅ Teste o app agora!
```

---

## 🧪 Testando o App

Após executar o script, você pode testar:

1. **Descobrir** (`/app/discover`):
   - Verá perfis de teste para dar swipe
   
2. **Curtidas** (`/app/matches`):
   - Verá ~12 perfis que curtiram você
   
3. **Mensagens** (`/app/chat`):
   - Verá ~6-8 conversas com mensagens já enviadas

---

## 🗑️ Limpando os Perfis de Teste

Se quiser remover os perfis de teste depois:

1. Acesse o Supabase Dashboard
2. Vá em **Table Editor** > **profiles**
3. Filtre por emails que terminam em `@example.com`
4. Delete os registros

Ou execute este SQL no SQL Editor:

```sql
-- Deletar swipes dos perfis de teste
DELETE FROM swipes WHERE swiper_id IN (
  SELECT user_id FROM profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@example.com'
  )
);

-- Deletar matches dos perfis de teste
DELETE FROM matches WHERE user1_id IN (
  SELECT user_id FROM profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@example.com'
  )
) OR user2_id IN (
  SELECT user_id FROM profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@example.com'
  )
);

-- Deletar mensagens dos perfis de teste
DELETE FROM messages WHERE sender_id IN (
  SELECT user_id FROM profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@example.com'
  )
);

-- Deletar perfis de teste
DELETE FROM profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);

-- Deletar usuários de teste do Auth
-- (Isso deve ser feito manualmente no dashboard ou via Admin API)
```

---

## ❓ Troubleshooting

### Erro: "SUPABASE_SERVICE_ROLE_KEY não definida"
- Certifique-se de executar o comando `$env:SUPABASE_SERVICE_ROLE_KEY="..."` antes do script

### Erro: "Usuário não encontrado"
- Verifique se o email `marketing.luizamorim@gmail.com` está correto
- Faça login no app pelo menos uma vez para criar o perfil

### Erro: "Erro ao acessar API Admin"
- Verifique se a Service Role Key está correta
- Certifique-se de copiar a chave completa (começa com `eyJ...`)

---

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- A Service Role Key tem acesso TOTAL ao banco de dados
- NUNCA faça commit dela no Git
- NUNCA compartilhe ela publicamente
- Use apenas em ambiente de desenvolvimento local

---

## 📝 Perfis Criados

Os perfis incluem:
- **Nomes:** Gabriel Santos, Mariana Oliveira, Lucas Ferreira, Ana Costa, etc.
- **Cidades:** São Paulo, Rio de Janeiro, Belo Horizonte, Curitiba, etc.
- **Ocupações:** Engenheiro, Professora, Médico, Designer, Empresário, etc.
- **Religiões:** Evangélico, Católico
- **Interesses:** Música Gospel, Grupos de Oração, Missões, Adoração, etc.
- **Fotos:** Avatares realistas do pravatar.cc

Todos os perfis são diversos, realistas e apropriados para um app de relacionamento cristão! 🙏
