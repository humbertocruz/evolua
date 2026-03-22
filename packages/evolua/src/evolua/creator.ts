import { Project } from "ts-morph";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

async function createPageFromScratch(pageName: string, description: string) {
  console.log(`🌸 Genesis: Criando a página "${pageName}" via AST...`);

  const project = new Project();
  const filePath = path.join("data", `${pageName.toLowerCase()}.tsx`);
  const sourceFile = project.createSourceFile(filePath, "", { overwrite: true });

  // 1. Definir a estrutura básica via IA
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Vou usar 2.0 que é mais estável

  const prompt = `
    Gere um design para uma página Next.js: ${description}.
    Retorne APENAS um JSON plano:
    {
      "title": "String",
      "subtitle": "String",
      "items": ["Item 1", "Item 2", "Item 3"]
    }
  `;

  console.log("🧠 Consultando a IA...");
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
  const info = JSON.parse(cleanJson);

  console.log("✅ Design recebido:", info);

  // 2. Construir via AST
  sourceFile.addStatements("'use client';");
  
  sourceFile.addImportDeclaration({
    moduleSpecifier: "lucide-react",
    namedImports: ["ArrowRight", "Layout"]
  });

  sourceFile.addFunction({
    name: `${pageName}Page`,
    isDefaultExport: true,
    statements: (writer) => {
      writer.writeLine(`return (`);
      writer.indent(() => {
        writer.writeLine(`<div className="min-h-screen bg-zinc-950 text-zinc-100 p-12">`);
        writer.indent(() => {
          writer.writeLine(`<div className="max-w-4xl mx-auto space-y-8">`);
          writer.indent(() => {
            writer.writeLine(`<header className="space-y-4">`);
            writer.writeLine(`  <h1 className="text-5xl font-extrabold tracking-tighter text-white">${info.title}</h1>`);
            writer.writeLine(`  <p className="text-zinc-400 text-xl">${info.subtitle}</p>`);
            writer.writeLine(`</header>`);
            
            writer.writeLine(`<div className="grid grid-cols-1 md:grid-cols-3 gap-6">`);
            info.items.forEach((item: string) => {
              writer.writeLine(`  <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 hover:border-pink-500/50 transition-all group">`);
              writer.writeLine(`    <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 mb-4 group-hover:scale-110 transition-transform">`);
              writer.writeLine(`      <ArrowRight size={24} />`);
              writer.writeLine(`    </div>`);
              writer.writeLine(`    <h3 className="text-lg font-semibold">${item}</h3>`);
              writer.writeLine(`  </div>`);
            });
            writer.writeLine(`</div>`);

            writer.writeLine(`<div className="pt-12 border-t border-zinc-800 text-zinc-600">`);
            writer.writeLine(`  Genesis Engine v1.0 • 🌸`);
            writer.writeLine(`</div>`);
          });
          writer.writeLine(`</div>`);
        });
        writer.writeLine(`</div>`);
      });
      writer.writeLine(`);`);
    }
  });

  await sourceFile.save();
  console.log(`✅ Página "${filePath}" gerada com sucesso! 🌸🚀`);
}

createPageFromScratch("Dashboard", "Um dashboard moderno para controle de leads do CRM Cáritas.")
  .catch(console.error);
