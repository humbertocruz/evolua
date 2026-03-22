# Next.js Target V1

## Objetivo

Definir o estado real do target `nextjs` no Evolu[a] v1, sem prometer magia interdimensional antes da hora.

O foco atual é provar um fluxo funcional e coerente de:

1. projeto canônico Evolu[a]
2. materialização para runtime Next.js em `.evolua/nextjs-app`
3. páginas e shell geradas a partir das dimensões canônicas

---

## Escopo do V1

O target `nextjs` v1 suporta um recorte simples e controlado.

### Dimensões atualmente usadas

- `structure`
- `visual`
- `data`
- `behavior`
- `surface`

### Papel de cada dimensão

#### `structure`
Responsável por:
- páginas
- seções
- hierarquia básica
- organização semântica dos nós

#### `visual`
Responsável por:
- `componentType`
- `props`
- `styleTokens`
- `layout.variant`
- `meta` por página

#### `behavior`
Responsável por:
- rotas simples
- ligação de páginas a paths
- transições básicas

#### `surface`
Responsável por:
- root layout
- metadata global
- idioma do documento
- tema global
- tokens visuais globais usados na shell

---

## Component types suportados no V1

### Patterns / shells
- `Page`
- `AuthCard`

### Primitives
- `Text`
- `TextField`
- `PasswordField`
- `Button`
- `Link`

Esses tipos ainda são propositalmente poucos. A meta do V1 é fazer o simples funcionar bem antes de abrir a porteira para widgets complexos.

---

## Arquivos materializados pelo target

Hoje o target `nextjs` materializa pelo menos:

### Shell global
- `src/app/layout.tsx`
- `src/app/globals.css`

### Components base do target
- `src/components/evolua/PageShell.tsx`
- `src/components/evolua/AuthCard.tsx`
- `src/components/evolua/TextField.tsx`
- `src/components/evolua/Button.tsx`
- `src/components/evolua/LinkText.tsx`

### Pages
- `src/app/page.tsx`
- `src/app/<route>/page.tsx`

---

## Estratégia atual de materialização

O target usa um catálogo mínimo local embutido no próprio materializer.

### Ideia atual
- o modelo canônico descreve a intenção
- o target `nextjs` materializa essa intenção em componentes e páginas reais
- as páginas geradas usam components base do target, em vez de HTML totalmente inline

### Situação atual
Já existe um registry simples baseado em:
- `node.kind`
- `visual.componentType`

Ainda é um V1 enxuto, mas já evita concentrar tudo em um único arquivo gigante de `if/else`.

---

## Runtime `.evolua`

### Decisão atual
O runtime do target `nextjs` vive em:

```txt
.evolua/nextjs-app
```

Esse runtime é considerado:
- local
- persistente entre execuções
- regenerável parcialmente
- subordinado ao projeto canônico

### Consequência importante
O projeto canônico **não é** o app Next.js.

O app Next.js é uma projeção/materialização operacional mantida em `.evolua/nextjs-app`.

---

## `node_modules` no V1

### Decisão atual
Cada runtime fica no próprio quadrado.

Portanto, no V1:

```txt
.evolua/nextjs-app/node_modules
```

pertence ao runtime gerado pelo target.

### Motivação
Essa decisão evita:
- acoplamento prematuro com a raiz do projeto canônico
- dependências compartilhadas confusas
- workspace/monorepo complexity antes da hora
- efeitos colaterais entre múltiplos targets futuros

### Regra prática
- o runtime Next.js gerencia seu próprio `package.json`
- o runtime Next.js gerencia seu próprio `node_modules`
- o runtime Next.js gerencia seu próprio `.next`

Cada target cuida da sua bagunça.

---

## Próximo possível passo conceitual: dimensão `modules`

Existe uma hipótese promissora de adicionar futuramente uma dimensão ou bloco como `modules`, para declarar dependências esperadas do runtime.

### Ideia
Essa dimensão poderia descrever, de forma canônica ou semicanônica:
- módulos necessários por target
- dependências opcionais
- adapters de UI
- libs extras exigidas por certos patterns/widgets

### Exemplo de responsabilidades futuras de `modules`
- declarar uso de `shadcn`, `daisyui` ou outro adapter
- declarar dependências adicionais do target
- controlar instalações complementares além do scaffold base

### Status
**Ainda não implementado.**

No V1, a responsabilidade de dependências ainda está principalmente no target/materializer.

Observação importante: o projeto canônico não precisa necessariamente de `package.json`. A direção atual é concentrar target e package manager no `app.evolua.json`, deixando o `package.json` restrito ao runtime materializado em `.evolua/nextjs-app`.

---

## Fluxo atual do `evolua dev`

Hoje o `evolua dev` já faz parte do caminho, mas ainda não está completo como experiência de desenvolvimento viva.

### O que ele já faz
- localiza `app.evolua.json`
- resolve target
- cria `.evolua/`
- inicializa runtime Next.js com `create-next-app --empty`
- materializa shell, components e pages

### O que ainda falta para o `dev` ficar realmente completo
- iniciar o servidor `next dev`
- decidir melhor o ciclo de vida do processo
- possivelmente rematerializar arquivos antes de subir o runtime
- no futuro, observar mudanças no modelo e refletir no preview

---

## Fora de escopo do V1

Ainda **não** faz parte do V1:

- widgets complexos (`Pagination`, `DataTable`, `Combobox`, etc.)
- adapters reais para bibliotecas como `shadcn` ou `daisyui`
- catálogo SaaS oficial completo
- hot rematerialization contínua
- gerenciamento avançado de múltiplos targets
- compartilhamento inteligente de dependências entre runtimes
- resolução completa de API routes (`app/api`) além da base conceitual

---

## Resumo

O target `nextjs` v1 já prova que:

- o app canônico pode ser separado do runtime gerado
- `surface` pode controlar `layout.tsx` e `globals.css`
- `visual` pode dirigir pages e metadata
- `structure` pode dirigir a hierarquia de páginas
- o runtime pode viver em `.evolua/nextjs-app`
- `node_modules` pode permanecer encapsulado dentro do runtime

O próximo passo natural é transformar `evolua dev` em um comando de desenvolvimento completo, não apenas de preparação/materialização do runtime.
