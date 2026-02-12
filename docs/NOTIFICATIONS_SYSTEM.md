# Sistema de Notificações do Menu Central

## Visão Geral

Sistema de notificações em tempo real que exibe **indicadores visuais discretos** (bolinhas verdes) no menu de navegação central quando há atualizações em cada seção do aplicativo.

## Funcionalidades

### 1. Indicadores Visuais
- **Bolinha verde** (`bg-emerald-500`) com efeito de pulso (`animate-pulse`)
- Tamanho: `8px` (w-2 h-2)
- Posição: Canto superior direito de cada ícone
- Sombra luminosa: `shadow-[0_0_8px_rgba(16,185,129,0.6)]`
- **Desaparece automaticamente** quando o usuário visita a seção

### 2. Seções Monitoradas

| Seção | Notificação Quando |
|-------|-------------------|
| **Descobrir** | Novos perfis criados nas últimas 24h |
| **Explorar** | Novo conteúdo disponível (atualizado diariamente) |
| **Curtidas** | Novos likes recebidos (swipes com direction='like') |
| **Mensagens** | Novas mensagens não lidas em conversas ativas |

### 3. Detecção em Tempo Real

O sistema usa **Supabase Realtime** para detectar atualizações instantaneamente:

- **Mensagens**: Escuta inserções na tabela `messages`
- **Likes**: Escuta inserções na tabela `swipes` com `direction='like'`
- **Perfis**: Verifica novos registros na tabela `profiles`

## Arquitetura

### Hook: `useNotifications`
**Localização**: `src/features/discovery/hooks/useNotifications.ts`

```typescript
interface NotificationState {
  discover: boolean;  // Novos perfis disponíveis
  explore: boolean;   // Novo conteúdo no Explorar
  matches: boolean;   // Novos likes recebidos
  chat: boolean;      // Novas mensagens não lidas
}

export function useNotifications() {
  const { notifications, clearNotification } = useNotifications();
  // ...
}
```

**Funções principais**:
- `checkMatches()`: Verifica novos likes recebidos
- `checkMessages()`: Verifica mensagens não lidas
- `checkDiscover()`: Verifica novos perfis
- `checkExplore()`: Verifica novo conteúdo
- `clearNotification(section)`: Limpa notificação ao visitar seção

### Integração no AppLayout
**Localização**: `src/features/discovery/components/AppLayout.tsx`

```tsx
const navItems = [
  { 
    to: '/app/discover', 
    icon: 'ri-compass-3-fill', 
    label: 'Descobrir', 
    notificationKey: 'discover' 
  },
  // ...
];

// No componente
const { notifications, clearNotification } = useNotifications();

// Limpar ao visitar
useEffect(() => {
  if (location.pathname.includes('/discover')) {
    clearNotification('discover');
  }
  // ...
}, [location.pathname]);

// Renderizar indicador
{hasNotification && !isActive && (
  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
)}
```

## Persistência

O sistema usa **localStorage** para rastrear a última verificação de cada seção:

```typescript
localStorage.setItem(`last_${section}_check_${user.id}`, Date.now().toString());
```

**Chaves usadas**:
- `last_discover_check_{userId}`
- `last_explore_check_{userId}`
- `last_matches_check_{userId}`
- `last_chat_check_{userId}`

## Comportamento

### Quando a notificação aparece:
1. Há uma atualização na seção
2. O usuário **não está** na seção atualmente
3. A atualização ocorreu após a última visita

### Quando a notificação desaparece:
1. Usuário navega para a seção
2. `clearNotification()` é chamado automaticamente
3. Timestamp é atualizado no localStorage

## Customização

### Alterar cor do indicador:
```tsx
// Linha 110 em AppLayout.tsx
<div className="... bg-emerald-500 ..." />
// Trocar bg-emerald-500 por outra cor (ex: bg-teal-500, bg-green-500)
```

### Alterar tamanho:
```tsx
// Linha 110 em AppLayout.tsx
<div className="... w-2 h-2 ..." />
// Trocar w-2 h-2 por w-3 h-3 (maior) ou w-1.5 h-1.5 (menor)
```

### Alterar posição:
```tsx
// Linha 110 em AppLayout.tsx
<div className="absolute top-1.5 right-1.5 ..." />
// Ajustar top-* e right-* conforme necessário
```

## Tabelas do Banco de Dados

### Swipes (Likes)
```sql
CREATE TABLE swipes (
  id UUID PRIMARY KEY,
  swiper_id UUID NOT NULL,
  swiped_id UUID NOT NULL,
  direction swipe_direction NOT NULL, -- 'like', 'dislike', 'super_like'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  match_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Matches
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Performance

- **Verificações iniciais**: Executadas apenas no mount do componente
- **Realtime**: Usa canais Supabase para atualizações instantâneas
- **Throttling**: Verificações limitadas por localStorage timestamps
- **Limpeza**: Canais são desinscritos no unmount do componente

## Melhorias Futuras

1. **Badge com contador**: Mostrar número de notificações
2. **Som/vibração**: Notificação sonora ao receber atualização
3. **Push notifications**: Integrar com service worker para notificações push
4. **Priorização**: Diferentes cores para diferentes tipos de notificação
5. **Histórico**: Manter log de notificações recebidas
