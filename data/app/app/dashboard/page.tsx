import React from "react";
import { prisma } from "../lib/prisma";
import SeedButton from "./SeedButton";
import DeleteButton from "./DeleteButton";

export default async function DashboardPage() {
  const movies = await prisma.movie.findMany({
    take: 10,
    orderBy: { id: 'desc' }
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-zinc-950 text-zinc-100">
      <h1 className="text-5xl font-bold text-pink-500 mb-8 tracking-tighter">
        Genesis Movie App
      </h1>
      
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-pink-500">🔥</span> Top 10 Filmes
        </h2>

        {movies.length === 0 ? (
          <div className="p-12 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500 flex flex-col items-center gap-4">
            <p>Nenhum filme encontrado no banco de dados.</p>
            <SeedButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <div key={movie.id} className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-pink-500/50 transition-all duration-300">
                <div className="aspect-video bg-zinc-800 relative">
                  {movie.poster_path ? (
                    <img 
                      src={movie.poster_path} 
                      alt={movie.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      Sem Imagem
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-bold">
                    ⭐️ {movie.vote_average}
                  </div>
                </div>
                
                <div className="p-4 relative">
                  <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-pink-400 transition-colors pr-8">
                    {movie.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {movie.genre && (
                      <span className="text-[10px] uppercase tracking-wider bg-zinc-800 px-2 py-1 rounded text-zinc-400">
                        {movie.genre}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-2">
                    {movie.overview}
                  </p>
                  <DeleteButton id={movie.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
