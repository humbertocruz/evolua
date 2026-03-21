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

export function addNode(model: AppModel, node: EvoluaNode): AppModel {
  model.nodes[node.id] = node;
  return model;
}

export function removeNode(model: AppModel, nodeId: string): AppModel {
  if (!model.nodes[nodeId]) return model;
  delete model.nodes[nodeId];

  for (const node of Object.values(model.nodes)) {
    if ("children" in node && Array.isArray(node.children)) {
      node.children = node.children.filter((childId) => childId !== nodeId);
    }
    if ("dataRefs" in node && Array.isArray(node.dataRefs)) {
      node.dataRefs = node.dataRefs.filter((ref) => ref.id !== nodeId);
    }
    if ("behaviorRefs" in node && Array.isArray(node.behaviorRefs)) {
      node.behaviorRefs = node.behaviorRefs.filter((ref) => ref.id !== nodeId);
    }
    if ("relationRefs" in node && Array.isArray(node.relationRefs)) {
      node.relationRefs = node.relationRefs.filter((ref) => ref.id !== nodeId);
    }
    if ("targetRefs" in node && Array.isArray(node.targetRefs)) {
      node.targetRefs = node.targetRefs.filter((ref) => ref.id !== nodeId);
    }
    if ("bindingRefs" in node && Array.isArray(node.bindingRefs)) {
      node.bindingRefs = node.bindingRefs.filter(
        (binding) => binding.from.id !== nodeId && binding.to.id !== nodeId
      );
    }
    if ("pageRef" in node && node.pageRef?.id === nodeId) {
      node.pageRef = { id: "missing:page" };
    }
    if ("trigger" in node && node.trigger?.sourceRef?.id === nodeId) {
      node.trigger = { ...node.trigger, sourceRef: undefined };
    }
  }

  model.app.rootPageIds = model.app.rootPageIds.filter((id) => id !== nodeId);
  model.app.routeIds = model.app.routeIds.filter((id) => id !== nodeId);

  return model;
}

export function setNodeChildren(
  model: AppModel,
  nodeId: string,
  childIds: string[]
): AppModel {
  const node = model.nodes[nodeId];
  if (!node) return model;
  if (!("children" in node)) return model;
  node.children = childIds;
  return model;
}

export function appendChild(
  model: AppModel,
  parentId: string,
  childId: string
): AppModel {
  const node = model.nodes[parentId];
  if (!node) return model;
  if (!("children" in node)) return model;
  node.children = [...(node.children ?? []), childId];
  return model;
}

export function moveNode(
  model: AppModel,
  nodeId: string,
  nextParentId: string,
  index?: number
): AppModel {
  for (const node of Object.values(model.nodes)) {
    if ("children" in node && Array.isArray(node.children)) {
      node.children = node.children.filter((childId) => childId !== nodeId);
    }
  }

  const nextParent = model.nodes[nextParentId];
  if (!nextParent || !("children" in nextParent)) return model;

  const nextChildren = [...(nextParent.children ?? [])];
  if (typeof index === "number" && index >= 0 && index <= nextChildren.length) {
    nextChildren.splice(index, 0, nodeId);
  } else {
    nextChildren.push(nodeId);
  }
  nextParent.children = nextChildren;

  return model;
}

function ensureNodeRef(ref: NodeRef): NodeRef {
  return ref.kind ? ref : { id: ref.id };
}

function pushUniqueRef(current: NodeRef[] | undefined, ref: NodeRef): NodeRef[] {
  const normalized = ensureNodeRef(ref);
  const list = current ?? [];
  return list.some((item) => item.id === normalized.id) ? list : [...list, normalized];
}

function pushUniqueBinding(current: BindingRef[] | undefined, binding: BindingRef): BindingRef[] {
  const list = current ?? [];
  return list.some(
    (item) =>
      item.from.id === binding.from.id &&
      item.to.id === binding.to.id &&
      item.expression === binding.expression
  )
    ? list
    : [...list, binding];
}

export function linkDataToView(
  model: AppModel,
  viewNodeId: string,
  dataNodeRef: NodeRef
): AppModel {
  const node = model.nodes[viewNodeId];
  if (!node || !("dataRefs" in node)) return model;
  node.dataRefs = pushUniqueRef(node.dataRefs, dataNodeRef);
  return model;
}

export function linkBehaviorToView(
  model: AppModel,
  viewNodeId: string,
  behaviorNodeRef: NodeRef
): AppModel {
  const node = model.nodes[viewNodeId];
  if (!node || !("behaviorRefs" in node)) return model;
  node.behaviorRefs = pushUniqueRef(node.behaviorRefs, behaviorNodeRef);
  return model;
}

export function createBinding(
  model: AppModel,
  bindingOwnerId: string,
  binding: BindingRef
): AppModel {
  const node = model.nodes[bindingOwnerId];
  if (!node || !("bindingRefs" in node)) return model;
  node.bindingRefs = pushUniqueBinding(node.bindingRefs, {
    from: ensureNodeRef(binding.from),
    to: ensureNodeRef(binding.to),
    expression: binding.expression,
  });
  return model;
}

export function bindStateToText(
  model: AppModel,
  stateNodeId: string,
  textNodeId: string,
  expression: string
): AppModel {
  const textNode = model.nodes[textNodeId];
  if (!textNode || !("props" in textNode)) return model;

  textNode.props = {
    ...(textNode.props ?? {}),
    content: {
      kind: "binding",
      value: stateNodeId,
    },
  };

  return createBinding(model, stateNodeId, {
    from: { id: stateNodeId, kind: "state" },
    to: { id: textNodeId, kind: "text" },
    expression,
  });
}

export function attachEventToRoute(
  model: AppModel,
  eventNodeId: string,
  routeNodeId: string,
  transition: RouteTransition
): AppModel {
  const eventNode = model.nodes[eventNodeId];
  const routeNode = model.nodes[routeNodeId];
  if (!eventNode || !("targetRefs" in eventNode)) return model;
  if (!routeNode || !("pageRef" in routeNode)) return model;

  eventNode.targetRefs = pushUniqueRef(eventNode.targetRefs, { id: routeNodeId, kind: "route" });

  const transitions = routeNode.transitions ?? [];
  routeNode.transitions = transitions.some(
    (item) => item.eventName === transition.eventName && item.to === transition.to
  )
    ? transitions
    : [...transitions, transition];

  return model;
}
