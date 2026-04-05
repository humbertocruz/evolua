import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProjects } from "@/evolua/user-store";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export async function GET() {
  const session = await auth();

  // Get user project if authenticated
  let projectSlug = "default";
  let apiKeyHint = "YOUR_API_KEY";

  if (session?.user) {
    const projects = await getUserProjects(session.user.id!);
    if (projects[0]) {
      projectSlug = projects[0].slug;
      // Partial key for display
      apiKeyHint = projects[0].apiKey.slice(0, 8) + "...";
    }
  }

  const templateDir = path.join(process.cwd(), "..", "..", "templates", "default");

  // Read all files from template
  function readDirRecursive(dir: string, base: string = dir): Record<string, string> {
    const files: Record<string, string> = {};
    if (!fs.existsSync(dir)) return files;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(base, fullPath);

      if (entry.isDirectory()) {
        Object.assign(files, readDirRecursive(fullPath, base));
      } else if (entry.isFile()) {
        files[relativePath] = fs.readFileSync(fullPath, "utf-8");
      }
    }
    return files;
  }

  const files = readDirRecursive(templateDir);

  // Inject project-specific values into relevant files
  const packageJson = JSON.parse(files["package.json"] || "{}");
  packageJson.name = `@evolua/project-${projectSlug}`;
  files["package.json"] = JSON.stringify(packageJson, null, 2);

  // Build a map of filename → content (no folder structure, flat for zip)
  const flatFiles: Record<string, string> = {};
  for (const [filePath, content] of Object.entries(files)) {
    // Remove "src/" prefix if exists for cleaner download
    const cleanPath = filePath.startsWith("src/") ? filePath.slice(4) : filePath;
    flatFiles[cleanPath] = content;
  }

  // Create a simple text response listing files (zip is complex without archiver)
  // For now, return a JSON with all files and a manifest
  return NextResponse.json({
    template: "Evolua Project Template",
    version: "0.1.0",
    projectSlug,
    apiKeyHint,
    files: flatFiles,
    instructions: {
      step1: "Save the files to your local machine",
      step2: "Run: npm install",
      step3: "Run: npm run db:push",
      step4: "Run: npm run db:seed",
      step5: "Run: npm run dev",
    },
  }, {
    headers: {
      "Content-Disposition": `attachment; filename="evolua-template-${projectSlug}.json"`,
    },
  });
}
