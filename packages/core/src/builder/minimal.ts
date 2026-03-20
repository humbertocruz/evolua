import type { AppModel, RouteNode, ViewNode } from "../model.ts";

export interface GeneratedFile {
  path: string;
  content: string;
}

function getRouteNodes(model: AppModel): RouteNode[] {
  return Object.values(model.nodes).filter((node): node is RouteNode => node.kind === "route");
}

function getViewNode(model: AppModel, id: string): ViewNode | undefined {
  const node = model.nodes[id];
  if (!node) return undefined;

  if (["page", "layout", "section", "component", "slot", "text"].includes(node.kind)) {
    return node as ViewNode;
  }

  return undefined;
}

function routePathToAppDir(path: string): string {
  if (path === "/") return "app/page.tsx";

  return `app${path
    .replace(/:([A-Za-z0-9_]+)/g, "[$1]")
    .replace(/\/+/g, "/")}/page.tsx`;
}

function renderChildren(model: AppModel, childIds: string[] = [], depth = 2): string[] {
  const pad = "  ".repeat(depth);
  const lines: string[] = [];

  for (const childId of childIds) {
    const child = getViewNode(model, childId);
    if (!child) continue;

    if (child.kind === "text") {
      const content = child.props?.content;
      const rendered =
        typeof content === "object" && content && "kind" in content
          ? `{String(/* ${String(content.kind)} */ "preview")}`
          : JSON.stringify(content ?? child.name);

      lines.push(`${pad}<p>${rendered}</p>`);
      continue;
    }

    lines.push(`${pad}<section data-node-id="${child.id}">`);
    lines.push(`${pad}  <h2>${child.name}</h2>`);
    lines.push(...renderChildren(model, child.children, depth + 1));
    lines.push(`${pad}</section>`);
  }

  return lines;
}

function renderPageFile(model: AppModel, route: RouteNode): GeneratedFile {
  const page = getViewNode(model, route.pageRef.id);
  const pageName = page?.name ?? "Page";
  const children = renderChildren(model, page?.children ?? []);

  const content = [
    `export default function ${pageName}() {`,
    `  return (`,
    `    <main data-route="${route.path}">`,
    `      <h1>${pageName}</h1>`,
    ...children,
    `    </main>`,
    `  );`,
    `}`,
    ``,
  ].join("\n");

  return {
    path: routePathToAppDir(route.path),
    content,
  };
}

export function buildMinimalApp(model: AppModel): GeneratedFile[] {
  const routes = getRouteNodes(model);
  return routes.map((route) => renderPageFile(model, route));
}
