# Evolu[a] Agent Protocol v0

> Working title: **Cognitive Bridge**

Este documento descreve como uma IA externa deve entender e operar o Evolu[a].

## 1. Problema que o protocolo resolve

Não basta expor uma API local do Evolu[a].

Uma IA que se conecta ao sistema também precisa entender:
- o que é o Evolu[a]
- qual é a fonte de verdade do projeto
- quais dimensões existem
- como localizar elementos do app
- como transformar pedidos humanos em operações semânticas
- o que não deve fazer (ex.: editar código gerado como fonte principal)

Sem isso, a IA usará categorias genéricas demais e tratará o Evolu[a] como se fosse apenas um editor de código comum.

## 2. Objetivo

Criar uma ponte cognitiva entre:
- a IA
- a engine do Evolu[a]
- o projeto ativo em edição

Essa ponte deve permitir que a IA opere o app aberto diretamente no modelo multidimensional vivo.

## 3. O que toda IA conectada ao Evolu[a] precisa saber

### Identidade do produto
- Evolu[a] é um sistema para operar apps como **objetos multidimensionais**
- o código gerado não é a fonte primária de verdade
- o modelo canônico é a superfície principal de evolução do software

### Dimensões canônicas atuais
- `structure`
- `visual`
- `data`
- `behavior`

### Dimensões derivadas atuais
- `spatial`
- `code`
- previews / artifacts

### Relação central entre dimensões
- `structure` organiza o app
- `visual` materializa `structure`
- `data` descreve entidades, estado, queries, bindings
- `behavior` descreve eventos, ações, efeitos e navegação

## 4. Regras cognitivas principais para a IA

### Regra 1
Preferir operar no **modelo canônico**.

### Regra 2
Preferir **operações semânticas** em vez de edição textual bruta.

### Regra 3
Não tratar código gerado como fonte primária de verdade.

### Regra 4
Localizar elementos do app por:
- ids estáveis
- paths estruturais
- labels/nomes
- contexto da tela ativa

### Regra 5
Sempre que possível, explicar a mudança em termos do modelo:
- qual dimensão foi alterada
- qual nó foi afetado
- qual operação foi aplicada

## 5. Capacidades mínimas que a IA precisa consultar

A engine/API local do Evolu[a] deveria expor algo como:

- `getAgentGuide()`
- `getCapabilities()`
- `getActiveProject()`
- `getActiveSelection()`
- `findNode()`
- `applyOperation()`
- `saveProject()`

## 6. Informações mínimas que a IA deve receber da instância ativa

### Guia do produto
- ontologia do Evolu[a]
- princípios básicos
- dimensões disponíveis
- regras de operação

### Capacidades da API
- operações suportadas
- schema das chamadas
- limitações da instância atual

### Projeto ativo
- app aberto
- dimensões carregadas
- tela ativa
- seleção atual
- ids relevantes

## 7. Exemplo de fluxo

Usuário diz:

> "Nova, no meu app no Evolu[a], altere a tela de Login, mude a cor do link de Esqueci senha para vermelho"

Fluxo ideal:
1. IA consulta o projeto ativo
2. IA localiza a tela Login
3. IA localiza o nó estrutural e sua projeção visual correspondente
4. IA escolhe uma operação semântica adequada
5. IA aplica a operação na dimensão visual
6. Evolu[a] atualiza preview/editor
7. IA responde em linguagem humana explicando a alteração

## 8. Formas possíveis de implementação

### A. Documento estático de skill
Ex.:
- `EVOLUA_AGENT.md`
- `agent-protocol.json`
- skill oficial do Evolu[a]

### B. API introspectiva
A instância ativa do Evolu[a] responde com:
- guia
- schema
- capacidades
- contexto do projeto ativo

### C. Modelo híbrido (recomendado)
- base estática de conceitos
- introspecção dinâmica da instância ativa

## 9. Nome conceitual

### Evolu[a] Cognitive Bridge

Esse nome descreve bem a função:
- não é só uma API
- não é só uma skill
- é a camada que ensina a IA a pensar e operar dentro do universo do Evolu[a]

## 10. Próximo passo sugerido

Transformar este protocolo em dois artefatos separados:
1. **spec conceitual** para IA/agentes
2. **schema técnico da API local**

## Resumo curto

> O Cognitive Bridge é a camada que permite que uma IA compreenda o Evolu[a], interprete o projeto ativo corretamente e opere o app aberto diretamente no modelo multidimensional, sem depender de edição textual de código.
