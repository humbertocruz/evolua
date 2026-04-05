# Evolu[a]

**A plataforma que devs usam pra entregar projetos 3x mais rápido.**

Build apps com um cockpit visual, exporte código Next.js real e entregue ao cliente. O cliente edita pelo cockpit — você foca no que tem valor.

---

## O que é

- **Evolu[a] Cloud** — cockpit visual (SaaS) onde você modela apps sem escrever código
- **Eject** — exporta um projeto Next.js 100% standalone como zip
- **@evolua/next** — runtime leve que conecta apps no cockpit (opcional)
- **Marketplace** — templates e componentes compartilháveis (futuro)

## Para quem é

### Devs que entregam projetos
Modela o app no cockpit → Eject → ZIP → deploy na Vercel do cliente.  
O cliente edita textos, imagens e estrutura pelo cockpit. Você entrega mais rápido, cobra manutenção recorrente.

### Equipes e makers
Prototipa em horas, ejeta quando precisa de código real, ajusta manualmente se quiser.

---

## Arquitetura

```
Evolua/
├── apps/
│   └── web/                 # SaaS — cockpit, editor, home pública
├── packages/
│   ├── types/               # Contrato compartilhado
│   ├── db/                  # Prisma schema + cliente singleton
│   ├── ui/                  # Componentes React
│   ├── runtime/             # Motor de renderização de nodes → React
│   ├── core/                # Lógica central (experimentos)
│   └── next/                # Runtime leve pra app do usuário
├── templates/
│   └── default/             # Template oficial — base do Eject
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
| `@evolua/next` | Runtime leve pro app do usuário |

## Fluxo: Eject

1. Modele páginas no cockpit (`/evolua/pages`)
2. Clique em **Exportar → Eject**
3. Baixa um ZIP com projeto Next.js completo
4. Deploya na Vercel — app 100% standalone, sem dependência do Evolu[a] pra rodar

```
Cliente recebe → código Next.js normal
               → banco PostgreSQL próprio
               → domínio próprio
               → pode continuar editando pelo cockpit do Evolu[a] (opcional)
```

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

1. Crie um token em [npmjs.com/settings/tokens](https://www.npmjs.org/settings/tokens) — nível **Automation**
2. `export NPM_TOKEN=xxxx`
3. `npm run publish`

## Status

- [x] Auth, Projects, Pages — funcionando no SaaS
- [x] Eject — exportação de ZIP com projeto Next.js real
- [x] `@evolua/db`, `@evolua/ui`, `@evolua/runtime` — publicados
- [x] Cockpit de edição de páginas (nodes)
- [ ] Editor visual de páginas (arrastar, redimensionar)
- [ ] Marketplace de templates e componentes
- [ ] Deploy automático via API Vercel
- [ ] Publish dos packages no npm
