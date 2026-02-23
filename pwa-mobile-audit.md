# Plano de Auditoria: PWA & Experiência Mobile

Este documento descreve as etapas para a auditoria completa da experiência PWA (Progressive Web App) em dispositivos móveis do projeto "Encontro com Fé".

## 1. Objetivos
- Garantir que o app seja 100% instalável e funcional offline.
- Validar a fluidez da interface (gestos, transições e animações).
- Identificar gargalos de performance que impactam o carregamento em redes 4G/5G.
- Assegurar conformidade com as diretrizes de design mobile (touch targets, safe areas).

## 2. Escopo da Auditoria

### Fase 1: Infraestrutura PWA
- [ ] Analisar `manifest.json` (ícones, cores de tema, modo de exibição).
- [ ] Verificar Service Worker (estratégias de cache, suporte offline).
- [ ] Checar meta tags de compatibilidade (iOS splash screens, status bar).

### Fase 2: UI/UX & Design Mobile
- [ ] **Telas de Fluxo Principal:** Discover, Matches, Chat e Perfil.
- [ ] **Interações:** Gestos de swipe, abertura de teclados e modais.
- [ ] **Ergonomia:** Tamanho de botões (mínimo 44px) e legibilidade de fontes.
- [ ] **Safe Areas:** Garantir que o conteúdo não fique sob o "notch" ou barras de navegação do sistema.

### Fase 3: Performance & Resiliência
- [ ] Auditoria de Core Web Vitals (Lighthouse).
- [ ] Carregamento de Imagens (lazy loading, compressão).
- [ ] Estados de Erro/Loading (prevenção de spinners infinitos).

## 3. Agentes Envolvidos
- **orchestrator**: Coordenação e síntese.
- **frontend-specialist**: Auditoria de componentes e UI.
- **mobile-developer**: Validação de padrões mobile e gestos.
- **performance-optimizer**: Análise de infraestrutura e velocidade.

## 4. Cronograma de Execução
1. **Mapeamento:** Localizar arquivos críticos (manifest, sw, layouts base).
2. **Auditoria Estática:** Revisão de código de componentes.
3. **Auditoria Dinâmica:** Rodar scripts de UX e Performance.
4. **Relatório Final:** Apresentação dos problemas e sugestões de correção.
