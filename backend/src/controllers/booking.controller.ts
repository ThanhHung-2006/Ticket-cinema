import { Response } from 'express';
import { BookingService } from '../services/booking.service';
import { ResponseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../types';

export class BookingController {
  public static async holdSeats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { showtimeId, seatIds } = req.body;
      const booking = await BookingService.holdSeats(userId, showtimeId, seatIds);
      return ResponseUtil.created(res, booking, 'Giữ ghế thành công! Bạn có 5 phút để hoàn tất thanh toán.');
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async confirmPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { bookingId } = req.params;
      const { paymentMethod } = req.body;
      const booking = await BookingService.confirmPayment(userId, bookingId, paymentMethod);
      return ResponseUtil.success(res, booking, 'Thanh toán thành công! Vé đã được kích hoạt.');
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async cancelBooking(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { bookingId } = req.params;
      const result = await BookingService.cancelBooking(userId, bookingId);
      return ResponseUtil.success(res, result, 'Hủy vé thành công.');
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async getUserBookings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const bookings = await BookingService.getUserBookings(userId);
      return ResponseUtil.success(res, bookings);
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }

  public static async getBookingById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { bookingId } = req.params;
      const booking = await BookingService.getBookingById(userId, bookingId);
      return ResponseUtil.success(res, booking);
    } catch (err: any) {
      return ResponseUtil.error(res, err.message, err.statusCode || 500);
    }
  }
}
