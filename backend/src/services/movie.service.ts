import { prisma } from '../prisma';
import { MovieStatus } from '@prisma/client';

export class MovieService {
  public static async getMovies(filter: {
    status?: MovieStatus;
    search?: string;
    genre?: string;
  }) {
    const where: any = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.search && filter.search.trim() !== '') {
      const term = filter.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { englishTitle: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (filter.genre && filter.genre.trim() !== '') {
      where.genres = { contains: filter.genre.trim(), mode: 'insensitive' };
    }

    return prisma.movie.findMany({
      where,
      orderBy: { releaseDate: 'desc' },
    });
  }

  public static async getMovieById(id: string) {
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        showtimes: {
          where: {
            startTime: { gte: new Date() },
            isActive: true,
          },
          include: {
            room: {
              include: {
                cinema: true,
              },
            },
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!movie) {
      const error: any = new Error('Không tìm thấy thông tin phim.');
      error.statusCode = 404;
      throw error;
    }

    return movie;
  }

  public static async createMovie(data: {
    title: string;
    englishTitle?: string;
    genres: string;
    duration: number;
    releaseDate: string;
    ageRating?: string;
    posterUrl: string;
    trailerUrl?: string;
    description: string;
    status?: MovieStatus;
  }) {
    return prisma.movie.create({
      data: {
        title: data.title,
        englishTitle: data.englishTitle,
        genres: data.genres,
        duration: data.duration,
        releaseDate: new Date(data.releaseDate),
        ageRating: data.ageRating || 'P',
        posterUrl: data.posterUrl,
        trailerUrl: data.trailerUrl,
        description: data.description,
        status: data.status || MovieStatus.NOW_SHOWING,
      },
    });
  }

  public static async updateMovie(id: string, data: any) {
    const updatePayload = { ...data };
    if (updatePayload.releaseDate) {
      updatePayload.releaseDate = new Date(updatePayload.releaseDate);
    }

    return prisma.movie.update({
      where: { id },
      data: updatePayload,
    });
  }

  public static async deleteMovie(id: string) {
    return prisma.movie.delete({
      where: { id },
    });
  }
}
