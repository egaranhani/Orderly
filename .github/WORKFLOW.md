# 🔄 Workflow de Desenvolvimento - Feature Branch

Este documento descreve o workflow de desenvolvimento usando **Feature Branch** para o projeto OrderlyAI.

## 📋 Visão Geral

O projeto utiliza o workflow **Feature Branch**, onde cada funcionalidade é desenvolvida em uma branch separada e integrada via Pull Requests.

## 🌳 Estrutura de Branches

### Branches Principais

- **`main`**: Branch de produção. Contém apenas código estável e testado.
- **`develop`**: Branch de desenvolvimento. Contém código integrado e testado, pronto para release.

### Branches de Feature

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
# Atualizar develop
git checkout develop
git pull origin develop

# Criar nova feature branch
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

Periodicamente, atualize sua branch com as mudanças de `develop`:

```bash
# Na sua feature branch
git checkout feature/nome-da-funcionalidade
git fetch origin
git rebase origin/develop
```

**Ou use merge (se preferir):**
```bash
git checkout feature/nome-da-funcionalidade
git merge origin/develop
```

### 4. Criar Pull Request

Quando a feature estiver completa:

1. **Push da branch:**
```bash
git push origin feature/nome-da-funcionalidade
```

2. **Criar Pull Request no GitHub:**
   - Base: `develop`
   - Compare: `feature/nome-da-funcionalidade`
   - Preencher template de PR (se existir)

3. **Revisão:**
   - Aguardar code review
   - Resolver comentários e sugestões
   - Atualizar PR conforme necessário

### 5. Merge da Feature

Após aprovação:
- Merge será feito via GitHub (squash merge recomendado)
- Branch de feature será deletada após merge
- `develop` será atualizada automaticamente

### 6. Release para Produção

Quando `develop` estiver estável:

```bash
# Criar release branch (opcional)
git checkout -b release/v1.0.0 develop

# Após testes, merge para main
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```

## 📝 Checklist para Pull Requests

Antes de criar um PR, verifique:

- [ ] Código segue os padrões do projeto
- [ ] Arquivos seguem a estrutura de Clean Architecture
- [ ] Não há dependências circulares
- [ ] Validações implementadas nos DTOs
- [ ] Tratamento de erros adequado
- [ ] Código testado localmente
- [ ] Documentação atualizada (se necessário)
- [ ] Branch atualizada com `develop`
- [ ] Commits organizados e com mensagens claras

## 🚫 Regras Importantes

1. **NUNCA commitar diretamente em `main` ou `develop`**
   - Use sempre feature branches
   - Integração via Pull Requests

2. **NUNCA fazer force push em branches compartilhadas**
   - Apenas em suas feature branches locais

3. **Sempre atualizar `develop` antes de criar nova feature**
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

### Ver diferenças com develop
```bash
git diff develop
```

### Ver commits não sincronizados
```bash
git log origin/develop..HEAD
```

### Limpar branches locais deletadas remotamente
```bash
git fetch --prune
git branch -d feature/nome-deletado
```

## 📚 Referências

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

