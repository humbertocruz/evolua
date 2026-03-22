import process from 'node:process';
import path from 'node:path';
import { loadProject } from '../../lib/project.js';
import { resolveNextRoutes } from './routes.js';

const inputPath = process.argv[2] ?? path.resolve('../evolua-create-app/login-demo.evolua');
const project = loadProject(path.resolve(inputPath));
const routes = resolveNextRoutes(project);

console.log(JSON.stringify(routes, null, 2));
