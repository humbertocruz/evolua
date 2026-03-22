import path from 'node:path';
export function getStructureNode(project, nodeId) {
    return project.structure.nodes?.[nodeId];
}
export function getVisualNode(project, nodeId) {
    return project.visual.nodes?.[nodeId];
}
export function getSurfaceNode(project, nodeId) {
    return project.surface?.nodes?.[nodeId];
}
export function getTheme(project) {
    const rootId = project.surface?.root ?? 'surface:root';
    const root = getSurfaceNode(project, rootId) ?? {};
    return root.themeRef ? getSurfaceNode(project, root.themeRef) ?? {} : {};
}
export function resolvePageMetadata(project, pageId) {
    const node = getStructureNode(project, pageId) ?? {};
    const visual = getVisualNode(project, pageId) ?? {};
    const rootId = project.surface?.root ?? 'surface:root';
    const root = getSurfaceNode(project, rootId) ?? {};
    return {
        title: visual?.meta?.title ?? node?.name ?? root?.title ?? project.manifest.title ?? project.manifest.name,
        description: visual?.meta?.description ?? root?.description ?? project.manifest.description,
    };
}
export function findRoutePathForPage(project, pageId) {
    for (const node of Object.values(project.behavior.nodes ?? {})) {
        if (node?.kind === 'route' && node?.pageRef?.id === pageId && typeof node?.path === 'string') {
            return node.path;
        }
    }
    return pageId === project.structure.roots?.[0] ? '/' : '#';
}
export function resolveLinkHref(project, nodeId) {
    if (nodeId.includes('forgot-password-link')) {
        return findRoutePathForPage(project, 'structure:page:forgot-password');
    }
    return '#';
}
export function joinClasses(...values) {
    return values.filter(Boolean).join(' ');
}
export function mapStyleTokens(tokens) {
    if (!tokens?.length)
        return '';
    const tokenMap = {
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
export function relativeImportFromPage(outputFile, componentFileName) {
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
