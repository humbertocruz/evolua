import { Project, VariableDeclarationKind } from "ts-morph";
import * as fs from "fs";
import * as path from "path";

// --- Interfaces (Modelo do JSON) ---
interface EvoluaModel {
    project: {
        name: string;
        description: string;
        version: string;
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
            layout?: string;
            components?: Array<{
                type: string;
                props: Record<string, string | boolean>;
            }>;
        }>;
        components: Array<{
            name: string;
            props: string[];
            style: string;
        }>;
    };
}

async function build() {
    console.log("🌸 Evolua Builder 2.0: Iniciando a materialização do projeto...");

    const modelPath = path.join(process.cwd(), "data", "evolua.model.json");
    if (!fs.existsSync(modelPath)) {
        console.error("🚨 Erro: DNA não encontrado em", modelPath);
        return;
    }
    const model: EvoluaModel = JSON.parse(fs.readFileSync(modelPath, "utf-8"));
    console.log(`🧬 DNA Carregado: ${model.project.name} v${model.project.version}`);

    const project = new Project();
    
    // Raiz do Projeto Gerado
    const projectRoot = path.join(process.cwd(), "data", "app");
    if (!fs.existsSync(projectRoot)) fs.mkdirSync(projectRoot, { recursive: true });

    // Pasta do Next.js App Router
    const appDir = path.join(projectRoot, "app");
    if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

    // --- A. Gerar Root Layout ---
    console.log("🏗️ Construindo Layout Base...");
    const layoutFile = project.createSourceFile(path.join(appDir, "layout.tsx"), "", { overwrite: true });
    layoutFile.addImportDeclaration({ moduleSpecifier: "next/font/google", namedImports: ["Inter"] });
    layoutFile.addImportDeclaration({ moduleSpecifier: "./globals.css" });
    layoutFile.addVariableStatement({ 
        declarationKind: VariableDeclarationKind.Const, 
        declarations: [{ name: "inter", initializer: "Inter({ subsets: ['latin'] })" }] 
    });
    layoutFile.addVariableStatement({ 
        declarationKind: VariableDeclarationKind.Const, 
        isExported: true, 
        declarations: [{ 
            name: "metadata", 
            initializer: `{ title: "${model.project.name}", description: "${model.project.description}" }` 
        }] 
    });
    
    // Tailwind classes based on theme
    const bgClass = `bg-${model.theme.colors.background}`;
    const textClass = `text-${model.theme.colors.text}`;
    
    layoutFile.addFunction({
        name: "RootLayout",
        isExported: true,
        isDefaultExport: true,
        parameters: [{ name: "{ children }", type: "{ children: React.ReactNode }" }],
        statements: `return (<html lang="en"><body className={\`\${inter.className} ${bgClass} ${textClass} antialiased\`}>{children}</body></html>);`
    });

    // --- B. Gerar Globals CSS ---
    console.log("🎨 Pintando Globals CSS...");
    const cssContent = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;
    fs.writeFileSync(path.join(appDir, "globals.css"), cssContent);

    // --- C. Gerar Tailwind Config ---
    console.log("🎨 Configurando Tailwind...");
    // Mapeamento simples de cores do modelo para cores reais do Tailwind se necessário, 
    // mas assumindo que o modelo já traz nomes válidos (ex: zinc-950)
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
        primary: "#ec4899", // pink-500 hardcoded for safety/demo
      },
    },
  },
  plugins: [],
};
export default config;
`;
    fs.writeFileSync(path.join(projectRoot, "tailwind.config.ts"), tailwindConfig);

    // --- D. Gerar Componentes UI (ui/components) ---
    const componentsDir = path.join(appDir, "components");
    if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir, { recursive: true });

    if (model.ui?.components) {
        for (const comp of model.ui.components) {
            console.log(`🧩 Gerando Componente: ${comp.name}`);
            const compFile = project.createSourceFile(path.join(componentsDir, `${comp.name}.tsx`), "", { overwrite: true });
            
            // Gerar interface de props
            const propsInterface = comp.props.map(p => `${p}: any;`).join("\n");
            compFile.addInterface({
                name: `${comp.name}Props`,
                isExported: true,
                properties: comp.props.map(p => ({ name: p, type: "any" }))
            });

            // Gerar componente placeholder estilizado
            compFile.addFunction({
                name: comp.name,
                isExported: true,
                isDefaultExport: true,
                parameters: [{ name: "props", type: `${comp.name}Props` }],
                statements: `
                    return (
                        <div className="p-4 border border-zinc-700 rounded-lg m-2 bg-zinc-900/50 backdrop-blur-sm">
                            <h3 className="text-sm font-mono text-zinc-400 mb-2">&lt;${comp.name} /&gt;</h3>
                            <pre className="text-xs overflow-auto text-green-400">
                                {JSON.stringify(props, null, 2)}
                            </pre>
                        </div>
                    );
                `
            });
        }
    }

    // --- E. Gerar Páginas (app/[route]/page.tsx) ---
    if (model.ui?.pages) {
        for (const page of model.ui.pages) {
            console.log(`📄 Gerando Página: ${page.name} (${page.route})`);
            const routePath = page.route.startsWith("/") ? page.route.substring(1) : page.route;
            const isDynamic = routePath.includes("[");
            const paramName = isDynamic ? routePath.split("[")[1].split("]")[0] : null;

            // Criar diretório
            const pageDir = path.join(appDir, routePath);
            if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
            
            const pageFile = project.createSourceFile(path.join(pageDir, "page.tsx"), "", { overwrite: true });
            
            // Imports
            pageFile.addImportDeclaration({ moduleSpecifier: "react", defaultImport: "React" });
            pageFile.addImportDeclaration({ moduleSpecifier: "../../lib/prisma", namedImports: ["prisma"] });
            
            // Importar componentes usados
            const usedComponents = new Set(page.components?.map(c => c.type).filter(c => c !== "Header")); // Header é especial ou podemos gerar tb
            // Header hack: se não estiver no model.ui.components, ignora import
            const definedComponents = new Set(model.ui.components?.map(c => c.name));
            
            usedComponents.forEach(compName => {
                if (definedComponents.has(compName)) {
                    // Ajustar caminho do import dependendo da profundidade
                    const depth = routePath.split("/").length;
                    const relativePath = "../".repeat(depth) + "components/" + compName;
                    pageFile.addImportDeclaration({ moduleSpecifier: relativePath, defaultImport: compName });
                }
            });

            // Função de dados
            const entityName = "Movie"; // Hardcoded por enquanto, ideal vir do JSON ($Movie)
            const entityLower = entityName.toLowerCase();

            if (isDynamic && paramName) {
                // Página de Detalhes
                pageFile.addFunction({
                    name: "getData",
                    isAsync: true,
                    parameters: [{ name: "id", type: "string" }],
                    statements: `
                        const idInt = parseInt(id);
                        if (isNaN(idInt)) return null;
                        return await prisma.${entityLower}.findUnique({ where: { id: idInt } });
                    `
                });
                
                pageFile.addFunction({
                    name: page.name,
                    isExported: true,
                    isDefaultExport: true,
                    isAsync: true,
                    parameters: [{ name: "{ params }", type: "{ params: { " + paramName + ": string } }" }],
                    statements: `
                        const data = await getData(params.${paramName});
                        if (!data) return <div className="p-20 text-center">Not Found</div>;

                        return (
                            <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
                                ${page.components?.map(c => {
                                    if (c.type === "Header") return `<header className="p-6 border-b border-zinc-800 flex items-center gap-4"><a href="/dashboard" className="text-zinc-500 hover:text-white">← Voltar</a><h1 className="text-xl font-bold">${c.props.title}</h1></header>`;
                                    
                                    // Mapear props com $ (ex: $Movie -> data)
                                    const propsString = Object.entries(c.props).map(([key, value]) => {
                                        if (typeof value === 'string' && value.startsWith("$")) {
                                            return `${key}={data}`; 
                                        }
                                        return `${key}="${value}"`;
                                    }).join(" ");
                                    
                                    return `<${c.type} ${propsString} />`;
                                }).join("\n")}
                            </main>
                        );
                    `
                });

            } else {
                // Página de Lista (Dashboard)
                pageFile.addFunction({
                    name: "getData",
                    isAsync: true,
                    statements: `return await prisma.${entityLower}.findMany();`
                });

                pageFile.addFunction({
                    name: page.name,
                    isExported: true,
                    isDefaultExport: true,
                    isAsync: true,
                    statements: `
                        const data = await getData();

                        return (
                            <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
                                ${page.components?.map(c => {
                                    if (c.type === "Header") return `<h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">${c.props.title}</h1>`;
                                    
                                    if (c.type === "MovieList") { // Componente especial de lista
                                        return `
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {data.map((item: any) => (
                                                <a key={item.id} href={\`/movie/\${item.id}\`} className="block group">
                                                    <div className="border border-zinc-800 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all">
                                                        {item.poster_path && <img src={item.poster_path} alt={item.title} className="w-full h-48 object-cover opacity-60 group-hover:opacity-100 transition-opacity" />}
                                                        <div className="p-4">
                                                            <h2 className="text-xl font-bold group-hover:text-pink-400">{item.title}</h2>
                                                            <p className="text-zinc-500 text-sm mt-2 line-clamp-2">{item.overview}</p>
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                        `;
                                    }
                                    return `<${c.type} />`;
                                }).join("\n")}
                            </main>
                        );
                    `
                });
            }
        }
    }

    // --- F. Gerar Prisma Schema ---
    console.log("🐘 Gerando Schema do Prisma...");
    const prismaDir = path.join(projectRoot, "prisma");
    if (!fs.existsSync(prismaDir)) fs.mkdirSync(prismaDir, { recursive: true });

    let schemaContent = `generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "sqlite"\n  url      = "file:./dev.db"\n}\n`; // Mudado para SQLite para facilitar teste local sem env
    
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

    // --- G. Lib Prisma ---
    const libDir = path.join(appDir, "lib");
    if (!fs.existsSync(libDir)) fs.mkdirSync(libDir, { recursive: true });
    fs.writeFileSync(path.join(libDir, "prisma.ts"), `
        import { PrismaClient } from '@prisma/client';
        const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
        export const prisma = globalForPrisma.prisma || new PrismaClient();
        if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
    `);

    // --- H. package.json ---
    console.log("📦 Gerando package.json...");
    const pkgJson = {
        name: model.project.name.toLowerCase().replace(/\s+/g, "-"),
        version: model.project.version,
        private: true,
        scripts: {
            "dev": "next dev",
            "build": "next build",
            "start": "next start",
            "lint": "next lint",
            "db:push": "prisma db push",
            "db:studio": "prisma studio",
            "seed": "ts-node prisma/seed.ts"
        },
        dependencies: {
            "next": "14.1.0",
            "react": "^18",
            "react-dom": "^18",
            "@prisma/client": "^5.10.0",
            "lucide-react": "^0.300.0"
        },
        devDependencies: {
            "typescript": "^5",
            "@types/node": "^20",
            "@types/react": "^18",
            "@types/react-dom": "^18",
            "postcss": "^8",
            "tailwindcss": "^3.4.1",
            "prisma": "^5.10.0",
            "ts-node": "^10.9.2"
        }
    };
    fs.writeFileSync(path.join(projectRoot, "package.json"), JSON.stringify(pkgJson, null, 2));

    // --- I. Seed Script (Opcional, mas útil) ---
    const seedContent = `
        import { PrismaClient } from '@prisma/client';
        const prisma = new PrismaClient();
        async function main() {
            await prisma.movie.deleteMany();
            await prisma.movie.create({
                data: {
                    title: "Inception",
                    overview: "A thief who steals corporate secrets through the use of dream-sharing technology...",
                    genre: "Sci-Fi",
                    vote_average: 8.8,
                    poster_path: "https://image.tmdb.org/t/p/w500/9gk7admal4zl248sM758u15Z26.jpg",
                    backdrop_path: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
                    release_date: "2010-07-16"
                }
            });
            await prisma.movie.create({
                data: {
                    title: "Interstellar",
                    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                    genre: "Sci-Fi",
                    vote_average: 8.6,
                    poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniL6C8z1dY4uvULrDuXVZ4.jpg",
                    backdrop_path: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
                    release_date: "2014-11-05"
                }
            });
        }
        main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect());
    `;
    fs.writeFileSync(path.join(prismaDir, "seed.ts"), seedContent);

    console.log("💾 Salvando arquivos...");
    await project.save();
    console.log("✅ Evolução completa! Para rodar:");
    console.log("   cd data/app");
    console.log("   npm install");
    console.log("   npx prisma db push");
    console.log("   npm run seed");
    console.log("   npm run dev");
}

build().catch(console.error);
