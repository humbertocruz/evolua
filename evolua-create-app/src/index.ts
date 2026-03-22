import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createBasicAppTemplate, type JsonObject } from './templates/basic-app.js';

function sanitizeAppName(input: string) {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'my-app'
  );
}

function writeJson(filePath: string, value: JsonObject) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function main() {
  const rawName = process.argv[2];
  if (!rawName) {
    console.error('Usage: evolua-create-app <project-name>');
    process.exit(1);
  }

  const appName = sanitizeAppName(rawName);
  const targetDir = path.resolve(process.cwd(), `${appName}.evolua`);

  if (fs.existsSync(targetDir)) {
    console.error(`Target already exists: ${targetDir}`);
    process.exit(1);
  }

  ensureDir(targetDir);
  ensureDir(path.join(targetDir, 'dimensions'));
  ensureDir(path.join(targetDir, 'derived'));

  const template = createBasicAppTemplate(appName);

  writeJson(path.join(targetDir, 'app.evolua.json'), template.appManifest);
  writeJson(path.join(targetDir, 'package.json'), template.packageJson);
  writeJson(path.join(targetDir, 'dimensions', 'structure.evolua.json'), template.structure);
  writeJson(path.join(targetDir, 'dimensions', 'visual.evolua.json'), template.visual);
  writeJson(path.join(targetDir, 'dimensions', 'data.evolua.json'), template.data);
  writeJson(path.join(targetDir, 'dimensions', 'behavior.evolua.json'), template.behavior);
  writeJson(path.join(targetDir, 'dimensions', 'surface.evolua.json'), template.surface);

  console.log(`Created Evolu[a] app at ${targetDir}`);
}

main();
