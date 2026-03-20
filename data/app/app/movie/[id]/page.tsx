import React from "react";
import { prisma } from "../../lib/prisma";
import MovieHero from "../../components/MovieHero";

async function getData(id: string) {

                            const idInt = parseInt(id);
                            if (isNaN(idInt)) return null;
                            return await prisma.movie.findUnique({ where: { id: idInt } });
                        
}

export default async function MovieDetailsPage({ params }: { params: { id: string } }) {

                            const data = await getData(params.id);
                            if (!data) return <div className="p-20 text-center">Not Found</div>;

                            return (
                                <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
                                    <header className="p-6 border-b border-zinc-800 flex items-center gap-4"><a href="/dashboard" className="text-zinc-500 hover:text-white">← Voltar</a><h1 className="text-xl font-bold">Movie Details</h1></header>
    <MovieHero data={data} />
    <MovieInfo data={data} />
                                </main>
                            );
                        
}
