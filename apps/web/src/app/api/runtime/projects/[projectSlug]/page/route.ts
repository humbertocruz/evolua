import type { NextRequest } from "next/server";
import { getProjectByApiKey } from "@/evolua/user-store";

export const dynamic = "force-dynamic";

// GET /api/runtime/projects/:projectSlug/page?path=/home
// Returns a published page by project slug (legacy — prefer ?key= API)
// The projectSlug param is ignored when using API key in header
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectSlug: string }> },
) {
  const apiKey = request.headers.get("x-api-key") ?? request.nextUrl.searchParams.get("key");

  if (!apiKey) {
    return Response.json({ error: "Missing API key (x-api-key header or ?key=)" }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get("path")?.trim();
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

  // Import here to avoid circular deps
  const { getRuntimePageByProjectSlug } = await import("@/evolua/user-store");
  const result = await getRuntimePageByProjectSlug(project.slug, path);

  if (!result || !result.page) {
    return Response.json({ error: "Page not found or not published" }, { status: 404 });
  }

  return Response.json({
    project: { id: project.id, slug: project.slug, name: project.name },
    page: result.page,
  });
}
