# 🎯 SOLUÇÃO SIMPLES: Popular Perfis via Supabase Dashboard

## ⚠️ PROBLEMA IDENTIFICADO

Os scripts TypeScript estão falhando devido a:
1. Conflitos com triggers automáticos do Supabase
2. Constraints de chave única
3. Problemas com `auth.admin.createUser`

## ✅ SOLUÇÃO RECOMENDADA: SQL Direto

### 📝 PASSO A PASSO:

#### 1. **Acesse o SQL Editor do Supabase**
   - URL: https://supabase.com/dashboard/project/cpqsfixvpbtbqoaarcjq/sql/new
   - Ou: Dashboard > SQL Editor > New Query

#### 2. **Limpe perfis antigos (se existirem)**

Cole e execute este SQL primeiro:

```sql
-- Deletar perfis de teste antigos
DELETE FROM messages WHERE sender_id IN (
  SELECT user_id FROM profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@example.com'
  )
);

DELETE FROM matches WHERE user1_id IN (
  SELECT user_id FROM profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@example.com'
  )
) OR user2_id IN (
  SELECT user_id FROM profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@example.com'
  )
);

DELETE FROM swipes WHERE swiper_id IN (
  SELECT user_id FROM profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@example.com'
  )
) OR swiped_id IN (
  SELECT user_id FROM profiles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@example.com'
  )
);

DELETE FROM profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);

-- Deletar usuários de teste do Auth (requer permissões de service_role)
-- Isso pode precisar ser feito manualmente no Auth > Users
```

#### 3. **Crie os novos perfis**

Abra o arquivo: `scripts/populate-complete.sql` e execute-o no SQL Editor.

---

## 🔧 ALTERNATIVA: Criar Manualmente via Dashboard

Se o SQL também falhar, você pode criar perfis manualmente:

### Via Auth > Users:

1. Acesse: https://supabase.com/dashboard/project/cpqsfixvpbtbqoaarcjq/auth/users
2. Clique em "Add user"
3. Crie usuários com emails: `test1@example.com`, `test2@example.com`, etc.
4. Senha: `TestPassword123!`

### Via Table Editor > Profiles:

1. Acesse: https://supabase.com/dashboard/project/cpqsfixvpbtbqoaarcjq/editor
2. Selecione a tabela `profiles`
3. Clique em "Insert row"
4. Preencha os campos:
   - `user_id`: (copie do Auth > Users)
   - `display_name`: Nome do perfil
   - `gender`: `male` ou `female`
   - `birth_date`: `1995-01-01`
   - `city`: Cidade
   - `bio`: Descrição
   - etc.

### Via Table Editor > Swipes:

1. Selecione a tabela `swipes`
2. Insira curtidas:
   - `swiper_id`: ID do perfil de teste
   - `swiped_id`: `1803e7e5-ba10-4698-827b-d8cc85735fcc` (seu ID)
   - `direction`: `like` ou `super_like`

---

## 🎯 RECOMENDAÇÃO FINAL

**Use a abordagem SQL** (Passo 2 + 3 acima) pois é:
- ✅ Mais rápida
- ✅ Mais confiável
- ✅ Cria tudo de uma vez (perfis + curtidas + matches + mensagens)

Vou criar agora o arquivo SQL completo para você executar!
