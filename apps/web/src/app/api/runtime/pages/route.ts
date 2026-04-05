import type { NextRequest } from "next/server";
import { getProjectByApiKey } from "@/evolua/user-store";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/runtime/pages?key=pk_xxx
// Returns all published pages for a project
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const apiKey = searchParams.get("key");

  if (!apiKey) {
    return Response.json({ error: "Missing API key" }, { status: 401 });
  }

  const project = await getProjectByApiKey(apiKey);
  if (!project) {
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  const pages = await prisma.page.findMany({
    where: { projectId: project.id, status: "published" },
    select: { id: true, path: true, title: true },
    orderBy: { path: "asc" },
  });

  return Response.json({
    project: { id: project.id, slug: project.slug, name: project.name },
    pages,
  });
}
