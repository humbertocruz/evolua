import type { NextRequest } from "next/server";
import { getProjectByApiKey, getRuntimePageByProjectSlug } from "@/evolua/user-store";

export const dynamic = "force-dynamic";

// GET /api/runtime/project?key=pk_xxx&path=/home
// Returns the published page for a project identified by API key
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const apiKey = searchParams.get("key");
  const path = searchParams.get("path")?.trim();

  if (!apiKey) {
    return Response.json({ error: "Missing API key" }, { status: 401 });
  }

  if (!path) {
    return Response.json({ error: "Missing path query param" }, { status: 400 });
  }

  if (!path.startsWith("/")) {
    return Response.json({ error: "Path must start with /" }, { status: 400 });
  }

  const project = await getProjectByApiKey(apiKey);
  if (!project) {
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  const result = await getRuntimePageByProjectSlug(project.slug, path);
  if (!result || !result.page) {
    return Response.json(
      { error: `Page '${path}' not found or not published` },
      { status: 404 }
    );
  }

  return Response.json({
    project: {
      id: project.id,
      slug: project.slug,
      name: project.name,
    },
    page: result.page,
  });
}
