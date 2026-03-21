# Semantic Model Editor

## Ideia central

Sem IA, o usuário ainda deve conseguir operar o app diretamente no **modelo multidimensional**.

Mas isso não precisa significar editar JSON cru sem ajuda.

A proposta é um **Semantic Model Editor**:
- editor estrutural do modelo
- com autocomplete
- com validação contextual
- com sugestões semânticas
- com ações prontas para acelerar mudanças frequentes

## Por que isso importa

Isso evita dois extremos ruins:
- depender totalmente de IA
- construir cedo demais um editor visual manual enorme

O usuário continua operando a camada certa do sistema:
- `structure`
- `visual`
- `data`
- `behavior`

## Forma de interação

### 1. Edição direta assistida
O usuário pode editar os arquivos/dimensões do projeto com:
- autocomplete por schema
- sugestões de campos válidos
- snippets
- validação semântica

### 2. Actions / Recipes
Além da edição direta, o usuário pode disparar ações pré-montadas.

## Inspiração: Actions do macOS

Uma boa referência é a ideia de **actions agrupadas por tipo**, com:
- entrada
- saída
- categorias
- composição de ações

## Aplicação no Evolu[a]

O Evolu[a] pode oferecer ações semânticas agrupadas por dimensão/tipo, por exemplo:

### Structure
- criar tela
- adicionar seção
- adicionar componente
- mover nó estrutural
- extrair componente

### Visual
- aplicar variante visual
- mudar cor
- alterar spacing
- trocar layout
- adicionar estilo base

### Data
- criar entidade
- criar state
- criar query
- conectar binding
- ligar fonte de dados a destino

### Behavior
- criar evento
- criar ação
- conectar evento a rota
- adicionar efeito
- adicionar transição

## Modelo mental de action

Cada action pode ter:
- `type`
- `category`
- `input`
- `output`
- `preconditions`
- `effects`

### Exemplo conceitual

```json
{
  "type": "visual.set-color",
  "category": "visual",
  "input": {
    "nodeId": "structure:text:forgot-password-link",
    "color": "red"
  },
  "output": {
    "updatedDimension": "visual"
  }
}
```

## Relação com a IA

Com IA:
- a IA pode acionar essas mesmas actions/operations via engine

Sem IA:
- o usuário pode acionar actions manualmente
- ou editar o modelo com assistência

## Benefício estratégico

Isso cria uma base comum para:
- interação por IA
- interação manual assistida
- evolução do app sem depender de código textual bruto

## Resumo curto

> O Semantic Model Editor é a forma de permitir que o usuário opere diretamente o modelo multidimensional com assistência, enquanto actions semânticas agrupadas por tipo/entrada/saída fornecem um modo prático de evolução mesmo sem IA.
