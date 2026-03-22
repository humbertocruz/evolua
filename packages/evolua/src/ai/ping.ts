import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

async function checkModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  
  // Lista de modelos para testar
  const modelsToTry = [
    "gemini-3-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash"
  ];

  console.log("🧪 Iniciando bateria de testes de modelos...");

  for (const modelName of modelsToTry) {
    try {
      console.log(`📡 Testando: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Diga 'OK'");
      const response = await result.response;
      console.log(`✅ ${modelName} respondeu: ${response.text()}`);
      return; // Se um funcionar, paramos.
    } catch (e: any) {
      console.log(`❌ ${modelName} falhou: ${e.message.split('\n')[0]}`);
    }
  }
  
  console.log("\n🚨 Nenhum modelo padrão funcionou. Verifique se a API de 'Generative Language' está ativa no seu projeto do Google Cloud/AI Studio.");
}

checkModels();
