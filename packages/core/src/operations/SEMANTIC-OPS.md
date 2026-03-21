# Semantic Operations v0

Estas operações são uma camada acima do CRUD estrutural básico.

## Objetivo

Em vez de apenas:
- adicionar nós
- mover nós
- remover nós

elas devem expressar intenções multidimensionais do Evolua.

## Primeira leva

- `linkDataToView(model, viewNodeId, dataNodeRef)`
  - liga um nó visual a uma referência de dados

- `linkBehaviorToView(model, viewNodeId, behaviorNodeRef)`
  - liga um nó visual a um comportamento/evento

- `createBinding(model, bindingOwnerId, binding)`
  - registra um binding explícito entre dois nós

- `bindStateToText(model, stateNodeId, textNodeId, expression)`
  - operação semântica específica para conectar state -> text
  - além do binding, materializa o `props.content` do texto

- `attachEventToRoute(model, eventNodeId, routeNodeId, transition)`
  - conecta evento e rota preservando a transição de navegação

## Critério

Uma operação semântica do Evolua deve, idealmente:
1. expressar intenção de domínio estrutural
2. preservar coerência entre dimensões
3. atualizar mais de um ponto do modelo quando necessário
4. aproximar o core da ideia de App Multidimensional

## Próximo passo sugerido

Criar novas operações como:
- `extractViewAsComponent`
- `projectNodeIntoDimension`
- `linkQueryToComponentList`
- `attachActionToEvent`
- `materializeCodeArtifact`
