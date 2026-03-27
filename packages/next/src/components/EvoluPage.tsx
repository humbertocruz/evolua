"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchPage } from "../client";
import type { AppModel, ViewNode, DataNode, BehaviorNode } from "@evolua/types";
import { extractPageNodes, extractRoutes } from "../renderer";
import { useEvolua } from "./EvoluProvider";

interface EvoluPageProps {
  fallback?: React.ReactNode;
}

export function EvoluPage({ fallback = null }: EvoluPageProps) {
  const { config } = useEvolua();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug ?? "/";
  const route = slug ? `/${slug}` : "/";

  const [model, setModel] = useState<AppModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config.projectId) return;

    setLoading(true);
    setError(null);

    fetchPage(config.projectId, route)
      .then((page) => {
        setModel(page.model);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load page");
        setLoading(false);
      });
  }, [config.projectId, route]);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!model) return <>{fallback}</>;

  return <RenderModel model={model} route={route} />;
}

// ─── Renderizador do modelo ────────────────────────────────

function RenderModel({ model, route }: { model: AppModel; route: string }) {
  const routes = extractRoutes(model);
  const pages = extractPageNodes(model);

  // Encontrar a página correspondente à rota atual
  const currentRoute = routes.find((r) => r.path === route);
  const pageNode = currentRoute
    ? model.nodes[currentRoute.pageRef.id]
    : pages[0];

  if (!pageNode || !isViewNode(pageNode)) {
    return <div>Page not found</div>;
  }

  return <RenderViewNode node={pageNode} allNodes={model.nodes} />;
}

function RenderViewNode({
  node,
  allNodes,
}: {
  node: ViewNode;
  allNodes: AppModel["nodes"];
}) {
  const tag = getHtmlTag(node.kind);
  const { props, children } = resolveNodeProps(node, allNodes);

  return (
    <tag {...props}>
      {children.map((childId) => {
        const child = allNodes[childId];
        if (!child || !isViewNode(child)) return null;
        return (
          <RenderViewNode key={child.id} node={child} allNodes={allNodes} />
        );
      })}
    </tag>
  );
}

// ─── Resolução de props ───────────────────────────────────

function resolveNodeProps(node: ViewNode, allNodes: AppModel["nodes"]) {
  const props: Record<string, unknown> = {};

  // Props do nó
  if (node.props) {
    for (const [key, value] of Object.entries(node.props)) {
      props[key] = resolveValue(value);
    }
  }

  // children
  const children = node.children ?? [];

  return { props, children };
}

function resolveValue(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(resolveValue);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (obj.kind === "ref" && typeof obj.expression === "string") {
      // Expressão referenciada — retorna placeholder por enquanto
      return `{${obj.expression}}`;
    }
    if (typeof obj.expression === "string") {
      return `{${obj.expression}}`;
    }
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveValue(v)]));
  }
  return null;
}

// ─── Helpers ─────────────────────────────────────────────

function getHtmlTag(kind: ViewNode["kind"]): string {
  const map: Record<ViewNode["kind"], string> = {
    page: "main",
    layout: "div",
    section: "section",
    component: "div",
    slot: "div",
    text: "span",
  };
  return map[kind] ?? "div";
}

function isViewNode(node: unknown): node is ViewNode {
  return (
    typeof node === "object" &&
    node !== null &&
    "kind" in node &&
    ["page", "layout", "section", "component", "slot", "text"].includes((node as ViewNode).kind)
  );
}

// ─── Estados ──────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
      Loading...
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ padding: "2rem", textAlign: "center", color: "#d32f2f" }}>
      Error: {message}
    </div>
  );
}
