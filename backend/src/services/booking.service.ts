import { prisma } from '../prisma';
import { BookingStatus, TicketStatus } from '@prisma/client';
import { config } from '../config';
import { CodeUtil } from '../utils/code.util';

export class BookingService {
  /**
   * Giữ ghế tạm thời 5 phút với Prisma Interactive Transaction (Chống Race Condition)
   */
  public static async holdSeats(userId: string, showtimeId: string, seatIds: string[]) {
    if (!seatIds || seatIds.length === 0) {
      const error: any = new Error('Vui lòng chọn ít nhất 1 ghế.');
      error.statusCode = 400;
      throw error;
    }

    if (seatIds.length > 8) {
      const error: any = new Error('Chỉ được chọn tối đa 8 ghế trong một lần đặt.');
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();
    const holdExpiresAt = new Date(now.getTime() + config.seatHoldMinutes * 60 * 1000);

    return prisma.$transaction(async (tx) => {
      // 1. Dọn dẹp các booking giữ chỗ đã hết hạn 5 phút cho suất chiếu này
      const expiredBookings = await tx.booking.findMany({
        where: {
          showtimeId,
          status: BookingStatus.HOLDING,
          holdExpiresAt: { lt: now },
        },
        select: { id: true },
      });

      if (expiredBookings.length > 0) {
        const expiredIds = expiredBookings.map((b) => b.id);
        await tx.ticket.deleteMany({
          where: { bookingId: { in: expiredIds } },
        });
        await tx.booking.updateMany({
          where: { id: { in: expiredIds } },
          data: { status: BookingStatus.EXPIRED },
        });
      }

      // 2. Kiểm tra thông tin suất chiếu
      const showtime = await tx.showtime.findUnique({
        where: { id: showtimeId },
        include: { room: true },
      });

      if (!showtime || !showtime.isActive) {
        const error: any = new Error('Suất chiếu không tồn tại hoặc đã bị hủy.');
        error.statusCode = 404;
        throw error;
      }

      if (showtime.startTime <= now) {
        const error: any = new Error('Suất chiếu đã bắt đầu hoặc đã kết thúc, không thể đặt vé.');
        error.statusCode = 400;
        throw error;
      }

      // 3. Kiểm tra danh sách ghế có thuộc phòng chiếu này không
      const seats = await tx.seat.findMany({
        where: {
          id: { in: seatIds },
          roomId: showtime.roomId,
        },
      });

      if (seats.length !== seatIds.length) {
        const error: any = new Error('Một số ghế được chọn không tồn tại trong phòng chiếu này.');
        error.statusCode = 400;
        throw error;
      }

      // 4. KIỂM TRA TRÙNG LẶP GHẾ (CONCURRENCY CHECK):
      // Ghế không được trùng với bất kỳ vé nào đang BOOKED hoặc đang HELD còn hạn
      const conflictingTickets = await tx.ticket.findMany({
        where: {
          showtimeId,
          seatId: { in: seatIds },
          OR: [
            { status: TicketStatus.BOOKED },
            {
              status: TicketStatus.HELD,
              booking: {
                status: BookingStatus.HOLDING,
                holdExpiresAt: { gt: now },
              },
            },
          ],
        },
        include: { seat: true },
      });

      if (conflictingTickets.length > 0) {
        const busySeatCodes = conflictingTickets
          .map((t) => `${t.seat.row}${t.seat.number}`)
          .join(', ');
        const error: any = new Error(`Ghế [${busySeatCodes}] vừa có người khác đặt hoặc đang giữ chỗ. Vui lòng chọn ghế khác!`);
        error.statusCode = 409;
        throw error;
      }

      // 5. Tính tổng tiền vé
      let totalPrice = 0;
      const seatPriceMap = new Map<string, number>();

      for (const seat of seats) {
        const price = Math.round(showtime.basePrice * seat.priceMultiplier);
        seatPriceMap.set(seat.id, price);
        totalPrice += price;
      }

      // 6. Tạo Booking giữ chỗ (HOLDING)
      const bookingCode = CodeUtil.generateBookingCode();
      const booking = await tx.booking.create({
        data: {
          bookingCode,
          userId,
          showtimeId,
          totalPrice,
          status: BookingStatus.HOLDING,
          holdExpiresAt,
        },
      });

      // 7. Tạo danh sách vé (HELD)
      const ticketsData = seats.map((seat) => ({
        ticketCode: CodeUtil.generateTicketCode(seat.row, seat.number),
        bookingId: booking.id,
        showtimeId,
        seatId: seat.id,
        price: seatPriceMap.get(seat.id) || showtime.basePrice,
        status: TicketStatus.HELD,
      }));

      await tx.ticket.createMany({
        data: ticketsData,
      });

      // 8. Trả về thông tin đặt chỗ kèm hạn 5 phút
      const createdBooking = await tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          showtime: {
            include: {
              movie: true,
              room: { include: { cinema: true } },
            },
          },
          tickets: {
            include: { seat: true },
          },
        },
      });

      return createdBooking;
    });
  }

  /**
   * Thanh toán giả lập (Mock Payment) & Xác nhận vé
   */
  public static async confirmPayment(userId: string, bookingId: string, paymentMethod: string) {
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          showtime: {
            include: {
              movie: true,
              room: { include: { cinema: true } },
            },
          },
          tickets: {
            include: { seat: true },
          },
        },
      });

      if (!booking) {
        const error: any = new Error('Không tìm thấy thông tin đơn đặt vé.');
        error.statusCode = 404;
        throw error;
      }

      if (booking.userId !== userId) {
        const error: any = new Error('Bạn không có quyền thanh toán đơn đặt vé này.');
        error.statusCode = 403;
        throw error;
      }

      if (booking.status === BookingStatus.CONFIRMED) {
        return booking; // Đã thanh toán trước đó
      }

      if (booking.status !== BookingStatus.HOLDING) {
        const error: any = new Error('Đơn đặt vé này không còn ở trạng thái chờ thanh toán.');
        error.statusCode = 400;
        throw error;
      }

      // Kiểm tra xem đã quá 5 phút giữ chỗ chưa
      if (booking.holdExpiresAt < now) {
        await tx.ticket.deleteMany({ where: { bookingId: booking.id } });
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.EXPIRED },
        });

        const error: any = new Error('Thời gian giữ ghế 5 phút đã hết. Ghế đã được nhả cho người khác. Vui lòng chọn lại ghế.');
        error.statusCode = 400;
        throw error;
      }

      // Chuỗi dữ liệu QR Code cho vé điện tử
      const qrPayload = JSON.stringify({
        code: booking.bookingCode,
        movie: booking.showtime.movie.title,
        cinema: booking.showtime.room.cinema.name,
        room: booking.showtime.room.name,
        time: booking.showtime.startTime,
        seats: booking.tickets.map((t) => `${t.seat.row}${t.seat.number}`).join(', '),
        total: booking.totalPrice,
      });

      const qrCodeDataUrl = await CodeUtil.generateQrCodeBase64(qrPayload);

      // Cập nhật trạng thái vé và booking
      await tx.ticket.updateMany({
        where: { bookingId: booking.id },
        data: { status: TicketStatus.BOOKED },
      });

      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONFIRMED,
          paymentMethod,
          paymentTime: now,
          qrCodeData: qrCodeDataUrl,
        },
        include: {
          showtime: {
            include: {
              movie: true,
              room: { include: { cinema: true } },
            },
          },
          tickets: {
            include: { seat: true },
          },
        },
      });

      return updatedBooking;
    });
  }

  /**
   * Hủy vé trước giờ chiếu
   */
  public static async cancelBooking(userId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        showtime: true,
      },
    });

    if (!booking) {
      const error: any = new Error('Không tìm thấy đơn đặt vé.');
      error.statusCode = 404;
      throw error;
    }

    if (booking.userId !== userId) {
      const error: any = new Error('Bạn không có quyền thao tác trên đơn vé này.');
      error.statusCode = 403;
      throw error;
    }

    if (booking.status === BookingStatus.CANCELLED) {
      const error: any = new Error('Đơn đặt vé này đã được hủy trước đó.');
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();
    // Bắt buộc hủy trước giờ chiếu tối thiểu 30 phút
    const showtimeStart = new Date(booking.showtime.startTime);
    const deadline = new Date(showtimeStart.getTime() - 30 * 60 * 1000);

    if (now > deadline) {
      const error: any = new Error('Chỉ được phép hủy vé trước giờ chiếu ít nhất 30 phút.');
      error.statusCode = 400;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      await tx.ticket.updateMany({
        where: { bookingId: booking.id },
        data: { status: TicketStatus.CANCELLED },
      });

      return tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CANCELLED },
        include: {
          showtime: {
            include: {
              movie: true,
              room: { include: { cinema: true } },
            },
          },
          tickets: {
            include: { seat: true },
          },
        },
      });
    });
  }

  /**
   * Lấy lịch sử đặt vé của người dùng
   */
  public static async getUserBookings(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      include: {
        showtime: {
          include: {
            movie: true,
            room: { include: { cinema: true } },
          },
        },
        tickets: {
          include: { seat: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Lấy chi tiết một đơn đặt vé
   */
  public static async getBookingById(userId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        showtime: {
          include: {
            movie: true,
            room: { include: { cinema: true } },
          },
        },
        tickets: {
          include: { seat: true },
        },
      },
    });

    if (!booking) {
      const error: any = new Error('Không tìm thấy thông tin đơn đặt vé.');
      error.statusCode = 404;
      throw error;
    }

    if (booking.userId !== userId) {
      const error: any = new Error('Bạn không có quyền xem thông tin đơn vé này.');
      error.statusCode = 403;
      throw error;
    }

    return booking;
  }
}
