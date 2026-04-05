import Link from "next/link";
import type { CSSProperties } from "react";
import type { NodeKindLiteral } from "@evolua/types";

type Node = {
  id: string;
  kind: NodeKindLiteral;
  text?: string;
  href?: string;
  src?: string;
  alt?: string;
  level?: string;
  align?: string;
  color?: string;
  tone?: string;
  ordered?: boolean;
  rounded?: string;
  shadow?: boolean;
  variant?: string;
  fullWidth?: boolean;
  underline?: boolean;
  target?: string;
  size?: string;
  weight?: string;
  spacing?: string;
  maxWidth?: string;
  padding?: string;
  tag?: string;
  bg?: string;
  gap?: string;
  count?: string;
  collapseOn?: string;
  direction?: string;
  orientation?: string;
  thickness?: string;
  objectFit?: string;
  title?: string;
  description?: string;
  [key: string]: unknown;
  children?: Node[];
};

function getNodeStyle(visual: Record<string, unknown> | undefined, nodeId: string): CSSProperties {
  const nodeVisual = visual?.[nodeId] as Record<string, unknown> | undefined;
  return {
    color: (nodeVisual?.color as string) ?? undefined,
    opacity: nodeVisual?.tone === "muted" ? 0.7 : undefined,
  };
}

function classForAlign(align?: string): string {
  switch (align) {
    case "center": return "text-center";
    case "right": return "text-right";
    default: return "text-left";
  }
}

function renderRec(node: Node, visual?: Record<string, unknown>): React.ReactNode {
  const p = node;
  const style = getNodeStyle(visual, node.id);

  function renderChildren() {
    if (!node.children || node.children.length === 0) return null;
    return <>{node.children.map((child) => renderRec(child, visual))}</>;
  }

  switch (node.kind) {
    case "heading": {
      const level = String(p.level ?? "h1");
      const text = String(p.text ?? "");
      const align = String(p.align ?? "left");
      if (level === "h1") return <h1 style={style} className={`text-4xl font-bold tracking-tight ${classForAlign(align)}`}>{text}{renderChildren()}</h1>;
      if (level === "h2") return <h2 style={style} className={`text-3xl font-bold ${classForAlign(align)}`}>{text}{renderChildren()}</h2>;
      if (level === "h3") return <h3 style={style} className={`text-2xl font-bold ${classForAlign(align)}`}>{text}{renderChildren()}</h3>;
      if (level === "h4") return <h4 style={style} className={`text-xl font-bold ${classForAlign(align)}`}>{text}{renderChildren()}</h4>;
      if (level === "h5") return <h5 style={style} className={`text-lg font-bold ${classForAlign(align)}`}>{text}{renderChildren()}</h5>;
      return <h6 style={style} className={`text-base font-bold ${classForAlign(align)}`}>{text}{renderChildren()}</h6>;
    }

    case "paragraph": {
      const text = String(p.text ?? "");
      const align = String(p.align ?? "left");
      return (
        <p style={style} className={`max-w-2xl text-base leading-7 text-zinc-600 ${classForAlign(align)}`}>
          {text}{renderChildren()}
        </p>
      );
    }

    case "text": {
      const text = String(p.text ?? "");
      const size = String(p.size ?? "base");
      const weight = String(p.weight ?? "normal");
      const sizeClass: Record<string, string> = {
        xs: "text-xs", sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl", "2xl": "text-2xl",
      };
      const weightClass: Record<string, string> = {
        light: "font-light", normal: "font-normal", medium: "font-medium", bold: "font-bold",
      };
      return (
        <span style={style} className={`${sizeClass[size] ?? "text-base"} ${weightClass[weight] ?? ""}`}>
          {text}
        </span>
      );
    }

    case "link": {
      const text = String(p.text ?? "");
      const href = String(p.href ?? "#");
      const underline = p.underline !== false;
      const color = p.color ?? style.color;
      return (
        <Link
          href={href}
          target={String(p.target ?? "_self")}
          className={`text-base font-medium underline underline-offset-4 transition-opacity hover:opacity-80 ${underline ? "" : "no-underline"}`}
          style={{ color: color as string | undefined }}
        >
          {text}
        </Link>
      );
    }

    case "image": {
      const src = String(p.src ?? "");
      const alt = String(p.alt ?? "");
      const rounded = String(p.rounded ?? "md");
      const shadow = p.shadow === true;
      const roundedClass: Record<string, string> = {
        none: "rounded-none", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl", full: "rounded-full",
      };
      return (
        <div className={`overflow-hidden ${roundedClass[rounded] ?? "rounded-md"} ${shadow ? "shadow-md" : ""}`}>
          <img src={src} alt={alt} className="w-full object-cover" loading="lazy" />
        </div>
      );
    }

    case "button": {
      const text = String(p.text ?? "");
      const variant = String(p.variant ?? "solid");
      const fullWidth = p.fullWidth === true;
      const variantClass: Record<string, string> = {
        solid: "bg-indigo-600 text-white hover:bg-indigo-700",
        outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
        ghost: "text-indigo-600 hover:bg-indigo-50",
        link: "text-blue-600 hover:underline",
      };
      return (
        <button
          type="button"
          className={`inline-block rounded-xl px-4 py-2 text-sm font-medium transition ${variantClass[variant] ?? ""} ${fullWidth ? "w-full" : ""}`}
        >
          {text}
        </button>
      );
    }

    case "divider": {
      const orientation = String(p.orientation ?? "horizontal");
      return orientation === "horizontal" ? (
        <hr className="my-4 border-zinc-300" />
      ) : (
        <div className="my-2 h-8 w-px bg-zinc-300" />
      );
    }

    case "spacer": {
      const size = String(p.size ?? "md");
      const direction = String(p.direction ?? "vertical");
      const sizeClass: Record<string, string> = {
        xs: "h-2", sm: "h-4", md: "h-6", lg: "h-10", xl: "h-16",
      };
      return (
        <div
          className={`${sizeClass[size] ?? "h-6"} ${direction === "horizontal" ? "w-4 inline-block" : ""}`}
          aria-hidden="true"
        />
      );
    }

    case "container": {
      const tag = String(p.tag ?? "div");
      const maxWidth = String(p.maxWidth ?? "lg");
      const padding = String(p.padding ?? "md");
      const bg = p.bg as string | undefined;
      const maxWidthClass: Record<string, string> = {
        none: "max-w-none", sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl", "2xl": "max-w-2xl", full: "max-w-full",
      };
      const paddingClass: Record<string, string> = {
        none: "p-0", sm: "p-2", md: "p-4", lg: "p-6", xl: "p-8",
      };
      return (
        // @ts-ignore — dynamic tag
        <div
          className={`${maxWidthClass[maxWidth] ?? "max-w-lg"} ${paddingClass[padding] ?? "p-4"}`}
          style={{ backgroundColor: bg }}
        >
          {node.children && node.children.length > 0
            ? node.children.map((c) => renderRec(c, visual))
            : null}
        </div>
      );
    }

    case "columns": {
      const count = parseInt(String(p.count ?? "3"), 10);
      const gap = String(p.gap ?? "md");
      const gapClass: Record<string, string> = {
        none: "gap-0", sm: "gap-2", md: "gap-4", lg: "gap-6",
      };
      return (
        <div className={`grid grid-cols-${count} ${gapClass[gap] ?? "gap-4"}`}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-400">
              {node.children && node.children[i]
                ? renderRec(node.children[i], visual)
                : `Coluna ${i + 1}`}
            </div>
          ))}
        </div>
      );
    }

    case "list": {
      const ordered = p.ordered === true;
      const spacing = String(p.spacing ?? "normal");
      const spacingClass: Record<string, string> = {
        tight: "space-y-1", normal: "space-y-2", relaxed: "space-y-4",
      };
      const Tag = ordered ? "ol" : "ul";
      return (
        <Tag className={`${spacingClass[spacing] ?? "space-y-2"} pl-5`}>
          {node.children && node.children.length > 0
            ? node.children.map((c) => <li key={c.id}>{renderRec(c, visual)}</li>)
            : <><li>Item 1</li><li>Item 2</li><li>Item 3</li></>
          }
        </Tag>
      );
    }

    case "listItem": {
      const text = String(p.text ?? "");
      return <li className="text-zinc-600">{text}</li>;
    }

    case "card": {
      const shadow = p.shadow === true;
      const rounded = String(p.rounded ?? "md");
      const padding = String(p.padding ?? "md");
      const bg = p.bg as string | undefined;
      const roundedClass: Record<string, string> = {
        none: "rounded-none", sm: "rounded-sm", md: "rounded-lg", lg: "rounded-xl", xl: "rounded-2xl", full: "rounded-full",
      };
      const paddingClass: Record<string, string> = {
        none: "p-0", sm: "p-2", md: "p-4", lg: "p-6", xl: "p-8",
      };
      return (
        <div
          className={`overflow-hidden ${roundedClass[rounded] ?? ""} ${shadow ? "shadow-md" : "border border-zinc-200"} ${paddingClass[padding] ?? "p-4"}`}
          style={{ backgroundColor: bg }}
        >
          {node.children && node.children.length > 0
            ? node.children.map((c) => renderRec(c, visual))
            : null}
        </div>
      );
    }

    default:
      return null;
  }
}

export function normalizePathFromSlug(slug?: string[]) {
  if (!slug || slug.length === 0) return "/";
  return `/${slug.join("/")}`;
}

export function renderPage(
  page: { nodes: unknown; visual?: unknown },
  options: { className?: string } = {}
) {
  // Support both flat array (legacy) and nested tree (new editor)
  const rawNodes = page.nodes as Node[] | undefined;
  const visual = page.visual as Record<string, unknown> | undefined;

  return (
    <main className={`flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-950 ${options.className ?? ""}`}>
      <section className="flex w-full max-w-3xl flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
        {rawNodes && rawNodes.length > 0
          ? rawNodes.map((node) => renderRec(node, visual))
          : <p className="text-zinc-400">Esta página está vazia.</p>
        }
      </section>
    </main>
  );
}
