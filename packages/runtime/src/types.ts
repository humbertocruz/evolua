export type { EvoluaPage, PageStatus } from "@evolua/types";

export interface PageNode {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: PageNode[];
}

export interface VisualConfig {
  theme?: string;
  styles?: Record<string, unknown>;
}
