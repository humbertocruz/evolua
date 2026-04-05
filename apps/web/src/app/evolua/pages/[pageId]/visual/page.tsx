import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPageById, savePageNodes } from "@/evolua/user-store";
import { VisualEditor } from "../editor/visual-editor";
import type { EditorNode } from "../editor/editor-context";
import type { NodeKindLiteral } from "@evolua/types";

export const dynamic = "force-dynamic";

export default async function VisualEditorPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { pageId } = await params;
  const userId = session.user.id;
  const _pageData = await getPageById(decodeURIComponent(pageId), userId);
  if (!_pageData) notFound();
  const page = _pageData;

  // Convert flat DB nodes → nested EditorNode tree
  const dbNodes = (page.nodes ?? []) as DbNode[];
  const initialNodes: EditorNode[] = buildTree(dbNodes);

  async function handleSave(nodes: EditorNode[]) {
    "use server";
    const flatNodes = flattenTree(nodes);
    await savePageNodes(
      page.id,
      userId,
      flatNodes.map((n) => ({
        id: n.id,
        kind: n.kind,
        text: String(n.props.text ?? ""),
        href: n.props.href as string | undefined,
        parentId: n.parentId,
      }))
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/evolua/pages"
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50"
          >
            ← Voltar
          </Link>
          <div>
            <h1 className="font-semibold">{page.title}</h1>
            <p className="text-sm text-zinc-500">{page.path}</p>
          </div>
        </div>
        <Link
          href={`/evolua/pages/${encodeURIComponent(pageId)}`}
          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50"
        >
          📝 Ver modo lista
        </Link>
      </div>

      {/* Visual editor */}
      <VisualEditor pageId={page.id} initialNodes={initialNodes} onSave={handleSave} />
    </div>
  );
}

// ─── Tree conversion helpers ──────────────────────────────────

type DbNode = {
  id: string;
  kind: string;
  text?: string;
  href?: string;
  parentId?: string | null;
  [key: string]: unknown;
};

/** Build a nested EditorNode tree from a flat DB array */
function buildTree(dbNodes: DbNode[]): EditorNode[] {
  const nodeMap = new Map<string, EditorNode>();

  // First pass: create all nodes with empty children
  for (const n of dbNodes) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, kind: _kind, text: _text, href: _href, parentId: _parentId, ...rest } = n;
    nodeMap.set(n.id, {
      id: n.id,
      kind: n.kind as NodeKindLiteral,
      props: {
        ...rest,
        text: n.text ?? "",
        href: n.href,
      },
      parentId: (n.parentId as string | null) ?? null,
      children: [],
    });
  }

  // Second pass: wire children to parents
  const roots: EditorNode[] = [];
  for (const node of nodeMap.values()) {
    if (node.parentId === null) {
      roots.push(node);
    } else {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Orphan — treat as root
        roots.push(node);
      }
    }
  }

  return roots;
}

/** Flatten a nested tree back to a flat DB array */
function flattenTree(nodes: EditorNode[]): EditorNode[] {
  const result: EditorNode[] = [];
  function walk(n: EditorNode, parentId: string | null) {
    result.push({ ...n, parentId, children: [] });
    for (const child of n.children) {
      walk(child, n.id);
    }
  }
  for (const node of nodes) {
    walk(node, null);
  }
  return result;
}
