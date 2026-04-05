import { z } from "zod";

// ────────────────────────────────────────────────────────────────
// Fonte de verdade: um schema Zod por node kind
// O editor introspecta estes schemas pra gerar forms automaticamente.
// O renderer usa os tipos inferidos pra tipar os props.
// Campo `custom` garante que NADA fica de fora — livre key-value.
// ────────────────────────────────────────────────────────────────

// ─── Base ──────────────────────────────────────────────────────

export const nodeKinds = [
  "heading",
  "paragraph",
  "text",
  "link",
  "image",
  "button",
  "divider",
  "spacer",
  "container",
  "columns",
  "list",
  "listItem",
  "card",
] as const;

export type NodeKindLiteral = (typeof nodeKinds)[number];

// ─── Custom catch-all ──────────────────────────────────────────

/**
 * Campo livre: o usuário pode adicionar qualquer prop que quiser.
 * O renderer passa direto pro elemento (via spread).
 * Útil pra data-*, aria-*, props específicas de libs externas, etc.
 */
export const customPropsSchema = z.record(z.string(), z.unknown()).optional();

// ─── Node Schemas ─────────────────────────────────────────────

export const nodeSchemas = {
  // ── Textos ──────────────────────────────────────────────────

  heading: z.object({
    text: z.string().min(1),
    level: z.enum(["h1", "h2", "h3", "h4", "h5", "h6"]).default("h1"),
    align: z.enum(["left", "center", "right"]).default("left"),
    color: z.string().optional(), // hex ou tailwind class
    custom: customPropsSchema,
  }),

  paragraph: z.object({
    text: z.string().min(1),
    align: z.enum(["left", "center", "right"]).default("left"),
    color: z.string().optional(),
    custom: customPropsSchema,
  }),

  text: z.object({
    text: z.string(),
    size: z.enum(["xs", "sm", "base", "lg", "xl", "2xl"]).default("base"),
    weight: z.enum(["light", "normal", "medium", "bold"]).default("normal"),
    color: z.string().optional(),
    custom: customPropsSchema,
  }),

  // ── Mídia ───────────────────────────────────────────────────

  link: z.object({
    text: z.string().min(1),
    href: z.string(),
    target: z.enum(["_self", "_blank", "_parent", "_top"]).default("_self"),
    align: z.enum(["left", "center", "right"]).default("left"),
    color: z.string().optional(),
    underline: z.boolean().default(true),
    custom: customPropsSchema,
  }),

  image: z.object({
    src: z.string().url("Deve ser uma URL válida"),
    alt: z.string().default(""),
    width: z.number().optional(),
    height: z.number().optional(),
    aspectRatio: z.string().optional(), // ex: "16/9"
    objectFit: z.enum(["cover", "contain", "fill", "none"]).default("cover"),
    rounded: z.enum(["none", "sm", "md", "lg", "xl", "full"]).default("none"),
    shadow: z.boolean().default(false),
    custom: customPropsSchema,
  }),

  // ── Ações ──────────────────────────────────────────────────

  button: z.object({
    text: z.string().min(1),
    variant: z.enum(["solid", "outline", "ghost", "link"]).default("solid"),
    size: z.enum(["xs", "sm", "md", "lg"]).default("md"),
    color: z.string().optional(),
    href: z.string().optional(),      // se preenchido, renderiza como <a>
    action: z.string().optional(),    // nome da action (onClick)
    align: z.enum(["left", "center", "right"]).default("left"),
    fullWidth: z.boolean().default(false),
    custom: customPropsSchema,
  }),

  // ── Layout ─────────────────────────────────────────────────

  divider: z.object({
    orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
    color: z.string().optional(),
    thickness: z.enum(["thin", "medium", "thick"]).default("thin"),
    custom: customPropsSchema,
  }),

  spacer: z.object({
    size: z.enum(["xs", "sm", "md", "lg", "xl"]).default("md"),
    direction: z.enum(["horizontal", "vertical"]).default("vertical"),
    custom: customPropsSchema,
  }),

  container: z.object({
    tag: z.enum(["div", "section", "article", "aside", "header", "footer", "main"]).default("div"),
    maxWidth: z.enum(["none", "sm", "md", "lg", "xl", "2xl", "full"]).default("lg"),
    padding: z.enum(["none", "sm", "md", "lg", "xl"]).default("md"),
    bg: z.string().optional(),
    custom: customPropsSchema,
  }),

  columns: z.object({
    count: z.enum(["2", "3", "4"]).default("3"),
    gap: z.enum(["none", "sm", "md", "lg"]).default("md"),
    collapseOn: z.enum(["sm", "md", "lg", "none"]).default("md"), // em qual breakpoint empilha
    align: z.enum(["top", "center", "bottom"]).default("top"),
    custom: customPropsSchema,
  }),

  list: z.object({
    ordered: z.boolean().default(false),
    spacing: z.enum(["tight", "normal", "relaxed"]).default("normal"),
    custom: customPropsSchema,
  }),

  listItem: z.object({
    text: z.string().min(1),
    index: z.number().optional(),
    custom: customPropsSchema,
  }),

  card: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),      // URL da imagem de capa
    href: z.string().optional(),       // se preenchido, card é clicável
    padding: z.enum(["none", "sm", "md", "lg"]).default("md"),
    shadow: z.boolean().default(false),
    rounded: z.enum(["none", "sm", "md", "lg"]).default("md"),
    bg: z.string().optional(),
    custom: customPropsSchema,
  }),
} as const satisfies Record<string, z.ZodObject<Record<string, z.ZodTypeAny>>>;

// ─── Inferência de tipos ──────────────────────────────────────

export type NodeSchema = typeof nodeSchemas;
export type NodeProps<K extends keyof NodeSchema> = z.infer<NodeSchema[K]>;

// Exemplo de uso:
//
//   type HeadingProps = NodeProps<"heading">;
//   // → { text: string; level: "h1" | ...; align: "left" | ...; ... }
//
//   type ButtonProps = NodeProps<"button">;
//   // → { text: string; variant: "solid" | ...; href?: string; ... }

// ─── Accessors para o editor ──────────────────────────────────

/** Lista de todos os kinds disponíveis (pra paleta) */
export const nodeKindList = nodeKinds.map((k) => ({
  kind: k,
  label: kindLabel[k] ?? k,
  icon: kindIcon[k] ?? "📦",
}));

/** Rótulos amigáveis */
export const kindLabel: Record<string, string> = {
  heading: "Título",
  paragraph: "Parágrafo",
  text: "Texto pequeno",
  link: "Link",
  image: "Imagem",
  button: "Botão",
  divider: "Divisor",
  spacer: "Espaçador",
  container: "Container",
  columns: "Colunas",
  list: "Lista",
  listItem: "Item de lista",
  card: "Card",
};

/** Ícones pro editor (emojis temporários) */
export const kindIcon: Record<string, string> = {
  heading: "H1",
  paragraph: "¶",
  text: "Aa",
  link: "🔗",
  image: "🖼",
  button: "🔘",
  divider: "—",
  spacer: "↕",
  container: "▢",
  columns: "⊟",
  list: "☰",
  listItem: "•",
  card: "▣",
};

/** Retorna os fields de um schema pra gerar o form */
export function getNodeFields<K extends keyof NodeSchema>(
  kind: K
): Array<{ name: string; schema: z.ZodTypeAny }> {
  const shape = nodeSchemas[kind].shape;
  return Object.entries(shape).map(([name, schema]) => ({ name, schema }));
}

// ─── Render map (tipos pro renderer) ─────────────────────────

/** Props completos de um node — inferidos do schema Zod */
export type RenderableNodeProps = {
  [K in keyof NodeSchema]: NodeProps<K>;
};
