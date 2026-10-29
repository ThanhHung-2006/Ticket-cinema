import { Request, Response } from 'express';
import { CinemaService } from '../services/cinema.service';
import { ResponseUtil } from '../utils/response.util';

export class CinemaController {
  public static async getCinemas(req: Request, res: Response) {
    try {
      const cinemas = await CinemaService.getCinemas();
      return ResponseUtil.success(res, cinemas);
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async getCinemaById(req: Request, res: Response) {
    try {
      const cinema = await CinemaService.getCinemaById(req.params.id);
      return ResponseUtil.success(res, cinema);
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async createCinema(req: Request, res: Response) {
    try {
      const cinema = await CinemaService.createCinema(req.body);
      return ResponseUtil.created(res, cinema, 'Thêm rạp chiếu mới thành công.');
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async createRoom(req: Request, res: Response) {
    try {
      const room = await CinemaService.createRoom(req.body);
      return ResponseUtil.created(res, room, 'Thêm phòng chiếu và sinh ghế thành công.');
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async getRoomSeats(req: Request, res: Response) {
    try {
      const room = await CinemaService.getRoomSeats(req.params.roomId);
      return ResponseUtil.success(res, room);
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }
}
