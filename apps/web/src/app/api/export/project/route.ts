import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getProjectById, getProjectPages } from "@/evolua/user-store";
import * as fs from "fs";
import * as path from "path";
import archiver from "archiver";

export const dynamic = "force-dynamic";

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

function escapeJs(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, "&quot;");
}

function pathToFileName(p: string): string {
  if (p === "/") return "page.tsx";
  return p.replace(/^\//, "").replace(/\//g, "_") + ".tsx";
}

function renderPageNodesToTsx(
  pagePath: string,
  nodes: Array<{ kind: string; text: string; href?: string }>
): string {
  if (!nodes || nodes.length === 0) {
    return `import { EvoluPage } from "@evolua/next";

export default function Page() {
  return <EvoluPage pagePath="${pagePath}" />;
}
`;
  }

  const renderedNodes = nodes
    .map((node) => {
      switch (node.kind) {
        case "heading":
          return `      <h1 className="text-3xl font-bold">${escapeJs(node.text)}</h1>`;
        case "paragraph":
          return `      <p className="text-zinc-700">${escapeJs(node.text)}</p>`;
        case "text":
          return `      <span className="text-sm text-zinc-500">${escapeJs(node.text)}</span>`;
        case "link":
          return `      <a href="${escapeAttr(node.href || "#")}" className="text-blue-600 hover:underline">${escapeJs(node.text)}</a>`;
        default:
          return `      <p>${escapeJs(node.text)}</p>`;
      }
    })
    .join("\n");

  return `import { EvoluPage } from "@evolua/next";

export default function Page() {
  return (
    <EvoluPage
      pagePath="${pagePath}"
      render={{
        nodes: [
${renderedNodes}
        ]
      }}
    />
  );
}
`;
}

// GET /api/export/project?projectId=xxx&name=meu-projeto
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const projectName = searchParams.get("name") ?? "evolua-project";

  if (!projectId) {
    return Response.json({ error: "Missing projectId" }, { status: 400 });
  }

  const project = await getProjectById(projectId, session.user.id);
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const pages = await getProjectPages(projectId);
  const templateDir = path.join(process.cwd(), "..", "..", "templates", "default");
  const templateFiles = readDirRecursive(templateDir);

  const chunks: Uint8Array[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const archive: any = archiver("zip", { zlib: { level: 9 } });

  const promise = new Promise<void>((resolve, reject) => {
    archive.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    archive.on("end", () => resolve());
    archive.on("error", (err: Error) => reject(err));
  });

  // package.json with project name
  const packageJson = JSON.parse(templateFiles["package.json"] ?? "{}");
  packageJson.name = `@evolua/project-${projectName.toLowerCase().replace(/\s+/g, "-")}`;
  archive.append(JSON.stringify(packageJson, null, 2), { name: "package.json" });

  // .env.example with credentials
  const envExample = (templateFiles[".env.example"] ?? "") + `\nEVOLUA_API_KEY=${project.apiKey}\nNEXT_PUBLIC_EVOLUA_API_URL=${process.env.NEXT_PUBLIC_APP_URL ?? "https://evolua.cloud"}`;
  archive.append(envExample, { name: ".env.example" });

  // static files from template
  for (const [filePath, content] of Object.entries(templateFiles)) {
    if (["package.json", ".env.example"].includes(filePath)) continue;
    const cleanPath = filePath.startsWith("src/") ? filePath.slice(4) : filePath;
    archive.append(content, { name: cleanPath });
  }

  // evolua config
  const evoluaConfig = `export const evoluaConfig = {
  projectId: "${project.id}",
  projectSlug: "${project.slug}",
  apiKey: "${project.apiKey}",
  apiUrl: "${process.env.NEXT_PUBLIC_APP_URL ?? "https://evolua.cloud"}",
};
`;
  archive.append(evoluaConfig, { name: "src/evolua/config.ts" });

  // one page file per page in the project
  for (const page of pages) {
    const fileName = pathToFileName(page.path);
    const pageCode = renderPageNodesToTsx(
      page.path,
      page.nodes as Array<{ kind: string; text: string; href?: string }>
    );
    archive.append(pageCode, { name: `src/app/${fileName}` });
  }

  // README
  const readme = `# Evolu[a] Project — ${project.name}

Este projeto foi gerado pelo Evolu[a].

## Setup

\`\`\`bash
npm install
cp .env.example .env.local
# Edite .env.local com suas credenciais
npm run dev
\`\`\`

## Estrutura

- \`src/app/\` — páginas Next.js
- \`src/evolua/config.ts\` — configuração do projeto
- \`prisma/schema.prisma\` — schema do banco

## Publicar mudanças

Edite suas páginas em https://evolua.cloud/evolua e rode:

\`\`\`bash
npm run evolua:pull
\`\`\`

---
Gerado em ${new Date().toISOString()}
`;
  archive.append(readme, { name: "README.md" });

  archive.finalize();
  await promise;

  const zipBuffer = Buffer.concat(chunks);

  return new Response(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${projectName.toLowerCase().replace(/\s+/g, "-")}.zip"`,
    },
  });
}
