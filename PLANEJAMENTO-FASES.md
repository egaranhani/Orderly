# 📋 Planejamento de Implementação - OrderlyAI

Este documento descreve o planejamento das fases de implementação do projeto OrderlyAI.

## 🎯 Visão Geral

O projeto está sendo implementado em fases incrementais, seguindo Clean Architecture e Hexagonal Architecture. Cada fase inclui implementação, testes automatizados de aceitação e documentação.

## 📊 Fases de Implementação

### ✅ Fase 1: Domain e Infrastructure (CONCLUÍDA)

**Objetivo:** Criar a base do sistema com entidades de domínio e implementações de persistência.

**Entregas:**
- ✅ Entidades de domínio (Prioridade, Tarefa, InboxItem)
- ✅ Interfaces de repositórios
- ✅ Implementações Firestore
- ✅ Testes de integração Domain + Infrastructure

**Testes:**
- ✅ Testes automatizados de integração (`test/integration/domain-infrastructure.test.ts`)
- ✅ Validação de CRUD completo
- ✅ Validação de filtros e consultas

---

### ✅ Fase 2: Application Layer (CONCLUÍDA)

**Objetivo:** Implementar a camada de aplicação com Use Cases e DTOs.

**Entregas:**
- ✅ DTOs (Priority, Task, Inbox, Report)
- ✅ Use Cases de Prioridades (CRUD, move, reorder, archive)
- ✅ Use Cases de Tarefas (CRUD, move, complete, cancel)
- ✅ Use Cases de Inbox (process, accept, discard)
- ✅ Use Cases de Relatórios (daily, weekly)
- ✅ Módulos NestJS (PriorityModule, TaskModule, InboxModule, ReportModule)

**Testes:**
- ⏳ Testes automatizados de aceitação para Use Cases
- ⏳ Validação de regras de negócio
- ⏳ Validação de validações e tratamento de erros

---

### 🔄 Fase 3: Integração com IA (EM PLANEJAMENTO)

**Objetivo:** Integrar processamento de Inbox com Vertex AI usando formato TOON.

**Entregas:**
- ⏳ Integração completa do ProcessInboxUseCase com IA
- ⏳ Processamento de resumos de reunião
- ⏳ Geração de sugestões em formato TOON
- ⏳ Decodificação de respostas TOON
- ⏳ Tratamento de erros da API de IA

**Testes:**
- ⏳ Testes automatizados de aceitação para processamento de Inbox
- ⏳ Testes com mocks da API de IA
- ⏳ Validação de formato TOON
- ⏳ Validação de sugestões geradas

---

### 🔄 Fase 4: Presentation Layer - Controllers REST (EM PLANEJAMENTO)

**Objetivo:** Implementar controllers REST para expor as funcionalidades via API.

**Entregas:**
- ⏳ PriorityController (CRUD completo)
- ⏳ TaskController (CRUD completo)
- ⏳ InboxController (process, accept, discard)
- ⏳ ReportController (daily, weekly)
- ⏳ Validação de DTOs com class-validator
- ⏳ Guards de autenticação
- ⏳ Tratamento de erros HTTP

**Testes:**
- ⏳ Testes automatizados de aceitação (E2E) para endpoints REST
- ⏳ Testes de autenticação e autorização
- ⏳ Testes de validação de entrada
- ⏳ Testes de tratamento de erros

---

### 🔄 Fase 5: Frontend - Interface de Usuário (EM PLANEJAMENTO)

**Objetivo:** Implementar interface React para interação com o sistema.

**Entregas:**
- ⏳ Páginas de gestão de prioridades
- ⏳ Páginas de gestão de tarefas
- ⏳ Interface de Inbox
- ⏳ Interface de relatórios
- ⏳ Integração com API backend
- ⏳ Autenticação OAuth

**Testes:**
- ⏳ Testes automatizados de aceitação (E2E) para fluxos principais
- ⏳ Testes de componentes React
- ⏳ Testes de integração com API

---

## 🧪 Estratégia de Testes

### Tipos de Testes

1. **Testes de Integração (Domain + Infrastructure)**
   - Testam a integração entre camadas de domínio e infraestrutura
   - Validam persistência e recuperação de dados
   - Localização: `backend/test/integration/`

2. **Testes de Aceitação (Use Cases)**
   - Testam casos de uso completos
   - Validam regras de negócio
   - Validam validações e tratamento de erros
   - Localização: `backend/test/acceptance/`

3. **Testes E2E (End-to-End)**
   - Testam fluxos completos via API REST
   - Validam autenticação e autorização
   - Validam integração frontend-backend
   - Localização: `backend/test/e2e/`

### Execução de Testes

```bash
# Testes de integração
npm run test:integration

# Testes de aceitação
npm run test:acceptance

# Testes E2E
npm run test:e2e

# Todos os testes
npm run test:all
```

---

## 📝 Checklist por Fase

Para cada fase, antes de considerar concluída:

- [ ] Implementação funcional completa
- [ ] Testes automatizados de aceitação criados
- [ ] Testes passando (100% de sucesso)
- [ ] Documentação atualizada
- [ ] Código revisado
- [ ] PR criado e aprovado
- [ ] Merge em `main` realizado

---

## 🔄 Workflow de Desenvolvimento

Cada fase segue o seguinte workflow:

1. **Criar Feature Branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/fase-X-descricao
   ```

2. **Implementar Funcionalidades**
   - Seguir Clean Architecture
   - Implementar uma funcionalidade por vez
   - Commits frequentes e atômicos

3. **Criar Testes de Aceitação**
   - Criar testes para cada Use Case implementado
   - Garantir cobertura de casos de sucesso e erro
   - Executar testes e garantir que passam

4. **Revisar e Ajustar**
   - Executar todos os testes
   - Verificar linter e formatação
   - Revisar código

5. **Criar Pull Request**
   - Preencher template de PR
   - Incluir descrição das mudanças
   - Listar testes criados

6. **Aguardar Aprovação e Merge**
   - Code review
   - Ajustes se necessário
   - Merge em `main`

---

## 📚 Referências

- [Especificação Técnica](./Especificacao%20Tecnica.mdc) - Detalhes técnicos e ordem de implementação sugerida
- [Especificação Funcional](./Especificacao%20Funcional.mdc) - Requisitos funcionais do sistema
- [Workflow de Desenvolvimento](./.github/WORKFLOW.md) - Processo de desenvolvimento e Git

## 🔗 Relação com Especificação Técnica

Este documento complementa a seção "10. Ordem de Implementação Sugerida" da [Especificação Técnica](./Especificacao%20Tecnica.mdc), fornecendo:

- ✅ Organização em fases claras
- ✅ Inclusão de testes automatizados de aceitação no workflow
- ✅ Status de progresso de cada fase
- ✅ Checklist detalhado por fase
- ✅ Estratégia de testes completa


