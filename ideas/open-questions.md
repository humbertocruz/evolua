# Open Questions — Evolua

Estas perguntas são fundacionais e precisam ser refinadas antes de decisões maiores de arquitetura.

## 1. Qual é o arquivo principal do projeto?

Pergunta:
- o projeto Evolua será salvo em qual formato principal?

Possibilidades atuais:
- `.evolua.json` como modelo canônico principal
- `.3djson` apenas como projeção derivada espacial
- outro formato próprio no futuro

Hipótese atual:
- `.3djson` **não deve ser o arquivo principal do projeto**
- ele parece mais adequado como projeção/export derivada
- o principal deve ser o **modelo canônico** do app

## 2. O app vive em memória ou em arquivo?

Pergunta:
- o Evolua trabalha primariamente com o app carregado em memória e salva snapshots em arquivo?
- ou edita diretamente um arquivo persistido?

Hipótese forte:
- o app canônico provavelmente deve viver **em memória durante a edição**
- e ser persistido periodicamente/sob demanda como snapshot do modelo

## 3. Local ou servidor?

Pergunta:
- o Evolua funciona primeiro localmente, no dispositivo do usuário?
- ou o modelo canônico mora num backend/servidor desde o começo?

Possíveis direções:
- **local-first** no começo
- backend opcional depois para sync, colaboração e repositório multidimensional

Hipótese forte:
- local-first parece mais coerente com a fase inicial
- servidor pode entrar depois como camada de sync/versionamento/colaboração

## 4. Código é salvo continuamente ou gerado no fim?

Pergunta:
- o builder gera código continuamente durante a edição?
- ou o código só é materializado em pontos específicos?

Hipótese atual:
- o código não deve ser a fonte primária de verdade
- o builder deve materializar o código como saída derivada
- geração incremental pode existir, mas sem transformar o código em centro da arquitetura

## 5. Qual é a unidade de versionamento?

Pergunta:
- salvar versões por snapshot?
- por operação?
- por change set semântico?
- por combinação disso?

Hipótese promissora:
- modelo híbrido
  - snapshots ocasionais
  - log de operações semânticas entre snapshots

## 6. Como o projeto é aberto?

Pergunta:
- ao abrir um projeto, o Evolua carrega:
  - um único arquivo canônico?
  - uma pasta com modelo + projeções + artifacts?
  - um repositório remoto?

Essa resposta impacta todo o produto.

## 7. Spatial/VR é nativo ou projeção opcional?

Pergunta:
- o spatial é parte nativa do modelo desde o começo?
- ou é uma projeção opcional que pode existir ou não?

Hipótese atual:
- spatial / VR parece melhor como **projeção opcional poderosa**, não como obrigação estrutural de todo app

## Próximo passo sugerido

Transformar estas perguntas em decisões graduais, começando por:
1. definir o **formato canônico principal** do projeto
2. decidir se o Evolua é **local-first**
3. definir a relação entre **modelo em memória** e **persistência em arquivo**
4. só então discutir repositório multidimensional e versionamento semântico em maior detalhe
