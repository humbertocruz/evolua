import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createMovieAppExample, to3DJson } from "../../../packages/core/src/index.ts";

const outputPath = resolve(process.cwd(), "preview.3djson");
const model = createMovieAppExample();
const spatial = to3DJson(model);

writeFileSync(outputPath, JSON.stringify(spatial, null, 2), "utf8");
console.log(`🌸 3djson generated at ${outputPath}`);
