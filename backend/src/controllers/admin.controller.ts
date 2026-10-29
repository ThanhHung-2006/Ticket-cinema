import { Response } from 'express';
import { AdminService } from '../services/admin.service';
import { ResponseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../types';
import { BookingStatus } from '@prisma/client';

export class AdminController {
  public static async getRevenue(req: AuthenticatedRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const stats = await AdminService.getRevenueStats(startDate as string, endDate as string);
      return ResponseUtil.success(res, stats);
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async getAllBookings(req: AuthenticatedRequest, res: Response) {
    try {
      const { page, limit, status } = req.query;
      const result = await AdminService.getAllBookings({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        status: status as BookingStatus,
      });
      return ResponseUtil.success(res, result);
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }
}
