# Guia de Validação de Performance e UX (PWA)

Este guia descreve os testes manuais e técnicos necessários para validar as otimizações de performance, cache e preservação de estado implementadas.

---

## 1. Validação de Imagens e Renderização
**Objetivo:** Garantir que o scroll seja fluido e o carregamento de fotos não cause saltos visuais.

- [ ] **Teste de Jank/Scroll**: Role o feed de "Descobrir" rapidamente.
    - **Comportamento Esperado**: Zero engasgos visíveis. O uso de `decoding="async"` deve manter a thread principal livre para as animações de swipe.
- [ ] **Teste de Skeleton**: Limpe o cache do navegador e carregue o app em uma conexão simulada como "Fast 3G" (DevTools > Network).
    - **Comportamento Esperado**: Um esqueleto retangular (shimmer) deve aparecer no lugar da foto. A foto só deve aparecer (fade-in) quando estiver 100% carregada. Nunca deve aparecer uma foto carregando "de cima para baixo".

## 2. Validação do Service Worker e Cache Offline
**Objetivo:** Confirmar que o SW está agindo como um "Proxy" eficiente e ignorando headers restritivos da CDN.

- [ ] **Ativação Precoce**: Abra o DevTools > Application > Service Workers.
    - **Verificação**: Recarregue a página (`Ctrl+F5`). O SW deve estar "Running" e ativo imediatamente. No console (se habilitado o log ou inspecionando o tráfego), o registro deve ocorrer antes do `DOMContentLoaded`.
- [ ] **Persistência de Cache (Offline)**: Navegue por alguns perfis, feche o app, coloque o navegador em "Offline" (Network panel) e reabra.
    - **Comportamento Esperado**: As fotos dos usuários já visitados devem carregar instantaneamente.
    - **Verificação Técnica**: No Network panel, a coluna "Size" deve indicar `(from ServiceWorker)`. Verifique se o SW ignorou o `Cache-Control: no-cache` (comum no Supabase) graças ao `forceCachePlugin`.

## 3. Navegação entre Abas (Keep-Alive)
**Objetivo:** Validar que a troca de contexto é instantânea e mantém a memória visual do usuário.

- [ ] **Teste de Persistência**: 
    1. Vá na aba **Descobrir**, role um pouco o perfil.
    2. Clique na aba **Mensagens**.
    3. Volte para a aba **Descobrir**.
    - **Comportamento Esperado**: O retorno deve ser **instantâneo**. Não deve aparecer o spinner/loader de página, e a posição do scroll no perfil deve ser a mesma de onde você saiu.
- [ ] **Teste de "Out-of-Tab"**: Entre em uma conversa específica (ChatRoom) ou em um perfil detalhado. Saia e volte para a aba.
    - **Comportamento Esperado**: Como o ChatRoom usa o `Outlet` padrão, ele pode recarregar (comportamento normal para economizar memória), mas ao clicar na aba inferior de volta, a aba principal deve estar preservada.

## 4. Monitoramento de Memória
**Objetivo:** Garantir que manter as 5 abas montadas não causa um "Memory Leak".

- [ ] **Stress Test de Memória**:
    1. Abra o DevTools > Performance > aba **Memory**.
    2. Habilite a checkbox "Memory" e clique no ícone de círculo (Record).
    3. Use o app normalmente por 5 minutos, trocando de abas e dando swipes.
    4. Force a coleta de lixo (ícone da lixeira no DevTools) e pare o Record.
    - **Comportamento Esperado**: O gráfico "Total JS Heap Size" pode subir um pouco, mas deve estabilizar em um "plateau" (patamar). Se o gráfico for uma linha diagonal infinita para cima, temos um vazamento.

## 5. Auditoria de SEO e Performance (Lighthouse)
**Objetivo:** Validar as metas de rede (`preconnect`).

- [ ] **Lighthouse Mobile Report**: Execute um report no modo Mobile.
    - **Verificação**: Em "Best Practices", verifique se não há avisos sobre imagens pesadas ou falta de `preconnect`. Em "Performance", o `Initial Connection Time` deve ser baixo devido aos links adicionados no `index.html`.
