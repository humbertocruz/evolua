# Evolua

> **Evolua v[0,[0,1]]**
> primeira iteração de uma linguagem de desenvolvimento estrutural e multidimensional.

Evolua é um **conjunto de ferramentas para uma nova forma de programar**.

A ideia central não é depender de IA desde o começo.
O foco inicial é permitir que devs construam software de forma **estrutural**, usando:

- **modelos estruturados**
- **AST (Abstract Syntax Tree)**
- **preview/view visual**
- **builder/export para código real**

A IA pode entrar depois como camada opcional, mas **não é a fundação do projeto**.

## Visão

No Evolua, o desenvolvimento não precisa começar do texto bruto.
O dev pode montar a aplicação a partir de estruturas, operações e componentes que alimentam:

1. um **modelo interno** do app
2. um **motor AST**
3. uma camada de **preview/view**
4. um **builder** que gera o código final

Em uma frase:

> Evolua não é “IA que gera app”.
> Evolua é **programação estrutural com AST + preview + builder**.

## Organização da pasta `Evolua`

A pasta `~/Work/Projects/Evolua` deve ser tratada como um **workspace/ecossistema**.
Ela pode conter múltiplos projetos e ferramentas relacionadas, por exemplo:

- `evolua-web` → app web / playground / editor visual
- `evolua-cli` → CLI para operar modelos, builders e exportações
- `evolua-mobile` → app mobile no futuro
- `packages/*` → bibliotecas compartilhadas do ecossistema

Ou seja: `Evolua` não representa apenas um app, mas possivelmente uma **família de ferramentas**.

## Princípios iniciais

> Norte adicional do projeto: a evolução do software deve acontecer primariamente no **modelo multidimensional**. O código gerado é materialização final, não a superfície principal de edição. No futuro, isso pode inclusive abrir caminho para um **git semântico**, baseado em mudanças estruturais do objeto multidimensional em vez de diffs puramente textuais.


### 1. IA é opcional
No começo, o projeto deve funcionar **sem IA**.
A estrutura principal precisa ser determinística, previsível e local.

### 2. O core é estrutural
O núcleo do Evolua deve trabalhar com:
- entidades
- componentes
- páginas
- rotas
- props
- ações
- dados
- relações
- operações AST

### 3. Preview é parte do produto
O preview/view não é detalhe cosmético.
Ele faz parte da experiência de desenvolvimento.

### 4. Builder gera código real
O output precisa ser código normal, legível e utilizável por devs em projetos reais.

### 5. IA entra depois, falando a linguagem do Evolua
No futuro, IA pode:
- sugerir operações
- transformar intenções em mudanças estruturadas
- refatorar
- explicar modelos
- acelerar fluxos

Mas sempre como camada opcional sobre uma base sólida.

## Blocos da arquitetura desejada

### Nota arquitetural atual
No direcionamento atual do projeto, `structure`, `visual`, `data` e `behavior` tendem a ser tratados como **dimensões canônicas** do app multidimensional. A projeção espacial (`.3djson`) e o código gerado permanecem como camadas derivadas/materializadas.


### Core Model
Representação estruturada do app e de seus elementos.

### AST Engine
Transformações determinísticas para criar e modificar código a partir do modelo.

### Preview / View
Forma de visualizar o estado atual do app de maneira rápida e interativa.

### Builder
Exportação para código real, com pastas, arquivos e convenções utilizáveis.

### Adapters
Suporte a targets específicos, como Next.js, React, Prisma, Tailwind etc.

### AI (futuro)
Camada plugável e opcional, nunca a fundação do sistema.

## View / Preview multidimensional

O preview do Evolua não deve mostrar apenas o resultado final da interface.
Ele deve permitir navegar pelo app como um **objeto estrutural em múltiplas dimensões** — quase como um **"JSON 3D"**.

Isso significa que o preview não é só uma tela renderizada.
Ele é também um **navegador espacial**, um **inspector estrutural** e um **mapa vivo do sistema**.

### Limitação do preview tradicional
Normalmente, preview significa apenas:
- “como ficou a UI”

No Evolua, isso é insuficiente.
O dev precisa enxergar não só a aparência final, mas também a estrutura, os dados, os comportamentos e a materialização em código.

### Dimensões do preview

O mesmo elemento do app pode ser visto em diferentes camadas:

- **Dimensão visual** → como a interface aparece
- **Dimensão estrutural** → quais componentes existem e como se encaixam
- **Dimensão de dados** → quais entidades, props, state e bindings alimentam a UI
- **Dimensão de navegação** → como páginas, rotas e fluxos se conectam
- **Dimensão de comportamento** → ações, eventos, mutations e efeitos
- **Dimensão de AST** → como aquilo existe como árvore sintática
- **Dimensão de código gerado** → quais arquivos, trechos e convenções serão materializados pelo builder

### Exemplo de navegação

Um dev pode selecionar um card na interface e alternar entre visões como:

- **View** → o card renderizado
- **Structure** → `Page > Section > MovieList > MovieCard`
- **Data** → props, bindings e origem dos dados
- **Behavior** → eventos, navegação e ações
- **AST** → nó estrutural correspondente
- **Build Output** → arquivo e código final gerado

### Implicação conceitual

O modelo do Evolua não deve ser apenas uma árvore simples.
Ele tende a se comportar mais como um **grafo com múltiplas projeções**.

O mesmo elemento pode existir simultaneamente como:
- elemento visual
- nó estrutural
- ponto de interação
- fragmento de AST
- origem de código gerado

Por isso, o preview precisa trabalhar com a ideia de **projeções do mesmo modelo canônico**.

### Modelo mental sugerido

#### Canonical Model
Fonte única de verdade do app.
Não é o código final e não é apenas a UI renderizada.
É o modelo estrutural/semântico do sistema.

#### Projections
Formas diferentes de visualizar o mesmo modelo:
- visual projection
- tree projection
- graph projection
- data projection
- behavior projection
- ast projection
- code projection

#### Inspector / Canvas
Uma interface onde o dev navega e manipula essas projeções.

#### Builder
Camada que materializa o modelo em código real.

### Síntese

> O preview do Evolua não deve mostrar apenas “resultado”.
> Ele deve mostrar o app como um objeto navegável em múltiplas dimensões.

## Primeiras dimensões oficiais do Evolua v[0,[0,1]]

Para evitar abstração demais logo no começo, o Evolua pode nascer com um conjunto pequeno de dimensões oficiais.
Essas dimensões já são suficientes para provar a ideia central sem tentar resolver o universo inteiro em um fim de semana movido a café e delírio técnico.

### 1. Visual
Mostra como a interface aparece.

**Função:**
- preview da tela
- layout
- composição visual
- estilos
- noção de responsividade

**Pergunta principal:**
- “como isso aparece?”

### 2. Structure
Mostra a composição do app como árvore estrutural.

**Função:**
- páginas
- seções
- componentes
- hierarquia pai/filho
- slots e regiões

**Pergunta principal:**
- “do que isso é feito?”

### 3. Data
Mostra a origem, passagem e vínculo dos dados.

**Função:**
- entidades
- props
- state
- bindings
- origem dos dados
- destino dos dados na UI

**Pergunta principal:**
- “de onde isso vem e para onde vai?”

### 4. Behavior
Mostra o que acontece quando algo acontece.

**Função:**
- eventos
- ações
- handlers
- transições
- efeitos
- mutações locais ou remotas

**Pergunta principal:**
- “qual é a lógica viva desse ponto do app?”

### 5. Code Projection
Mostra a materialização estrutural em código.

**Função:**
- AST correspondente
- arquivos gerados
- trechos de código
- saída do builder

**Pergunta principal:**
- “como isso vira código real?”

## Por que começar com essas cinco?

Porque elas cobrem o ciclo essencial do Evolua:

- **Visual** → o que o dev vê
- **Structure** → como aquilo é montado
- **Data** → o que alimenta aquilo
- **Behavior** → o que aquilo faz
- **Code Projection** → como aquilo é materializado

Com isso, o projeto já consegue demonstrar que um app pode ser tratado como um objeto navegável por projeções sincronizadas.

## Dimensões futuras

Depois, o Evolua pode ganhar dimensões adicionais como:

- **Navigation / Flow**
- **Domain**
- **Graph**
- **Build Target**
- **Collaboration**
- **AI Assistance**

Mas no começo, o ideal é manter o núcleo enxuto e inteligível.

## Regra de ouro das dimensões

Cada elemento do app deve poder ser localizado, pelo menos, nestas cinco perspectivas:

- como aparece
- onde está na estrutura
- quais dados usa
- quais comportamentos possui
- como vira código

Se uma dimensão não consegue se conectar ao modelo canônico e às outras projeções, então ela ainda não merece existir como dimensão oficial.

## Inspiração conceitual: *Contato*

Parte da visão do Evolua conversa com a ideia apresentada no filme *Contato*:
uma estrutura complexa pode parecer apenas dados quando vista de forma linear, mas revela outra natureza quando interpretada em múltiplas dimensões.

No Evolua, um app não deve ser tratado apenas como texto ou como tela final.
Ele pode ser entendido como um **objeto multidimensional**, em que cada projeção revela uma parte da sua natureza:

- visual
- estrutural
- dados
- comportamento
- AST
- código materializado

Assim como uma mensagem pode conter o esquema de uma máquina quando corretamente interpretada, o modelo do app pode conter mais do que “código”.
Ele pode conter uma forma navegável, manipulável e materializável em diferentes projeções.

Nesse sentido, o código gerado não é o app em sua totalidade.
Ele é uma **projeção colapsada** do app.

## Canonical Model v[0,[0,1]]

Para o Evolua funcionar como sistema multidimensional, ele precisa de uma **fonte única de verdade**.
Esse modelo canônico não é apenas a UI, nem apenas o código final: ele é a representação estrutural e semântica do app.

### Princípios do modelo canônico

1. **Um app é um objeto único**
   - não existem versões separadas para visual, dados e código
   - existem projeções diferentes sobre o mesmo objeto

2. **Cada elemento precisa de identidade estável**
   - para poder ser localizado em múltiplas dimensões
   - um componente visto na UI precisa ser o mesmo componente visto na estrutura, nos dados e no código

3. **O modelo precisa ser navegável**
   - tanto em árvore quanto em grafo, dependendo da projeção

4. **O builder não inventa a estrutura**
   - ele materializa o que já existe no modelo

5. **Código é output, não fonte primária**
   - o código gerado é consequência do modelo

### Tipos conceituais iniciais

#### AppModel
Representa a aplicação como um todo.

Campos esperados:
- metadados do app
- páginas
- componentes
- entidades de dados
- ações e comportamentos
- rotas
- targets de build
- projeções disponíveis

#### Node
Tipo base para qualquer elemento identificável do sistema.

Campos esperados:
- `id`
- `kind`
- `name`
- `meta`
- `tags`

Todo elemento importante do app deve herdar a ideia de `Node`.

#### ViewNode
Representa elementos visuais e estruturais da interface.

Exemplos:
- página
- seção
- layout
- componente
- slot
- elemento textual
- container

Campos esperados:
- identidade
- tipo visual/estrutural
- props
- children
- style tokens
- references para dados e comportamentos

#### DataNode
Representa entidades e fontes de dados.

Exemplos:
- entidade de domínio
- state local
- query remota
- coleção
- campo
- binding

Campos esperados:
- esquema
- origem
- relações
- bindings com ViewNodes

#### BehaviorNode
Representa comportamento executável ou reativo.

Exemplos:
- evento
- ação
- handler
- navegação
- mutation
- efeito
- regra condicional

Campos esperados:
- gatilho
- condição
- operação
- alvo
- efeitos colaterais

#### RouteNode
Representa navegação e fluxo entre superfícies.

Campos esperados:
- path
- page alvo
- parâmetros
- transições possíveis

#### Projection
Representa uma forma de observar o mesmo modelo.

Campos esperados:
- `id`
- `kind` (`visual`, `structure`, `data`, `behavior`, `code`)
- regras de mapeamento
- formas de seleção e foco

#### ProjectionRef
Faz a ponte entre um elemento e sua presença em uma projeção específica.

Exemplo de uso:
- um `MovieCard` pode ter referências para:
  - sua posição na árvore estrutural
  - sua renderização visual
  - seus bindings de dados
  - seus handlers
  - seu trecho AST
  - seu arquivo gerado

#### BuildArtifact
Representa a materialização final.

Exemplos:
- arquivo TSX
- schema Prisma
- módulo de rota
- componente gerado
- configuração

Campos esperados:
- caminho
- tipo de artefato
- origem no modelo
- target

### Relação entre os blocos

Fluxo conceitual:

`AppModel -> Nodes -> Projections -> Builder -> BuildArtifacts`

Mas o ponto importante é:
- o builder lê o modelo
- as projeções revelam o modelo
- os artefatos materializam o modelo

### Regra central

Todo elemento relevante do sistema deve responder a estas perguntas:
- como aparece?
- onde está na estrutura?
- de quais dados depende?
- que comportamento possui?
- como vira código?

Se um elemento não puder ser localizado nessas perguntas, então o modelo ainda está incompleto.

## XR / Spatial Development (direção futura)

Uma possível direção futura do Evolua é levar a ideia de app multidimensional para um ambiente espacial/3D.

Essa possibilidade ganhou força a partir da ideia de usar um **Meta Quest 3** como plataforma experimental para visualização e manipulação do app em múltiplas dimensões.

### Por que isso faz sentido

No monitor tradicional, múltiplas dimensões precisam ser simuladas com:
- painéis
- abas
- árvores
- inspectors
- divisões de tela

Em um ambiente XR, parte disso pode virar uma interface mais natural:
- UI renderizada flutuando no espaço
- árvore estrutural como composição espacial
- vínculos de dados como conexões visuais
- comportamentos como camadas ou fluxos ativáveis
- AST e code projection como planos, fatias ou painéis contextuais

Nesse cenário, o objetivo não seria simplesmente “rodar um editor em VR”.
O objetivo seria criar uma **forma espacial nativa de navegar e manipular o modelo canônico do app**.

### Princípio importante

XR não deve ser o primeiro passo do projeto.
Primeiro, o Evolua precisa consolidar:
- modelo canônico
- projeções
- preview 2D
- builder

Depois disso, a exploração espacial faz mais sentido como extensão do ecossistema.

### Ecossistema sugerido

A pasta `Evolua` pode evoluir para algo como:

- `packages/core` → modelo canônico, projeções e tipos centrais
- `evolua-web` → editor/preview 2D
- `evolua-cli` → builder, exportações e automações
- `evolua-xr` → exploração e edição espacial do app multidimensional

### Visão

No futuro, um dev poderia:
- caminhar ao redor de uma interface
- selecionar um componente no espaço
- abrir suas dimensões de estrutura, dados e comportamento
- visualizar a ligação com AST e código gerado
- manipular projeções diferentes do mesmo elemento como objetos espaciais relacionados

### Síntese

> O Evolua pode começar em 2D.
> Mas sua ideia talvez encontre uma forma ainda mais honesta em um ambiente espacial.

## Nota de direção

Se houver dúvidas sobre o rumo do projeto, seguir esta regra:

> Primeiro criar a linguagem e a mecânica do Evolua.
> Depois, se quiser, ensinar IA a falar essa linguagem.
