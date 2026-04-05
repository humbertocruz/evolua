import { Project } from "ts-morph";
import * as dotenv from "dotenv";

dotenv.config();

console.log("🌸 Genesis: Iniciando sistema de manipulação de código...");

async function main() {
  const project = new Project();
  
  // Exemplo inicial: Criar um arquivo na memória
  const sourceFile = project.createSourceFile("data/hello.ts", "function sayHello() { console.log('Olá mundo! 🚀'); }", { overwrite: true });
  
  console.log("📄 Arquivo de teste criado com sucesso na memória.");
  console.log("🔧 Nome da função detectada:", sourceFile.getFunctions()[0].getName());
  
  // Aqui no futuro o Evolua vai agir...
}

main().catch(err => {
  console.error("🚨 Erro ao iniciar Genesis:", err);
});
