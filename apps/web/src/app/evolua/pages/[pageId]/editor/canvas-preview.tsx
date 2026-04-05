"use client";

import { useEditor } from "./editor-context";
import type { EditorNode } from "./editor-context";

export function CanvasPreview() {
  const { nodes } = useEditor();

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
        <p className="text-4xl">📭</p>
        <p className="mt-3 font-medium text-zinc-600">Canvas vazio</p>
        <p className="mt-1 text-sm text-zinc-400">
          Adicione elementos pela paleta ao lado
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[500px] rounded-2xl border border-zinc-200 bg-white p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {nodes.map((node) => (
          <RenderNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}

// Recursive renderer
function RenderNode({ node }: { node: EditorNode }) {
  const p = node.props;

  // Render children recursively
  function renderChildren() {
    if (!node.children || node.children.length === 0) return null;
    return (
      <div className={childContainerClass(node.kind)}>
        {node.children.map((child) => (
          <RenderNode key={child.id} node={child} />
        ))}
      </div>
    );
  }

  function childContainerClass(kind: string): string {
    switch (kind) {
      case "columns": return "contents";
      case "container": return "";
      case "card": return "";
      case "list": return "";
      default: return "mt-2";
    }
  }

  switch (node.kind) {
    case "heading": {
      const level = String(p.level ?? "h1") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      const text = String(p.text ?? "");
      const align = String(p.align ?? "left") as "left" | "center" | "right";
      const color = p.color as string | undefined;
      const style = { textAlign: align, color };
      if (level === "h1") return <h1 style={style}>{text}{renderChildren()}</h1>;
      if (level === "h2") return <h2 style={style}>{text}{renderChildren()}</h2>;
      if (level === "h3") return <h3 style={style}>{text}{renderChildren()}</h3>;
      if (level === "h4") return <h4 style={style}>{text}{renderChildren()}</h4>;
      if (level === "h5") return <h5 style={style}>{text}{renderChildren()}</h5>;
      return <h6 style={style}>{text}{renderChildren()}</h6>;
    }

    case "paragraph": {
      const text = String(p.text ?? "");
      const align = String(p.align ?? "left") as "left" | "center" | "right";
      return <p style={{ textAlign: align }} className="text-base leading-relaxed text-zinc-700">{text}{renderChildren()}</p>;
    }

    case "text": {
      const text = String(p.text ?? "");
      const size = String(p.size ?? "base");
      const weight = String(p.weight ?? "normal");
      const color = p.color as string | undefined;
      const sizeClass: Record<string, string> = {
        xs: "text-xs", sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl", "2xl": "text-2xl",
      };
      const weightClass: Record<string, string> = {
        light: "font-light", normal: "font-normal", medium: "font-medium", bold: "font-bold",
      };
      return (
        <span
          className={`${sizeClass[size] ?? "text-base"} ${weightClass[weight] ?? ""}`}
          style={{ color }}
        >
          {text}
        </span>
      );
    }

    case "link": {
      const text = String(p.text ?? "");
      const href = String(p.href ?? "#");
      const underline = p.underline !== false;
      const color = p.color as string | undefined;
      return (
        <a
          href={href}
          target={String(p.target ?? "_self")}
          className={`text-blue-600 hover:underline ${underline ? "" : "no-underline"}`}
          style={{ color }}
        >
          {text}
        </a>
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
        <button className={`rounded-xl px-4 py-2 text-sm font-medium transition ${variantClass[variant] ?? ""} ${fullWidth ? "w-full" : ""}`}>
          {text}
        </button>
      );
    }

    case "divider": {
      const orientation = String(p.orientation ?? "horizontal");
      return orientation === "horizontal" ? (
        <hr className="border-zinc-300" />
      ) : (
        <div className="h-8 w-px bg-zinc-300" />
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
        <div
          className={`${maxWidthClass[maxWidth] ?? ""} ${paddingClass[padding] ?? "p-4"}`}
          style={{ backgroundColor: bg }}
        >
          {node.children.length > 0 ? renderChildren() : <span className="text-zinc-400">container</span>}
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
              {node.children[i] ? <RenderNode node={node.children[i]} /> : `Coluna ${i + 1}`}
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
          {node.children.length > 0
            ? node.children.map((c) => <li key={c.id}><RenderNode node={c} /></li>)
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
          {node.children.length > 0
            ? node.children.map((c) => <RenderNode key={c.id} node={c} />)
            : <span className="text-zinc-400">Card vazio</span>
          }
        </div>
      );
    }

    default:
      return (
        <div className="rounded bg-zinc-100 px-3 py-2 text-sm text-zinc-500">
          [{node.kind}]
        </div>
      );
  }
}
