# Local Connector

## Ideia central

Mesmo com o Evolu[a] seguindo como **SaaS-first**, o produto deve prever um **conector local opcional** para acessar recursos privados do ambiente do usuário.

## Problema que resolve

Um produto SaaS puro não consegue acessar diretamente:
- bancos locais do usuário
- containers Docker locais
- APIs internas/rede privada
- arquivos locais relevantes

Isso cria atrito especialmente quando o usuário quer conectar o app em recursos que ainda não estão na nuvem.

## Direção proposta

### Evolu[a] como SaaS-first, mas não cloud-only

O editor, catálogo de actions, IA e ambiente principal continuam centralizados.

Mas o usuário pode instalar um **Local Connector** que:
- roda na máquina dele
- acessa recursos locais/privados
- conversa com a plataforma do Evolu[a]
- expõe capacidades de forma controlada e segura

## Casos de uso

- conectar banco PostgreSQL/MySQL local
- acessar banco rodando em Docker
- consultar APIs privadas da rede local
- ler dados e schemas de ambientes locais
- talvez acionar runtimes/previews locais no futuro

## Observação importante

Já existe um antecedente parcial dessa ideia no projeto **ZapFarma**:
- foi feito um connector mais simples
- focado em fazer query em 1 ou 2 tabelas do banco do usuário

No Evolu[a], o conector tende a ser:
- mais amplo
- mais dinâmico
- mais genérico
- mais integrado ao modelo multidimensional

## Diferença conceitual em relação ao connector simples

### Connector simples
- consulta pontual
- escopo fechado
- poucas tabelas
- baixa variação

### Connector do Evolu[a]
- precisa servir a múltiplos apps e contextos
- precisa lidar com mais tipos de recurso
- pode precisar expor schemas, queries, introspecção e capacidades
- pode virar parte essencial da ponte entre ambiente local e plataforma SaaS

## Resumo curto

> O Evolu[a] pode seguir como SaaS-first, desde que preveja um Local Connector opcional para acessar bancos, APIs e ambientes privados do usuário. Esse conector é conceitualmente mais complexo e dinâmico do que o connector simples já feito no ZapFarma.
