export type EvoluaNode = {
  id: string;
  kind: "heading" | "paragraph" | "text" | "link";
  text: string;
  href?: string;
};

export type EvoluaPageStatus = "draft" | "published";

export type EvoluaPage = {
  id: string;
  projectId: string;
  path: string;
  title: string;
  status: EvoluaPageStatus;
  nodes: EvoluaNode[];
  visual?: Record<string, { color?: string; tone?: "muted" | "default" }>;
};

export type EvoluaAppModel = {
  app: {
    id: string;
    name: string;
    title: string;
  };
  pages: EvoluaPage[];
};
