// ============================================================
// @evolua/types — Contrato entre SaaS e Runtime Next.js
// ============================================================

export * from "./nodes";

// ─── Entidades do Modelo ────────────────────────────────────

export type NodeKind =
  | "app"
  | "page"
  | "layout"
  | "section"
  | "component"
  | "slot"
  | "text"
  | "entity"
  | "field"
  | "state"
  | "query"
  | "binding"
  | "event"
  | "action"
  | "effect"
  | "route";

export interface NodeRef {
  id: string;
  kind?: NodeKind;
}

export interface MetaRecord {
  [key: string]: unknown;
}

export interface BaseNode {
  id: string;
  kind: NodeKind;
  name: string;
  meta?: MetaRecord;
  tags?: string[];
}

// ─── View (visual) ────────────────────────────────────────

export interface ViewNode extends BaseNode {
  kind: "page" | "layout" | "section" | "component" | "slot" | "text";
  componentType?: string;
  props?: Record<string, ValueExpression>;
  custom?: Record<string, unknown>; // props livres — não precisam ser previtos no schema
  children?: string[];
  styleTokens?: string[];
  dataRefs?: NodeRef[];
  behaviorRefs?: NodeRef[];
}

// ─── Data (dados/estado) ──────────────────────────────────

export interface DataNode extends BaseNode {
  kind: "entity" | "field" | "state" | "query" | "binding";
  type?: string;
  entityRef?: NodeRef;
  defaultValue?: ValueExpression;
  sourceQuery?: NodeRef;
  bindingRefs?: NodeRef[];
}

// ─── Behavior (lógica/ações) ───────────────────────────────

export interface BehaviorNode extends BaseNode {
  kind: "event" | "action" | "effect";
  targetRef?: NodeRef;
  params?: MetaRecord;
  expression?: string;
}

// ─── Structure (rotas) ───────────────────────────────────

export interface RouteNode extends BaseNode {
  kind: "route";
  path: string;
  pageRef: NodeRef;
  layoutRef?: NodeRef;
  methods?: ("GET" | "POST" | "PUT" | "DELETE")[];
}

// ─── App (raiz) ──────────────────────────────────────────

export interface AppNode extends BaseNode {
  kind: "app";
  rootPageIds: string[];
  routeIds: string[];
}

// ─── Valor / Expressão ───────────────────────────────────

export type ValueExpression =
  | string
  | number
  | boolean
  | null
  | ValueExpression[]
  | { [key: string]: ValueExpression }
  | {
      kind: string;
      ref?: NodeRef;
      expression?: string;
      params?: MetaRecord;
    };

// ─── Modelo Completo ─────────────────────────────────────

export interface AppModel {
  id: string;
  version: string;
  app: AppNode;
  nodes: Record<string, ViewNode | DataNode | BehaviorNode | RouteNode | BaseNode>;
}

/** @deprecated Use AppModel */
export type EvoluaAppModel = AppModel;

// ─── Contrato SaaS → Runtime ─────────────────────────────

export type ProjectionKind = "visual" | "structure" | "data" | "behavior";

export interface ProjectionRequest {
  projectId: string;
  projection: ProjectionKind;
  locale?: string;
}

export interface ProjectionResponse {
  projection: ProjectionKind;
  model: AppModel;
  renderedAt: string;
}

// ─── API do Evolua Cloud ─────────────────────────────────

export interface EvoluaPageResponse {
  id: string;
  projectId: string;
  route: string;
  model: AppModel;
  updatedAt: string;
}

export interface EvoluaProjectResponse {
  id: string;
  name: string;
  model: AppModel;
  pages: Array<{ id: string; route: string; name: string }>;
  createdAt: string;
  updatedAt: string;
}

// ─── Runtime Config ───────────────────────────────────────

export interface EvoluaConfig {
  projectId: string;
  endpoint: string; // URL do Evolu[a] Cloud (ex: https://evolua.cloud)
  apiKey: string;   // Chave do projeto (pk_xxx do dashboard)
  debug?: boolean;
}

// ─── Renderable Node (o que o runtime recebe) ─────────────

export type RenderableNode = ViewNode | DataNode | BehaviorNode | RouteNode;

/** @deprecated Use RenderableNode */
export type EvoluaNode = RenderableNode;

/** @deprecated Use AppModel */
export type EvoluaAppModel = AppModel;

// ─── Prisma-backed types ───────────────────────────────────

export type PageStatus = "draft" | "published";

export interface Page {
  id: string;
  projectId: string;
  path: string;
  title: string;
  status: PageStatus;
  nodes: string;
  visual?: string;
}

/** @deprecated Use Page */
export type EvoluaPage = Page;

/** @deprecated Use PageStatus */
export type EvoluaPageStatus = PageStatus;

export function isViewNode(node: BaseNode): node is ViewNode {
  return ["page", "layout", "section", "component", "slot", "text"].includes(node.kind);
}

export function isDataNode(node: BaseNode): node is DataNode {
  return ["entity", "field", "state", "query", "binding"].includes(node.kind);
}

export function isBehaviorNode(node: BaseNode): node is BehaviorNode {
  return ["event", "action", "effect"].includes(node.kind);
}

export function isRouteNode(node: BaseNode): node is RouteNode {
  return node.kind === "route";
}
