# create-evolua Flow

## Objetivo

Definir o papel inicial do `create-evolua` no ecossistema Evolu[a].

## Responsabilidade do `create-evolua`

O `create-evolua` deve criar a estrutura mínima e canônica de um app Evolu[a].

### Ele deve:
1. criar a pasta do projeto
2. criar os arquivos JSON principais
3. criar as dimensões canônicas
4. criar um `package.json` mínimo que declare o pacote `evolua` e o target inicial

### Ele não precisa, nesse primeiro momento:
- gerar dezenas de arquivos Next.js
- materializar o app completo
- montar a saída final do framework

Essa parte deve ficar com o **pacote `evolua`**.

## Estrutura esperada

```txt
my-app.evolua/
  app.evolua.json
  package.json
  dimensions/
    structure.evolua.json
    visual.evolua.json
    data.evolua.json
    behavior.evolua.json
```

## Papel do `package.json`

O `package.json` do projeto pode ser simples, mas deve declarar:
- dependência do pacote `evolua`
- target escolhido
- scripts básicos do ecossistema

Exemplo conceitual:

```json
{
  "name": "my-app",
  "private": true,
  "scripts": {
    "dev": "evolua dev",
    "build": "evolua build"
  },
  "dependencies": {
    "evolua": "workspace:*"
  },
  "evolua": {
    "target": "nextjs"
  }
}
```

## Target inicial

### Decisão inicial
O primeiro target será:
- `nextjs`

## Papel do pacote `evolua`

O pacote `evolua` ficará responsável por:
- ler o projeto canônico
- entender o target (`nextjs`)
- materializar o app em estrutura compatível com Next.js
- manter essa materialização atualizável quando o app mudar

## A magia do produto

A parte mágica do Evolu[a] está aqui:

> transformar meia dúzia de arquivos JSON multidimensionais em dezenas de arquivos Next.js — e manter isso atualizável rapidamente quando o app mudar.

## Implicação importante

O valor do produto não está em começar gerando tudo no `create-evolua`.

O valor está em:
- manter o projeto canônico pequeno e claro
- e deixar a materialização ser responsabilidade do `evolua`

## Resumo curto

> `create-evolua` cria o projeto canônico mínimo. O pacote `evolua` pega esse projeto, entende o target inicial (`nextjs`) e faz a materialização dinâmica do app para um projeto web real.
