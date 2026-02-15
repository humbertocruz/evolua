import { Project, SyntaxKind } from "ts-morph";
import * as path from "path";

async function injectComponent(targetFile: string, componentName: string, props: string) {
  console.log(`🌸 Genesis Injector: Injetando <${componentName} /> em ${targetFile}...`);

  const project = new Project();
  const filePath = path.join("data", targetFile);
  const sourceFile = project.addSourceFileAtPath(filePath);

  // 1. Adicionar Import do componente
  sourceFile.addImportDeclaration({
    moduleSpecifier: `./components/${componentName}`,
    defaultImport: componentName
  });

  // 2. Localizar o ponto de inserção
  // Vamos procurar o grid de cards que já existe
  const dashboardFunc = sourceFile.getFunction("DashboardPage");
  if (!dashboardFunc) return;

  const fullText = sourceFile.getFullText();
  
  // Vamos substituir o primeiro card "estático" pelo nosso componente real
  const oldCardMarker = '<h3 className="text-lg font-semibold">Gráfico de Funil de Vendas (Leads por Estágio)</h3>';
  
  if (fullText.includes(oldCardMarker)) {
      // Procuramos a div pai desse h3 para substituir o conteúdo do card
      const newCardJsx = `
                  <div className="p-1 bg-zinc-900 rounded-3xl border border-zinc-800 hover:border-pink-500/50 transition-all group overflow-hidden">
                    {movie && (
                        <${componentName} 
                            id={movie.id} 
                            title={movie.title} 
                            poster_path={movie.poster_path} 
                            vote_average={movie.vote_average} 
                        />
                    )}
                  </div>`;
      
      // Essa é uma forma simplificada de substituição para o protótipo
      // No motor real, usaríamos manipulação de JsxElement via AST
      const startTag = '<div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 hover:border-pink-500/50 transition-all group">';
      const endTag = '</div>';
      
      // Localizamos o bloco do primeiro card
      const searchPattern = startTag + '[\\s\\S]*?' + oldCardMarker + '[\\s\\S]*?' + endTag;
      const regex = new RegExp(searchPattern);
      
      const updatedText = fullText.replace(regex, newCardJsx);
      sourceFile.replaceWithText(updatedText);
  }

  await sourceFile.save();
  console.log(`✅ Componente <${componentName} /> injetado com sucesso! 🌸🚀✨`);
}

injectComponent("dashboard.tsx", "MovieCard", "movie").catch(console.error);
