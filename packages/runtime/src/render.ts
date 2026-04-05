import React from "react";
import { Button, Card, Input } from "@evolua/ui";
import type { PageNode, VisualConfig } from "./types";

interface RenderOptions {
  onCreatePage?: () => void;
  onDeletePage?: (pageId: string) => void;
  onPublishPage?: (pageId: string) => void;
}

function renderNode(node: PageNode): React.ReactNode {
  if (!node) return null;

  switch (node.type) {
    case "heading":
      return (
        <h1 key={node.id} className="text-3xl font-bold text-gray-900">
          {node.props?.text as string}
        </h1>
      );
    case "paragraph":
      return (
        <p key={node.id} className="text-gray-600 leading-relaxed">
          {node.props?.text as string}
        </p>
      );
    case "button":
      return (
        <Button
          key={node.id}
          variant={(node.props?.variant as "primary" | "secondary" | "ghost") ?? "primary"}
          size={(node.props?.size as "sm" | "md" | "lg") ?? "md"}
        >
          {node.props?.text as string}
        </Button>
      );
    case "input":
      return (
        <Input
          key={node.id}
          label={node.props?.label as string}
          placeholder={node.props?.placeholder as string}
          type={node.props?.type as string}
        />
      );
    case "card":
      return (
        <Card key={node.id} variant="default" padding="md">
          {node.children?.map(renderNode)}
        </Card>
      );
    default:
      return null;
  }
}

export interface RenderPageOptions extends RenderOptions {
  visual?: VisualConfig;
}

export function renderPage(
  page: {
    title: string;
    status: string;
    nodes: PageNode[];
    visual?: VisualConfig;
  },
  options?: RenderPageOptions
): React.ReactNode {
  const parsedNodes: PageNode[] =
    typeof page.nodes === "string" ? JSON.parse(page.nodes) : page.nodes;

  const visual: VisualConfig =
    typeof page.visual === "string"
      ? JSON.parse(page.visual)
      : page.visual ?? {};

  const backgroundColor =
    visual.theme === "dark" ? "bg-gray-900" : "bg-gray-50";

  return (
    <div
      className={`min-h-screen ${backgroundColor}`}
      style={visual.styles as React.CSSProperties}
    >
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
            {page.status === "draft" && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                Draft
              </span>
            )}
          </div>
          {options?.onPublishPage && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => options.onPublishPage?.(page.id ?? "")}
            >
              {page.status === "published" ? "Unpublish" : "Publish"}
            </Button>
          )}
        </div>

        {/* Page Content */}
        <div className="space-y-4">
          {parsedNodes.map(renderNode)}
        </div>

        {/* Empty State */}
        {parsedNodes.length === 0 && (
          <Card variant="outlined" padding="lg" className="text-center">
            <p className="text-gray-500 mb-4">This page has no content yet.</p>
            {options?.onCreatePage && (
              <Button variant="primary" onClick={options.onCreatePage}>
                Add Content
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
