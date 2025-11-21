# 🧪 Guia de Teste - Fase 1

Este guia explica como testar a Fase 1 do projeto (Domain e Infrastructure) localmente.

## 📋 Pré-requisitos

1. **Node.js** instalado (versão 18 ou superior)
2. **Conta Google Cloud** com projeto configurado
3. **Firestore** habilitado no projeto Google Cloud
4. **Credenciais do Google Cloud** configuradas

## 🔧 Configuração do Ambiente

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=seu-projeto-id-aqui
GOOGLE_CLOUD_LOCATION=us-central1

# JWT Configuration (pode usar qualquer string para testes)
JWT_SECRET=minha-chave-secreta-de-teste
JWT_EXPIRES_IN=7d

# Google OAuth (opcional para testes da Fase 1)
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_WORKSPACE_DOMAIN=seu-dominio.com

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 3. Configurar Credenciais do Google Cloud

Você precisa de credenciais do Google Cloud para acessar o Firestore.

**Usando Service Account (Recomendado):**

1. No Google Cloud Console, vá em **IAM & Admin** → **Service Accounts**
2. Crie uma nova service account ou use uma existente
3. Baixe a chave JSON (será um arquivo como `orderlyai-backend-xxxxx.json`)
4. Salve o arquivo em um local seguro (ex: `~/.config/orderlyai/service-account-key.json`)
5. Configure a variável de ambiente:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/caminho/completo/para/service-account-key.json"
```

**⚠️ IMPORTANTE:**
- Não commite o arquivo JSON no Git (já está no .gitignore)
- Mantenha o arquivo em local seguro
- Use caminho absoluto na variável de ambiente

## 🧪 Executar Testes

### Teste 1: Verificar Compilação

```bash
npm run build
```

Deve compilar sem erros.

### Teste 2: Teste Automatizado da Fase 1

Execute o script de teste:

```bash
npx ts-node -r tsconfig-paths/register test/integration/domain-infrastructure.test.ts
```

Este script testa:
- ✅ Criação e busca de Prioridades
- ✅ Criação e busca de Tarefas
- ✅ Criação e busca de Itens de Inbox
- ✅ Filtros e consultas
- ✅ Limpeza de dados de teste

### Teste 3: Iniciar o Servidor

```bash
npm run start:dev
```

O servidor deve iniciar na porta 3001 (ou a porta configurada no `.env`).

## 🔍 Verificar no Firestore

Após executar os testes, você pode verificar os dados no Firestore:

1. Acesse o [Firestore Console](https://console.cloud.google.com/firestore)
2. Selecione seu projeto
3. Verifique as coleções:
   - `priorities`
   - `tasks`
   - `inbox`

**Nota:** O script de teste limpa os dados após executar, então você não verá dados permanentes.

## 🐛 Troubleshooting

### Erro: "Could not load the default credentials"

**Solução:** Configure as credenciais do Google Cloud (veja seção 3 acima).

### Erro: "Project not found"

**Solução:** Verifique se `GOOGLE_CLOUD_PROJECT_ID` está correto no `.env`.

### Erro: "Permission denied"

**Solução:** Verifique se a service account tem permissões de **Firestore User** ou **Editor**.

### Erro de compilação TypeScript

**Solução:** 
```bash
npm run build
```

Se houver erros, verifique se todas as dependências estão instaladas:
```bash
npm install
```

## 📝 O que está sendo testado?

A Fase 1 implementa:

1. **Entidades de Domínio**
   - `Prioridade` com enums (EisenhowerQuadrant, PriorityStatus, PriorityOrigin)
   - `Tarefa` com enums (TaskClassification, TaskStatus, TaskOrigin)
   - `InboxItem` com `ActionSuggestion`

2. **Interfaces de Repositórios**
   - `IPriorityRepository`
   - `ITaskRepository`
   - `IInboxRepository`

3. **Implementações Firestore**
   - `FirestorePriorityRepository`
   - `FirestoreTaskRepository`
   - `FirestoreInboxRepository`

## ✅ Checklist de Teste

- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Credenciais do Google Cloud configuradas
- [ ] Código compila sem erros (`npm run build`)
- [ ] Script de teste executa com sucesso
- [ ] Servidor inicia sem erros (`npm run start:dev`)

## 🚀 Próximos Passos

Após validar a Fase 1, você pode:
- Iniciar a Fase 2: Application Layer (Use Cases e DTOs)
- Criar endpoints REST para testar via HTTP
- Implementar testes unitários mais completos


