import { buildMinimalApp, createMovieAppExample, projectBehavior, projectData, projectStructure } from "./index.ts";

const model = createMovieAppExample();

console.log("🌸 Structure Projection\n");
console.log(projectStructure(model));
console.log("\n🌸 Data Projection\n");
console.log(projectData(model));
console.log("\n🌸 Behavior Projection\n");
console.log(projectBehavior(model));
console.log("\n🌸 Minimal Builder Output\n");

for (const file of buildMinimalApp(model)) {
  console.log(`--- ${file.path} ---`);
  console.log(file.content);
}
