# @evolua/core

Core do Evolua.

Contém:
- modelo canônico
- projeções
- builder mínimo
- spatial / `3djson`
- operações formais sobre o modelo

## Operações iniciais

Atualmente o core expõe operações básicas como:
- `getNode(model, nodeId)`
- `renameNode(model, nodeId, nextName)`
- `updateNodeProps(model, nodeId, nextProps)`

Essas operações são o começo da gramática de edição do Evolua.
No futuro, elas podem crescer para incluir:
- addNode
- moveNode
- removeNode
- bindData
- attachBehavior
- createRoute
- reproject / rebuild
