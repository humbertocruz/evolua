# Evolu[a]

- **Evolu[a] Cloud** como produto SaaS
- **Next.js do usuário** permanecendo livre
- **runtime local leve** para resolver rotas e renderizar o que vem do Evolu[a]
- **marketplace** como camada natural do ecossistema

A direção oficial atual está em `ideas/current-direction.md`.

## Arquitetura

```
Evolua/
├── apps/
│   └── web/                 # SaaS — cockpit, editor, home pública
├── packages/
│   ├── types/               # Contrato compartilhado (EvoluaPage, PageNode, etc.)
│   ├── db/                  # Prisma schema + cliente singleton
│   ├── ui/                  # Componentes React (Button, Card, Input)
│   ├── runtime/             # Motor de renderização de nodes → React
│   ├── core/                # Lógica central (experimentos)
│   └── next/                # Runtime leve pra Next.js do usuário
├── templates/
│   └── default/             # Template oficial — o que o usuário baixa
├── scripts/
│   └── publish.sh           # Publish de todos os packages no npm
└── ideas/
    └── current-direction.md # Direção de produto
```

## Packages (@evolua/*)

| Package | Descrição |
|---------|-----------|
| `@evolua/types` | Tipos compartilhados (PageNode, VisualConfig, etc.) |
| `@evolua/db` | Prisma schema + `createPrismaClient()` + seed |
| `@evolua/ui` | Componentes React (Button, Card, Input) |
| `@evolua/runtime` | `renderPage(page)` — renderiza nodes como React |
| `@evolua/next` | Runtime leve pro Next.js do usuário |

## Dev

```bash
# Rodar o SaaS localmente
npm run dev:web

# Build do SaaS
npm run build:web

# Publicar packages no npm (requer NPM_TOKEN)
export NPM_TOKEN=your_token_here
npm run publish
```

## Publish no npm

O npmjs exige OAuth (token + 2FA) para publicar packages em scope.

1. Crie um token em [npmjs.com/settings/tokens](https://www.npmjs.org/settings/tokens) — nível **Automation**
2. `export NPM_TOKEN=xxxx`
3. `npm run publish`

O script `scripts/publish.sh` publica todos os packages de uma vez, **só versões novas** (não sobrepõe o que já existe no npm).

## Dogfooding: Home do SaaS

A home pública do SaaS (`/`) é renderizada pelo próprio `@evolua/runtime`, consumindo nodes do banco. Isso é a prova de conceito viva — "esta página foi feita com a ferramenta que você vai baixar".

## Status atual

- [x] Auth, Projects, Pages — funcionando no SaaS
- [x] `@evolua/db`, `@evolua/ui`, `@evolua/runtime` — criados
- [x] `scripts/publish.sh` — pronto pro npm
- [ ] Home do SaaS renderizada pelo Evolua runtime (próximo passo)
- [ ] Publish dos packages no npm
