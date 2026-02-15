import { Project } from "ts-morph";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

async function modernizeCode() {
  console.log("🚀 Iniciando Prova de Conceito: Evolua + AST + Gemini 2.0 🌸");

  // 1. Configurar Projeto e Carregar Arquivo
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath("data/old-code.ts");

  console.log("📂 Arquivo carregado:", sourceFile.getBaseName());

  // 2. Extrair informações para a IA (O "Cérebro" do Evolua)
  const functions = sourceFile.getFunctions().map(f => f.getText());
  const variables = sourceFile.getVariableStatements().map(v => v.getText());

  const codeContext = `
    Temos o seguinte código TypeScript antigo:
    Variáveis: ${variables.join('\n')}
    Funções: ${functions.join('\n')}

    Sugira uma modernização (ex: trocar var por let/const, adicionar tipos).
    Responda APENAS com um JSON contendo:
    {
      "newVariableName": "mensagem",
      "newFunctionName": "printModerno"
    }
  `;

  // 3. Chamar o Gemini 2.5 Flash
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  console.log("🧠 Consultando Gemini para melhorias...");
  const result = await model.generateContent(codeContext);
  const response = await result.response;
  const suggestions = JSON.parse(response.text().replace(/```json/g, "").replace(/```/g, "").trim());

  console.log("💡 Sugestões da IA recebidas:", suggestions);

  // 4. APLICAR MUDANÇAS VIA AST (O "Músculo" do Evolua)
  // Aqui não fazemos "replace" de texto, mudamos as propriedades dos objetos!
  
  // Renomear variável
  const variable = sourceFile.getVariableDeclaration("message");
  if (variable) {
      variable.rename(suggestions.newVariableName);
      // Mudar 'var' para 'const'
      const statement = variable.getVariableStatement();
      if (statement) statement.setDeclarationKind("const" as any);
  }

  // Renomear e tipar função
  const legacyFunc = sourceFile.getFunction("legacyPrint");
  if (legacyFunc) {
      legacyFunc.rename(suggestions.newFunctionName);
      // Adiciona tipo ao parâmetro
      legacyFunc.getParameters()[0].setType("string");
  }

  // 5. Salvar o resultado
  await sourceFile.save();
  console.log("✅ Código modernizado com sucesso via AST! Verifique data/old-code.ts 🌸✨");
}

modernizeCode().catch(console.error);
