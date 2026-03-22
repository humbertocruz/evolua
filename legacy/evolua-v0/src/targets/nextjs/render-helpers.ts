import path from 'node:path';
import type { EvoluaProject } from '../../lib/project.js';

export function getStructureNode(project: EvoluaProject, nodeId: string) {
  return project.structure.nodes?.[nodeId];
}

export function getVisualNode(project: EvoluaProject, nodeId: string) {
  return project.visual.nodes?.[nodeId];
}

export function getSurfaceNode(project: EvoluaProject, nodeId: string) {
  return project.surface?.nodes?.[nodeId];
}

export function getTheme(project: EvoluaProject) {
  const rootId = project.surface?.root ?? 'surface:root';
  const root = getSurfaceNode(project, rootId) ?? {};
  return root.themeRef ? getSurfaceNode(project, root.themeRef) ?? {} : {};
}

export function resolvePageMetadata(project: EvoluaProject, pageId: string) {
  const node = getStructureNode(project, pageId) ?? {};
  const visual = getVisualNode(project, pageId) ?? {};
  const rootId = project.surface?.root ?? 'surface:root';
  const root = getSurfaceNode(project, rootId) ?? {};

  return {
    title: visual?.meta?.title ?? node?.name ?? root?.title ?? project.manifest.title ?? project.manifest.name,
    description: visual?.meta?.description ?? root?.description ?? project.manifest.description,
  };
}

export function findRoutePathForPage(project: EvoluaProject, pageId: string) {
  for (const node of Object.values(project.behavior.nodes ?? {}) as any[]) {
    if (node?.kind === 'route' && node?.pageRef?.id === pageId && typeof node?.path === 'string') {
      return node.path;
    }
  }

  return pageId === (project.structure.roots?.[0] as string | undefined) ? '/' : '#';
}

export function resolveLinkHref(project: EvoluaProject, nodeId: string) {
  if (nodeId.includes('forgot-password-link')) {
    return findRoutePathForPage(project, 'structure:page:forgot-password');
  }

  return '#';
}

export function joinClasses(...values: Array<string | undefined | null | false>) {
  return values.filter(Boolean).join(' ');
}

export function mapStyleTokens(tokens?: string[]) {
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

export function relativeImportFromPage(outputFile: string, componentFileName: string) {
  const normalizedOutputFile = outputFile.replace(/\\/g, '/');
  const srcAppMarker = '/src/app/';
  const markerIndex = normalizedOutputFile.indexOf(srcAppMarker);

  if (markerIndex === -1) {
    throw new Error(`Could not resolve src/app root from output file: ${outputFile}`);
  }

  const runtimeRoot = normalizedOutputFile.slice(0, markerIndex);
  const fromDir = path.dirname(outputFile);
  const componentPath = path.join(runtimeRoot, 'src', 'components', 'evolua', componentFileName);
  let relative = path.relative(fromDir, componentPath).replace(/\\/g, '/');

  if (!relative.startsWith('.')) {
    relative = `./${relative}`;
  }

  return relative.replace(/\.tsx$/, '');
}
