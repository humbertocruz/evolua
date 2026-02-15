import { ArrowRight, Layout, ThumbsUp, Heart, Calendar } from "lucide-react";
import { getMovieDetails, Movie } from "./movie-service";
import { useState, useEffect } from "react";
import MovieCard from "./components/MovieCard";

'use client';

export default function DashboardPage() {
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      async function loadData() {
        try {
          const data = await getMovieDetails(550); // Fight Club id
          setMovie(data);
        } catch (err) {
          console.error('Erro ao carregar filme:', err);
        } finally {
          setLoading(false);
        }

      }

      loadData();
    }, []);
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="space-y-4">
                  <h1 className="text-5xl font-extrabold tracking-tighter text-white">{loading ? "Carregando..." : movie?.title}</h1>
                  <p className="text-zinc-400 text-xl">{movie?.overview}</p>
<div className="flex items-center gap-4 mt-4">
  <div className="flex items-center gap-2 text-emerald-400">
    <ThumbsUp size={20} className="text-emerald-400" />
    <span>{movie?.vote_average}</span>
  </div>
  <div className="flex items-center gap-2 text-rose-400">
    <Heart size={20} className="text-rose-400" />
    <span>{movie?.popularity}</span>
  </div>
  <div className="flex items-center gap-2 text-sky-400">
    <Calendar size={20} className="text-sky-400" />
    <span>{movie?.release_date}</span>
  </div>
</div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 hover:border-pink-500/50 transition-all group">
                    <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 mb-4 group-hover:scale-110 transition-transform">
                      <ArrowRight size={24} />
                    </div>
                    <h3 className="text-lg font-semibold">Gráfico de Funil de Vendas (Leads por Estágio)</h3>
                  </div>
                  <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 hover:border-pink-500/50 transition-all group">
                    <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 mb-4 group-hover:scale-110 transition-transform">
                      <ArrowRight size={24} />
                    </div>
                    <h3 className="text-lg font-semibold">Lista de Leads Recentes (com detalhes básicos e ações rápidas)</h3>
                  </div>
                  <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 hover:border-pink-500/50 transition-all group">
                    <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 mb-4 group-hover:scale-110 transition-transform">
                      <ArrowRight size={24} />
                    </div>
                    <h3 className="text-lg font-semibold">Métricas Chave (Total de Leads, Leads Qualificados, Taxa de Conversão)</h3>
                  </div>
                  <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 hover:border-pink-500/50 transition-all group">
                    <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 mb-4 group-hover:scale-110 transition-transform">
                      <ArrowRight size={24} />
                    </div>
                    <h3 className="text-lg font-semibold">Filtros Avançados (por data, responsável, origem, etc.)</h3>
                  </div>
                  <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 hover:border-pink-500/50 transition-all group">
                    <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 mb-4 group-hover:scale-110 transition-transform">
                      <ArrowRight size={24} />
                    </div>
                    <h3 className="text-lg font-semibold">Ações Rápidas (Criar Lead, Importar Leads, Exportar Dados)</h3>
                  </div>
                </div>
                <div className="pt-12 border-t border-zinc-800 text-zinc-600">
                  Genesis Engine v1.0 • 🌸
                </div>
            </div>
        </div>
    );
}
