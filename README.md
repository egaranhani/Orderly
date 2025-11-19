# OrderlyAI

Sistema de IA construído com Clean Architecture e Arquitetura Hexagonal.

## Stack Tecnológica

- **Backend**: Node.js + NestJS
- **Frontend**: React + TypeScript + Vite
- **Banco de Dados**: Firestore
- **Autenticação**: Google Workspace OAuth
- **IA**: Vertex AI (Gemini 2.0)
- **Framework de IA**: LangGraph
- **Deploy**: Cloud Run

## Estrutura do Projeto

```
OrderlyAI/
├── backend/          # Backend NestJS
│   ├── src/
│   │   ├── domain/           # Camada de domínio (entidades, interfaces)
│   │   ├── application/      # Casos de uso e DTOs
│   │   ├── infrastructure/   # Implementações (Firestore, Vertex AI)
│   │   └── presentation/     # Controllers, módulos NestJS
│   └── package.json
├── frontend/         # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── pages/           # Páginas
│   │   ├── services/        # Serviços de API
│   │   ├── contexts/        # Contextos React
│   │   └── types/           # Tipos TypeScript
│   └── package.json
└── README.md
```

## Arquitetura

### Backend - Clean Architecture / Hexagonal

O backend segue os princípios de Clean Architecture e Arquitetura Hexagonal:

1. **Domain** (Camada de Domínio)
   - Entidades de negócio
   - Interfaces de repositórios
   - Interfaces de serviços
   - Regras de negócio puras

2. **Application** (Camada de Aplicação)
   - Casos de uso (Use Cases)
   - DTOs (Data Transfer Objects)
   - Orquestração de lógica de negócio

3. **Infrastructure** (Camada de Infraestrutura)
   - Implementações de repositórios (Firestore)
   - Serviços externos (Vertex AI)
   - Adaptadores para serviços externos

4. **Presentation** (Camada de Apresentação)
   - Controllers REST
   - Módulos NestJS
   - Estratégias de autenticação
   - Validação de entrada

### Frontend - Arquitetura Modular

O frontend está organizado de forma modular:

- **Components**: Componentes reutilizáveis
- **Pages**: Páginas da aplicação
- **Services**: Comunicação com API
- **Contexts**: Gerenciamento de estado global
- **Types**: Definições TypeScript

## Configuração

### Backend

1. Instale as dependências:
```bash
cd backend
npm install
```

2. Configure as variáveis de ambiente (copie `.env.example` para `.env`):
```bash
cp .env.example .env
```

3. Configure as variáveis no `.env`:
- `GOOGLE_CLIENT_ID`: ID do cliente OAuth do Google
- `GOOGLE_CLIENT_SECRET`: Secret do cliente OAuth
- `GOOGLE_WORKSPACE_DOMAIN`: Domínio do Google Workspace
- `GOOGLE_CLOUD_PROJECT_ID`: ID do projeto no Google Cloud
- `JWT_SECRET`: Chave secreta para JWT

4. Execute o backend:
```bash
npm run start:dev
```

### Frontend

1. Instale as dependências:
```bash
cd frontend
npm install
```

2. Configure as variáveis de ambiente (opcional):
```bash
VITE_API_URL=http://localhost:3001
```

3. Execute o frontend:
```bash
npm run dev
```

## Deploy no Cloud Run

### Backend

1. Crie um Dockerfile no diretório `backend/`
2. Configure o Cloud Build
3. Faça o deploy:
```bash
gcloud run deploy orderlyai-backend --source .
```

### Frontend

1. Configure o build de produção
2. Faça o deploy no Cloud Run ou Cloud Storage + Cloud CDN

## Desenvolvimento

### Princípios

- Código limpo e simples
- Arquivos pequenos e focados (máximo 200 linhas)
- Testes após mudanças significativas
- Nomenclatura clara e consistente
- Modularidade e separação de responsabilidades

### Estrutura de Pastas

Cada camada tem responsabilidades bem definidas:
- **Domain**: Não depende de nada externo
- **Application**: Depende apenas do Domain
- **Infrastructure**: Implementa interfaces do Domain
- **Presentation**: Orquestra tudo e expõe APIs

## Próximos Passos

1. Implementar testes unitários e de integração
2. Configurar CI/CD
3. Adicionar monitoramento e logging
4. Implementar cache quando necessário
5. Adicionar rate limiting
6. Configurar CORS adequadamente para produção

