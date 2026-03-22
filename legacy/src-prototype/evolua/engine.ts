import { Project, SyntaxKind } from "ts-morph";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

async function processGenesisTask(task: string) {
  console.log(`🌸 Genesis Engine: Processando tarefa: "${task}"`);

  const project = new Project();
  const dashboardPath = path.join("data", "dashboard.tsx");
  const sourceFile = project.addSourceFileAtPath(dashboardPath);
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const context = `
    Arquivo Atual (dashboard.tsx):
    ${sourceFile.getFullText()}

    Tarefa: ${task}

    Instrução: Analise o código e decida como adicionar esse novo elemento visual usando Tailwind CSS e ícones do Lucide.
    Retorne um JSON com:
    {
      "imports": ["lista de novos imports do lucide-react"],
      "jsxToInsert": "string com o código JSX do novo componente (use dados do objeto 'movie' que já existe no state)",
      "insertAfter": "texto do elemento JSX existente após o qual devemos inserir (ex: o </header> ou um <h1>)"
    }
  `;

  console.log("🧠 IA planejando a evolução da AST...");
  const result = await model.generateContent(context);
  const response = result.response.text();
  const plan = JSON.parse(response.replace(/```json/g, "").replace(/```/g, "").trim());

  console.log("🛠️ Aplicando mudanças via AST...");

  // 1. Adicionar novos ícones se necessário
  if (plan.imports && plan.imports.length > 0) {
    const lucideImport = sourceFile.getImportDeclaration(i => i.getModuleSpecifierValue() === "lucide-react");
    if (lucideImport) {
        plan.imports.forEach((icon: string) => {
            if (!lucideImport.getNamedImports().map(n => n.getName()).includes(icon)) {
                lucideImport.addNamedImport(icon);
            }
        });
    }
  }

  // 2. Inserir o JSX (O "Músculo" do Genesis)
  // Procuramos o ponto de inserção
  const fullText = sourceFile.getFullText();
  if (fullText.includes(plan.insertAfter)) {
      const updatedText = fullText.replace(plan.insertAfter, `${plan.insertAfter}\n${plan.jsxToInsert}`);
      sourceFile.replaceWithText(updatedText);
  }

  await sourceFile.save();
  console.log("✅ Evolução concluída com sucesso! 🌸🚀✨");
}

processGenesisTask("Adicione um componente de estatísticas (votos, popularidade e data) logo abaixo do parágrafo de descrição do filme, usando cores vibrantes.")
  .catch(console.error);
