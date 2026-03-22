# Current Direction

> Este arquivo consolida a direção oficial atual do Evolu[a].
> Outros arquivos em `ideas/` podem conter conceitos úteis, mas este documento é a bússola principal.

## 1. Tese central

O **Evolu[a] é um produto SaaS** que armazena e opera o modelo do app na nuvem.

O app do usuário **não precisa virar um projeto interno do Evolu[a]**.
Em vez disso, o usuário conecta seu app Next.js ao Evolu[a] por meio de um **runtime leve**.

Resumo da tese:
- o **Evolu[a] Cloud** guarda o projeto, as telas, componentes, visual, schemas e outras entidades semânticas
- o **app Next.js do usuário** continua livre, limpo e dono da sua própria stack
- o **runtime local** resolve rotas e renderiza localmente o que vem do modelo do Evolu[a]

Frase-guia:

> O Next renderiza. O Evolu[a] pensa o app.

---

## 2. Papel de cada parte

### 2.1 Evolu[a] Cloud

O SaaS do Evolu[a] é a fonte de verdade de alto nível.

Ele deve concentrar:
- autenticação e contas
- projetos do usuário
- páginas e componentes semânticos
- visual, schemas, data e outras camadas do modelo
- marketplace
- catálogo oficial de blocos, telas, templates e packs
- edição/authoring do app
- versionamento, publicação e coordenação futura

### 2.2 Runtime local no app Next.js

O projeto do usuário recebe apenas uma camada mínima de integração.

Esse runtime deve:
- rodar dentro do Next.js do usuário
- resolver a rota atual
- consultar o Evolu[a] Cloud
- obter a definição da página/componente correspondente
- renderizar isso localmente no app

Idealmente, a integração local deve ser simples, algo próximo de:
- instalar um pacote (`@evolua/next`, nome provisório)
- configurar `projectId`, endpoint e token
- adicionar uma rota dinâmica como `src/app/[[...slug]]/page.tsx`

### 2.3 Projeto do usuário

O projeto do usuário **permanece livre**.

O Evolu[a] não deve obrigar:
- Prisma
- banco específico
- UI library específica
- estrutura rígida de pastas
- abandono de páginas manuais

O usuário pode continuar tendo:
- páginas próprias em `/app`
- `app/api`
- banco próprio
- componentes próprios
- qualquer stack que faça sentido para ele

---

## 3. O que o Evolu[a] NÃO deve ser agora

Neste momento, o Evolu[a] **não deve ser**:
- um fork do Next.js
- um framework que toma posse do projeto do usuário
- um formato local obrigatório tipo `.evolua/` como eixo principal
- um builder pesado que gera um projeto inteiro a cada mudança
- uma plataforma que força o usuário a adotar um banco, ORM ou biblioteca visual específica

A proposta atual é de **integração leve com alto poder semântico**, não de substituição total do ecossistema do usuário.

---

## 4. Marketplace

O marketplace é uma peça natural do produto.

Ele não deve se limitar a UI estética.
Pode incluir:
- componentes
- telas prontas
- blocos
- fluxos
- templates de app
- packs semânticos
- schemas e estruturas reutilizáveis
- no futuro, talvez actions e integrações mais avançadas

A instalação ideal deve acontecer no nível do projeto do Evolu[a] Cloud, e o runtime local do usuário apenas passa a consumir/renderizar o que foi instalado.

---

## 5. Instalação / onboarding

A direção mais promissora hoje é:
- o usuário conhece e cria projeto no **Evolu[a] Cloud**
- depois conecta seu app local com uma integração pequena

Ou seja:
- **usar o Evolu[a}** começa na nuvem
- **conectar o Evolu[a] ao app local** acontece por pacote/runtime

O onboarding ideal deve evitar pedir uma instalação pesada logo no primeiro contato.

---

## 6. Local connector / bridge

Pode existir no futuro um **connector local opcional**.

Esse connector serviria para casos em que o SaaS sozinho não alcança:
- bancos locais
- Docker local
- APIs privadas
- arquivos internos do projeto
- introspecção de ambiente do usuário

Mas isso deve ser tratado como **camada complementar**, não como requisito da arquitetura base do produto.

---

## 7. Sobre edição semântica e IA

A IA continua central para a visão do Evolu[a], mas operando sobre o modelo que vive no SaaS.

Direções que continuam válidas:
- o usuário deve poder editar o app por intenção, não só por código textual
- o sistema deve oferecer uma camada semântica real sobre páginas, componentes, visual e dados
- uma IA externa pode precisar de uma ponte/documentação/protocolo para entender como operar o Evolu[a]

O fallback manual também continua importante:
- editor semântico
- actions semânticas
- formas visuais/estruturadas de operar o modelo sem depender exclusivamente de IA

---

## 8. Papel do `packages/evolua-next`

O `packages/evolua-next` continua importante como referência prática da nova direção.

Ele já aponta para ideias úteis como:
- host no Next.js
- rota dinâmica
- runtime de renderização
- cockpit `/evolua`
- experiência visual inicial

Porém, ele deve evoluir para refletir a arquitetura nova:
- menos foco em modelo local como fonte primária
- mais foco em runtime local conectado ao Evolu[a] Cloud

---

## 9. Próximo passo mais coerente

Os próximos passos mais coerentes agora são:

1. definir o **contrato técnico mínimo** entre Cloud e runtime Next
2. definir como o runtime autentica e busca páginas/componentes
3. definir quais entidades vivem no SaaS no v1
4. desenhar como o usuário conecta um projeto Next existente ao Evolu[a]
5. adaptar `evolua-next` para consumir dados remotos, não apenas modelo local

---

## Resumo curto

> A direção oficial atual do Evolu[a] é: produto SaaS como fonte de verdade do modelo, marketplace e authoring; app Next.js do usuário permanecendo livre; e um runtime local leve resolvendo rotas e renderizando localmente o que vem do Evolu[a] Cloud.
