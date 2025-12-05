# Workflow de Desenvolvimento Frontend

## Princípios Fundamentais

1. **Commits e PRs incrementais**: Cada fase e cada tela finalizada deve ter seu próprio commit e PR
2. **Prototipagem primeiro**: Sempre criar protótipo antes de integrar com backend
3. **Aprovação obrigatória**: Protótipos devem ser aprovados antes da integração

## Fluxo Completo por Tela

### 1. Design System (Fase Única)

**Branch:** `feature/frontend-design-system`

**Etapas:**
1. Setup do Tailwind CSS e dependências
2. Criação dos componentes base
3. Tela de Design System
4. Aplicação do tema de cores

**Commits:**
- `feat(frontend): setup tailwind e dependências do design system`
- `feat(frontend): cria componentes base do design system`
- `feat(frontend): implementa tela de design system`
- `style(frontend): aplica tema de cores do Airbnb`

**PR:** Após aprovação do design system
- Título: `feat(frontend): Design System com tema Airbnb`
- Descrição: Inclui todos os componentes base e tela de showcase

---

### 2. Layout Principal

**Branch:** `feature/frontend-layout`

**Etapas:**
1. Criar componente Layout
2. Implementar navegação
3. Integrar com AuthContext

**Commits:**
- `feat(frontend): cria componente Layout com navegação`

**PR:** Após implementação completa
- Título: `feat(frontend): Layout principal com navegação`

---

### 3. Tela de Prioridades (Exemplo Completo)

#### 3.1 Prototipagem

**Branch:** `feature/frontend-priorities-prototype`

**Etapas:**
1. Criar página com layout 2x2
2. Implementar cards de prioridades mockados
3. Adicionar modais de criação/edição
4. Implementar filtros visuais

**Commits:**
- `feat(frontend): protótipo da tela de prioridades`
- `feat(frontend): adiciona modais de criação/edição na tela de prioridades`

**PR:** Após protótipo completo
- Título: `feat(frontend): Protótipo - Tela de Prioridades`
- Descrição: Protótipo estático da matriz de Eisenhower. Aguardando aprovação do designer.

**Status:** Aguardando aprovação do designer

#### 3.2 Integração (Após Aprovação)

**Branch:** `feature/frontend-priorities-integration`

**Etapas:**
1. Criar/atualizar tipos TypeScript
2. Criar serviço de API
3. Integrar React Query
4. Substituir dados mockados
5. Implementar drag-and-drop funcional
6. Tratar estados de loading/error

**Commits:**
- `feat(frontend): integra tela de prioridades com backend`
- `feat(frontend): implementa drag-and-drop de prioridades`
- `feat(frontend): adiciona tratamento de erros na tela de prioridades`

**PR:** Após integração completa
- Título: `feat(frontend): Integração - Tela de Prioridades`
- Descrição: Integração completa com backend, incluindo CRUD e drag-and-drop

---

### 4. Tela de Tarefas

**Seguir mesmo padrão:**
- `feature/frontend-tasks-prototype` → PR de protótipo
- `feature/frontend-tasks-integration` → PR de integração

---

### 5. Tela de Inbox

**Seguir mesmo padrão:**
- `feature/frontend-inbox-prototype` → PR de protótipo
- `feature/frontend-inbox-integration` → PR de integração

---

### 6. Tela de Relatórios

**Seguir mesmo padrão:**
- `feature/frontend-reports-prototype` → PR de protótipo
- `feature/frontend-reports-integration` → PR de integração

---

## Regras de Commits

### Formato de Mensagem

```
tipo(escopo): descrição curta

Descrição detalhada (opcional)
```

### Tipos para Frontend

- `feat(frontend)`: Nova funcionalidade/tela
- `fix(frontend)`: Correção de bug
- `style(frontend)`: Mudanças de estilo/design
- `refactor(frontend)`: Refatoração
- `chore(frontend)`: Tarefas de manutenção (deps, config)

### Escopos Comuns

- `design-system`: Componentes do design system
- `layout`: Layout e navegação
- `priorities`: Tela de prioridades
- `tasks`: Tela de tarefas
- `inbox`: Tela de inbox
- `reports`: Tela de relatórios
- `chat`: Tela de chat
- `auth`: Autenticação

### Exemplos

```
feat(frontend): protótipo da tela de prioridades

Implementa layout 2x2 da matriz de Eisenhower com dados mockados.
Inclui cards de prioridades, modais de criação/edição e filtros visuais.

feat(frontend): integra tela de prioridades com backend

Substitui dados mockados por chamadas reais à API.
Implementa React Query para gerenciamento de estado.
Adiciona drag-and-drop funcional entre quadrantes.

style(frontend): aplica tema de cores do Airbnb

Atualiza variáveis CSS com cores Rausch, Babu, Arches, Hof e Foggy.
```

## Checklist Antes de PR

### Para Protótipos

- [ ] Layout implementado conforme especificação
- [ ] Componentes do design system utilizados
- [ ] Dados mockados funcionando
- [ ] Interações visuais implementadas
- [ ] Sem erros de lint/TypeScript
- [ ] Testado visualmente no navegador

### Para Integrações

- [ ] Protótipo aprovado pelo designer
- [ ] Integração com backend completa
- [ ] React Query configurado corretamente
- [ ] Estados de loading/error tratados
- [ ] Validações de formulário implementadas
- [ ] Funcionalidades completas (CRUD, drag-drop, etc.)
- [ ] Sem erros de lint/TypeScript
- [ ] Testado localmente com backend rodando

## Estrutura de Branches

### Padrão de Nomenclatura

```
feature/frontend-{tela}-{tipo}
```

**Tipos:**
- `prototype`: Versão protótipo (sem integração)
- `integration`: Versão integrada (com backend)

**Exemplos:**
- `feature/frontend-priorities-prototype`
- `feature/frontend-priorities-integration`
- `feature/frontend-inbox-prototype`
- `feature/frontend-inbox-integration`

## Fluxo de Trabalho Resumido

```
1. Criar branch: feature/frontend-{tela}-prototype
2. Desenvolver protótipo
3. Commits incrementais
4. Criar PR de protótipo
5. Aguardar aprovação do designer
6. Após aprovação: criar branch feature/frontend-{tela}-integration
7. Integrar com backend
8. Commits incrementais
9. Criar PR de integração
10. Após merge: deletar branches
```

## Exceções

### Componentes do Design System

Se precisar criar novo componente durante desenvolvimento:
1. Criar branch: `feature/frontend-design-system-{componente}`
2. Adicionar componente à tela `/design-system`
3. Criar PR para aprovação
4. Após aprovação, usar na tela principal

### Correções Urgentes

Para correções críticas, pode usar:
- `fix/frontend-{descricao}`

## Status Atual

✅ **Design System**: Concluído e aprovado
- Branch: `feature/frontend-design-system` (a ser criada)
- PR: A ser criado após commit

⏳ **Próximos Passos:**
1. Criar branch e fazer commits do design system
2. Criar PR do design system
3. Iniciar prototipagem das telas

## Referências

- Workflow geral: `.cursor/rules/workflow.mdc`
- Documentação completa: `.github/WORKFLOW.md`
