import { Project } from "ts-morph";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config();

async function createComponentFactory(componentName: string, description: string) {
  console.log(`🌸 Genesis Factory: Fabricando o componente "${componentName}"...`);

  // Garantir que a pasta de componentes existe
  const componentsDir = path.join("data", "components");
  if (!fs.existsSync(componentsDir)) {
      fs.mkdirSync(componentsDir, { recursive: true });
  }

  const project = new Project();
  const filePath = path.join(componentsDir, `${componentName}.tsx`);
  const sourceFile = project.createSourceFile(filePath, "", { overwrite: true });
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Crie um componente React (Next.js Client Component) chamado "${componentName}".
    Descrição: ${description}
    Use Tailwind CSS para um visual ultra-moderno (dark mode, glassmorphism, pink/blue accents).
    Use ícones do lucide-react.
    O componente deve receber os dados necessários via Props.

    Retorne APENAS o código TypeScript/JSX completo.
  `;

  console.log("🧠 IA desenhando a engenharia do componente...");
  const result = await model.generateContent(prompt);
  const code = result.response.text().replace(/```tsx/g, "").replace(/```typescript/g, "").replace(/```/g, "").trim();

  sourceFile.replaceWithText(code);
  await sourceFile.save();

  console.log(`✅ Componente "${componentName}" fabricado com sucesso em ${filePath}! 🌸🏗️✨`);
}

// Fabricar o MovieCard para a nossa lib
createComponentFactory("MovieCard", "Um card de filme elegante com imagem de fundo, overlay gradiente, título, nota e botão de detalhes.")
  .catch(console.error);
