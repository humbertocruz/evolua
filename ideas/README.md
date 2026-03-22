# Evolua Ideas

Esta pasta reúne ideias estratégicas, conceitos de produto e perguntas abertas do ecossistema Evolua.

## Objetivo

Separar do core técnico aquilo que ainda está em exploração conceitual, como:
- novos produtos do ecossistema
- decisões arquiteturais grandes
- formatos de arquivo
- versionamento semântico
- storage local vs remoto
- modos de operação do Evolua
- decisões de runtime/distribuição (ex.: Tauri + web UI)

## Conteúdo inicial

- `current-direction.md` → bússola do momento: o que está valendo agora, o que está em aberto e o que foi hipótese anterior
- `create-evolua-flow.md` → definição do papel do create-evolua e da responsabilidade do pacote evolua
- `nextjs-target-notes.md` → nuances do target Next.js, incluindo páginas, `app/api` e SSR


- `multidimensional-app-repo.md` → conceito de um produto/repositório para apps multidimensionais criados pelo Evolua
- `open-questions.md` → perguntas abertas sobre persistência, runtime, backend, arquivos e operação local/remota
- `project-structure-v0.md` → rascunho de como um projeto Evolu[a] pode existir na memória e no disco
- `file-shapes-v0.md` → shapes iniciais dos arquivos centrais e dos arquivos por dimensão
- `ai-interaction-with-live-app.md` → cenário de IA operando o app aberto diretamente no modelo, sem editar código
- `agent-protocol-v0.md` → rascunho do protocolo/skill para ensinar IAs a entender e operar o Evolu[a] (Cognitive Bridge)
- `self-evolution.md` → ideia de bootstrapping: o Evolu[a] evoluir até construir progressivamente a si mesmo
- `mvp-0.md` → primeiro recorte implementável para provar IA operando o app vivo pelo modelo canônico
- `app-evolution-phases.md` → rascunho da ideia de apps evoluindo por fases/maturidade dentro do Evolu[a]
- `semantic-model-editor.md` → ideia de fallback/manual assistido por edição estrutural do modelo + actions semânticas
- `action-catalog-v0.md` → rascunho do catálogo de actions semânticas e como evitar engessamento
- `local-connector.md` → necessidade de conector local opcional para recursos privados em um produto SaaS-first
