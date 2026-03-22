export type NextJsTargetConfig = {
  kind: 'nextjs';
  runtimeDirName: string;
  packageManager: 'npm' | 'bun' | 'yarn' | 'pnpm';
  createCommand: string[];
};

export function resolveNextJsTargetConfig(input?: {
  packageManager?: string;
}): NextJsTargetConfig {
  const packageManager = (input?.packageManager ?? 'npm') as NextJsTargetConfig['packageManager'];
  const packageManagerFlagByName: Record<NextJsTargetConfig['packageManager'], string> = {
    npm: '--use-npm',
    pnpm: '--use-pnpm',
    yarn: '--use-yarn',
    bun: '--use-bun',
  };

  return {
    kind: 'nextjs',
    runtimeDirName: 'nextjs-app',
    packageManager,
    createCommand: [
      'npx',
      'create-next-app@latest',
      'nextjs-app',
      '--ts',
      '--eslint',
      '--app',
      '--src-dir',
      '--import-alias',
      '@/*',
      packageManagerFlagByName[packageManager],
      '--yes',
      '--empty',
      '--disable-git',
    ],
  };
}
