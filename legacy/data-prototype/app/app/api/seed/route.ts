import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function POST() {
  try {
    // Lista de Clássicos para popular o banco
    const movies = [
      {
        title: "Matrix",
        overview: "Um hacker descobre a natureza da sua realidade e seu papel na guerra contra seus controladores.",
        poster_path: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        vote_average: 9,
        genre: "Sci-Fi"
      },
      {
        title: "Interestelar",
        overview: "Uma equipe de exploradores viaja através de um buraco de minhoca no espaço na tentativa de garantir a sobrevivência da humanidade.",
        poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniL6E8ahDaX06e8798Fclq.jpg",
        vote_average: 9,
        genre: "Sci-Fi"
      },
      {
        title: "O Poderoso Chefão",
        overview: "O patriarca idoso de uma dinastia do crime organizado transfere o controle de seu império clandestino para seu filho relutante.",
        poster_path: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
        vote_average: 10,
        genre: "Crime"
      },
      {
        title: "Clube da Luta",
        overview: "Um homem insone e um vendedor de sabonete criam um clube de luta subterrâneo que evolui para algo muito mais sinistro.",
        poster_path: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        vote_average: 9,
        genre: "Drama"
      },
      {
        title: "A Origem",
        overview: "Um ladrão que rouba segredos corporativos através do uso de tecnologia de compartilhamento de sonhos é dado a tarefa inversa de plantar uma ideia.",
        poster_path: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        vote_average: 8,
        genre: "Action"
      }
    ];

    // Limpar banco antes? Opcional. Vamos apenas criar.
    // await prisma.movie.deleteMany(); 

    for (const movie of movies) {
        await prisma.movie.create({ data: movie });
    }

    return NextResponse.json({ message: "Banco populado com sucesso! 🍿" });
  } catch (error) {
    console.error("Erro ao popular:", error);
    return NextResponse.json({ error: "Falha no seed" }, { status: 500 });
  }
}
