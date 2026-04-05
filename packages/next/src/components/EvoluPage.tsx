"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchPage } from "../client";
import { useEvolua } from "./EvoluProvider";
import type { EvoluaNode } from "@/evolua/types";

interface EvoluPageProps {
  fallback?: React.ReactNode;
}

export function EvoluPage({ fallback = null }: EvoluPageProps) {
  const { config } = useEvolua();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug ?? "";
  const path = slug ? `/${slug}` : "/";

  const [data, setData] = useState<{
    project: { id: string; slug: string; name: string };
    page: { id: string; path: string; title: string; nodes: unknown; visual?: unknown };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config?.endpoint) return;

    setLoading(true);
    setError(null);

    fetchPage(path)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load page");
        setLoading(false);
      });
  }, [config?.endpoint, path]);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <>{fallback}</>;

  return <RenderNodes nodes={data.page.nodes as EvoluaNode[]} visual={data.page.visual as Record<string, unknown> | undefined} />;
}

// ─── Renderizador simples de nodes ─────────────────────────

function RenderNodes({ nodes, visual }: { nodes: EvoluaNode[]; visual?: Record<string, unknown> }) {
  if (!nodes || nodes.length === 0) {
    return <p style={{ color: "#888", padding: "2rem", textAlign: "center" }}>Page is empty.</p>;
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", backgroundColor: "#fafafa" }}>
      <section style={{ maxWidth: "48rem", width: "100%", backgroundColor: "#fff", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
        {nodes.map((node) => (
          <RenderNode key={node.id} node={node} visual={visual} />
        ))}
      </section>
    </main>
  );
}

function RenderNode({ node, visual }: { node: EvoluaNode; visual?: Record<string, unknown> }) {
  const nodeVisual = visual?.[node.id] as Record<string, unknown> | undefined;
  const style: React.CSSProperties = {
    color: (nodeVisual?.color as string) ?? undefined,
    opacity: nodeVisual?.tone === "muted" ? 0.7 : undefined,
  };

  switch (node.kind) {
    case "heading":
      return <h1 style={{ fontSize: "2.25rem", fontWeight: 600, letterSpacing: "-0.025em", marginBottom: "1rem", ...style }}>{node.text}</h1>;
    case "paragraph":
      return <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "#52525b", marginBottom: "1rem", maxWidth: "42rem", ...style }}>{node.text}</p>;
    case "text":
      return <p style={{ fontSize: "0.875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#71717a", marginBottom: "0.5rem", ...style }}>{node.text}</p>;
    case "link":
      return (
        <a
          href={node.href ?? "#"}
          style={{ fontSize: "1rem", fontWeight: 500, textDecorationLine: "underline", textUnderlineOffset: "4px", transition: "opacity 0.2s", ...style }}
        >
          {node.text}
        </a>
      );
    default:
      return null;
  }
}

// ─── Estados ──────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
      Loading...
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626" }}>
      Error: {message}
    </div>
  );
}
