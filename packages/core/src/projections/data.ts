import type { AppModel, DataNode, EvoluaNode } from "../model.ts";

function isDataNode(node: EvoluaNode | undefined): node is DataNode {
  return Boolean(
    node && ["entity", "field", "state", "query", "binding"].includes(node.kind)
  );
}

function renderSchema(node: DataNode): string[] {
  if (!node.schema?.fields?.length) return [];

  return node.schema.fields.map((field) => {
    const required = field.required ? "!" : "?";
    const list = field.isList ? "[]" : "";
    return `    field ${field.name}: ${field.type}${list}${required}`;
  });
}

function renderBindings(node: DataNode): string[] {
  if (!node.bindingRefs?.length) return [];

  return node.bindingRefs.map(
    (binding) =>
      `    binding ${binding.from.id} -> ${binding.to.id}${
        binding.expression ? ` (${binding.expression})` : ""
      }`
  );
}

export function projectData(model: AppModel): string {
  const lines: string[] = [];

  lines.push(`data:${model.app.name}`);

  const dataNodes = Object.values(model.nodes).filter(isDataNode);

  for (const node of dataNodes) {
    lines.push(`  - ${node.kind}:${node.name}`);

    if (node.source) {
      lines.push(`    source ${node.source.kind}${node.source.reference ? ` -> ${node.source.reference}` : ""}`);
    }

    if (node.relationRefs?.length) {
      for (const relation of node.relationRefs) {
        lines.push(`    relation -> ${relation.id}`);
      }
    }

    lines.push(...renderSchema(node));
    lines.push(...renderBindings(node));
  }

  return lines.join("\n");
}
