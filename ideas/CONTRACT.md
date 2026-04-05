# Contrato Técnico — SaaS ↔ Runtime

> "O Next.js renderiza. O Evolu[a] pensa o app."

## Arquitetura

```
┌─────────────────────────────────────────────────┐
│  Evolu[a] SaaS                                 │
│  - Modelo AST com múltiplas dimensões          │
│  - Editor / Authoring                          │
│  - Autenticação + Projetos                    │
│  - Marketplace                                 │
│  - Expõe API REST                             │
└──────────────────────────┬────────────────────┘
                           │ HTTP / JSON
                           ▼
┌─────────────────────────────────────────────────┐
│  @evolua/next (Runtime no Next.js do usuário)  │
│  - only: conecta no SaaS                        │
│  - Renderiza nodes do modelo                    │
│  - App continua livre e dono da stack          │
└─────────────────────────────────────────────────┘
```

## Contrato de API

### GET /projects/:projectId
Retorna o projeto completo com modelo e páginas.

```json
{
  "id": "proj_xxx",
  "name": "Meu App",
  "model": { /* AppModel completo */ },
  "pages": [
    { "id": "page_home", "route": "/", "name": "Home" },
    { "id": "page_about", "route": "/about", "name": "Sobre" }
  ],
  "createdAt": "2026-03-01T00:00:00Z",
  "updatedAt": "2026-03-27T00:00:00Z"
}
```

### GET /projects/:projectId/pages?route=:route
Retorna uma página específica por rota.

```json
{
  "id": "page_xxx",
  "projectId": "proj_xxx",
  "route": "/",
  "model": { /* AppModel */ },
  "updatedAt": "2026-03-27T00:00:00Z"
}
```

## Modelo (AppModel)

```typescript
interface AppModel {
  id: string;
  version: string;
  app: AppNode;        // nó raiz
  nodes: Record<string, ViewNode | DataNode | BehaviorNode | RouteNode>;
}
```

### NodeKinds

**View (visual):**
- `page` — página completa
- `layout` — layout compartilhado
- `section` — seção de conteúdo
- `component` — componente reutilizável
- `slot` — ponto de inserção
- `text` — texto

**Data (dados):**
- `entity` — entidade de dados
- `field` — campo
- `state` — estado reativo
- `query` — consulta
- `binding` — vínculo dado ↔ view

**Behavior (lógica):**
- `event` — evento
- `action` — ação
- `effect` — efeito colateral

**Structure:**
- `route` — rota (liga path → page)

## Exemplo de Uso

```typescript
// app/layout.tsx
import { EvoluaProvider } from "@evolua/next";

export default function Layout({ children }) {
  return (
    <EvoluaProvider
      config={{
        projectId: process.env.EVOLUA_PROJECT_ID!,
        endpoint: process.env.EVOLUA_ENDPOINT!,
        token: process.env.EVOLUA_TOKEN,
        debug: process.env.NODE_ENV === "development",
      }}
    >
      {children}
    </EvoluaProvider>
  );
}
```

```typescript
// app/[[...slug]]/page.tsx
import { EvoluPage } from "@evolua/next";

export default function Page() {
  return <EvoluPage />;
}
```

## Próximos Passos

1. [x] Tipos (`@evolua/types`) — definidos
2. [x] Runtime (`@evolua/next`) — esqueleto com client + renderer
3. [ ] API mock no `apps/web` — simular SaaS
4. [ ] Renderização real de componentes React (não só HTML)
5. [ ] Projeções (visual/structure/data/behavior)
6. [ ] Autenticação e tokens
7. [ ] Marketplace e templates
