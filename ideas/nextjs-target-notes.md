# Next.js Target Notes

## Observações importantes para o target `nextjs`

O target `nextjs` não deve ser tratado como um bloco único e genérico.

Existem diferenças importantes que o Evolu[a] precisa modelar ao materializar o app.

## 1. Rotas de front vs rotas de back

No ecossistema Next.js existem pelo menos dois grupos importantes de rotas:

### Front routes
Exemplos:
- `app/page.tsx`
- `app/login/page.tsx`
- `app/dashboard/page.tsx`

Essas rotas representam a navegação/interface do app.

### Back/API routes
Exemplos:
- `app/api/users/route.ts`
- `app/api/auth/login/route.ts`

Essas rotas representam endpoints backend do app.

## Implicação para o Evolu[a]

Mesmo que isso seja algo específico do target `nextjs`, o Evolu[a] precisa reconhecer essa diferença na materialização.

### Possível consequência no modelo/target layer
O target `nextjs` pode precisar distinguir algo como:
- `routeType: "page"`
- `routeType: "api"`

ou equivalente.

## 2. SSR nas rotas de front

No Next.js, rotas de front podem ter comportamento importante relacionado a:
- SSR
- SSG
- dinâmica de renderização
- cache/revalidate

Isso também é relevante para o target.

## Implicação para o Evolu[a]

Mesmo que o modelo canônico não precise nascer totalmente preso à linguagem do Next.js, o target `nextjs` provavelmente precisará representar metadados como:
- se a rota é renderizada no servidor
- se é estática
- se é dinâmica
- se tem revalidate/cache

## 3. Conclusão prática

Ao evoluir o target `nextjs`, é importante lembrar que:
- nem toda rota é uma página visual
- existem rotas de API/backend
- e rotas de front podem carregar metadados de SSR/renderização

## Resumo curto

> No target `nextjs`, o Evolu[a] deve considerar a diferença entre rotas de front e rotas de API, além de metadados relevantes de SSR/renderização nas rotas visuais.
