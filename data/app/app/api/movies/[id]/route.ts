import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.movie.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Filme deletado com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
  }
}
