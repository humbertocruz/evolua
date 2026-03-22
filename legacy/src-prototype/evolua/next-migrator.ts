import { Project, SyntaxKind } from "ts-morph";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

async function migrateToNext16() {
  console.log("🚀 Evolua: Iniciando Migração para Next.js 16 🌸");

  const project = new Project();
  const sourceFile = project.addSourceFileAtPath("data/customer-page-legacy.tsx");

  console.log("📂 Analisando componente:", sourceFile.getBaseName());

  // 1. Extrair o código para o Gemini analisar
  const code = sourceFile.getFullText();

  const prompt = `
    Você é um especialista em Next.js 16. Analise o código abaixo e identifique o que precisa ser atualizado para o padrão Next.js 16.
    
    FOCO PRINCIPAL:
    - O objeto 'params' em componentes de página (Page) e rotas de API agora é uma Promise e deve ser acessado via 'use(params)' ou 'await params'.
    
    CÓDIGO:
    ${code}

    Responda APENAS com um JSON contendo as instruções de refatoração para o ts-morph:
    {
      "componentName": "NomeDoComponente",
      "paramsInterfaceName": "NomeDaInterfaceOuTipo",
      "needsUseImport": true
    }
  `;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  console.log("🧠 Gemini analisando breaking changes...");
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const analysis = JSON.parse(response.text().replace(/```json/g, "").replace(/```/g, "").trim());

  console.log("💡 Plano de migração:", analysis);

  // 2. APLICAR MUDANÇAS VIA AST
  
  // A. Adicionar 'use' no import do 'react'
  const reactImport = sourceFile.getImportDeclaration("react");
  if (reactImport && analysis.needsUseImport) {
      if (!reactImport.getNamedImports().some(i => i.getName() === "use")) {
          reactImport.addNamedImport("use");
      }
  }

  // B. Transformar o tipo do params em Promise
  const mainFunc = sourceFile.getFunction(analysis.componentName) || sourceFile.getExportedDeclarations().get(analysis.componentName)?.[0].asKind(SyntaxKind.FunctionDeclaration);
  
  if (mainFunc) {
      const paramsParam = mainFunc.getParameters()[0];
      if (paramsParam) {
          // Ajuste fino para envolver apenas o campo 'params' no tipo
          paramsParam.setType("{ params: Promise<{ id: string }> }");

          // C. Inserir a linha 'const { id } = use(params);' ou similar
          // Removemos a atribuição antiga 'const id = params.id'
          const oldAssignment = mainFunc.getVariableDeclaration("id");
          if (oldAssignment) {
              oldAssignment.remove();
          }
          
          // Adiciona a nova forma moderna
          mainFunc.insertStatements(0, "  const { id } = use(params);");
      }
  }

  await sourceFile.save();
  console.log("✅ Migração concluída! Verifique data/customer-page-legacy.tsx ✨🚀");
}

migrateToNext16().catch(console.error);
