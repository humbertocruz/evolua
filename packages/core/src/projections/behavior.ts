import type { AppModel, BehaviorNode, EvoluaNode } from "../model.ts";

function isBehaviorNode(node: EvoluaNode | undefined): node is BehaviorNode {
  return Boolean(node && ["event", "action", "effect"].includes(node.kind));
}

export function projectBehavior(model: AppModel): string {
  const lines: string[] = [];

  lines.push(`behavior:${model.app.name}`);

  const behaviorNodes = Object.values(model.nodes).filter(isBehaviorNode);

  for (const node of behaviorNodes) {
    lines.push(`  - ${node.kind}:${node.name}`);

    if (node.trigger) {
      lines.push(
        `    trigger ${node.trigger.kind}:${node.trigger.name}${
          node.trigger.sourceRef ? ` from ${node.trigger.sourceRef.id}` : ""
        }`
      );
    }

    if (node.condition) {
      lines.push(`    condition ${node.condition.expression}`);
    }

    if (node.operation) {
      lines.push(`    operation ${node.operation.kind}:${node.operation.name}`);
    }

    if (node.targetRefs?.length) {
      for (const target of node.targetRefs) {
        lines.push(`    target -> ${target.id}`);
      }
    }

    if (node.sideEffects?.length) {
      for (const effect of node.sideEffects) {
        lines.push(`    side-effect ${effect.kind}:${effect.name}`);
      }
    }
  }

  return lines.join("\n");
}
