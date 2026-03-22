# Evolu[a]

Evolu[a] está entrando em uma fase mais clara:

- **Evolu[a] Cloud** como produto SaaS
- **Next.js do usuário** permanecendo livre
- **runtime local leve** para resolver rotas e renderizar o que vem do Evolu[a]
- **marketplace** como camada natural do ecossistema

A direção oficial atual está em:

- `ideas/current-direction.md`

## Estrutura atual

```txt
Evolua/
  apps/
    web/              # app principal do Evolu[a] (SaaS / cockpit / referência visual)
  packages/
    core/             # lógica central e experimentos reaproveitáveis
  ideas/              # direção de produto, arquitetura e explorações conceituais
  legacy/             # protótipos e material antigo preservado no repositório
```

## Pastas

### `apps/web`
App Next.js principal do projeto neste momento.

Hoje ele serve como:
- base visual do cockpit do Evolu[a]
- referência para o SaaS
- lugar natural para continuar a evolução do produto web

### `packages/core`
Pacote central com código experimental/reaproveitável ligado ao núcleo conceitual do Evolu[a`.
Ainda precisa ser refinado conforme a arquitetura nova for se consolidando.

### `ideas/`
Documentação viva de direção.
Se houver conflito entre arquivos, use `ideas/current-direction.md` como fonte oficial.

### `legacy/`
Material antigo mantido por histórico e reaproveitamento pontual.
Não deve ser tratado como base oficial da arquitetura atual.

## Próximos passos naturais

- transformar `apps/web` no embrião oficial do Evolu[a] SaaS
- extrair, com calma, os futuros pacotes `@evolua/*` quando as fronteiras ficarem claras
- adaptar o runtime para consumir dados remotos do Evolu[a] Cloud

## Scripts úteis

Da raiz do monorepo:

```bash
npm run dev:web
npm run build:web
npm run lint:web
```
