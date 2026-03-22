import type { EvoluaProject } from '../../lib/project.js';

export type NextRoute = {
  id: string;
  path: string;
  pageId: string;
  source: 'root' | 'behavior-route';
};

export function resolveNextRoutes(project: EvoluaProject): NextRoute[] {
  const routes: NextRoute[] = [];
  const seen = new Set<string>();
  const rootIds = (project.structure.roots ?? []) as string[];

  for (const rootId of rootIds) {
    if (seen.has('/')) continue;
    routes.push({
      id: `route:root:${rootId}`,
      path: '/',
      pageId: rootId,
      source: 'root',
    });
    seen.add('/');
  }

  for (const node of Object.values(project.behavior.nodes ?? {}) as any[]) {
    if (node?.kind !== 'route' || typeof node?.path !== 'string' || !node?.pageRef?.id) {
      continue;
    }

    if (seen.has(node.path)) {
      continue;
    }

    routes.push({
      id: node.id,
      path: node.path,
      pageId: node.pageRef.id,
      source: 'behavior-route',
    });
    seen.add(node.path);
  }

  return routes;
}
