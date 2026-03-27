# Arquitetura do Evolu[a] — Mapa de Parts

## Filosofia
> "O Next.js renderiza. O Evolu[a] pensa o app."

```
SaaS ( Evolua )  ←→  Runtime (@evolua/next)  ←→  App Next.js do usuário
   "cérebro"                         "olhos"
```

---

## Parts Hoje

### 1. `apps/web` — O SaaS (localhost hoje)
**O que é:** Next.js 16 + Prisma + PostgreSQL (Neon)  
**Responsabilidade:** Editor de modelo, auth, DB, API

```
apps/web/src/
├── app/
│   ├── [[...slug]]/          ← RENDERIZA páginas do modelo (já funciona!)
│   │   └── page.tsx
│   ├── api/
│   │   └── runtime/          ← API pro runtime externo
│   │       └── projects/[projectSlug]/page/route.ts
│   └── evolua/               ← COCKPIT de edição (existe, básico)
│       ├── page.tsx          ← Dashboard
│       ├── pages/            ← Lista de páginas
│       ├── components/       ← Gerenciar componentes
│       ├── datasources/      ← Gerenciar dados
│       ├── layout.tsx
│       └── actions.ts
├── evolua/
│   ├── runtime.tsx           ← Renderiza nodes → React (já funciona!)
│   ├── store.ts              ← Acesso ao banco (Prisma)
│   ├── types.ts              ← Tipos do modelo (EvoluaNode, EvoluaPage)
│   ├── app.model.json        ← Seed: 3 páginas de exemplo
│   └── db-notes.md
├── lib/
│   └── prisma.ts             ← Cliente Prisma + Pool PostgreSQL
└── prisma/
    ├── schema.prisma          ← Project + Page (nodes JSON)
    └── seed.ts                ← Popula com app.model.json
```

### 2. `packages/core` — Motor AST (Node.js pur)
**O que é:** Lógica de modelo, operações, projeções  
**Responsabilidade:** Criar/manipular AST, gerar código, projeções multidimensionais  
**Status:** Experimental, não conectado no app ainda

```
packages/core/src/
├── model.ts                  ← Tipo AppModel, NodeKind, View/Data/Behavior/Route
├── operations/               ← Operações formais no AST
│   └── model.ts
├── projections/              ← Projeções do modelo (structure, data, behavior)
│   ├── structure.ts
│   ├── data.ts
│   └── behavior.ts
├── builder/                  ← Gerador de código ( Next.js )
│   └── minimal.ts
├── examples/                 ← Movie App example
│   └── movie-app.ts
└── spatial/                  ← 3D JSON (experimental)
    └── 3djson.ts
```

### 3. `packages/types` — Contrato compartilhado
**O que é:** Tipos TypeScript do contrato entre SaaS e Runtime  
**Responsabilidade:** Definir o que é um AppModel, NodeKind, API responses

```
packages/types/src/
└── index.ts                  ← AppModel, ViewNode, DataNode, BehaviorNode,
                                 RouteNode, EvoluaConfig, ProjectionKind...
```

### 4. `packages/next` — Runtime pra app Next.js do usuário
**O que é:** Pacote instalável num Next.js externo  
**Responsabilidade:** Conectar no SaaS, buscar página, renderizar

```
packages/next/src/
├── client.ts                 ← fetchProject(), fetchPage(), fetchProjection()
├── config.ts                 ← initEvolua(), getConfig()
├── renderer.ts               ← Renderização de nodes (utils)
├── components/
│   ├── EvoluProvider.tsx     ← Provider com config
│   └── EvoluPage.tsx         ← Componente que busca e renderiza página
└── index.ts
```

---

## O que já funciona

| O quê | Onde | Status |
|---|---|---|
| Seed com 3 páginas (`/`, `/login`, `/forgot-password`) | `app.model.json` → DB | ✅ |
| Renderização de página via `[[...slug]]` | `runtime.tsx` | ✅ |
| Prisma + Neon DB | `apps/web` | ✅ |
| API REST `/api/runtime/projects/:slug/page?path=` | `apps/web` | ✅ |
| Cockpit `/evolua/*` | `apps/web` | 📝 existe, básico |

---

## Arquitetura simplificada

```
EDITOR (humano ou IA)
      │
      ▼
┌─────────────────────────────────────────────────────┐
│              apps/web (SaaS / Cockpit)              │
│                                                     │
│  1. Modelo existe em Prisma (nodes JSON)            │
│  2. Voc^e edita via /evolua/* (futuro: IA também)  │
│  3. Pubilca página (muda status p/ published)      │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP GET /api/runtime/...
                       ▼
┌─────────────────────────────────────────────────────┐
│        @evolua/next (Runtime no app do usuário)   │
│                                                     │
│  1. Componente <EvoluPage /> busca página          │
│  2. Recebe nodes (JSON)                           │
│  3. Renderiza localmente                           │
└─────────────────────────────────────────────────────┘
```

---

## Próximos Passos Prioritários

### Fase 1 — Cockpit funcional (hoje)
 fazer `/evolua/*` realmente editar o modelo no banco

```
/evolua              → lista páginas, cria nova
/evolua/pages/[id]   → editor da página (nodes + visual)
/evolua/components   → gerenciar componentes
```

### Fase 2 — Publicar página
Botão "Publicar" muda status → a página aparece pro runtime

### Fase 3 — Auth básico
Login no cockpit (NextAuth ou Credentials)

### Fase 4 — @evolua/next consumindo API real
O runtime no app do usuário busca do SaaS real (não local)

### Fase 5 — Marketplace (futuro)
Blocos, templates, componentes prontos

---

## Histórico de Mudanças de Conceito

| Fase | Conceito | Motivo da mudança |
|---|---|---|
| Original | Editor de AST que gera código | Complexidade alta (server-side code gen) |
| Nova | SaaS guarda modelo + runtime leve renderiza | Mais prático, mesmo poder semântico |
| Atual | `apps/web` = SaaS (localhost) | Já tem Prisma + API + seed funcionando |

---

## Keys

- **Modelo** = JSON com nodes (ViewNode, DataNode, BehaviorNode, RouteNode)
- **Renderizar** = `runtime.tsx` lê nodes e devolve React
- **Publicar** = salvarer no DB com status `published`
- **Runtime externo** = `@evolua/next` busca via API HTTP
