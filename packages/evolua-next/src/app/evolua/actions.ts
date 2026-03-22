"use server";

import { revalidatePath } from "next/cache";

import { updatePageInModel } from "@/evolua/store";

export async function updatePageBasics(formData: FormData) {
  const pageId = String(formData.get("pageId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const path = String(formData.get("path") ?? "").trim();

  if (!pageId || !title || !path.startsWith("/")) {
    throw new Error("Invalid page payload.");
  }

  await updatePageInModel(pageId, (page) => ({
    ...page,
    title,
    path,
  }));

  revalidatePath("/evolua");
  revalidatePath("/evolua/pages");
  revalidatePath(`/evolua/pages/${encodeURIComponent(pageId)}`);
  revalidatePath(path);
}
