'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Film } from 'lucide-react';

interface MovieCardProps {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ id, title, poster_path, vote_average }) => {
  const imageUrl = `https://image.tmdb.org/t/p/w500${poster_path}`;

  return (
    <div className="relative rounded-lg overflow-hidden shadow-md transition-transform transform hover:scale-105">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-10"></div>
      <Image
        src={imageUrl}
        alt={title}
        width={500}
        height={750}
        className="object-cover w-full h-full"
        style={{
          maxWidth: "100%",
          height: "auto"
        }}
      />
      <div className="absolute bottom-0 left-0 p-4 z-20 w-full">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex items-center mt-2 text-sm text-gray-300">
          <Star className="h-4 w-4 mr-1 text-yellow-400" />
          <span>{vote_average.toFixed(1)}</span>
        </div>
        <Link href={`/movie/${id}`} className="mt-4 inline-flex items-center bg-gradient-to-r from-pink-500 to-blue-500 text-white px-4 py-2 rounded-full hover:from-pink-400 hover:to-blue-400 transition-colors">
          <Film className="h-4 w-4 mr-2" />
          Detalhes
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;