export type EvoluaVersion = "v[0,[0,1]]";

export type NodeId = string;
export type ProjectionId = string;
export type ArtifactId = string;

export type ProjectionKind =
  | "visual"
  | "structure"
  | "data"
  | "behavior"
  | "code";

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

export type BuildTargetKind =
  | "react"
  | "nextjs"
  | "prisma"
  | "tailwind"
  | "unknown";

export interface MetaRecord {
  [key: string]: unknown;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface NodeRef {
  id: NodeId;
  kind?: NodeKind;
}

export interface BaseNode {
  id: NodeId;
  kind: NodeKind;
  name: string;
  meta?: MetaRecord;
  tags?: string[];
  projectionRefs?: ProjectionRef[];
}

export interface AppNode extends BaseNode {
  kind: "app";
  rootPageIds: NodeId[];
  routeIds: NodeId[];
}

export interface ViewNode extends BaseNode {
  kind: "page" | "layout" | "section" | "component" | "slot" | "text";
  componentType?: string;
  props?: Record<string, ValueExpression>;
  children?: NodeId[];
  styleTokens?: string[];
  dataRefs?: NodeRef[];
  behaviorRefs?: NodeRef[];
}

export interface DataNode extends BaseNode {
  kind: "entity" | "field" | "state" | "query" | "binding";
  schema?: DataSchema;
  source?: DataSource;
  relationRefs?: NodeRef[];
  bindingRefs?: BindingRef[];
}

export interface BehaviorNode extends BaseNode {
  kind: "event" | "action" | "effect";
  trigger?: TriggerDefinition;
  condition?: ConditionExpression;
  operation?: OperationDefinition;
  targetRefs?: NodeRef[];
  sideEffects?: SideEffectDefinition[];
}

export interface RouteNode extends BaseNode {
  kind: "route";
  path: string;
  pageRef: NodeRef;
  params?: RouteParam[];
  transitions?: RouteTransition[];
}

export type EvoluaNode =
  | AppNode
  | ViewNode
  | DataNode
  | BehaviorNode
  | RouteNode;

export interface AppModel {
  version: EvoluaVersion;
  app: AppNode;
  nodes: Record<NodeId, EvoluaNode>;
  projections: Record<ProjectionId, Projection>;
  buildTargets: BuildTarget[];
  artifacts?: Record<ArtifactId, BuildArtifact>;
  meta?: MetaRecord;
}

export interface Projection {
  id: ProjectionId;
  kind: ProjectionKind;
  name: string;
  description?: string;
  selectionMode?: "single" | "multiple" | "graph";
  mapping?: ProjectionMapping;
}

export interface ProjectionRef {
  projectionId: ProjectionId;
  nodeId: NodeId;
  path?: string;
  position?: Position3D;
  meta?: MetaRecord;
}

export interface ProjectionMapping {
  nodeKinds?: NodeKind[];
  rules?: string[];
  meta?: MetaRecord;
}

export interface BuildTarget {
  id: string;
  kind: BuildTargetKind;
  name: string;
  options?: MetaRecord;
}

export interface BuildArtifact {
  id: ArtifactId;
  targetId: string;
  type: "file" | "module" | "schema" | "config";
  path: string;
  sourceNodeIds: NodeId[];
  meta?: MetaRecord;
}

export interface DataSchema {
  fields?: DataField[];
  shape?: string;
}

export interface DataField {
  name: string;
  type: string;
  required?: boolean;
  isList?: boolean;
}

export interface DataSource {
  kind: "static" | "local-state" | "remote-query" | "derived";
  reference?: string;
  meta?: MetaRecord;
}

export interface BindingRef {
  from: NodeRef;
  to: NodeRef;
  expression?: string;
}

export interface TriggerDefinition {
  kind: "event" | "lifecycle" | "navigation" | "data-change";
  name: string;
  sourceRef?: NodeRef;
}

export interface ConditionExpression {
  expression: string;
}

export interface OperationDefinition {
  kind: "set-state" | "navigate" | "fetch" | "mutate" | "custom";
  name: string;
  input?: ValueExpression;
}

export interface SideEffectDefinition {
  kind: "log" | "toast" | "request" | "storage" | "custom";
  name: string;
  payload?: ValueExpression;
}

export interface RouteParam {
  name: string;
  type: string;
  required?: boolean;
}

export interface RouteTransition {
  eventName: string;
  to: string;
  condition?: string;
}

export type PrimitiveValue = string | number | boolean | null;

export type ValueExpression =
  | PrimitiveValue
  | PrimitiveValue[]
  | {
      kind: "expression" | "binding" | "object" | "array";
      value: unknown;
    };

export const DEFAULT_PROJECTIONS: Projection[] = [
  {
    id: "visual",
    kind: "visual",
    name: "Visual",
    description: "Como o app aparece.",
  },
  {
    id: "structure",
    kind: "structure",
    name: "Structure",
    description: "Do que o app é feito.",
  },
  {
    id: "data",
    kind: "data",
    name: "Data",
    description: "De onde os dados vêm e para onde vão.",
  },
  {
    id: "behavior",
    kind: "behavior",
    name: "Behavior",
    description: "O que acontece quando algo acontece.",
  },
  {
    id: "code",
    kind: "code",
    name: "Code Projection",
    description: "Como o app vira código real.",
  },
];

export function createEmptyAppModel(name: string): AppModel {
  const appId = "app:root";

  const appNode: AppNode = {
    id: appId,
    kind: "app",
    name,
    rootPageIds: [],
    routeIds: [],
    tags: ["root"],
  };

  return {
    version: "v[0,[0,1]]",
    app: appNode,
    nodes: {
      [appId]: appNode,
    },
    projections: Object.fromEntries(
      DEFAULT_PROJECTIONS.map((projection) => [projection.id, projection])
    ),
    buildTargets: [],
  };
}
