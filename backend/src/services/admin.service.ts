import { prisma } from '../prisma';
import { BookingStatus, TicketStatus } from '@prisma/client';

export class AdminService {
  public static async getRevenueStats(startDate?: string, endDate?: string) {
    const where: any = {
      status: BookingStatus.CONFIRMED,
    };

    if (startDate && endDate) {
      where.paymentTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        showtime: {
          include: {
            movie: true,
          },
        },
        tickets: {
          where: { status: TicketStatus.BOOKED },
        },
      },
      orderBy: { paymentTime: 'asc' },
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalTicketsSold = bookings.reduce((sum, b) => sum + b.tickets.length, 0);
    const totalOrders = bookings.length;

    // Doanh thu theo phim
    const movieMap = new Map<string, { movieId: string; title: string; tickets: number; revenue: number }>();

    for (const b of bookings) {
      const m = b.showtime.movie;
      const current = movieMap.get(m.id) || { movieId: m.id, title: m.title, tickets: 0, revenue: 0 };
      current.tickets += b.tickets.length;
      current.revenue += b.totalPrice;
      movieMap.set(m.id, current);
    }

    const byMovie = Array.from(movieMap.values()).sort((a, b) => b.revenue - a.revenue);

    // Doanh thu theo ngày
    const dailyMap = new Map<string, { date: string; revenue: number; tickets: number; orders: number }>();

    for (const b of bookings) {
      const d = b.paymentTime ? b.paymentTime.toISOString().slice(0, 10) : b.createdAt.toISOString().slice(0, 10);
      const current = dailyMap.get(d) || { date: d, revenue: 0, tickets: 0, orders: 0 };
      current.revenue += b.totalPrice;
      current.tickets += b.tickets.length;
      current.orders += 1;
      dailyMap.set(d, current);
    }

    const daily = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return {
      summary: {
        totalRevenue,
        totalTicketsSold,
        totalOrders,
      },
      byMovie,
      daily,
    };
  }

  public static async getAllBookings(options: { page?: number; limit?: number; status?: BookingStatus }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.status) {
      where.status = options.status;
    }

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, fullName: true, phone: true },
          },
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
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      bookings,
    };
  }
}
