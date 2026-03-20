# 3DJSON v0

`3djson` é um formato para representar uma **projeção tridimensional navegável** de um modelo de aplicação potencialmente multidimensional.

## Princípio central

Um app no Evolua pode possuir múltiplas dimensões semânticas:
- visual
- structure
- data
- behavior
- code
- outras no futuro

O arquivo `.3djson` **não limita** o app a três dimensões.
Ele representa uma **projeção espacial em 3D** desse objeto multidimensional.

Em resumo:
- `.json` / `.evolua.json` → modelo canônico
- `.3djson` → projeção espacial 3D do modelo

## Objetivo

O `3djson` existe para:
- alimentar viewers 3D
- descrever layout espacial de nós
- padronizar formas, cores e relações visuais
- permitir navegação espacial de apps multidimensionais
- servir como ponte para web 3D, XR e Meta Quest

## Estrutura base

```json
{
  "format": "3djson",
  "version": "0.0.1",
  "source": {
    "model": "movie-app.evolua.json",
    "appName": "Movie App"
  },
  "space": {
    "kind": "multidimensional-app",
    "axes": {
      "x": "layout-index",
      "y": "hierarchy-or-importance",
      "z": "dimension-plane"
    }
  },
  "legend": {
    "dimensions": {
      "visual": { "color": "#ec4899" },
      "data": { "color": "#3b82f6" },
      "behavior": { "color": "#8b5cf6" }
    }
  },
  "nodes": [],
  "edges": [],
  "camera": {}
}
```

## Campos principais

### `format`
Identificador fixo do formato.

### `version`
Versão da spec do `3djson`.

### `source`
Origem da projeção.

Campos sugeridos:
- `model`
- `appName`
- `modelVersion`

### `space`
Descreve o tipo de espaço e o significado dos eixos.

### `legend`
Metadados de leitura visual.
Pode incluir:
- cores por dimensão
- formas por tipo
- convenções de escala

### `nodes`
Lista de objetos espaciais.
Cada node representa a manifestação 3D de um nó do modelo canônico.

### `edges`
Conexões visuais entre nodes.

### `camera`
Sugestões de câmera inicial para viewers.

## Node espacial

Exemplo:

```json
{
  "id": "view:component:movie-list",
  "label": "MovieList",
  "kind": "component",
  "dimension": "visual",
  "shape": "panel",
  "position": { "x": 5, "y": 3, "z": -10 },
  "rotation": { "x": 0, "y": 0, "z": 0 },
  "scale": { "x": 1.6, "y": 1.0, "z": 0.4 },
  "style": {
    "color": "#ec4899",
    "emissive": "#ec4899"
  },
  "links": ["data:query:movies", "behavior:event:open-movie"],
  "meta": {
    "tags": ["list", "movies"]
  }
}
```

### Campos sugeridos de node
- `id`
- `label`
- `kind`
- `dimension`
- `shape`
- `position`
- `rotation`
- `scale`
- `style`
- `links`
- `meta`

## Edge espacial

Exemplo:

```json
{
  "id": "edge:movie-list:data-query",
  "from": "view:component:movie-list",
  "to": "data:query:movies",
  "kind": "binding",
  "style": {
    "color": "#52525b",
    "opacity": 0.7
  }
}
```

### Campos sugeridos de edge
- `id`
- `from`
- `to`
- `kind`
- `style`
- `meta`

## Semântica geométrica inicial

Sugestão v0 para viewers:

### Por tipo
- `page` → `slab`
- `section` → `panel`
- `component` → `panel`
- `text` → `line`
- `entity` → `sphere`
- `state` → `orb`
- `query` → `capsule`
- `event` → `diamond`
- `action` → `prism`
- `route` → `ring`

### Por dimensão
- `visual` → plano frontal / z negativo
- `data` → plano central
- `behavior` → plano traseiro / z positivo

## Relação com o modelo canônico

O `.3djson` é uma projeção derivada.
Ele não substitui o modelo canônico.

Regras:
1. o modelo canônico continua sendo a fonte primária
2. o `3djson` deve referenciar ids reais do modelo
3. múltiplos `3djson` podem existir para o mesmo app
4. mudanças espaciais não precisam alterar a semântica do app

## Possibilidades futuras

No futuro, `3djson` pode suportar:
- múltiplos layouts espaciais
- animações
- estados de seleção
- clusters
- planos dinâmicos
- presets XR
- navegação temporal
- colaboração multi-user

## Frase curta da spec

> `3djson` representa uma projeção tridimensional de um modelo potencialmente multidimensional.
