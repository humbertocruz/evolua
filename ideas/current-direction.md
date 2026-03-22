# Current Direction

> Este arquivo consolida o estado atual das decisões e direções do Evolu[a].
> Os demais arquivos em `ideas/` podem conter hipóteses, explorações e caminhos anteriores. Este documento deve funcionar como bússola do momento.

---

## Update forte — 2026-03-22

A direção do projeto foi simplificada de forma importante.

### O que mudou
A hipótese anterior mais forte era:
- manter um projeto canônico separado (`.evolua` / `app.evolua.json`)
- usar um CLI próprio (`create-evolua`, `evolua dev`)
- materializar esse modelo em um target Next.js gerado
- rodar o app resultante via `next dev`

Essa direção ajudou a explorar a visão do produto, mas começou a introduzir complexidade cedo demais:
- CLI próprio para desenvolvimento
- geração/materialização como etapa central obrigatória
- runtime intermediário escondido
- mais moving parts do que o MVP realmente precisa

### Nova leitura do problema
O princípio central do Evolu[a] continua **inalterado**:

> **o app deve nascer e evoluir a partir do modelo, não do código-fonte**

Mas isso **não obriga** o projeto a manter uma arquitetura pesada de materialização externa desde o começo.

### Nova direção principal
A direção atual mais promissora é:

- **Next.js vira o host/runtime inicial do Evolu[a]**
- **o modelo continua sendo a fonte da verdade**
- **o código do host não é a superfície principal de autoria**
- **rotas dinâmicas do Next são usadas como palco para renderizar o modelo**

Formulação curta:

> **O Next renderiza. O Evolu[a] pensa o app.**

Ou ainda:

> **Evolu[a] é uma camada de autoria e evolução semântica sobre Next.js.**

---

## 1. O que está valendo agora

### 1.1 Conceito central
O Evolu[a] trata o app como um **objeto vivo definido por modelo**.

A visão multidimensional continua importante, mas o foco imediato deixa de ser “separar tudo fisicamente em múltiplos arquivos canônicos desde o dia 1” e passa a ser:
- preservar o **modelo como verdade**
- reduzir a complexidade do runtime
- provar o loop **modelo → app rodando** de forma direta

### 1.2 Relação com Next.js
Next.js agora é entendido menos como “target distante a ser gerado” e mais como:
- **host inicial do ecossistema**
- runtime de desenvolvimento web
- motor de roteamento/renderização
- base prática para o MVP

Isso significa que o Evolu[a] não tenta competir com o Next em:
- bundling
- dev server
- App Router
- runtime server/client
- deploy

Ele opera **acima** disso.

### 1.3 Princípio inegociável
Mesmo usando Next como host, a regra continua sendo:

- o app é definido pelo **modelo**
- o código do host é fino, genérico ou derivado
- a evolução do app deve acontecer pelo modelo, não por edição manual do código React gerado/host

### 1.4 Roteamento mágico / dinâmico
A direção atual favorece o uso de rotas dinâmicas/catch-all do Next, por exemplo:
- `src/app/[[...slug]]/page.tsx`

Esse arquivo funciona como um **resolver/renderizador genérico**:
- recebe a URL
- resolve qual página do modelo corresponde à rota
- renderiza a UI a partir do modelo

Fluxo atual desejado:

```txt
URL -> Next dynamic route -> resolver do modelo -> renderer Evolu[a] -> UI
```

Isso reduz bastante a necessidade de gerar uma árvore completa de `page.tsx` para cada tela no MVP.

### 1.5 Modelo como fonte da verdade
A direção atual aceita que o modelo inicial seja **mais simples e mais operacional**.

Em vez de começar obrigatoriamente com uma separação física rígida como:
- `structure.evolua.json`
- `visual.evolua.json`
- `data.evolua.json`
- `behavior.evolua.json`

é aceitável começar com modelos mais unificados por página/rota, desde que:
- o modelo continue sendo a origem real da interface
- o runtime/renderer leia esse modelo
- mudanças importantes sejam feitas no modelo, não no código host

### 1.6 Multidimensionalidade continua viva
A visão multidimensional **não foi abandonada**.

Ela continua como horizonte arquitetural do Evolu[a], mas agora de maneira mais pragmática:
- pode existir primeiro como **camadas conceituais internas do modelo**
- não precisa obrigatoriamente virar uma explosão de arquivos e pastas no MVP
- pode amadurecer por fases, guiada pelo uso real

### 1.7 Posicionamento do produto
Uma formulação útil para o momento:

> O Evolu[a] pode se tornar para apps Next.js algo parecido com o que o WordPress foi para sites — mas com foco em **modelo, estrutura viva e evolução semântica**, não apenas em conteúdo ou templates.

Importante: essa analogia ajuda a explicar, mas não deve reduzir o Evolu[a] a:
- CMS tradicional
- page builder
- low-code raso

A diferença principal é esta:

- no WordPress, a página ainda tende a terminar como **conteúdo/HTML** (mesmo quando há editor visual)
- no Evolu[a], a tela deve nascer como **objeto semântico e dimensional**
- ou seja: não é apenas “um pedaço de markup editável”, e sim uma estrutura com identidade, papel, relações, comportamento e projeções visuais

Formulação mais precisa:

> WordPress organiza conteúdo que vira HTML.
> Evolu[a] organiza telas e fluxos que nascem de um modelo semântico/dimensional e se projetam como aplicação.

O diferencial continua sendo:
- modelo como fonte de verdade
- app como objeto evolutivo
- IA operando sobre estrutura semântica
- interface não tratada como HTML disfarçado, e sim como modelo vivo

---

## 2. O que está valendo menos agora

### 2.1 CLI próprio como centro do desenvolvimento
A ideia de `create-evolua` + `evolua dev` como núcleo obrigatório do fluxo perdeu força.

Essas ferramentas ainda podem existir no futuro como utilitários auxiliares para:
- bootstrap
- inspect
- export
- migração
- materialização opcional

Mas **não precisam mais ser o coração do MVP**.

### 2.2 Materialização pesada como etapa obrigatória
A ideia de gerar/espelhar um app Next inteiro em diretórios intermediários (`.evolua/nextjs-app` etc.) também perdeu centralidade.

Pode continuar útil como:
- export futuro
- build target opcional
- projeção de código materializado

Mas não precisa ser a forma principal de iteração no começo.

### 2.3 Generalidade precoce de múltiplos targets
A ambição de tratar Next.js desde o início como apenas “um target entre muitos” fica menos central no curto prazo.

A direção atual assume com mais honestidade:
- o **host inicial é Next.js**
- outros hosts/targets podem vir depois, se fizer sentido

---

## 3. Decisão prática atual

A base nova do projeto deve seguir esta lógica:

- `packages/evolua-next` como host principal inicial
- `next dev` como fluxo normal de desenvolvimento
- modelo do Evolu[a] vivendo dentro do projeto host
- rota dinâmica do Next resolvendo páginas a partir do modelo
- renderer do Evolu[a] interpretando esse modelo

Em termos mentais:

```txt
Next = host/runtime
Evolu[a] = modelo + resolver + renderer + inteligência estrutural
```

---

## 4. Próximo passo mais coerente

O próximo passo útil não é aumentar abstração.

É consolidar o `packages/evolua-next` como prova viva desta direção:

1. fortalecer o shape do modelo
2. separar melhor resolver / renderer / tipos
3. provar edição real do modelo alterando a UI em runtime
4. explorar como layouts, nested routes e componentes compartilhados entram nessa arquitetura
5. só depois decidir até onde vale reintroduzir materialização/export

---

## 5. Resumo curto

> O estado atual do Evolu[a] mudou: o modelo continua sendo a fonte de verdade, mas Next.js passa a ser o host/runtime inicial do sistema. Em vez de depender de um pipeline pesado de materialização externa, o Evolu[a] pode usar rotas dinâmicas do Next para resolver e renderizar páginas diretamente a partir do modelo. Assim, o produto se aproxima de uma camada de autoria e evolução semântica sobre Next.js — não um replacement do framework, mas uma evolução da forma de construir apps sobre ele.
