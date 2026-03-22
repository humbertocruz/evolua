import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execSync } from 'node:child_process';
import { materializeRoutes } from './targets/nextjs/materialize-routes.js';
import { resolveNextJsTargetConfig } from './targets/nextjs/config.js';
function findProjectRoot(inputPath) {
    const start = inputPath ? path.resolve(inputPath) : process.cwd();
    const manifestPath = path.join(start, 'app.evolua.json');
    if (fs.existsSync(manifestPath)) {
        return start;
    }
    throw new Error(`Could not find app.evolua.json in ${start}`);
}
function readJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
function resolveTarget(projectRoot) {
    const packageJson = readJsonFile(path.join(projectRoot, 'package.json'));
    if (packageJson?.evolua?.target) {
        return packageJson.evolua.target;
    }
    const appManifest = readJsonFile(path.join(projectRoot, 'app.evolua.json'));
    const manifestTarget = appManifest?.buildTargets?.[0]?.kind;
    if (manifestTarget) {
        return manifestTarget;
    }
    return 'nextjs';
}
function resolvePackageManager(projectRoot) {
    const packageJson = readJsonFile(path.join(projectRoot, 'package.json'));
    return packageJson?.evolua?.packageManager ?? 'npm';
}
function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}
function initNextApp(runtimeRoot, packageManager) {
    const config = resolveNextJsTargetConfig({ packageManager });
    const nextAppDir = path.join(runtimeRoot, config.runtimeDirName);
    if (fs.existsSync(path.join(nextAppDir, 'package.json'))) {
        console.log(`Next.js runtime already exists at ${nextAppDir}`);
        return;
    }
    ensureDir(runtimeRoot);
    console.log(`Initializing Next.js runtime at ${nextAppDir}...`);
    execSync(config.createCommand.join(' '), {
        cwd: runtimeRoot,
        stdio: 'inherit',
    });
}
function main() {
    const command = process.argv[2] ?? 'dev';
    const inputPath = process.argv[3];
    if (command !== 'dev') {
        console.error(`Unsupported command: ${command}`);
        process.exit(1);
    }
    const projectRoot = findProjectRoot(inputPath);
    const target = resolveTarget(projectRoot);
    const packageManager = resolvePackageManager(projectRoot);
    const runtimeRoot = path.join(projectRoot, '.evolua');
    ensureDir(runtimeRoot);
    console.log(`Project: ${projectRoot}`);
    console.log(`Target: ${target}`);
    console.log(`Package manager: ${packageManager}`);
    console.log(`Runtime root: ${runtimeRoot}`);
    if (target === 'nextjs') {
        initNextApp(runtimeRoot, packageManager);
        const result = materializeRoutes(projectRoot);
        console.log('Materialized routes:', result);
        return;
    }
    console.error(`Unsupported target: ${target}`);
    process.exit(1);
}
main();
