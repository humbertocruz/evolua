# Evolu[a] File Shapes v0

> Rascunho dos arquivos principais de um projeto Evolu[a] com arquivo central + dimensões canônicas separadas + `.3djson` derivado.

## Estrutura alvo v0

```txt
my-app.evolua/
  app.evolua.json
  dimensions/
    structure.evolua.json
    visual.evolua.json
    data.evolua.json
    behavior.evolua.json
  derived/
    spatial.3djson
```

## Status das dimensões no v0

### Dimensões canônicas
- `structure`
- `visual`
- `data`
- `behavior`

### Dimensões derivadas
- `spatial` (`.3djson`)
- `code` / builder output
- previews exportados

---

## 1. `app.evolua.json`

Arquivo central do projeto.

### Papel
- identificar o app
- declarar versão/formato
- apontar para os arquivos das dimensões
- registrar metadados globais
- declarar build targets e capabilities de alto nível

### Shape sugerido

```json
{
  "format": "evolua-app",
  "version": "0.0.1",
  "appModelVersion": "v[0,[0,1]]",
  "appId": "app:movie-example",
  "name": "Movie Example",
  "description": "Exemplo inicial do Evolu[a]",
  "entryDimension": "visual",
  "dimensions": {
    "structure": "./dimensions/structure.evolua.json",
    "visual": "./dimensions/visual.evolua.json",
    "data": "./dimensions/data.evolua.json",
    "behavior": "./dimensions/behavior.evolua.json"
  },
  "derived": {
    "spatial": "./derived/spatial.3djson"
  },
  "buildTargets": [
    {
      "id": "target:web",
      "kind": "nextjs",
      "name": "Next.js App Router"
    }
  ],
  "meta": {
    "createdAt": "2026-03-21T13:30:00Z",
    "updatedAt": "2026-03-21T13:30:00Z"
  }
}
```

### Observações
- este arquivo não precisa repetir todos os nós do app
- ele funciona como **manifesto + índice do projeto**
- o estado canônico está distribuído nos arquivos de dimensão

---

## 2. `structure.evolua.json`

### Papel
Guardar a **estrutura canônica** do app.

### Decisão v0
No Evolu[a] v0, `structure` será tratada como **dimensão canônica**.

Isso significa que:
- a organização principal do app mora em `structure`
- a dimensão visual passa a ser uma **projeção/materialização da structure**
- essa escolha favorece o conceito de App Multidimensional
- e evita refatorações conceituais pesadas no futuro

### Shape sugerido

```json
{
  "format": "evolua-dimension",
  "version": "0.0.1",
  "appId": "app:movie-example",
  "dimension": "structure",
  "roots": ["structure:page:dashboard"],
  "nodes": {
    "structure:page:dashboard": {
      "id": "structure:page:dashboard",
      "kind": "page",
      "name": "DashboardPage",
      "children": ["structure:section:hero", "structure:component:movie-list"]
    },
    "structure:section:hero": {
      "id": "structure:section:hero",
      "kind": "section",
      "name": "HeroSection",
      "children": ["structure:text:hero-title"]
    },
    "structure:text:hero-title": {
      "id": "structure:text:hero-title",
      "kind": "text",
      "name": "HeroTitle",
      "children": []
    },
    "structure:component:movie-list": {
      "id": "structure:component:movie-list",
      "kind": "component",
      "name": "MovieList",
      "children": []
    }
  },
  "meta": {
    "canonical": true
  }
}
```

---

## 3. `visual.evolua.json`

### Papel
Guardar a dimensão visual do app como **projeção/materialização da structure**, mantendo ainda status canônico no v0.

Ou seja:
- `structure` continua sendo a camada principal de organização
- `visual` não é dona da estrutura
- mas `visual` continua sendo uma dimensão canônica importante do projeto, não mero cache descartável

### Conteúdo esperado
- mapeamento entre nós estruturais e manifestação visual
- props visuais
- style tokens
- layout
- componentType visual
- referências para data/behavior quando necessário

### Shape sugerido

```json
{
  "format": "evolua-dimension",
  "version": "0.0.1",
  "appId": "app:movie-example",
  "dimension": "visual",
  "nodes": {
    "structure:page:dashboard": {
      "structureNodeId": "structure:page:dashboard",
      "componentType": "Page",
      "tags": ["page", "root"],
      "layout": {
        "variant": "page"
      }
    },
    "structure:section:hero": {
      "structureNodeId": "structure:section:hero",
      "componentType": "Section",
      "props": {
        "title": "Evolua Movies",
        "subtitle": "Um exemplo mínimo do app multidimensional."
      },
      "styleTokens": ["bg-zinc-950", "text-zinc-100"]
    },
    "structure:text:hero-title": {
      "structureNodeId": "structure:text:hero-title",
      "componentType": "Text",
      "props": {
        "content": {
          "kind": "binding",
          "value": "data:state:ui:selectedGenre"
        }
      }
    }
  },
  "meta": {
    "projects": "structure"
  }
}
```

---

## 4. `data.evolua.json`

### Papel
Guardar a dimensão de dados como camada canônica do app.

### Conteúdo esperado
- entities
- fields
- states
- queries
- bindings
- relações entre fontes de dados e destinos

### Shape sugerido

```json
{
  "format": "evolua-dimension",
  "version": "0.0.1",
  "appId": "app:movie-example",
  "dimension": "data",
  "nodes": {
    "data:entity:movie": {
      "id": "data:entity:movie",
      "kind": "entity",
      "name": "Movie",
      "schema": {
        "fields": [
          { "name": "id", "type": "number", "required": true },
          { "name": "title", "type": "string", "required": true }
        ]
      },
      "tags": ["domain", "movie"]
    },
    "data:query:movies": {
      "id": "data:query:movies",
      "kind": "query",
      "name": "MoviesQuery",
      "source": {
        "kind": "remote-query",
        "reference": "GET /api/movies"
      },
      "relationRefs": [{ "id": "data:entity:movie", "kind": "entity" }],
      "bindingRefs": [
        {
          "from": { "id": "data:query:movies", "kind": "query" },
          "to": { "id": "structure:component:movie-list", "kind": "component" },
          "expression": "result.items -> visual props.items"
        }
      ]
    }
  },
  "meta": {
    "canonical": true
  }
}
```

---

## 5. `behavior.evolua.json`

### Papel
Guardar eventos, ações, efeitos, navegação e transições de comportamento como camada canônica do app.

### Conteúdo esperado
- events
- actions
- effects
- routes
- triggers
- operations
- targets
- transitions

### Shape sugerido

```json
{
  "format": "evolua-dimension",
  "version": "0.0.1",
  "appId": "app:movie-example",
  "dimension": "behavior",
  "nodes": {
    "behavior:event:open-movie": {
      "id": "behavior:event:open-movie",
      "kind": "event",
      "name": "OpenMovieEvent",
      "trigger": {
        "kind": "event",
        "name": "onMovieClick",
        "sourceRef": { "id": "structure:component:movie-list", "kind": "component" }
      },
      "operation": {
        "kind": "navigate",
        "name": "GoToMovieDetails",
        "input": {
          "kind": "expression",
          "value": "/movie/:id"
        }
      },
      "targetRefs": [{ "id": "route:movie-details", "kind": "route" }]
    },
    "route:movie-details": {
      "id": "route:movie-details",
      "kind": "route",
      "name": "MovieDetailsRoute",
      "path": "/movie/:id",
      "pageRef": { "id": "structure:page:dashboard", "kind": "page" },
      "params": [{ "name": "id", "type": "number", "required": true }],
      "transitions": [{ "eventName": "onMovieClick", "to": "/movie/:id" }]
    }
  },
  "meta": {
    "canonical": true
  }
}
```

---

## 6. `spatial.3djson`

### Papel
Projeção espacial derivada.

### Importante
- não é a fonte primária de verdade
- pode ser regenerada a partir das dimensões canônicas
- serve para preview spatial/3D/XR

### Shape
Seguir a spec existente em `3DJSON.md`.

---

## Relação entre dimensões canônicas

### `structure`
Define a organização principal do app.

### `visual`
Materializa visualmente a structure.

### `data`
Define entidades, estado, queries, bindings e fluxo de dados.

### `behavior`
Define eventos, ações, efeitos, navegação e transições.

### Regra geral
As dimensões canônicas devem ser conectadas por **ids estáveis** e refs explícitas.

Isso permite:
- múltiplos visuais sobre a mesma estrutura
- data e behavior independentes do layout visual imediato
- projeções derivadas consistentes

---

## 7. Regras de conexão

### Regra central
A conexão entre dimensões deve acontecer por **ids estáveis**, não apenas por nome humano.

Exemplos:
- `structure:component:movie-list`
- `data:query:movies`
- `behavior:event:open-movie`
- `route:movie-details`

### O arquivo central conecta por caminho
- `app.evolua.json` conecta os arquivos

### As dimensões se conectam por identidade
- refs e bindings cruzam dimensões por `id`

---

## 8. O que ainda está em aberto

- `code` entra como dimensão separada ou fica apenas como artifact derivado no v0?
- o manifesto central deve declarar checksums/versões por dimensão?
- existe um índice global de nodes no arquivo central ou não?
- devemos ter um arquivo extra de `relations.evolua.json` no futuro?
- quando uma projeção visual puder ter múltiplas variantes (web/mobile/vr), como nomear isso no formato?

---

## Resumo curto

> O v0 do projeto Evolu[a] pode usar um arquivo central (`app.evolua.json`) como manifesto/índice e arquivos separados por dimensão (`structure`, `visual`, `data`, `behavior`), conectados por ids estáveis. `Structure`, `visual`, `data` e `behavior` são canônicos. O `.3djson` permanece como projeção espacial derivada.
