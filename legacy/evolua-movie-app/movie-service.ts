interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  poster_path: string;
  genres: { id: number; name: string }[];
}
async function getMovieDetails(movieId: number): Promise<Movie> {
  const url = `https://api.example.com/movie/${movieId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: Movie = await response.json();
  return data;
}
