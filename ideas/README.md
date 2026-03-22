# Evolua Ideas

Esta pasta reúne ideias estratégicas, direções de produto e explorações conceituais do ecossistema Evolu[a].

## Objetivo

Separar do core técnico aquilo que ainda está em definição, especialmente temas como:
- arquitetura do produto SaaS
- integração do runtime local com Next.js
- marketplace
- edição semântica
- IA operando o modelo do app
- connectors/bridges opcionais
- visão de longo prazo do ecossistema

## Ponto de verdade atual

O documento principal desta pasta é:

- `current-direction.md`

Ele funciona como a bússola oficial do momento.
Os outros arquivos podem conter:
- ideias complementares
- explorações futuras
- recortes parciais
- hipóteses ainda não consolidadas

## Direção atual resumida

Hoje, a visão mais forte do Evolu[a] é:
- **Evolu[a] como SaaS**
- **modelo do app vivendo na nuvem**
- **Next.js do usuário permanecendo livre**
- **runtime local leve** para resolver rotas e renderizar o que vem do Evolu[a] Cloud
- **marketplace** como camada natural do produto
- **bridge local** apenas como recurso opcional/futuro

## Conteúdo atual

- `current-direction.md` → direção oficial atual do produto
- `local-connector.md` → hipótese de connector/bridge local opcional para acessar recursos privados
- `agent-protocol-v0.md` → rascunho de como ensinar IAs externas a entender e operar o Evolu[a]
- `ai-interaction-with-live-app.md` → visão de IA interagindo com o app/modelo vivo
- `semantic-model-editor.md` → direção de edição manual/estruturada sem depender só de IA
- `action-catalog-v0.md` → ideias sobre catálogo de actions semânticas
- `app-evolution-phases.md` → visão de apps evoluindo por estágios dentro do Evolu[a]
- `self-evolution.md` → horizonte estratégico mais distante

## Regra prática

Se um arquivo desta pasta conflitar com `current-direction.md`, considere `current-direction.md` como fonte oficial.
