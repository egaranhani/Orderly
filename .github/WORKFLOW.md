# 🔄 Workflow de Desenvolvimento - Feature Branch

Este documento descreve o workflow de desenvolvimento usando **Feature Branch Workflow** para o projeto OrderlyAI.

## 📋 Visão Geral

O projeto utiliza o workflow **Feature Branch**, onde cada funcionalidade é desenvolvida em uma branch separada criada diretamente a partir de `main` e integrada via Pull Requests.

**Referência:** [Atlassian Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)

## 🌳 Estrutura de Branches

### Branch Principal

- **`main`**: Branch de produção. Contém código estável e testado, sempre pronto para deploy.

### Branches de Feature

Todas as branches de feature são criadas **diretamente a partir de `main`**:

- **`feature/*`**: Branches para novas funcionalidades
  - Exemplo: `feature/prioridades-crud`, `feature/inbox-processing`
- **`fix/*`**: Branches para correções de bugs
  - Exemplo: `fix/auth-token-expiration`
- **`refactor/*`**: Branches para refatorações
  - Exemplo: `refactor/ai-service-structure`
- **`docs/*`**: Branches para documentação
  - Exemplo: `docs/api-documentation`

## 🔄 Fluxo de Trabalho

### 1. Criar uma Feature Branch

```bash
# Atualizar main
git checkout main
git pull origin main

# Criar nova feature branch a partir de main
git checkout -b feature/nome-da-funcionalidade
```

**Convenção de nomenclatura:**
- Use kebab-case (minúsculas com hífens)
- Seja descritivo mas conciso
- Exemplos:
  - `feature/create-priority`
  - `feature/inbox-ai-processing`
  - `feature/move-priority-quadrant`

### 2. Desenvolver a Feature

- Faça commits frequentes e atômicos
- Use mensagens de commit claras e descritivas
- Siga os padrões de código do projeto

**Formato de mensagem de commit:**
```
tipo(escopo): descrição curta

Descrição detalhada (opcional)

Exemplos:
- feat(priorities): adiciona criação de prioridades
- fix(auth): corrige expiração de token JWT
- refactor(ai): reorganiza serviço de IA
- docs(readme): atualiza instruções de setup
```

**Tipos de commit:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `refactor`: Refatoração de código
- `docs`: Documentação
- `style`: Formatação, espaços, etc.
- `test`: Testes
- `chore`: Tarefas de manutenção

### 3. Manter a Branch Atualizada

Periodicamente, atualize sua branch com as mudanças de `main`:

```bash
# Na sua feature branch
git checkout feature/nome-da-funcionalidade
git fetch origin
git rebase origin/main
```

**Ou use merge (se preferir):**
```bash
git checkout feature/nome-da-funcionalidade
git merge origin/main
```

### 4. Criar Pull Request

Quando a feature estiver completa:

1. **Push da branch:**
```bash
git push origin feature/nome-da-funcionalidade
```

2. **Criar Pull Request no GitHub:**
   - Base: `main`
   - Compare: `feature/nome-da-funcionalidade`
   - Preencher template de PR

3. **Revisão:**
   - Aguardar code review
   - Resolver comentários e sugestões
   - Atualizar PR conforme necessário

### 5. Merge da Feature

Após aprovação:
- Merge será feito via GitHub (squash merge recomendado)
- Branch de feature será deletada após merge
- `main` será atualizada automaticamente

### 6. Deletar Branch Local

Após merge bem-sucedido:

```bash
# Atualizar main local
git checkout main
git pull origin main

# Deletar branch local
git branch -d feature/nome-da-funcionalidade
```

## 📝 Checklist para Pull Requests

Antes de criar um PR, verifique:

- [ ] Código segue os padrões do projeto
- [ ] Arquivos seguem a estrutura de Clean Architecture
- [ ] Não há dependências circulares
- [ ] Validações implementadas nos DTOs
- [ ] Tratamento de erros adequado
- [ ] **Testes automatizados de aceitação criados** (conforme [PLANEJAMENTO-FASES.md](../../PLANEJAMENTO-FASES.md))
- [ ] **Todos os testes passando** (100% de sucesso)
- [ ] Código testado localmente
- [ ] Documentação atualizada (se necessário)
- [ ] Branch atualizada com `main`
- [ ] Commits organizados e com mensagens claras

> 📋 **Nota:** Para fases 2 em diante, a criação de testes automatizados de aceitação é obrigatória. Consulte [PLANEJAMENTO-FASES.md](../../PLANEJAMENTO-FASES.md) para detalhes.

## 🚫 Regras Importantes

1. **NUNCA commitar diretamente em `main`**
   - Use sempre feature branches
   - Integração via Pull Requests

2. **NUNCA fazer force push em branches compartilhadas**
   - Apenas em suas feature branches locais

3. **Sempre atualizar `main` antes de criar nova feature**
   - Evita conflitos desnecessários

4. **Mantenha branches de feature pequenas e focadas**
   - Uma feature = uma branch
   - Evite branches gigantes

5. **Delete branches após merge**
   - Mantém o repositório organizado

## 🔧 Comandos Úteis

### Ver branches locais e remotas
```bash
git branch -a
```

### Ver diferenças com main
```bash
git diff main
```

### Ver commits não sincronizados
```bash
git log origin/main..HEAD
```

### Limpar branches locais deletadas remotamente
```bash
git fetch --prune
git branch -d feature/nome-deletado
```

## 🎯 Vantagens deste Workflow

- **Simplicidade**: Menos complexidade que Git Flow
- **Agilidade**: Ciclos de desenvolvimento mais rápidos
- **Facilidade de revisão**: Cada funcionalidade isolada
- **Integração contínua**: PRs diretos para produção

## 📚 Referências

- [Atlassian Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Planejamento de Fases](../../PLANEJAMENTO-FASES.md) - Roadmap de implementação com testes automatizados
