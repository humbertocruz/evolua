import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderPreviewHtml } from "./render-preview-html.ts";

const outputPath = resolve(process.cwd(), "preview.html");
writeFileSync(outputPath, renderPreviewHtml(), "utf8");
console.log(`🌸 Preview generated at ${outputPath}`);
