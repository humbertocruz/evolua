import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET() {

                        try {
                            const data = await prisma.movie.findMany();
                            return NextResponse.json(data);
                        } catch (error) {
                            return NextResponse.json({ error: 'Erro ao buscar movies' }, { status: 500 });
                        }
                    
}

export async function POST(request: Request) {

                        try {
                            const body = await request.json();
                            const data = await prisma.movie.create({ data: body });
                            return NextResponse.json(data);
                        } catch (error) {
                            return NextResponse.json({ error: 'Erro ao criar Movie' }, { status: 500 });
                        }
                    
}
