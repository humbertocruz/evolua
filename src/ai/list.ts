import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  console.log("📡 Listando modelos disponíveis...");
  
  try {
    // A biblioteca não tem um método direto listModels() exposto no objeto genAI de forma óbvia as vezes.
    // Vamos tentar o conteúdo básico com um modelo que DEVE existir.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("ping");
    console.log("✅ OK!");
  } catch (error: any) {
    console.error("❌ Erro:", error.message);
  }
}

listModels();
