
        import { PrismaClient } from '@prisma/client';
        const prisma = new PrismaClient();
        async function main() {
            await prisma.movie.deleteMany();
            await prisma.movie.create({
                data: {
                    title: "Inception",
                    overview: "A thief who steals corporate secrets through the use of dream-sharing technology...",
                    genre: "Sci-Fi",
                    vote_average: 8.8,
                    poster_path: "https://image.tmdb.org/t/p/w500/9gk7admal4zl248sM758u15Z26.jpg",
                    backdrop_path: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
                    release_date: "2010-07-16"
                }
            });
            await prisma.movie.create({
                data: {
                    title: "Interstellar",
                    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                    genre: "Sci-Fi",
                    vote_average: 8.6,
                    poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniL6C8z1dY4uvULrDuXVZ4.jpg",
                    backdrop_path: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
                    release_date: "2014-11-05"
                }
            });
        }
        main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect());
    