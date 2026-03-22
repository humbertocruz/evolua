export function resolveNextJsTargetConfig(input) {
    const packageManager = (input?.packageManager ?? 'npm');
    const packageManagerFlagByName = {
        npm: '--use-npm',
        pnpm: '--use-pnpm',
        yarn: '--use-yarn',
        bun: '--use-bun',
    };
    const devCommandByPackageManager = {
        npm: ['npm', 'run', 'dev'],
        pnpm: ['pnpm', 'dev'],
        yarn: ['yarn', 'dev'],
        bun: ['bun', 'run', 'dev'],
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
        devCommand: devCommandByPackageManager[packageManager],
    };
}
