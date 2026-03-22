import {
  buildMinimalApp,
  createMovieAppExample,
  projectBehavior,
  projectData,
  projectStructure,
  to3DJson,
} from "../../../packages/core/src/index.ts";

function summarizeNode(node) {
  return {
    id: node.id,
    name: node.name,
    kind: node.kind,
    tags: node.tags ?? [],
    props: "props" in node ? node.props ?? {} : {},
    children: "children" in node ? node.children ?? [] : [],
    styleTokens: "styleTokens" in node ? node.styleTokens ?? [] : [],
    dataRefs: "dataRefs" in node ? node.dataRefs ?? [] : [],
    behaviorRefs: "behaviorRefs" in node ? node.behaviorRefs ?? [] : [],
    source: "source" in node ? node.source ?? null : null,
    relationRefs: "relationRefs" in node ? node.relationRefs ?? [] : [],
    bindingRefs: "bindingRefs" in node ? node.bindingRefs ?? [] : [],
    schema: "schema" in node ? node.schema ?? null : null,
    trigger: "trigger" in node ? node.trigger ?? null : null,
    condition: "condition" in node ? node.condition ?? null : null,
    operation: "operation" in node ? node.operation ?? null : null,
    targetRefs: "targetRefs" in node ? node.targetRefs ?? [] : [],
    sideEffects: "sideEffects" in node ? node.sideEffects ?? [] : [],
    path: "path" in node ? node.path ?? null : null,
    pageRef: "pageRef" in node ? node.pageRef ?? null : null,
    params: "params" in node ? node.params ?? [] : [],
    transitions: "transitions" in node ? node.transitions ?? [] : [],
  };
}

function collectRelatedNodeIds(node) {
  const refs = new Set();
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

function createVisualTree(nodesById, nodeId) {
  const node = nodesById[nodeId];
  if (!node) return null;

  const isView = ["page", "layout", "section", "component", "slot", "text"].includes(node.kind);
  if (!isView) return null;

  return {
    id: node.id,
    name: node.name,
    kind: node.kind,
    props: node.props ?? {},
    styleTokens: node.styleTokens ?? [],
    children: (node.children ?? []).map((childId) => createVisualTree(nodesById, childId)).filter(Boolean),
  };
}

export function getEvoluaPreviewPanels() {
  const model = createMovieAppExample();
  const files = buildMinimalApp(model);
  const spatial = to3DJson(model);
  const nodes = Object.values(model.nodes).map((node) => {
    const summary = summarizeNode(node);
    return {
      ...summary,
      relatedNodeIds: collectRelatedNodeIds(summary),
    };
  });

  const nodesById = Object.fromEntries(nodes.map((node) => [node.id, node]));
  const visualTree = model.app.rootPageIds.map((id) => createVisualTree(nodesById, id)).filter(Boolean);

  return {
    app: {
      name: model.app.name,
      version: model.version,
      rootPageIds: model.app.rootPageIds,
      routeIds: model.app.routeIds,
    },
    nodes,
    visualTree,
    structure: projectStructure(model),
    data: projectData(model),
    behavior: projectBehavior(model),
    spatial,
    files,
  };
}
