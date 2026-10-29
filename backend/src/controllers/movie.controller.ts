import { Request, Response } from 'express';
import { MovieService } from '../services/movie.service';
import { ResponseUtil } from '../utils/response.util';
import { MovieStatus } from '@prisma/client';

export class MovieController {
  public static async getMovies(req: Request, res: Response) {
    try {
      const { status, search, genre } = req.query;
      const movies = await MovieService.getMovies({
        status: status as MovieStatus,
        search: search as string,
        genre: genre as string,
      });
      return ResponseUtil.success(res, movies);
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async getMovieById(req: Request, res: Response) {
    try {
      const movie = await MovieService.getMovieById(req.params.id);
      return ResponseUtil.success(res, movie);
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async createMovie(req: Request, res: Response) {
    try {
      const movie = await MovieService.createMovie(req.body);
      return ResponseUtil.created(res, movie, 'Thêm phim mới thành công.');
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async updateMovie(req: Request, res: Response) {
    try {
      const movie = await MovieService.updateMovie(req.params.id, req.body);
      return ResponseUtil.success(res, movie, 'Cập nhật thông tin phim thành công.');
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async deleteMovie(req: Request, res: Response) {
    try {
      await MovieService.deleteMovie(req.params.id);
      return ResponseUtil.success(res, null, 'Xóa phim thành công.');
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }
}
