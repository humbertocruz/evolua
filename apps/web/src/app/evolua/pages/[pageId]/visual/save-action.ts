"use server";

import { auth } from "@/auth";
import { savePageNodes } from "@/evolua/user-store";

export async function savePageNodesAction(
  pageId: string,
  nodes: Array<{
    id: string;
    kind: string;
    text: string;
    href?: string;
    parentId?: string | null;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await savePageNodes(pageId, session.user.id, nodes);
}
