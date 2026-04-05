import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureDefaultProject } from "@/evolua/store";
import seedModel from "@/evolua/app.model.json";

function asInputJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
      },
    });

    // Create a default project for the new user with seed pages
    const project = await prisma.project.create({
      data: {
        slug: `user-${user.id.slice(0, 8)}`,
        name: "Meu Projeto",
        apiKey: "pk_dev_" + Math.random().toString(36).slice(2, 18),
        ownerId: user.id,
      },
    });

    // Seed pages from app.model.json
    const seedPages = seedModel.pages.map((page) => ({
      projectId: project.id,
      path: page.path.startsWith("/") ? page.path : `/${page.path}`,
      title: page.title,
      status: "published" as const,
      nodes: asInputJson(page.nodes),
      visual: asInputJson(page.visual ?? {}),
    }));

    await prisma.page.createMany({ data: seedPages });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
