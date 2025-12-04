# 🧪 Testes

Esta pasta contém os testes do projeto OrderlyAI.

## Estrutura

```
test/
├── integration/          # Testes de integração
│   └── domain-infrastructure.test.ts
├── acceptance/           # Testes de aceitação (Use Cases)
│   ├── priority.use-cases.test.ts
│   ├── task.use-cases.test.ts
│   ├── inbox.use-cases.test.ts
│   └── report.use-cases.test.ts
└── e2e/                 # Testes end-to-end (futuro)
```

## Executar Testes

### Testes de Integração - Domain e Infrastructure

```bash
npm run test:integration
# ou
npx ts-node -r tsconfig-paths/register test/integration/domain-infrastructure.test.ts
```

Este teste verifica:
- ✅ Criação e busca de Prioridades
- ✅ Criação e busca de Tarefas
- ✅ Criação e busca de Itens de Inbox
- ✅ Filtros e consultas
- ✅ Limpeza de dados de teste

### Testes de Aceitação - Use Cases

#### Todos os testes de aceitação:
```bash
npm run test:acceptance
```

#### Testes individuais:
```bash
# Prioridades
npm run test:acceptance:priority

# Tarefas
npm run test:acceptance:task

# Inbox
npm run test:acceptance:inbox

# Relatórios
npm run test:acceptance:report
```

#### Executar todos os testes:
```bash
npm run test:all
```

### Testes de Aceitação - O que testam

#### Prioridades (`priority.use-cases.test.ts`)
- ✅ Criar prioridade com validações
- ✅ Buscar prioridade por ID
- ✅ Listar prioridades com filtros
- ✅ Atualizar prioridade
- ✅ Mover prioridade entre quadrantes
- ✅ Reordenar prioridades
- ✅ Arquivar prioridade
- ✅ Deletar prioridade
- ✅ Validações de segurança (usuário não pode acessar recursos de outros)
- ✅ Validações de entrada (título, quadrante, tags)

#### Tarefas (`task.use-cases.test.ts`)
- ✅ Criar tarefa com validações
- ✅ Criar tarefa Schedule (requer idealDate)
- ✅ Criar tarefa Delegate (requer responsible)
- ✅ Buscar tarefa por ID
- ✅ Listar tarefas de uma prioridade
- ✅ Atualizar tarefa
- ✅ Mover tarefa entre classificações
- ✅ Completar tarefa
- ✅ Cancelar tarefa
- ✅ Validações de segurança
- ✅ Não permitir criar tarefa em prioridade arquivada

#### Inbox (`inbox.use-cases.test.ts`)
- ✅ Processar inbox item
- ✅ Buscar inbox item por ID
- ✅ Listar inbox items com filtros
- ✅ Deletar inbox item
- ✅ Validações de entrada (conteúdo mínimo, título máximo)
- ✅ Validações de segurança

#### Relatórios (`report.use-cases.test.ts`)
- ✅ Relatório diário
- ✅ Relatório semanal
- ✅ Relatórios com datas específicas
- ✅ Contagem de prioridades por quadrante
- ✅ Contagem de tarefas completadas
- ✅ Contagem por origem (manual/AI)

## Requisitos

- Arquivo `.env` configurado
- Variável `GOOGLE_APPLICATION_CREDENTIALS` configurada
- Banco de dados Firestore criado e acessível

## Notas

- Os testes de aceitação criam dados de teste no Firestore
- Os testes tentam limpar os dados criados ao final
- Alguns dados podem permanecer no banco (não crítico para desenvolvimento)
- Para produção, considere usar um banco de dados de teste separado

