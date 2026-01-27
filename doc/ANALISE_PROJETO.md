# Análise Detalhada do Projeto: Encontro com Fé (PWA)

## Visão Geral
O projeto é um **Progressive Web App (PWA)** desenvolvido com **React** e **Vite**, focado em uma rede social ou aplicativo de encontros cristão ("Encontro com Fé"). Ele utiliza uma stack moderna e robusta, priorizando performance, experiência do usuário (UX) e funcionalidades offline.

## Stack Tecnológica

### Core
-   **Framework**: React 18
-   **Build Tool**: Vite (com plugin SWC para compilação rápida)
-   **Linguagem**: TypeScript
-   **PWA**: `vite-plugin-pwa` (suporte a instalação, service workers e cache)

### Interface e Estilização
-   **UI Library**: Shadcn/UI (baseado em Radix UI)
-   **Estilização**: Tailwind CSS
-   **Ícones**: Lucide React
-   **Animações**: Framer Motion
-   **Fontes/Tipografia**: Configurado via Tailwind (provavelmente Inter ou similar, padrão do Shadcn)

### Gerenciamento de Estado e Dados
-   **Estado Global**: Zustand (leve e performático)
-   **Server State (API)**: React Query (@tanstack/react-query) - excelente para cache e sincronização de dados
-   **Backend/Database**: Supabase (BaaS - Backend as a Service)

### Rotas e Navegação
-   **Router**: React Router DOM
-   **Estrutura**:
    -   **Públicas**: Login, Registro, Instalação, Termos de Uso.
    -   **Funil (V1)**: Sequência de boas-vindas, gênero, quiz, perfis e planos (provavelmente para onboarding ou vendas).
    -   **Protegidas (App)**: Discovery, Matches, Chat, Perfil, Configurações.
    -   **Proteção**: Componente `ProtectedRoute` para bloquear acesso não autorizado.

### Outras Ferramentas
-   **Formulários**: React Hook Form + Zod (validação de schemas)
-   **Testes**: Vitest (Unitários) e Playwright (E2E)
-   **Linting**: ESLint

## Estrutura do Projeto (`src`)

-   **`pages/`**: Contém as telas da aplicação.
    -   `app/`: Telas principais do usuário logado (Chat, Profile, Discover).
    -   `funnel/`: Fluxos de entrada/vendas.
-   **`components/`**: Componentes reutilizáveis (UI do Shadcn, componentes de domínio específico).
-   **`hooks/`**: Custom hooks (ex: `useAuth`, `useSplashScreen`).
-   **`lib/`**: Utilitários e configurações (ex: cliente do Supabase).
-   **`App.tsx`**: Configuração principal de rotas e providers.
-   **`main.tsx`**: Ponto de entrada, inicialização do React e áudio.

## Destaques da Implementação

1.  **PWA Robusto**: O `vite.config.ts` mostra uma configuração completa de PWA, com estratégias de cache (CacheFirst para CDN, NetworkFirst para API do Supabase) e manifesto completo para instalação (ícones, cores, display standalone).
2.  **Arquitetura de Rotas**: Separação clara entre área pública, funil de conversão e área logada do aplicativo. Isso facilita a manutenção e a gestão de acesso.
3.  **Performance**: Uso de `vite` + `swc` garante desenvolvimento rápido. `React Query` otimiza as requisições de rede.

## Próximos Passos Sugeridos

1.  **Configurar Supabase**: Verificar se as variáveis de ambiente (URL e Key do Supabase) estão configuradas corretamente no arquivo `.env`.
2.  **Testar Fluxos**: Rodar o projeto (`npm run dev`) e navegar pelos fluxos de Login e Funil para garantir que as rotas estão funcionando.
3.  **Auditoria PWA**: Usar o Lighthouse (DevTools do Chrome) para validar se o PWA está instalável e performático.

Este é um projeto bem estruturado e moderno, pronto para escalar.

## Histórico de Alterações (Changelog)

| Data | Autor | Descrição |
| :--- | :--- | :--- |
| 27/01/2026 | Antigravity | Criação do documento inicial de análise do projeto. |
