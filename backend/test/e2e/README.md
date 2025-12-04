# Testes E2E (End-to-End)

Testes end-to-end que validam os endpoints REST da API.

## Executar Testes

### Com Mock (Padrão - Mais Rápido)

Usa `MockAiService` para simular respostas da IA:

```bash
npm run test:e2e
```

Ou com credenciais do Google Cloud (necessário para Firestore):

```bash
GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/credenciais.json npm run test:e2e
```

### Com Vertex AI Real

Usa o `VertexAiService` real para testar integração completa com IA:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/credenciais.json npm run test:e2e:real
```

Ou definindo a variável de ambiente manualmente:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/credenciais.json USE_MOCK_AI=false npm run test:e2e
```

## Variáveis de Ambiente

- `USE_MOCK_AI`: Controla se usa mock ou Vertex AI real
  - `true` ou não definido: Usa `MockAiService` (padrão)
  - `false`: Usa `VertexAiService` real
- `GOOGLE_APPLICATION_CREDENTIALS`: Caminho para arquivo de credenciais do Google Cloud (necessário para Firestore e Vertex AI)

## Testes Incluídos

### PriorityController
- ✅ Criar prioridade
- ✅ Validação de entrada
- ✅ Autenticação
- ✅ Listar prioridades
- ✅ Filtrar por quadrante
- ✅ Buscar por ID
- ✅ Atualizar prioridade
- ✅ Deletar prioridade

### TaskController
- ✅ Criar tarefa
- ✅ Validação de entrada
- ✅ Listar tarefas de uma prioridade
- ✅ Buscar tarefa por ID

### InboxController
- ✅ Processar item de inbox
- ✅ Validação de entrada
- ✅ Listar itens de inbox

### ReportController
- ✅ Relatório diário
- ✅ Relatório semanal

## Notas

- Os testes criam dados reais no Firestore
- Os testes tentam limpar dados criados, mas alguns podem permanecer
- Para produção, considere usar um banco de dados de teste separado
- Testes com Vertex AI real podem ser mais lentos e dependem da disponibilidade da API

