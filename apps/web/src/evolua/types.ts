export type EvoluaNode = {
  id: string;
  kind: "heading" | "paragraph" | "text" | "link";
  text: string;
  href?: string;
};

export type EvoluaPage = {
  id: string;
  path: string;
  title: string;
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
