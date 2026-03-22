import fs from 'node:fs';
import path from 'node:path';

export type JsonRecord = Record<string, any>;

export type EvoluaProject = {
  rootDir: string;
  manifest: JsonRecord;
  structure: JsonRecord;
  visual: JsonRecord;
  data: JsonRecord;
  behavior: JsonRecord;
  surface: JsonRecord;
};

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as JsonRecord;
}

function readOptionalJson(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return {} as JsonRecord;
  }

  return readJson(filePath);
}

export function loadProject(projectRoot: string): EvoluaProject {
  const manifest = readJson(path.join(projectRoot, 'app.evolua.json'));
  const structure = readJson(path.join(projectRoot, 'dimensions', 'structure.evolua.json'));
  const visual = readJson(path.join(projectRoot, 'dimensions', 'visual.evolua.json'));
  const data = readJson(path.join(projectRoot, 'dimensions', 'data.evolua.json'));
  const behavior = readJson(path.join(projectRoot, 'dimensions', 'behavior.evolua.json'));
  const surface = readOptionalJson(path.join(projectRoot, 'dimensions', 'surface.evolua.json'));

  return {
    rootDir: projectRoot,
    manifest,
    structure,
    visual,
    data,
    behavior,
    surface,
  };
}
