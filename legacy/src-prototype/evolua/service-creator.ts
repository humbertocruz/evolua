import { Project, VariableDeclarationKind } from "ts-morph";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

async function createServiceFromJSON(serviceName: string, sampleJson: any) {
  console.log(`🌸 Genesis: Criando o serviço "${serviceName}" baseado em JSON...`);

  const project = new Project();
  const filePath = path.join("data", `${serviceName.toLowerCase()}-service.ts`);
  const sourceFile = project.createSourceFile(filePath, "", { overwrite: true });

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Baseado neste JSON de exemplo de uma API de filmes:
    ${JSON.stringify(sampleJson, null, 2)}

    Gere:
    1. Uma interface TypeScript chamada "Movie" que mapeie esses campos.
    2. Uma função assíncrona "getMovieDetails" que faça um fetch (use um placeholder de URL).
    
    Retorne APENAS um JSON com os campos:
    {
      "interfaceCode": "string com o código da interface",
      "functionCode": "string com o código da função"
    }
  `;

  console.log("🧠 IA analisando a estrutura dos dados...");
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
  const data = JSON.parse(cleanJson);

  // Construir via AST
  sourceFile.addStatements(data.interfaceCode);
  sourceFile.addStatements(data.functionCode);

  await sourceFile.save();
  console.log(`✅ Serviço "${filePath}" gerado com sucesso! 🎬🌸`);
}

const movieSample = {
  "id": 550,
  "title": "Fight Club",
  "overview": "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy...",
  "release_date": "1999-10-15",
  "vote_average": 8.4,
  "poster_path": "/pB8BM79JsS0vS9pS90mI77TSexW.jpg",
  "genres": [
    {"id": 18, "name": "Drama"}
  ]
};

createServiceFromJSON("Movie", movieSample).catch(console.error);
