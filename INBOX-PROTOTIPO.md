# Protótipo da Interface de Inbox

## Estrutura Visual

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Inbox                                                                   │
│  Processe resumos de reuniões e revise sugestões da IA                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────┐  ┌──────────────────────────────────────────┐ │
│  │ Processar Reunião    │  │ Sugestões Processadas                    │ │
│  │                      │  │ 3 sugestão(ões) disponível(is)           │ │
│  │                      │  │                                          │ │
│  │ Título (opcional)    │  │ ┌────────────────────────────────────┐  │ │
│  │ [_____________]      │  │ │ Revisar proposta técnica com equipe│  │ │
│  │                      │  │ │ Reunião de Planejamento - 15/01    │  │ │
│  │ Resumo da Reunião    │  │ │                                      │  │ │
│  │ ┌─────────────────┐  │  │ │ 📋 Prioridade Sugerida               │  │ │
│  │ │                 │  │  │ │ ┌────────────────────────────────┐ │  │ │
│  │ │                 │  │  │ │ │ Título: Revisar proposta técnica│ │  │ │
│  │ │                 │  │  │ │ │ Quadrante: [Q1] Urgente/Import. │  │ │ │
│  │ │                 │  │  │ │ │ Tags: [trabalho] [urgente]     │  │ │ │
│  │ └─────────────────┘  │  │ │ └────────────────────────────────┘ │  │ │
│  │                      │  │ │                                      │  │ │
│  │ [Processar com IA]   │  │ │ ✅ Tarefa Sugerida                  │  │ │
│  │                      │  │ │ ┌────────────────────────────────┐ │  │ │
│  │ Histórico            │  │ │ │ Título: Agendar reunião técnica│ │  │ │
│  │ ┌─────────────────┐  │  │ │ │ Classificação: [Agendar]       │  │ │ │
│  │ │ 📅 15/01/2024   │  │  │ │ │ Data Ideal: 20/01/2024         │  │ │ │
│  │ │ Reunião Planej. │  │  │ │ └────────────────────────────────┘ │  │ │
│  │ │ 3 sugestões     │  │  │ │                                      │  │ │
│  │ ├─────────────────┤  │  │ │ [Editar] [Aceitar] [Descartar]     │  │ │
│  │ │ 📅 10/01/2024   │  │  │ └────────────────────────────────────┘  │ │
│  │ │ Reunião Sprint  │  │  │                                          │ │
│  │ │ 2 sugestões     │  │  │ ┌────────────────────────────────────┐  │ │
│  │ └─────────────────┘  │  │ │ Enviar relatório mensal            │  │ │
│  │                      │  │ │ ...                                  │  │ │
│  └──────────────────────┘  └──────────────────────────────────────────┘ │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Componentes Detalhados

### 1. Card de Processamento (Lado Esquerdo)

**Seção: Formulário de Processamento**
- Input de título (opcional, placeholder: "Ex: Reunião de Planejamento")
- Textarea expansível para resumo (mínimo 200px, cresce conforme conteúdo)
- Contador de caracteres (opcional, mas útil)
- Botão "Processar com IA" (desabilitado se textarea vazio)
- Loading state durante processamento
- Mensagem de sucesso/erro após processamento

**Seção: Histórico de Reuniões**
- Lista compacta de reuniões processadas
- Cada item mostra:
  - Ícone de calendário + data formatada
  - Título da reunião (ou "Sem título")
  - Contador de sugestões (ex: "3 sugestões")
  - Badge de status (Processado, Aceito, Descartado)
- Click no item expande para ver detalhes
- Scroll se houver muitas reuniões

### 2. Área de Sugestões (Lado Direito)

**Cabeçalho**
- Título: "Sugestões Processadas"
- Contador: "X sugestão(ões) disponível(is)"
- Filtros rápidos (opcional):
  - Botões: "Todas" | "Pendentes" | "Aceitas" | "Descartadas"

**Cards de Sugestão**
Cada card contém:

1. **Header do Card**
   - Título: Resumo da ação (actionSummary)
   - Subtítulo: Referência da reunião (meetingReference)
   - Badge de status (se aplicável)

2. **Seção: Prioridade Sugerida**
   - Background diferenciado (bg-muted)
   - Título da prioridade (editável inline ou via dialog)
   - Badge do quadrante com cor (Q1=vermelho, Q2=azul, Q3=amarelo, Q4=cinza)
   - Tags como chips pequenos
   - Botão "Vincular a prioridade existente" (abre dialog com busca)

3. **Seção: Tarefa Sugerida**
   - Background diferenciado (bg-muted)
   - Título da tarefa (editável)
   - Badge da classificação com cor
   - Data ideal (se aplicável)
   - Responsável (se aplicável, para Delegar)
   - Botão "Ver texto relevante" (expande para mostrar relevantText)

4. **Ações do Card**
   - Botão "Editar" (outline) - abre dialog de edição completa
   - Botão "Aceitar" (primary) - aceita com valores atuais
   - Botão "Descartar" (destructive) - abre confirmação antes de descartar

### 3. Dialog de Edição

**Campos Editáveis:**
- Prioridade:
  - Título (Input)
  - Quadrante (Select com 4 opções)
  - Tags (Input com chips, adicionar/remover)
- Tarefa:
  - Título (Input)
  - Classificação (Select com 4 opções)
  - Data Ideal (Date picker, se classificação = Agendar)
  - Responsável (Input, se classificação = Delegar)
- Opção: "Vincular a prioridade existente" (Select com busca)

**Ações:**
- Botão "Cancelar"
- Botão "Salvar e Aceitar"

### 4. Estados e Feedback

**Estados Visuais:**
- Loading: Skeleton ou spinner durante processamento
- Vazio: Mensagem quando não há sugestões
- Erro: Toast/alert para erros de API
- Sucesso: Toast/feedback ao aceitar/descartar

**Animações:**
- Transição suave ao expandir/colapsar cards
- Fade in/out ao adicionar/remover sugestões
- Loading skeleton durante carregamento

## Responsividade

**Desktop (≥1024px):**
- Layout em 2 colunas (1/3 + 2/3)
- Cards lado a lado

**Tablet (768px - 1023px):**
- Layout em 2 colunas (40% + 60%)
- Cards empilhados verticalmente

**Mobile (<768px):**
- Layout em coluna única
- Formulário primeiro, depois sugestões
- Histórico colapsável
- Cards full-width

## Cores e Badges

**Quadrantes:**
- Q1 (Urgente/Importante): Vermelho/Rosa
- Q2 (Não Urgente/Importante): Azul
- Q3 (Urgente/Não Importante): Amarelo/Laranja
- Q4 (Não Urgente/Não Importante): Cinza

**Classificações:**
- Fazer: Verde
- Agendar: Azul
- Delegar: Roxo
- Eliminar: Vermelho

**Status:**
- Pendente: Amarelo
- Processado: Azul
- Aceito: Verde
- Descartado: Cinza

## Interações

1. **Processar Reunião:**
   - Usuário preenche formulário
   - Clica "Processar com IA"
   - Loading aparece
   - Sugestões aparecem na área direita
   - Reunião adicionada ao histórico

2. **Editar Sugestão:**
   - Click em "Editar"
   - Dialog abre com campos editáveis
   - Usuário ajusta valores
   - Click em "Salvar e Aceitar"
   - Sugestão é aceita com valores editados

3. **Aceitar Sugestão:**
   - Click em "Aceitar"
   - Confirmação rápida (opcional)
   - Prioridade e tarefa criadas
   - Card muda para status "Aceito"
   - Feedback de sucesso

4. **Descartar Sugestão:**
   - Click em "Descartar"
   - Dialog de confirmação
   - Ao confirmar, sugestão é descartada
   - Card muda para status "Descartado" ou é removido

5. **Vincular a Prioridade Existente:**
   - Click em "Vincular"
   - Dialog com busca/select de prioridades
   - Seleciona prioridade
   - Tarefa é criada vinculada à prioridade existente
   - Prioridade não é criada

## Melhorias de UX

1. **Ações em Lote:**
   - Checkbox em cada card
   - Botões "Aceitar Selecionadas" e "Descartar Selecionadas"

2. **Busca e Filtros:**
   - Busca por texto nas sugestões
   - Filtro por quadrante
   - Filtro por classificação
   - Filtro por status

3. **Ordenação:**
   - Ordenar por data (mais recente primeiro)
   - Ordenar por relevância (se disponível)

4. **Preview Rápido:**
   - Hover no card mostra preview expandido
   - Click expande para ver todos os detalhes

5. **Atalhos de Teclado:**
   - Enter para processar
   - Esc para fechar dialogs
   - Tab para navegar entre campos

