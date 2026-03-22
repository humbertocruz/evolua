import type { NextRequest } from "next/server";

import { getRuntimePageByProjectSlugAndPath } from "@/evolua/store";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectSlug: string }> },
) {
  const { projectSlug } = await context.params;
  const rawPath = request.nextUrl.searchParams.get("path")?.trim();

  if (!rawPath) {
    return Response.json(
      {
        error: "Missing required query param: path",
      },
      { status: 400 },
    );
  }

  if (!rawPath.startsWith("/")) {
    return Response.json(
      {
        error: "Invalid path. It must start with '/'.",
      },
      { status: 400 },
    );
  }

  const runtimePage = await getRuntimePageByProjectSlugAndPath(projectSlug, rawPath);

  if (!runtimePage) {
    return Response.json(
      {
        error: `Project '${projectSlug}' was not found.`,
      },
      { status: 404 },
    );
  }

  if (!runtimePage.page) {
    return Response.json(
      {
        error: `Published page '${rawPath}' was not found for project '${projectSlug}'.`,
      },
      { status: 404 },
    );
  }

  return Response.json({
    project: runtimePage.project,
    page: runtimePage.page,
  });
}
