import fs from 'node:fs';
import path from 'node:path';
function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
function readOptionalJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return {};
    }
    return readJson(filePath);
}
export function loadProject(projectRoot) {
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
