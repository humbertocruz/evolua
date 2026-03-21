# Current Direction

> Este arquivo consolida o estado atual das decisões e direções do Evolu[a].
> Os demais arquivos em `ideas/` podem conter hipóteses, explorações e caminhos anteriores. Este documento deve funcionar como bússola do momento.

## 1. O que está valendo agora

### 1.1 Conceito central
O Evolu[a] trata o app como um **objeto multidimensional**.

### 1.2 Dimensões canônicas
Atualmente, as dimensões tratadas como canônicas são:
- `structure`
- `visual`
- `data`
- `behavior`

### 1.3 Relação entre structure e visual
- `structure` é a camada canônica de organização do app
- `visual` materializa/projeta a `structure`
- isso abre caminho para múltiplos visuais sobre a mesma base estrutural

### 1.4 Dimensões derivadas
Atualmente, são tratadas como derivadas:
- `spatial` (`.3djson`)
- `code`
- previews/artifacts

### 1.5 Formato do projeto
Direção atual:
- `app.evolua.json` como manifesto central
- arquivos separados por dimensão
- `.3djson` como projeção espacial derivada

### 1.6 Operação por IA
Cenário oficial importante:
- a IA deve poder operar o **app aberto** diretamente no modelo multidimensional vivo
- sem depender de edição textual de código
- via engine/API local ou ponte equivalente

### 1.7 Cognitive Bridge
É uma direção oficial do projeto:
- IA externa precisa de uma camada que ensine o que é o Evolu[a]
- essa ponte pode combinar skill/documentação + API introspectiva

### 1.8 Semantic Model Editor
Sem IA, o usuário não deve ficar impotente.

Direção atual:
- fallback/manual via **Semantic Model Editor**
- edição estrutural assistida do modelo
- actions semânticas
- autocomplete / validação / recipes

### 1.9 Catálogo de actions
- actions são centrais para o produto
- mas não devem engessar o sistema
- devem funcionar como camada extensível sobre o modelo canônico
- com escape hatch pelo Semantic Model Editor

### 1.10 Evolução por fases
O Evolu[a] deve ajudar apps a evoluir por estágios de maturidade, não apenas “gerar tudo de uma vez”.

### 1.11 Self-Evolution
Permanece como direção estratégica/horizonte:
- o Evolu[a] deve caminhar para construir progressivamente partes de si mesmo
- mas isso **não é foco imediato**

## 2. Mudança importante mais recente

A direção mais recente e mais forte não é mais:
- local-first puro
- nem SaaS-first puro

### Estado atual mais coerente
Um **ecossistema híbrido**:

#### SaaS / plataforma
Serve como fonte de:
- catálogo oficial de actions
- Cognitive Bridge oficial
- inteligência oficial do sistema
- templates/recipes
- eventual sync/repositório/coordenação

#### Ambiente local de desenvolvimento
Serve como lugar onde:
- o app do usuário roda
- o preview acontece
- o editor pode rodar
- a engine local pode operar o projeto

### Exemplo de experiência local
- `localhost:3000` → app/preview
- `localhost:4000` → editor Evolu[a]

### VS Code
- pode ser ferramenta complementar
- idealmente com extensão oficial do Evolu[a]
- não deve ser a única interface principal do produto

## 3. O que está em aberto

- qual é a spec exata da API local mínima
- como engine/editor/preview conversam na prática
- como o catálogo oficial sincroniza com o ambiente local
- se haverá `create-evolua` e `evolua dev` já no começo
- como será a extensão VS Code
- até onde vai o connector local opcional

## 4. Hipóteses anteriores que hoje são menos centrais

### 4.1 Local-first puro + Tauri como eixo principal
Foi uma hipótese válida, mas hoje está menos central do que a visão híbrida.

### 4.2 SaaS-first puro como ambiente único
Também foi importante como exploração, mas hoje a visão híbrida parece mais equilibrada.

### 4.3 Dependência total de IA
Hoje a direção melhor é:
- IA muito importante
- mas com fallback/manual via Semantic Model Editor + actions

## 5. Próximo passo mais coerente

O próximo passo mais útil agora é descrever a **arquitetura do ecossistema híbrido**, incluindo:
- papel do SaaS
- papel do ambiente local
- `create-evolua`
- `evolua dev`
- editor vs preview
- extensão VS Code
- como a IA conversa com esse ambiente

## Resumo curto

> O estado atual do Evolu[a] é um ecossistema híbrido: modelo multidimensional canônico com `structure`, `visual`, `data` e `behavior`; IA operando o app vivo; fallback por Semantic Model Editor + actions; e uma arquitetura combinando plataforma central (catálogo/inteligência) com ambiente local de desenvolvimento e preview.
