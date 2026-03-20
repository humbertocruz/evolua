import type { AppModel, EvoluaNode, ValueExpression } from "../model.ts";

export function getNode(model: AppModel, nodeId: string): EvoluaNode | undefined {
  return model.nodes[nodeId];
}

export function renameNode(model: AppModel, nodeId: string, nextName: string): AppModel {
  const node = model.nodes[nodeId];
  if (!node) return model;
  node.name = nextName;
  return model;
}

export function updateNodeProps(
  model: AppModel,
  nodeId: string,
  nextProps: Record<string, ValueExpression>
): AppModel {
  const node = model.nodes[nodeId];
  if (!node) return model;
  if (!("props" in node)) return model;
  node.props = nextProps;
  return model;
}
