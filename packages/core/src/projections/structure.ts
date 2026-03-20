import type { AppModel, EvoluaNode, ViewNode } from "../model.ts";

function isViewNode(node: EvoluaNode | undefined): node is ViewNode {
  return Boolean(
    node &&
      ["page", "layout", "section", "component", "slot", "text"].includes(node.kind)
  );
}

function renderNode(model: AppModel, nodeId: string, depth = 0): string[] {
  const node = model.nodes[nodeId];
  if (!isViewNode(node)) {
    return [`${"  ".repeat(depth)}- [missing-view-node] ${nodeId}`];
  }

  const label = `${"  ".repeat(depth)}- ${node.kind}:${node.name}`;
  const children = (node.children ?? []).flatMap((childId) =>
    renderNode(model, childId, depth + 1)
  );

  return [label, ...children];
}

export function projectStructure(model: AppModel): string {
  const lines: string[] = [];

  lines.push(`app:${model.app.name}`);

  for (const pageId of model.app.rootPageIds) {
    lines.push(...renderNode(model, pageId, 1));
  }

  return lines.join("\n");
}
