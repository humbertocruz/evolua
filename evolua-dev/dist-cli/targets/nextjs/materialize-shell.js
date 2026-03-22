import fs from 'node:fs';
import path from 'node:path';
function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}
function getSurfaceNode(project, nodeId) {
    return project.surface?.nodes?.[nodeId];
}
function resolveRootLayout(project) {
    const rootId = project.surface?.root ?? 'surface:root';
    const root = getSurfaceNode(project, rootId) ?? {};
    const theme = root.themeRef ? getSurfaceNode(project, root.themeRef) ?? {} : {};
    return {
        lang: root.lang ?? 'en',
        title: root.title ?? project.manifest.title ?? project.manifest.name ?? 'Evolu[a] App',
        description: root.description ??
            project.manifest.description ??
            'Materialized from the Evolu[a] canonical app model',
        bodyClassName: root.bodyClassName ?? '',
        theme,
    };
}
export function materializeNextShell(project, runtimeAppDir) {
    const appDir = path.join(runtimeAppDir, 'src', 'app');
    ensureDir(appDir);
    const shell = resolveRootLayout(project);
    const colors = shell.theme?.colors ?? {};
    const typography = shell.theme?.typography ?? {};
    const layoutContent = `import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: ${JSON.stringify(shell.title)},
  description: ${JSON.stringify(shell.description)},
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang=${JSON.stringify(shell.lang)}>
      <body className=${JSON.stringify(shell.bodyClassName)}>{children}</body>
    </html>
  );
}
`;
    const globalsContent = `@import "tailwindcss";

:root {
  --background: ${colors.background ?? '#09090b'};
  --foreground: ${colors.foreground ?? '#f4f4f5'};
  --card: ${colors.card ?? '#ffffff'};
  --card-foreground: ${colors.cardForeground ?? '#18181b'};
  --muted-foreground: ${colors.mutedForeground ?? '#71717a'};
  --primary: ${colors.primary ?? '#18181b'};
  --primary-foreground: ${colors.primaryForeground ?? '#ffffff'};
  --accent: ${colors.accent ?? '#2563eb'};
  --font-family-base: ${JSON.stringify(typography.fontFamily ?? 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif')};
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-family-base);
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
textarea,
select {
  font: inherit;
}
`;
    fs.writeFileSync(path.join(appDir, 'layout.tsx'), layoutContent, 'utf8');
    fs.writeFileSync(path.join(appDir, 'globals.css'), globalsContent, 'utf8');
}
