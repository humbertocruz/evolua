# Multidimensional App Repository

## Ideia

Criar um produto novo, separado do Evolua como editor/authoring system, para funcionar como **repositório de apps multidimensionais**.

Em vez de armazenar apenas código e diff textual, esse produto armazenaria:
- modelo canônico do app
- projeções multidimensionais
- histórico semântico
- snapshots estruturais
- artifacts gerados (opcionalmente)

## Relação com o Evolua

### Evolua
Responsável por:
- criar
- editar
- operar semanticamente
- projetar
- gerar artifacts/código

### Repositório multidimensional
Responsável por:
- salvar apps multidimensionais
- versionar semanticamente
- comparar snapshots
- armazenar projeções
- suportar colaboração futura

## Hipótese central

Se o Evolua trata o app como um **objeto multidimensional**, então o versionamento ideal também não deveria depender só de diff textual.

## Entidades candidatas

- `AppRepository`
- `AppSnapshot`
- `OperationLog`
- `SemanticChangeSet`
- `ProjectionPack`
- `BuildArtifact`
- `SemanticBranch`
- `SemanticMerge`

## MVP possível

Um MVP não precisa substituir Git.

Pode começar como:
- armazenamento de snapshots do modelo canônico
- histórico de operações semânticas
- semantic diff entre snapshots
- export/import de projeto Evolua

## Perguntas abertas

- Esse repositório nasce como parte do Evolua ou como produto realmente separado?
- Ele armazena apenas modelo ou também artifacts gerados?
- O versionamento é append-only por operações, por snapshot, ou híbrido?
- Como branches e merges funcionariam sem cair de volta em diff textual comum?
- Como ele se relaciona com Git tradicional?
