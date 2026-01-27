# Documento de Requisitos do Produto (PRD) - Encontro com Fé

## 1. Introdução e Visão Geral

### 1.1 Visão do Produto
O **Encontro com Fé** é um **Progressive Web App (PWA)** focado em criar uma rede social e plataforma de relacionamentos (dating app) voltada para o público cristão. O objetivo é oferecer um ambiente seguro, moderno e performático para conectar pessoas com os mesmos valores.

### 1.2 Público-Alvo
*   Cristãos solteiros em busca de relacionamento sério.
*   Usuários móveis (foco *mobile-first*) que valorizam experiência de usuário fluida.

### 1.3 Localização
*   **Idioma Nativo:** Português do Brasil (pt-BR).
*   **Mercado:** Brasil.

---

## 2. Especificações Técnicas

O projeto utiliza uma stack moderna baseada no ecossistema React, priorizando performance e experiência "nativa".

### 2.1 Core Stack
*   **Framework:** React 18
*   **Build System:** Vite (com plugin SWC para compilação ultrarrápida)
*   **Linguagem:** TypeScript
*   **Plataforma:** PWA (`vite-plugin-pwa`) com suporte a instalação, Service Workers e funcionamento offline (CacheFirst/NetworkFirst).

### 2.2 Interface e Design (UI/UX)
*   **Biblioteca de Componentes:** Shadcn/UI (baseado em Radix UI - Acessibilidade first).
*   **Estilização:** Tailwind CSS (Utilitários).
*   **Ícones:** Lucide React.
*   **Animações:** Framer Motion (Transições fluidas e micro-interações).
*   **Fontes:** Configurradas via Tailwind (Padrão: DM Sans / Lora).

### 2.3 Gerenciamento de Dados e Estado
*   **Estado Global (Client):** Zustand (Leve e simples).
*   **Estado do Servidor (Async):** TanStack Query (React Query) - Gerenciamento de cache, sincronização e updates em background.
*   **Backend & Banco de Dados:** Supabase (BaaS - Postgres, Auth, Realtime).
*   **Formulários:** React Hook Form + Zod (Validação de schemas robusta).

### 2.4 Qualidade e Testes
*   **Testes Unitários:** Vitest.
*   **Testes E2E:** Playwright.
*   **Linting/Format:** ESLint.

---

## 3. Identidade Visual e Branding

O projeto segue um Design System consistente, definido via variáveis CSS e tokens do Tailwind.

### 3.1 Paleta de Cores Principais (HSLA)
*   **Primary (Teal/Verde Água):** `hsl(168 80% 35%)`
    *   *Uso:* Ação principal, identidade da marca, elementos de sucesso.
*   **Secondary (Azul):** `hsl(200 70% 45%)`
    *   *Uso:* Elementos de suporte, links secundários.
*   **Accent (Âmbar/Laranja):** `hsl(35 95% 55%)`
    *   *Uso:* Destaques vibrantes, chamadas de atenção (CTAs), notificações.

### 3.2 Cores de Interface (Neutros)
*   **Background:** `hsl(0 0% 100%)` (Light) / `hsl(220 25% 8%)` (Dark)
*   **Texto (Foreground):** `hsl(220 20% 15%)` (Light) / `hsl(0 0% 95%)` (Dark)
*   **Muted/Bordas:** Tons de cinza azulado (`hsl(220 10% 94%)`) para suavidade.
*   **Destructive:** Vermelho (`hsl(0 65% 55%)`) para erros e deleções.

### 3.3 Gradientes Característicos
A identidade visual aposta fortemente em gradientes suaves para transmitir modernidade:
*   **Welcome Gradient:** `linear-gradient(180deg, hsl(168 80% 30%) 0%, hsl(192 80% 38%) 50%, hsl(196 85% 30%) 100%)`
*   **Gender Gradient:** `linear-gradient(135deg, hsl(168 80% 30%) 0%, hsl(192 80% 38%) 100%)`
*   **Button Gradient:** `linear-gradient(135deg, hsl(168 75% 42%) 0%, hsl(35 95% 55%) 100%)`
*   **Planos:** Gradientes exclusivos para diferenciar níveis de assinatura.

---

## 4. Funcionalidades e Arquitetura do Produto

### 4.1 Estrutura de Navegação (Roteamento)
O aplicativo é dividido em três grandes áreas lógicas, gerenciadas pelo `React Router DOM`:

1.  **Área Pública**
    *   Login
    *   Registro
    *   Termos de Uso
    *   Landing de Instalação PWA

2.  **Funil de Conversão (Onboarding/Sales V1)**
    *   Objetivo: Captar o usuário, qualificar e converter.
    *   Etapas: Boas-vindas -> Seleção de Gênero -> Quiz de Perfil -> Preview de Perfis -> Seleção de Planos.

3.  **App Principal (Área Protegida)**
    *   Discovery (Feed de perfis)
    *   Matches (Conexões realizadas)
    *   Chat (Mensagens em tempo real)
    *   Perfil do Usuário (Edição e visualização)
    *   Configurações

*   **Segurança:** Componente `ProtectedRoute` envolve todas as rotas do App Principal para garantir autenticação.

### 4.2 Estrutura de Código (`src`)
A organização do código reflete a arquitetura de domínios:
*   `pages/`: Telas (Views).
    *   `app/`: Telas da área logada.
    *   `funnel/`: Telas do fluxo de entrada.
*   `components/`: Blocos de construção.
    *   Componentes de UI genéricos (Shadcn).
    *   Componentes de negócio específicos.
*   `hooks/`: Lógica reutilizável (ex: `useAuth`, `useSplashScreen`).
*   `lib/`: Configurações de infraestrutura (Clients, Utils).

---

## 5. Requisitos Não Funcionais (NFRs)

*   **Offline-First:** O App deve carregar instantaneamente mesmo sem rede (via Service Worker), exibindo conteúdo cacheado onde possível.
*   **Instalação:** Deve solicitar instalação na tela inicial (A2HS - Add to Home Screen) como um app nativo.
*   **Performance:**
    *   Carregamento inicial rápido (Code splitting via Vite).
    *   Otimização de imagens.
    *   Minimização de waterfalls de requisições.
*   **Responsividade:** Design 100% fluido, focado em dispositivos móveis, mas adaptável a desktops.

---

## 6. Roteiro e Próximos Passos (To-Do)

1.  **Configuração de Backend:**
    *   Validar conexão com Supabase.
    *   Verificar variáveis de ambiente (`.env`).
2.  **Validação de Fluxos:**
    *   Testar caminho crítico: Cadastro -> Funil -> Match -> Chat.
3.  **Auditoria Técnica:**
    *   Rodar Lighthouse para validar métricas de PWA e Performance.

---

## 7. Histórico de Versões

| Versão | Data | Autor | Descrição |
| :--- | :--- | :--- | :--- |
| **1.0** | 27/01/2026 | Antigravity | Consolidação inicial do PRD unificando Análise de Projeto e novas definições de Branding. |
