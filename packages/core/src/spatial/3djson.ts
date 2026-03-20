import type { AppModel, EvoluaNode } from "../model.ts";

export interface SpatialVector3 {
  x: number;
  y: number;
  z: number;
}

export interface SpatialStyle {
  color?: string;
  emissive?: string;
  opacity?: number;
}

export interface SpatialNode3D {
  id: string;
  label: string;
  kind: string;
  dimension: string;
  shape: string;
  position: SpatialVector3;
  rotation: SpatialVector3;
  scale: SpatialVector3;
  style: SpatialStyle;
  links: string[];
  meta?: Record<string, unknown>;
}

export interface SpatialEdge3D {
  id: string;
  from: string;
  to: string;
  kind: string;
  style?: SpatialStyle;
  meta?: Record<string, unknown>;
}

export interface Spatial3DJson {
  format: "3djson";
  version: "0.0.1";
  source: {
    appName: string;
    modelVersion: string;
  };
  space: {
    kind: "multidimensional-app";
    axes: {
      x: string;
      y: string;
      z: string;
    };
  };
  legend: {
    dimensions: Record<string, { color: string }>;
    shapes: Record<string, string>;
  };
  nodes: SpatialNode3D[];
  edges: SpatialEdge3D[];
  camera: {
    position: SpatialVector3;
    target: SpatialVector3;
  };
}

function nodeDimension(node: EvoluaNode): string {
  if (["page", "layout", "section", "component", "slot", "text"].includes(node.kind)) return "visual";
  if (["entity", "field", "state", "query", "binding"].includes(node.kind)) return "data";
  if (["event", "action", "effect", "route"].includes(node.kind)) return "behavior";
  return "structure";
}

function nodeShape(node: EvoluaNode): string {
  switch (node.kind) {
    case "page": return "slab";
    case "section": return "panel";
    case "component": return "panel";
    case "text": return "line";
    case "entity": return "sphere";
    case "state": return "orb";
    case "query": return "capsule";
    case "event": return "diamond";
    case "action": return "prism";
    case "route": return "ring";
    default: return "box";
  }
}

function dimensionColor(dimension: string): string {
  switch (dimension) {
    case "visual": return "#ec4899";
    case "data": return "#3b82f6";
    case "behavior": return "#8b5cf6";
    default: return "#a1a1aa";
  }
}

function relatedIds(node: any): string[] {
  const refs = new Set<string>();
  for (const child of node.children ?? []) refs.add(child);
  for (const ref of node.dataRefs ?? []) refs.add(ref.id);
  for (const ref of node.behaviorRefs ?? []) refs.add(ref.id);
  for (const ref of node.relationRefs ?? []) refs.add(ref.id);
  for (const ref of node.targetRefs ?? []) refs.add(ref.id);
  for (const binding of node.bindingRefs ?? []) {
    refs.add(binding.from.id);
    refs.add(binding.to.id);
  }
  if (node.trigger?.sourceRef?.id) refs.add(node.trigger.sourceRef.id);
  if (node.pageRef?.id) refs.add(node.pageRef.id);
  return Array.from(refs);
}

export function to3DJson(model: AppModel): Spatial3DJson {
  const dimensions = ["visual", "data", "behavior", "structure"];
  const zMap: Record<string, number> = { visual: -10, data: 0, behavior: 10, structure: 16 };
  const counters: Record<string, number> = { visual: 0, data: 0, behavior: 0, structure: 0 };

  const nodes = Object.values(model.nodes).map((node) => {
    const dimension = nodeDimension(node);
    const index = counters[dimension] ?? 0;
    counters[dimension] = index + 1;

    const x = (index % 4) * 5 - 8;
    const y = Math.floor(index / 4) * 3 + (dimension === "behavior" ? 6 : dimension === "visual" ? 0 : 3);
    const z = zMap[dimension] ?? 16;
    const color = dimensionColor(dimension);

    return {
      id: node.id,
      label: node.name,
      kind: node.kind,
      dimension,
      shape: nodeShape(node),
      position: { x, y, z },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.2, y: 1.0, z: 1.2 },
      style: { color, emissive: color, opacity: 1 },
      links: relatedIds(node as any),
      meta: { tags: node.tags ?? [] },
    } as SpatialNode3D;
  });

  const edges: SpatialEdge3D[] = [];
  for (const node of nodes) {
    for (const target of node.links) {
      edges.push({
        id: `edge:${node.id}->${target}`,
        from: node.id,
        to: target,
        kind: "relation",
        style: { color: "#52525b", opacity: 0.7 },
      });
    }
  }

  return {
    format: "3djson",
    version: "0.0.1",
    source: {
      appName: model.app.name,
      modelVersion: model.version,
    },
    space: {
      kind: "multidimensional-app",
      axes: {
        x: "layout-index",
        y: "hierarchy-or-importance",
        z: "dimension-plane",
      },
    },
    legend: {
      dimensions: Object.fromEntries(dimensions.map((dimension) => [dimension, { color: dimensionColor(dimension) }])),
      shapes: {
        page: "slab",
        section: "panel",
        component: "panel",
        text: "line",
        entity: "sphere",
        state: "orb",
        query: "capsule",
        event: "diamond",
        action: "prism",
        route: "ring",
      },
    },
    nodes,
    edges,
    camera: {
      position: { x: 0, y: 12, z: 36 },
      target: { x: 0, y: 4, z: 0 },
    },
  };
}
