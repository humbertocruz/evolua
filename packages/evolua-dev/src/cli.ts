import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execSync, spawn } from 'node:child_process';
import { materializeRoutes } from './targets/nextjs/materialize-routes.js';
import { resolveNextJsTargetConfig } from './targets/nextjs/config.js';

type AppManifest = {
  buildTargets?: Array<{
    kind?: string;
    runtime?: {
      packageManager?: string;
    };
  }>;
};

function findProjectRoot(inputPath?: string) {
  const start = inputPath ? path.resolve(inputPath) : process.cwd();
  const manifestPath = path.join(start, 'app.evolua.json');

  if (fs.existsSync(manifestPath)) {
    return start;
  }

  throw new Error(`Could not find app.evolua.json in ${start}`);
}

function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function loadManifest(projectRoot: string) {
  const manifest = readJsonFile<AppManifest>(path.join(projectRoot, 'app.evolua.json'));
  if (!manifest) {
    throw new Error(`Could not read app.evolua.json in ${projectRoot}`);
  }

  return manifest;
}

function resolveTarget(manifest: AppManifest) {
  return manifest.buildTargets?.[0]?.kind ?? 'nextjs';
}

function resolvePackageManager(manifest: AppManifest) {
  return manifest.buildTargets?.[0]?.runtime?.packageManager ?? 'npm';
}

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function initNextApp(runtimeRoot: string, packageManager: string) {
  const config = resolveNextJsTargetConfig({ packageManager });
  const nextAppDir = path.join(runtimeRoot, config.runtimeDirName);

  if (fs.existsSync(path.join(nextAppDir, 'package.json'))) {
    console.log(`Next.js runtime already exists at ${nextAppDir}`);
    return nextAppDir;
  }

  ensureDir(runtimeRoot);

  console.log(`Initializing Next.js runtime at ${nextAppDir}...`);
  execSync(config.createCommand.join(' '), {
    cwd: runtimeRoot,
    stdio: 'inherit',
  });

  return nextAppDir;
}

function startNextDevServer(runtimeRoot: string, packageManager: string) {
  const config = resolveNextJsTargetConfig({ packageManager });
  const nextAppDir = path.join(runtimeRoot, config.runtimeDirName);

  console.log(`Starting Next.js dev server in ${nextAppDir}...`);
  const child = spawn(config.devCommand[0], config.devCommand.slice(1), {
    cwd: nextAppDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      BROWSER: 'none',
    },
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
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
  const manifest = loadManifest(projectRoot);
  const target = resolveTarget(manifest);
  const packageManager = resolvePackageManager(manifest);
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
    startNextDevServer(runtimeRoot, packageManager);
    return;
  }

  console.error(`Unsupported target: ${target}`);
  process.exit(1);
}

main();
