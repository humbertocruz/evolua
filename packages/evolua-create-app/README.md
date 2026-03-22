# evolua-create-app

CLI inicial para gerar a estrutura base de um app Evolu[a].

## Uso local

```bash
cd evolua-create-app
npm install
npm run create -- my-app
```

Isso cria:

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

O `package.json` do app já nasce com:
- scripts `dev` e `build`
- dependência do pacote `evolua`
- target inicial `nextjs`
