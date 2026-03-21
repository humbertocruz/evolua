# Evolu[a] MVP 0

> Primeiro recorte implementável para provar o valor central do Evolu[a].

## Objetivo

Provar que o Evolu[a] consegue:
- carregar um app multidimensional em memória
- expor esse app para interação local
- permitir que uma IA altere o app aberto por meio do modelo canônico
- refletir a mudança no preview/editor
- sem editar código textual diretamente

## Tese que o MVP valida

> O software pode ser evoluído no modelo multidimensional vivo, e não primariamente no código gerado.

## Cenário de demonstração oficial

Usuário diz:

> "Nova, no meu app no Evolu[a], altere a tela de Login, mude a cor do link de Esqueci senha para vermelho"

O sistema deve:
1. localizar o projeto ativo
2. localizar a tela Login
3. localizar o elemento correspondente
4. aplicar uma operação semântica na dimensão visual
5. atualizar o preview
6. salvar a alteração no modelo

## Escopo do MVP 0

### 1. Projeto único simples
Um app de exemplo pequeno, com pelo menos:
- tela de Login
- link "Esqueci senha"
- estrutura mínima nas quatro dimensões canônicas

### 2. Dimensões canônicas mínimas
- `structure`
- `visual`
- `data`
- `behavior`

### 3. Engine local
Capaz de:
- abrir projeto
- manter projeto ativo em memória
- ler dimensões canônicas
- aplicar operação simples
- salvar projeto

### 4. API local mínima
Capacidades mínimas sugeridas:
- `getAgentGuide()`
- `getCapabilities()`
- `getActiveProject()`
- `findNode(query)`
- `applyOperation(operation)`
- `saveProject()`

### 5. Operação semântica mínima
Exemplo inicial:
- `setVisualStyle(nodeId, patch)`

Exemplo de uso:
- mudar cor do link "Esqueci senha" para vermelho

### 6. Preview/editor mínimo
Não precisa ser o editor final completo.

Precisa apenas mostrar:
- o app aberto
- a tela Login
- a alteração visual refletida após a operação

## Fora de escopo no MVP 0

- semantic repo completo
- git semântico
- colaboração remota
- múltiplos usuários
- spatial/VR operacional
- builder completo para targets reais
- self-evolution real do produto
- engine final completa
- merge semântico

## Forma de runtime sugerida

### Arquitetura
- produto principal SaaS/web
- engine/control plane no ambiente do Evolu[a]
- editor web para projeto ativo
- IA e catálogo operando no mesmo ambiente controlado

### Flexibilidade de implementação inicial
No MVP 0, a interface pode até ser um protótipo simples, desde que o fluxo central funcione.

## Estrutura mínima do projeto de exemplo

```txt
login-demo.evolua/
  app.evolua.json
  dimensions/
    structure.evolua.json
    visual.evolua.json
    data.evolua.json
    behavior.evolua.json
```

## Critérios de sucesso

O MVP 0 está validado se:

1. o Evolu[a] consegue abrir um projeto de exemplo
2. a engine expõe o projeto ativo localmente
3. uma IA/agente consegue localizar o link "Esqueci senha"
4. a IA/agente consegue aplicar uma mudança visual via operação semântica
5. o preview mostra a alteração
6. o projeto salvo reflete essa alteração no modelo

## Sinal de valor

Se esse MVP funcionar, ele já prova:
- engine local operando modelo canônico
- Cognitive Bridge viável
- IA atuando sobre o app vivo
- independência em relação à edição textual direta

## Próximo passo depois do MVP 0

### MVP 1
- mais operações semânticas
- seleção de nós melhor
- preview mais robusto
- suporte melhor a múltiplas telas

### MVP 2
- semantic diff local
- snapshots
- início do repositório multidimensional

## Resumo curto

> O MVP 0 do Evolu[a] deve provar que uma IA consegue alterar um app aberto diretamente no modelo multidimensional vivo — por exemplo, mudando o link "Esqueci senha" para vermelho — sem editar código textual.
