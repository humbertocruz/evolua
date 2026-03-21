# Evolua — Multidimensional Principles

## 1. O modelo vem antes do código

No Evolua, a evolução do software deve acontecer **primariamente no modelo multidimensional**.

O código gerado é uma **materialização final** do estado do modelo, não a superfície principal de edição.

Isso existe por um motivo prático e conceitual:
- edição textual direta é frágil
- mudanças espalhadas em múltiplos arquivos quebram coerência
- IA e automação sofrem mais em código textual disperso do que em estruturas canônicas bem definidas

## 2. O app é um objeto multidimensional

Uma consequência importante disso no Evolu[a] é:
- a dimensão **structure** deve ser tratada como uma camada canônica de organização
- a dimensão **visual** pode existir como projeção/materialização dessa estrutura, mantendo importância canônica própria
- as dimensões **data** e **behavior** também devem ser tratadas como canônicas
- isso permite múltiplos visuais sobre a mesma base estrutural, sem simplificar demais dados e comportamento


Um app não deve ser tratado apenas como:
- interface
- árvore de componentes
- conjunto de arquivos
- AST isolada

Ele deve ser tratado como um **objeto canônico com múltiplas dimensões/projeções**, como por exemplo:
- visual
- structure
- data
- behavior
- code
- spatial / XR no futuro

## 3. Operações devem ser semânticas

O Evolua deve evoluir de operações estruturais básicas para operações semânticas.

Em vez de apenas:
- add node
- move node
- remove node

precisamos também de operações como:
- ligar data a view
- ligar behavior a view
- criar bindings explícitos
- conectar eventos a rotas
- extrair componentes
- projetar elementos em outras dimensões

## 4. Builder no final

O builder deve entrar como etapa de materialização final.

O fluxo ideal é:
1. operar no modelo canônico
2. validar coerência multidimensional
3. projetar visual/structure/data/behavior/code
4. só então gerar código real

## 5. Git semântico é uma direção natural

Se o modelo é a fonte de verdade, então no futuro o versionamento também pode deixar de depender exclusivamente de diff textual.

Uma direção natural do Evolua é um tipo de **git semântico**, baseado em:
- operações estruturais/semânticas
- mudanças no objeto multidimensional
- diffs por intenção e por estrutura
- merges orientados por modelo, não apenas por texto

Isso não substitui necessariamente o Git tradicional no começo, mas define uma direção estratégica importante.

## Resumo curto

> No Evolua, o software deve ser evoluído no modelo multidimensional.
> O código é projeção/materialização.
> E no futuro até o versionamento pode ser semântico, estrutural e multidimensional.
