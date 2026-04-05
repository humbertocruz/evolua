// Shared types for the runtime — mirrors the SaaS model structure

export type EvoluaNode = {
  id: string;
  kind: "heading" | "paragraph" | "text" | "link";
  text: string;
  href?: string;
};

export type EvoluaPageStatus = "draft" | "published";

export type EvoluaPage = {
  id: string;
  path: string;
  title: string;
  status: EvoluaPageStatus;
  nodes: EvoluaNode[];
  visual?: Record<string, { color?: string; tone?: "muted" | "default" }>;
};

export type EvoluaConfig = {
  projectId: string;
  endpoint: string;
  apiKey: string;
  debug?: boolean;
};
