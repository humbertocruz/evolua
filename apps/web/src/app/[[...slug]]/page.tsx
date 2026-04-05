import { notFound } from "next/navigation";
import { getDefaultProject, getPageByPath } from "@/evolua/store";
import { renderPage } from "@/evolua/runtime";

export const dynamic = "force-dynamic";

export default async function EvoluaDynamicPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const path = slug ? `/${slug.join("/")}` : "/";

  // Use the default (demo) project for public pages
  const project = await getDefaultProject();
  const page = await getPageByPath(path, project.id);

  if (!page) {
    notFound();
  }

  return renderPage(page);
}
