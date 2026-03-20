import React from "react";
import { prisma } from "../../lib/prisma";

async function getData() {
    return await prisma.movie.findMany();
}

export default async function DashboardPage() {

                            const data = await getData();

                            return (
                                <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
                                    <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Evolua Movies</h1>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {data.map((item: any) => (
                                                    <a key={item.id} href={`/movie/${item.id}`} className="block group">
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
                                            
                                </main>
                            );
                        
}
