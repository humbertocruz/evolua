import type { EvoluaProject } from '../../lib/project.js';

function getNode(project: EvoluaProject, nodeId: string) {
  return project.structure.nodes?.[nodeId];
}

function getVisualNode(project: EvoluaProject, nodeId: string) {
  return project.visual.nodes?.[nodeId];
}

function getSurfaceNode(project: EvoluaProject, nodeId: string) {
  return project.surface?.nodes?.[nodeId];
}

function getTheme(project: EvoluaProject) {
  const rootId = project.surface?.root ?? 'surface:root';
  const root = getSurfaceNode(project, rootId) ?? {};
  return root.themeRef ? getSurfaceNode(project, root.themeRef) ?? {} : {};
}

function findRoutePathForPage(project: EvoluaProject, pageId: string) {
  for (const node of Object.values(project.behavior.nodes ?? {}) as any[]) {
    if (node?.kind === 'route' && node?.pageRef?.id === pageId && typeof node?.path === 'string') {
      return node.path;
    }
  }

  return pageId === (project.structure.roots?.[0] as string | undefined) ? '/' : '#';
}

function resolveLinkHref(project: EvoluaProject, nodeId: string) {
  if (nodeId.includes('forgot-password-link')) {
    return findRoutePathForPage(project, 'structure:page:forgot-password');
  }

  return '#';
}

function joinClasses(...values: Array<string | undefined | null | false>) {
  return values.filter(Boolean).join(' ');
}

function mapStyleTokens(tokens?: string[]) {
  if (!tokens?.length) return '';

  const tokenMap: Record<string, string> = {
    'max-w-md': 'max-w-md',
    'gap-4': 'gap-4',
    'text-3xl': 'text-3xl',
    'font-bold': 'font-bold',
    'text-sm': 'text-sm',
    'text-zinc-600': 'text-zinc-600',
    'text-blue-500': 'text-blue-500',
    underline: 'underline underline-offset-4',
    primary: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
  };

  return tokens.map((token) => tokenMap[token] ?? '').filter(Boolean).join(' ');
}

function pageClasses(variant?: string) {
  if (variant === 'centered-auth') {
    return 'min-h-screen flex items-center justify-center px-6 py-12';
  }

  return 'min-h-screen px-6 py-12';
}

function sectionClasses(componentType?: string, styleTokens?: string[]) {
  if (componentType === 'AuthCard') {
    return joinClasses(
      'w-full rounded-3xl bg-[var(--card)] text-[var(--card-foreground)] shadow-2xl p-8 flex flex-col',
      mapStyleTokens(styleTokens),
    );
  }

  return mapStyleTokens(styleTokens);
}

function textClasses(nodeId: string, styleTokens?: string[]) {
  const fallback = nodeId.includes('title')
    ? 'text-3xl font-bold tracking-tight'
    : 'text-sm text-[var(--muted-foreground)]';

  const mapped = mapStyleTokens(styleTokens);
  return mapped || fallback;
}

function fieldClasses() {
  return 'h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-zinc-900';
}

function buttonClasses(styleTokens?: string[]) {
  return joinClasses(
    'h-11 rounded-xl font-semibold transition-colors hover:opacity-90',
    mapStyleTokens(styleTokens) || 'bg-[var(--primary)] text-[var(--primary-foreground)]',
  );
}

function linkClasses(styleTokens?: string[]) {
  return joinClasses(
    'text-left transition-colors hover:opacity-80',
    mapStyleTokens(styleTokens) || 'text-sm text-[var(--accent)] underline underline-offset-4',
  );
}

function renderNode(project: EvoluaProject, nodeId: string): string {
  const node = getNode(project, nodeId);
  const visual = getVisualNode(project, nodeId);
  if (!node) return '';

  if (node.kind === 'page') {
    const children = (node.children ?? []).map((childId: string) => renderNode(project, childId)).join('\n');
    const variant = visual?.layout?.variant;
    return `<main className="${pageClasses(variant)}">\n${children}\n</main>`;
  }

  if (node.kind === 'section') {
    const children = (node.children ?? []).map((childId: string) => renderNode(project, childId)).join('\n');
    return `<section className="${sectionClasses(visual?.componentType, visual?.styleTokens)}">\n${children}\n</section>`;
  }

  if (visual?.componentType === 'Link') {
    const content = visual?.props?.content ?? node.name;
    const href = resolveLinkHref(project, node.id);
    return `<a href="${href}" className="${linkClasses(visual?.styleTokens)}">${content}</a>`;
  }

  if (visual?.componentType === 'Text') {
    const content = visual?.props?.content ?? node.name;
    return `<div className="${textClasses(node.id, visual?.styleTokens)}">${content}</div>`;
  }

  if (visual?.componentType === 'TextField' || visual?.componentType === 'PasswordField') {
    const label = visual?.props?.label ?? node.name;
    const type = visual?.componentType === 'PasswordField' ? 'password' : 'email';
    return `<label className="flex flex-col gap-2 text-sm text-zinc-700">\n  <span>${label}</span>\n  <input type="${type}" placeholder="${label}" className="${fieldClasses()}" />\n</label>`;
  }

  if (visual?.componentType === 'Button') {
    const label = visual?.props?.label ?? 'Button';
    return `<button className="${buttonClasses(visual?.styleTokens)}">${label}</button>`;
  }

  return `<div>${node.name}</div>`;
}

function resolvePageMetadata(project: EvoluaProject, pageId: string) {
  const node = getNode(project, pageId) ?? {};
  const visual = getVisualNode(project, pageId) ?? {};
  const rootId = project.surface?.root ?? 'surface:root';
  const root = getSurfaceNode(project, rootId) ?? {};

  return {
    title: visual?.meta?.title ?? node?.name ?? root?.title ?? project.manifest.title ?? project.manifest.name,
    description: visual?.meta?.description ?? root?.description ?? project.manifest.description,
  };
}

export function materializeNextPage(project: EvoluaProject, pageId: string) {
  const theme = getTheme(project);
  const metadata = resolvePageMetadata(project, pageId);
  const body = renderNode(project, pageId);
  const pageBackground = theme?.colors?.background ?? '#09090b';
  const pageForeground = theme?.colors?.foreground ?? '#f4f4f5';

  return `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ${JSON.stringify(metadata.title)},
  description: ${JSON.stringify(metadata.description)},
};

export default function Page() {
  return (
    <>
      <div style={{ background: ${JSON.stringify(pageBackground)}, color: ${JSON.stringify(pageForeground)} }}>
        ${body}
      </div>
    </>
  );
}
`;
}
