# Action Catalog v0

## Ideia central

O poder do Evolu[a] pode estar menos em um editor manual gigantesco e mais em um **catálogo de actions semânticas** capazes de evoluir o app multidimensional.

## Princípio

As actions não devem engessar o Evolu[a].

Elas devem funcionar como:
- operações de alto nível
- blocos reutilizáveis de evolução
- atalhos inteligentes
- interface comum entre usuário manual e IA

E não como a única forma possível de construir software.

## Regra importante

> O catálogo de actions deve ampliar a capacidade do usuário, não limitar o espaço de evolução do app.

## Como evitar engessamento

### 1. Actions como camada sobre o modelo
As actions devem operar sobre o modelo canônico, não substituir o modelo.

Isso significa:
- o modelo continua sendo mais expressivo do que qualquer action isolada
- o usuário/IA pode combinar actions
- o editor do modelo continua existindo como escape hatch poderoso

### 2. Catálogo extensível
O conjunto de actions não deve ser fixo para sempre.

Ele deve poder crescer por:
- novas ações nativas
- recipes
- bibliotecas por domínio
- ações compostas

### 3. Actions pequenas + actions compostas
Ter dois níveis:
- actions atômicas
- actions de alto nível

Exemplo:
- `visual.set-color`
- `structure.add-screen`
- `behavior.attach-event-to-route`

E também:
- `app.create-login-flow`
- `app.create-crud-module`
- `app.promote-to-authenticated-flow`

### 4. Escape hatch pelo Semantic Model Editor
Quando o catálogo não bastar, o usuário ainda pode operar diretamente o modelo com assistência.

Então o sistema não fica preso ao catálogo.

### 5. IA e humano usando a mesma linguagem
As actions também devem servir como linguagem compartilhada entre:
- IA
- usuário manual
- engine

Isso reduz caos sem reduzir potência.

## Categorias iniciais

### Structure
- add-screen
- add-section
- add-component
- move-node
- extract-component

### Visual
- set-color
- set-spacing
- apply-layout
- apply-variant
- set-typography

### Data
- create-entity
- create-state
- create-query
- connect-binding
- attach-data-source

### Behavior
- create-event
- create-action
- attach-event-to-route
- add-side-effect
- define-transition

## Resumo curto

> Um catálogo de actions não precisa engessar o Evolu[a] se ele for tratado como uma camada evolutiva sobre o modelo canônico, com catálogo extensível e escape hatch pelo Semantic Model Editor.
