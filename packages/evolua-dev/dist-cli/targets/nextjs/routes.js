export function resolveNextRoutes(project) {
    const routes = [];
    const seen = new Set();
    const rootIds = (project.structure.roots ?? []);
    for (const rootId of rootIds) {
        if (seen.has('/'))
            continue;
        routes.push({
            id: `route:root:${rootId}`,
            path: '/',
            pageId: rootId,
            source: 'root',
        });
        seen.add('/');
    }
    for (const node of Object.values(project.behavior.nodes ?? {})) {
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
