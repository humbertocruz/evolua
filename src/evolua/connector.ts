import { Project, SyntaxKind, StructureKind } from "ts-morph";
import * as path from "path";

async function connectServiceToUI() {
  console.log("🌸 Genesis: Conectando o Serviço de Filmes à UI do Dashboard...");

  const project = new Project();
  const dashboardPath = path.join("data", "dashboard.tsx");
  const sourceFile = project.addSourceFileAtPath(dashboardPath);

  // 1. Adicionar imports necessários
  sourceFile.addImportDeclaration({
    moduleSpecifier: "./movie-service",
    namedImports: ["getMovieDetails", "Movie"]
  });

  // Garantir que temos useState e useEffect do React
  const reactImport = sourceFile.getImportDeclaration(i => i.getModuleSpecifierValue() === "react");
  if (reactImport) {
    const namedImports = reactImport.getNamedImports().map(n => n.getName());
    if (!namedImports.includes("useState")) reactImport.addNamedImport("useState");
    if (!namedImports.includes("useEffect")) reactImport.addNamedImport("useEffect");
  } else {
    sourceFile.addImportDeclaration({
      moduleSpecifier: "react",
      namedImports: ["useState", "useEffect"]
    });
  }

  // 2. Localizar o componente principal
  const dashboardFunc = sourceFile.getFunction("DashboardPage");
  if (!dashboardFunc) {
      console.error("🚨 Componente DashboardPage não encontrado!");
      return;
  }

  // 3. Injetar State e Effect no início da função
  dashboardFunc.insertStatements(0, [
    "const [movie, setMovie] = useState<Movie | null>(null);",
    "const [loading, setLoading] = useState(true);",
    "",
    "useEffect(() => {",
    "  async function loadData() {",
    "    try {",
    "      const data = await getMovieDetails(550); // Fight Club id",
    "      setMovie(data);",
    "    } catch (err) {",
    "      console.error('Erro ao carregar filme:', err);",
    "    } finally {",
    "      setLoading(false);",
    "    }",
    "  }",
    "  loadData();",
    "}, []);"
  ]);

  // 4. Transformar a UI estática em dinâmica (Simplificado para o exemplo)
  // Vamos trocar o título e o subtítulo para usar os dados do filme
  const jsx = dashboardFunc.getDescendantsOfKind(SyntaxKind.JsxElement).find(el => 
    el.getOpeningElement().getTagNameNode().getText() === "h1"
  );
  
  // Nota: Em um motor real, usaríamos o Evolua para decidir onde trocar.
  // Aqui vamos fazer uma substituição direta via AST para demonstrar o "músculo".
  
  const fullText = sourceFile.getFullText();
  let updatedText = fullText.replace(
      'Dashboard de Leads - CRM Cáritas', 
      '{loading ? "Carregando..." : movie?.title}'
  ).replace(
      'Visão geral e gerenciamento dos leads do CRM',
      '{movie?.overview}'
  );

  sourceFile.replaceWithText(updatedText);

  await sourceFile.save();
  console.log("✅ Dashboard agora está VIVO e conectado à API de Filmes! 🎬🔗🌸");
}

connectServiceToUI().catch(console.error);
