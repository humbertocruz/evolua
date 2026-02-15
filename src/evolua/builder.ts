import { Project, StructureKind, VariableDeclarationKind } from "ts-morph";
import * as fs from "fs";
import * as path from "path";

// --- Interfaces (Modelo do JSON) ---
interface GenesisModel {
    project: {
        name: string;
        description: string;
    };
    theme: {
        colors: {
            primary: string;
            background: string;
            surface: string;
            text: string;
        };
    };
    data: {
        entities: Array<{
            name: string;
            fields: Array<{
                name: string;
                type: string;
                primary?: boolean;
            }>;
        }>;
    };
    ui: {
        pages: Array<{
            route: string;
            name: string;
            components?: any[];
        }>;
    };
}

async function build() {
    console.log("🌸 Evolua Builder: Iniciando a materialização do projeto...");

    const modelPath = path.join(process.cwd(), "data", "genesis.model.json");
    if (!fs.existsSync(modelPath)) {
        console.error("🚨 Erro: DNA não encontrado em", modelPath);
        return;
    }
    const model: GenesisModel = JSON.parse(fs.readFileSync(modelPath, "utf-8"));
    console.log(`🧬 DNA Carregado: ${model.project.name}`);

    const project = new Project();
    
    // Raiz do Projeto Gerado
    const projectRoot = path.join(process.cwd(), "data", "app");
    if (!fs.existsSync(projectRoot)) fs.mkdirSync(projectRoot, { recursive: true });

    // Pasta do Next.js App Router (agora dentro de 'app/')
    const appDir = path.join(projectRoot, "app");
    if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

    // --- A. Gerar Root Layout (app/layout.tsx) ---
    console.log("🏗️ Construindo Layout Base...");
    const layoutFile = project.createSourceFile(path.join(appDir, "layout.tsx"), "", { overwrite: true });
    layoutFile.addImportDeclaration({ moduleSpecifier: "next/font/google", namedImports: ["Inter"] });
    layoutFile.addImportDeclaration({ moduleSpecifier: "./globals.css" });
    layoutFile.addVariableStatement({ declarationKind: VariableDeclarationKind.Const, declarations: [{ name: "inter", initializer: "Inter({ subsets: ['latin'] })" }] });
    layoutFile.addVariableStatement({ declarationKind: VariableDeclarationKind.Const, isExported: true, declarations: [{ name: "metadata", initializer: `{ title: "${model.project.name}", description: "${model.project.description}" }` }] });
    const bgClass = `bg-${model.theme.colors.background}`;
    const textClass = `text-${model.theme.colors.text}`;
    layoutFile.addFunction({
        name: "RootLayout",
        isExported: true,
        isDefaultExport: true,
        parameters: [{ name: "{ children }", type: "{ children: React.ReactNode }" }],
        statements: `return (<html lang="en"><body className={\`\${inter.className} ${bgClass} ${textClass} antialiased\`}>{children}</body></html>);`
    });

    // --- B. Gerar Globals CSS (app/globals.css) ---
    console.log("🎨 Pintando Globals CSS...");
    const cssContent = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;
    fs.writeFileSync(path.join(appDir, "globals.css"), cssContent);

    // --- C. Gerar Tailwind Config (tailwind.config.ts) ---
    console.log("🎨 Configurando Tailwind...");
    const tailwindConfig = `
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "${model.theme.colors.primary.replace('-500', '')}", // Simplificação
      },
    },
  },
  plugins: [],
};
export default config;
`;
    fs.writeFileSync(path.join(projectRoot, "tailwind.config.ts"), tailwindConfig);


    // --- D. Gerar Páginas (app/[route]/page.tsx) ---
    if (model.ui?.pages) {
        for (const page of model.ui.pages) {
            console.log(`📄 Gerando Página: ${page.name} (${page.route})`);
            const routePath = page.route.startsWith("/") ? page.route.substring(1) : page.route;
            
            // Agora dentro de app/
            const pageDir = path.join(appDir, routePath);
            if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
            const pageFile = project.createSourceFile(path.join(pageDir, "page.tsx"), "", { overwrite: true });
            pageFile.addImportDeclaration({ moduleSpecifier: "react", defaultImport: "React" });
            pageFile.addFunction({
                name: page.name,
                isExported: true,
                isDefaultExport: true,
                statements: `
                    return (
                        <main className="flex min-h-screen flex-col items-center justify-between p-24">
                            <h1 className="text-4xl font-bold text-${model.theme.colors.primary}">
                                ${model.project.name}
                            </h1>
                            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                                <p className="text-xl mt-4 border border-${model.theme.colors.primary} p-4 rounded-xl">
                                    Página gerada pelo Evolua: ${page.name} 🌸
                                </p>
                            </div>
                        </main>
                    );
                `
            });
        }
    }

    // --- E. Gerar Prisma Schema (Neon DB) ---
    console.log("🐘 Gerando Schema do Prisma (Neon DB)...");
    // Prisma fica na raiz do projeto (fora de app/)
    const prismaDir = path.join(projectRoot, "prisma");
    if (!fs.existsSync(prismaDir)) fs.mkdirSync(prismaDir, { recursive: true });

    let schemaContent = `generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n`;
    if (model.data?.entities) {
        for (const entity of model.data.entities) {
            console.log(`📦 Mapeando Entidade: ${entity.name}`);
            schemaContent += `\nmodel ${entity.name} {\n`;
            for (const field of entity.fields) {
                let type = "String";
                if (field.type === "number") type = "Int";
                if (field.type === "boolean") type = "Boolean";
                let attributes = "";
                if (field.primary) attributes = field.type === "number" ? "@id @default(autoincrement())" : "@id @default(cuid())";
                schemaContent += `  ${field.name} ${type} ${attributes}\n`;
            }
            schemaContent += "}\n";
        }
    }
    fs.writeFileSync(path.join(prismaDir, "schema.prisma"), schemaContent);

    // --- F. Gerar API Routes (app/api/[entity]/route.ts) ---
    if (model.data?.entities) {
        // Criar lib/prisma.ts (Singleton) - Dentro de app/lib ou raiz/lib? Next recomenda raiz/lib ou src/lib. Vamos por em app/lib pra ficar junto
        const libDir = path.join(appDir, "lib");
        if (!fs.existsSync(libDir)) fs.mkdirSync(libDir, { recursive: true });
        const prismaLibFile = project.createSourceFile(path.join(libDir, "prisma.ts"), "", { overwrite: true });
        prismaLibFile.addStatements(`
            import { PrismaClient } from '@prisma/client';
            const prismaClientSingleton = () => { return new PrismaClient(); };
            type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;
            const globalForPrisma = globalThis as unknown as { prisma: PrismaClientSingleton | undefined };
            export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
            if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
        `);

        for (const entity of model.data.entities) {
            const entityPlural = entity.name.toLowerCase() + "s";
            console.log(`🛣️ Gerando API Route: /api/${entityPlural}`);
            
            const apiDir = path.join(appDir, "api", entityPlural);
            if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });

            const routeFile = project.createSourceFile(path.join(apiDir, "route.ts"), "", { overwrite: true });
            routeFile.addImportDeclaration({ moduleSpecifier: "next/server", namedImports: ["NextResponse"] });
            routeFile.addImportDeclaration({ moduleSpecifier: "../../lib/prisma", namedImports: ["prisma"] }); // Ajustado path relativo

            routeFile.addFunction({
                name: "GET",
                isExported: true,
                isAsync: true,
                statements: `
                    try {
                        const data = await prisma.${entity.name.toLowerCase()}.findMany();
                        return NextResponse.json(data);
                    } catch (error) {
                        return NextResponse.json({ error: 'Erro ao buscar ${entityPlural}' }, { status: 500 });
                    }
                `
            });

            routeFile.addFunction({
                name: "POST",
                isExported: true,
                isAsync: true,
                parameters: [{ name: "request", type: "Request" }],
                statements: `
                    try {
                        const body = await request.json();
                        const data = await prisma.${entity.name.toLowerCase()}.create({ data: body });
                        return NextResponse.json(data);
                    } catch (error) {
                        return NextResponse.json({ error: 'Erro ao criar ${entity.name}' }, { status: 500 });
                    }
                `
            });
        }
    }
    
    // --- G. Gerar package.json ---
    console.log("📦 Gerando package.json do App...");
    const pkgJson = {
        name: model.project.name.toLowerCase().replace(/\s+/g, "-"),
        version: "0.1.0",
        private: true,
        scripts: {
            "dev": "next dev",
            "build": "next build",
            "start": "next start",
            "lint": "next lint",
            "postinstall": "prisma generate"
        },
        dependencies: {
            "next": "14.2.0",
            "react": "^18",
            "react-dom": "^18",
            "@prisma/client": "^5.22.0",
            "lucide-react": "^0.300.0"
        },
        devDependencies: {
            "typescript": "^5",
            "@types/node": "^20",
            "@types/react": "^18",
            "@types/react-dom": "^18",
            "postcss": "^8",
            "tailwindcss": "^3.4.1",
            "eslint": "^8",
            "eslint-config-next": "14.2.0",
            "prisma": "^5.22.0"
        }
    };
    fs.writeFileSync(path.join(projectRoot, "package.json"), JSON.stringify(pkgJson, null, 2));

    // Salvar Projeto TS
    console.log("💾 Salvando arquivos TSX...");
    await project.save();
    console.log("✅ Projeto materializado com sucesso! 🌸🚀");
}

build().catch(console.error);
