import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProjects } from "@/evolua/user-store";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await getUserProjects(session.user.id!);
  const project = projects[0];

  if (!project) {
    return NextResponse.json({ error: "No project found" }, { status: 404 });
  }

  const packageJson = {
    name: `@evolua/project-${project.slug}`,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      dev: "next dev",
      build: "prisma generate && next build",
      start: "next start",
      "db:generate": "prisma generate",
      "db:push": "prisma db push",
      "db:seed": "tsx prisma/seed.ts",
    },
    dependencies: {
      "@evolua/db": "^0.1.0",
      "@evolua/runtime": "^0.1.0",
      "@evolua/ui": "^0.1.0",
      next: "^15.0.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
      "@prisma/client": "^6.0.0",
      bcryptjs: "^3.0.0",
    },
    devDependencies: {
      prisma: "^6.0.0",
      typescript: "^5.0.0",
      tsx: "^4.0.0",
      "@types/node": "^22.0.0",
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
      "@types/bcryptjs": "^2.4.0",
    },
  };

  return NextResponse.json(packageJson, {
    headers: {
      "Content-Disposition": `attachment; filename="package-${project.slug}.json"`,
    },
  });
}
