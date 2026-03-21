# AI Interaction with Live App

## Cenário central

O Evolu[a] deve permitir que uma IA opere **diretamente sobre o app aberto em edição**, sem precisar editar código textual.

## Exemplo

Usuário diz:

> "Nova, no meu app no Evolu[a], altere a tela de Login, mude a cor do link de Esqueci senha para vermelho"

Fluxo desejado:
1. a IA acessa o projeto ativo no Evolu[a]
2. identifica a tela/nó relevante
3. localiza o elemento na dimensão visual conectado à estrutura canônica
4. aplica uma operação semântica sobre o modelo multidimensional
5. o preview/editor atualiza
6. o código continua sendo apenas materialização derivada, não superfície principal de edição

## Princípio

A IA não deve operar principalmente por:
- clique na interface
- scraping de DOM
- edição textual de código gerado

A IA deve operar por:
- engine local
- modelo canônico em memória
- operações semânticas
- API local do Evolu[a]

## Arquitetura sugerida

### 1. Projeto ativo
O Evolu[a] expõe o projeto atualmente aberto/ativo.

### 2. Engine local acessível
A engine local expõe uma API local consumível por:
- editor UI
- IA/agentes
- automações futuras

### 3. Operações semânticas
A IA usa operações como:
- localizar tela
- localizar nó por label/path estrutural
- alterar estilo visual
- conectar behavior
- alterar bindings

### 4. Atualização reativa
Mudanças no modelo atualizam:
- editor
- preview
- projeções derivadas
- artifacts quando necessário

## Benefício

Isso transforma a IA em:
- agente de evolução estrutural do app

E não apenas em:
- geradora de código textual
- automação frágil de interface

## Resumo curto

> No Evolu[a], a IA deve conseguir alterar o app aberto diretamente no modelo multidimensional vivo, sem editar código manualmente.
