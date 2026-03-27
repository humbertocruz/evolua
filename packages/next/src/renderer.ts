// Renderização de nodes do modelo Evolua
// O runtime "burro" que renderiza o que vem do SaaS

import type {
  ViewNode,
  DataNode,
  BehaviorNode,
  RouteNode,
  AppModel,
  MetaRecord,
  ValueExpression,
} from "@evolua/types";

// ─── Resolved Props ────────────────────────────────────────

export function resolveValue(
  value: ValueExpression | undefined,
  context: Record<string, unknown> = {}
): unknown {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;

  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, context));
  }

  if (typeof value === "object") {
    // Se é uma expressão referenciada (ex: { kind: "ref", ref: ... })
    const obj = value as { kind?: string; expression?: string; ref?: { id: string } };
    if (obj.kind === "ref" && obj.expression) {
      // Expressão tipo "data.user.name"
      return evalInContext(obj.expression, context);
    }
    if (obj.expression) {
      return evalInContext(obj.expression, context);
    }
    // Objeto comum
    const resolved: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      resolved[k] = resolveValue(v, context);
    }
    return resolved;
  }

  return null;
}

function evalInContext(expression: string, context: Record<string, unknown>): unknown {
  try {
    // Simula avaliação de expressões simples como "user.name" ou "items.length"
    const keys = expression.split(".").filter(Boolean);
    let result: unknown = context;
    for (const key of keys) {
      if (result && typeof result === "object" && key in result) {
        result = (result as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    return result;
  } catch {
    return undefined;
  }
}

// ─── Renderização de ViewNode ──────────────────────────────

export interface RenderContext {
  nodes: Record<string, ViewNode | DataNode | BehaviorNode | RouteNode | unknown>;
  data: Record<string, unknown>;
}

export function renderViewNode(
  node: ViewNode,
  context: RenderContext
): { component: string; props: Record<string, unknown>; children: string[] } {
  const resolvedProps: Record<string, unknown> = {};

  // Resolver props com contexto de dados
  if (node.props) {
    for (const [key, value] of Object.entries(node.props)) {
      resolvedProps[key] = resolveValue(value, context.data);
    }
  }

  // Resolver children
  const children = (node.children ?? []).map((childId) => {
    const childNode = context.nodes[childId];
    if (!childNode) return "";
    if (isViewNodeType(childNode)) {
      return renderViewNode(childNode, context).component;
    }
    return "";
  });

  return {
    component: node.componentType ?? getDefaultComponent(node.kind),
    props: resolvedProps,
    children,
  };
}

function getDefaultComponent(kind: ViewNode["kind"]): string {
  const map: Record<ViewNode["kind"], string> = {
    page: "div",
    layout: "div",
    section: "section",
    component: "div",
    slot: "div",
    text: "span",
  };
  return map[kind] ?? "div";
}

function isViewNodeType(node: unknown): node is ViewNode {
  return typeof node === "object" && node !== null && "kind" in node &&
    ["page", "layout", "section", "component", "slot", "text"].includes((node as ViewNode).kind);
}

// ─── helpers para o React ─────────────────────────────────

export function extractPageNodes(model: AppModel): ViewNode[] {
  return Object.values(model.nodes).filter(
    (node): node is ViewNode => isViewNodeType(node) && node.kind === "page"
  );
}

export function extractRoutes(model: AppModel): RouteNode[] {
  return Object.values(model.nodes).filter(
    (node): node is RouteNode => node.kind === "route"
  );
}

export function getNodeChildren(node: ViewNode, allNodes: AppModel["nodes"]): ViewNode[] {
  return (node.children ?? [])
    .map((id) => allNodes[id])
    .filter((n): n is ViewNode => isViewNodeType(n));
}
