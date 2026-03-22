import { notFound } from "next/navigation";

import { normalizePathFromSlug, renderPage } from "@/evolua/runtime";

export const dynamic = "force-dynamic";
import { getPageByPath } from "@/evolua/store";

export default async function EvoluaDynamicPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const path = normalizePathFromSlug(slug);
  const page = await getPageByPath(path);

  if (!page) {
    notFound();
  }

  return renderPage(page);
}
