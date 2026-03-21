# Evolu[a] Project Structure v0

> Rascunho para discutir como um projeto Evolu[a] existe em memória, no disco e em relação aos artifacts gerados.

## 1. Princípio central

O projeto deve ter uma **fonte canônica de verdade**.

Essa fonte **não** deve ser:
- o código gerado
- o `.3djson`
- o preview
- artifacts de builder

A fonte canônica deve ser o **modelo multidimensional do app**.

## 2. Memória vs disco

### Em memória
Durante a edição, o projeto vive como:
- `AppModel` canônico carregado na memória
- estado de edição auxiliar (seleção, foco, projeção ativa, viewport, inspector, histórico local de undo/redo)
- projeções deriváveis sob demanda

### No disco
No disco, o projeto deve persistir:
- modelo canônico
- metadados do projeto
- snapshots opcionais
- artifacts derivados apenas quando explicitamente gerados ou cacheados

## 3. Formato canônico principal

### Hipótese v0
O principal deve ser um arquivo como:
- `app.evolua.json`

ou
- `model.evolua.json`

Esse arquivo guarda:
- app model
- nodes
- projections declaradas
- build targets
- meta do projeto

### Importante
`.3djson` **não** deve ser o arquivo principal.

Ele parece melhor como:
- projeção espacial derivada
- export
- cache opcional
- input para viewer 3D / XR

## 4. Estrutura de pasta sugerida

```txt
my-app.evolua/
  evolua.json                # manifesto do projeto
  model/
    app.evolua.json          # modelo canônico principal
    snapshots/
      2026-03-21T12-00-00.evolua.json
      2026-03-21T12-30-00.evolua.json
    operations/
      log.jsonl              # log semântico opcional
  projections/
    structure.txt            # derivado/opcional
    data.txt                 # derivado/opcional
    behavior.txt             # derivado/opcional
    app.3djson               # derivado/opcional
  artifacts/
    web/
    prisma/
    preview/
  .evolua/
    cache/
    session/
    locks/
    local-state.json
```

## 5. Papel de cada camada

### `evolua.json`
Manifesto do projeto.

Pode guardar:
- nome
- versão do formato
- caminho do modelo principal
- targets habilitados
- preferências de workspace
- modo local/remoto

### `model/app.evolua.json`
Coração do projeto.

Deve conter:
- modelo canônico multidimensional
- fonte primária de verdade

### `model/snapshots/`
Snapshots pontuais do modelo.

Úteis para:
- restore
- histórico
- semantic diff
- versionamento local inicial

### `model/operations/log.jsonl`
Log de operações semânticas.

Útil para:
- replay
- auditoria
- undo/redo avançado
- base futura de git semântico

### `projections/`
Materializações legíveis/derivadas do modelo.

Exemplos:
- structure
- data
- behavior
- `.3djson`

### `artifacts/`
Saída do builder.

Exemplos:
- app Next.js gerado
- schema Prisma
- outros outputs concretos

### `.evolua/`
Infra local/temporária.

Exemplos:
- cache
- locks
- estado de sessão
- dados regeneráveis

## 6. O que é canônico vs derivado

### Canônico
- `evolua.json`
- `model/app.evolua.json`
- talvez snapshots e operation log

### Derivado
- `projections/*`
- `.3djson`
- structure/data/behavior textuais
- código gerado
- preview exports

## 7. Fluxo ideal de trabalho

1. abrir projeto
2. carregar `model/app.evolua.json` em memória
3. operar semanticamente no `AppModel`
4. atualizar projeções em memória ou sob demanda
5. autosave do modelo canônico
6. gerar projections/artifacts quando necessário

## 8. Local-first

### Hipótese forte v0
Evolu[a] deve nascer **local-first**.

Razões:
- mais simples
- mais determinístico
- menos dependência de backend cedo demais
- combina com experimentação estrutural

### Servidor depois
Servidor pode entrar depois para:
- sync
- colaboração
- snapshots remotos
- semantic repo
- publish/distribution

## 9. Relação com o código gerado

O código gerado deve ser tratado como:
- artifact
- build output
- export materializado

Não como a principal superfície de edição.

## 10. Perguntas ainda abertas

- `evolua.json` e `app.evolua.json` devem ser separados mesmo ou um só arquivo basta no v0?
- snapshots devem ser automáticos ou só por save/checkpoint?
- operation log nasce já no v0 ou só depois?
- projections ficam salvas sempre ou só sob demanda?
- artifacts fazem parte do projeto ou de um diretório de saída externo?
- o semantic repo futuro usa esse mesmo formato ou uma forma remota derivada?

## Decisão adicional registrada

### Structure, visual, data e behavior no v0
No Evolu[a] v0:
- `structure` será tratada como dimensão canônica de organização
- `visual` será uma projeção/materialização da structure, mas ainda uma dimensão canônica do projeto
- `data` será uma dimensão canônica própria
- `behavior` será uma dimensão canônica própria

Isso abre espaço para:
- múltiplos visuais sobre a mesma estrutura
- menor acoplamento entre composição e aparência
- modelagem rica de dados e comportamento
- fidelidade maior ao conceito de App Multidimensional

## 11. Direção estratégica

A estrutura de projeto deve favorecer:
- modelo canônico forte
- operação em memória
- persistência segura
- projeções derivadas
- builder no final
- transição futura para semantic versioning / semantic repo

## Resumo curto

> Um projeto Evolu[a] deve ter um modelo canônico principal, operar em memória durante a edição, persistir snapshots de forma segura e tratar código, `.3djson` e outras projeções como derivados — não como fonte primária de verdade.
