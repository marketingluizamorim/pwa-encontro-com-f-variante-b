# Auditoria de Performance e Renderização PWA

## 1. Problema: Fotos carregando pela metade
### Causa
As imagens estão sendo carregadas via tags `<img>` padrão no `Discover.tsx` e `Matches.tsx`. Em conexões instáveis, o navegador começa a renderizar o buffer de imagem conforme chega, resultando em fotos "cortadas" se o download demorar.

### Correção Proposta
- Criar o componente `OptimizedImage`.
- Usar `opacity-0` inicial e `opacity-100` no `onLoad`.
- Adicionar um background de skeleton ou cor sólida como placeholder.

---

## 2. Problema: Dificuldade de renderização inicial
### Causa
- Falta de tags de otimização de rede no `index.html`.
- Imagens pesadas não sendo cacheadas agressivamente pelo Service Worker.
- O Critical Rendering Path não está priorizando os assets do layout principal.

### Correção Proposta
- Adicionar `preconnect` ao Supabase no `index.html`.
- Configurar Workbox no `sw.ts` para cachear assets de imagem da CDN do Supabase.
- Otimizar o bundle gerado pelo Vite (ajustar chunks).

---

## 3. Problema: Reset de estado/scroll ao navegar nas abas
### Causa
- `AppLayout.tsx` possui um `useEffect` que executa `window.scrollTo(0, 0)` sempre que `location.pathname` muda.
- A natureza do SPA desmonta a página anterior ao navegar.

### Correção Proposta
- Tornar o scroll condicional (apenas se o usuário clicar no ícone da aba ativa).
- Implementar restauração de scroll manual ou via biblioteca.
- Considerar manter os componentes montados (Keep-Alive) se a performance permitir.

---

## Status da Implementação
- [x] Criar e implementar `OptimizedImage`.
- [x] Corrigir reset de scroll em `AppLayout.tsx`.
- [x] Atualizar `sw.ts` com cache de imagens.
- [x] Otimizar `index.html` com preconnect.
- [x] Implementar Keep-Alive nas abas (Descobrir, Explorar, Curtidas, Mensagens, Perfil).
- [x] Garantir registro do SW no head do HTML.
- [x] Forçar o cache de imagens ignorando headers de Cache-Control.
- [x] Adicionar `loading="lazy"` e `decoding="async"` ao `OptimizedImage`.
