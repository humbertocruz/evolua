import { getStructureNode, getTheme, getVisualNode, joinClasses, mapStyleTokens, relativeImportFromPage, resolveLinkHref, resolvePageMetadata, } from './render-helpers.js';
function renderPage(context, nodeId, fallbackRender) {
    const visual = getVisualNode(context.project, nodeId);
    const node = getStructureNode(context.project, nodeId);
    const children = (node?.children ?? []).map((childId) => fallbackRender(childId)).join('\n');
    const centered = visual?.layout?.variant === 'centered-auth';
    return `<PageShell centered={${centered ? 'true' : 'false'}}>\n${children}\n</PageShell>`;
}
function renderSection(context, nodeId, fallbackRender) {
    const visual = getVisualNode(context.project, nodeId);
    const node = getStructureNode(context.project, nodeId);
    const children = (node?.children ?? []).map((childId) => fallbackRender(childId)).join('\n');
    if (visual?.componentType === 'AuthCard') {
        return `<AuthCard className=${JSON.stringify(mapStyleTokens(visual?.styleTokens))}>\n${children}\n</AuthCard>`;
    }
    return `<section className=${JSON.stringify(mapStyleTokens(visual?.styleTokens))}>\n${children}\n</section>`;
}
function renderText(context, nodeId) {
    const visual = getVisualNode(context.project, nodeId);
    const node = getStructureNode(context.project, nodeId);
    const content = visual?.props?.content ?? node?.name ?? nodeId;
    const fallback = nodeId.includes('title')
        ? 'text-3xl font-bold tracking-tight'
        : 'text-sm text-[var(--muted-foreground)]';
    return `<div className=${JSON.stringify(mapStyleTokens(visual?.styleTokens) || fallback)}>${content}</div>`;
}
function renderLink(context, nodeId) {
    const visual = getVisualNode(context.project, nodeId);
    const node = getStructureNode(context.project, nodeId);
    const content = visual?.props?.content ?? node?.name ?? nodeId;
    const href = resolveLinkHref(context.project, nodeId);
    const className = joinClasses('text-left transition-colors hover:opacity-80', mapStyleTokens(visual?.styleTokens) || 'text-sm text-[var(--accent)] underline underline-offset-4');
    return `<LinkText href=${JSON.stringify(href)} className=${JSON.stringify(className)}>${content}</LinkText>`;
}
function renderField(context, nodeId) {
    const visual = getVisualNode(context.project, nodeId);
    const node = getStructureNode(context.project, nodeId);
    const label = visual?.props?.label ?? node?.name ?? nodeId;
    const type = visual?.componentType === 'PasswordField' ? 'password' : 'email';
    return `<TextField label=${JSON.stringify(label)} type=${JSON.stringify(type)} />`;
}
function renderButton(context, nodeId) {
    const visual = getVisualNode(context.project, nodeId);
    const label = visual?.props?.label ?? 'Button';
    const className = joinClasses('h-11 rounded-xl font-semibold transition-colors hover:opacity-90', mapStyleTokens(visual?.styleTokens) || 'bg-[var(--primary)] text-[var(--primary-foreground)]');
    return `<Button className=${JSON.stringify(className)}>${label}</Button>`;
}
export function renderNode(context, nodeId) {
    const node = getStructureNode(context.project, nodeId);
    const visual = getVisualNode(context.project, nodeId);
    if (!node)
        return '';
    const componentType = visual?.componentType;
    const handlersByKind = {
        page: (ctx, id) => renderPage(ctx, id, (childId) => renderNode(ctx, childId)),
        section: (ctx, id) => renderSection(ctx, id, (childId) => renderNode(ctx, childId)),
    };
    const handlersByComponentType = {
        Text: renderText,
        Link: renderLink,
        TextField: renderField,
        PasswordField: renderField,
        Button: renderButton,
    };
    const componentHandler = componentType ? handlersByComponentType[componentType] : undefined;
    if (componentHandler) {
        return componentHandler(context, nodeId);
    }
    const kindHandler = handlersByKind[node.kind];
    if (kindHandler) {
        return kindHandler(context, nodeId);
    }
    return `<div>${node.name}</div>`;
}
export function materializeNextPage(project, pageId, outputFile) {
    const theme = getTheme(project);
    const metadata = resolvePageMetadata(project, pageId);
    const body = renderNode({ project }, pageId);
    const pageBackground = theme?.colors?.background ?? '#09090b';
    const pageForeground = theme?.colors?.foreground ?? '#f4f4f5';
    const imports = [
        `import type { Metadata } from 'next';`,
        `import { PageShell } from ${JSON.stringify(relativeImportFromPage(outputFile, 'PageShell.tsx'))};`,
        `import { AuthCard } from ${JSON.stringify(relativeImportFromPage(outputFile, 'AuthCard.tsx'))};`,
        `import { TextField } from ${JSON.stringify(relativeImportFromPage(outputFile, 'TextField.tsx'))};`,
        `import { Button } from ${JSON.stringify(relativeImportFromPage(outputFile, 'Button.tsx'))};`,
        `import { LinkText } from ${JSON.stringify(relativeImportFromPage(outputFile, 'LinkText.tsx'))};`,
    ].join('\n');
    return `${imports}

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
