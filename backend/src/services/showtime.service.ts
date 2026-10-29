import { prisma } from '../prisma';

export class ShowtimeService {
  public static async getShowtimes(filter: {
    movieId?: string;
    cinemaId?: string;
    date?: string;
  }) {
    const where: any = { isActive: true };

    if (filter.movieId) {
      where.movieId = filter.movieId;
    }

    if (filter.cinemaId) {
      where.room = { cinemaId: filter.cinemaId };
    }

    if (filter.date) {
      const d = new Date(filter.date);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      where.startTime = { gte: startOfDay, lte: endOfDay };
    } else {
      where.startTime = { gte: new Date() };
    }

    return prisma.showtime.findMany({
      where,
      include: {
        movie: true,
        room: {
          include: {
            cinema: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  public static async getShowtimeById(id: string) {
    const showtime = await prisma.showtime.findUnique({
      where: { id },
      include: {
        movie: true,
        room: {
          include: {
            cinema: true,
          },
        },
      },
    });

    if (!showtime) {
      const error: any = new Error('Không tìm thấy suất chiếu.');
      error.statusCode = 404;
      throw error;
    }

    return showtime;
  }

  public static async getShowtimeSeatMap(showtimeId: string) {
    const showtime = await this.getShowtimeById(showtimeId);
    const room = await prisma.room.findUnique({
      where: { id: showtime.roomId },
      include: {
        seats: {
          orderBy: [{ row: 'asc' }, { number: 'asc' }],
        },
      },
    });

    if (!room) {
      const error: any = new Error('Phòng chiếu không tồn tại.');
      error.statusCode = 404;
      throw error;
    }

    const now = new Date();

    // Lấy các vé đã đặt hoặc đang được giữ chỗ còn hiệu lực
    const tickets = await prisma.ticket.findMany({
      where: {
        showtimeId,
        status: { in: ['HELD', 'BOOKED'] },
      },
      include: {
        booking: true,
      },
    });

    const seatStatusMap = new Map<string, { status: 'AVAILABLE' | 'HOLDING' | 'BOOKED' }>();

    for (const t of tickets) {
      if (t.status === 'BOOKED') {
        seatStatusMap.set(t.seatId, { status: 'BOOKED' });
      } else if (t.status === 'HELD') {
        // Kiểm tra xem booking giữ chỗ còn hạn 5 phút hay không
        if (t.booking.holdExpiresAt && t.booking.holdExpiresAt > now) {
          seatStatusMap.set(t.seatId, { status: 'HOLDING' });
        }
      }
    }

    const seatMap = room.seats.map((seat) => {
      const occupancy = seatStatusMap.get(seat.id);
      const calculatedPrice = Math.round(showtime.basePrice * seat.priceMultiplier);

      return {
        id: seat.id,
        row: seat.row,
        number: seat.number,
        code: `${seat.row}${seat.number}`,
        type: seat.type,
        priceMultiplier: seat.priceMultiplier,
        price: calculatedPrice,
        status: occupancy ? occupancy.status : 'AVAILABLE',
      };
    });

    // Nhóm theo hàng ghế để frontend render bảng ghế dễ dàng
    const rowsMap: { [row: string]: typeof seatMap } = {};
    for (const s of seatMap) {
      if (!rowsMap[s.row]) rowsMap[s.row] = [];
      rowsMap[s.row].push(s);
    }

    return {
      showtime: {
        id: showtime.id,
        movieTitle: showtime.movie.title,
        moviePoster: showtime.movie.posterUrl,
        cinemaName: showtime.room.cinema.name,
        roomName: showtime.room.name,
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        basePrice: showtime.basePrice,
      },
      totalSeats: seatMap.length,
      availableSeats: seatMap.filter((s) => s.status === 'AVAILABLE').length,
      rows: rowsMap,
      seats: seatMap,
    };
  }

  public static async createShowtime(data: {
    movieId: string;
    roomId: string;
    startTime: string;
    endTime: string;
    basePrice: number;
  }) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    // Kiểm tra trùng giờ chiếu trong cùng phòng
    const conflict = await prisma.showtime.findFirst({
      where: {
        roomId: data.roomId,
        isActive: true,
        OR: [
          {
            startTime: { lte: start },
            endTime: { gt: start },
          },
          {
            startTime: { lt: end },
            endTime: { gte: end },
          },
          {
            startTime: { gte: start },
            endTime: { lte: end },
          },
        ],
      },
    });

    if (conflict) {
      const error: any = new Error('Phòng chiếu đã có suất chiếu khác trong khoảng thời gian này.');
      error.statusCode = 409;
      throw error;
    }

    return prisma.showtime.create({
      data: {
        movieId: data.movieId,
        roomId: data.roomId,
        startTime: start,
        endTime: end,
        basePrice: data.basePrice,
      },
      include: {
        movie: true,
        room: { include: { cinema: true } },
      },
    });
  }

  public static async deleteShowtime(id: string) {
    return prisma.showtime.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
