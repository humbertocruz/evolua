import { notFound } from "next/navigation";
import { getPageByPath } from "@/evolua/store";
import { renderPage } from "@/evolua/runtime";

export const dynamic = "force-dynamic";

export default async function EvoluaDynamicPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const path = slug ? `/${slug.join("/")}` : "/";
  const page = await getPageByPath(path);

  if (!page) {
    notFound();
  }

  return renderPage(page);
}
