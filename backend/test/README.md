# 🧪 Testes

Esta pasta contém os testes do projeto OrderlyAI.

## Estrutura

```
test/
├── integration/          # Testes de integração
│   └── domain-infrastructure.test.ts
└── unit/                # Testes unitários (futuro)
└── e2e/                 # Testes end-to-end (futuro)
```

## Executar Testes

### Teste de Integração - Domain e Infrastructure

```bash
npx ts-node -r tsconfig-paths/register test/integration/domain-infrastructure.test.ts
```

Este teste verifica:
- ✅ Criação e busca de Prioridades
- ✅ Criação e busca de Tarefas
- ✅ Criação e busca de Itens de Inbox
- ✅ Filtros e consultas
- ✅ Limpeza de dados de teste

## Requisitos

- Arquivo `.env` configurado
- Variável `GOOGLE_APPLICATION_CREDENTIALS` configurada
- Banco de dados Firestore criado e acessível

