import { Request, Response } from 'express';
import { ShowtimeService } from '../services/showtime.service';
import { ResponseUtil } from '../utils/response.util';

export class ShowtimeController {
  public static async getShowtimes(req: Request, res: Response) {
    try {
      const { movieId, cinemaId, date } = req.query;
      const showtimes = await ShowtimeService.getShowtimes({
        movieId: movieId as string,
        cinemaId: cinemaId as string,
        date: date as string,
      });
      return ResponseUtil.success(res, showtimes);
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async getShowtimeById(req: Request, res: Response) {
    try {
      const showtime = await ShowtimeService.getShowtimeById(req.params.id);
      return ResponseUtil.success(res, showtime);
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async getShowtimeSeatMap(req: Request, res: Response) {
    try {
      const seatMap = await ShowtimeService.getShowtimeSeatMap(req.params.id);
      return ResponseUtil.success(res, seatMap);
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async createShowtime(req: Request, res: Response) {
    try {
      const showtime = await ShowtimeService.createShowtime(req.body);
      return ResponseUtil.created(res, showtime, 'Thêm suất chiếu mới thành công.');
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async deleteShowtime(req: Request, res: Response) {
    try {
      await ShowtimeService.deleteShowtime(req.params.id);
      return ResponseUtil.success(res, null, 'Hủy suất chiếu thành công.');
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }
}
