import fs from 'node:fs';
import path from 'node:path';
import { loadProject } from '../../lib/project.js';
import { materializeNextPage } from './materialize-page.js';
import { resolveNextRoutes } from './routes.js';
import { materializeNextShell } from './materialize-shell.js';
import { materializeNextComponents } from './materialize-components.js';
function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}
function routePathToPageFile(runtimeAppDir, routePath) {
    if (routePath === '/') {
        return path.join(runtimeAppDir, 'src', 'app', 'page.tsx');
    }
    const cleaned = routePath.replace(/^\//, '');
    return path.join(runtimeAppDir, 'src', 'app', cleaned, 'page.tsx');
}
export function materializeRoutes(projectRoot) {
    const project = loadProject(projectRoot);
    const runtimeAppDir = path.join(projectRoot, '.evolua', 'nextjs-app');
    const routes = resolveNextRoutes(project);
    materializeNextShell(project, runtimeAppDir);
    materializeNextComponents(runtimeAppDir);
    for (const route of routes) {
        const outputFile = routePathToPageFile(runtimeAppDir, route.path);
        ensureDir(path.dirname(outputFile));
        const pageContent = materializeNextPage(project, route.pageId, outputFile);
        fs.writeFileSync(outputFile, pageContent, 'utf8');
    }
    return routes.map((route) => ({ path: route.path, pageId: route.pageId }));
}
