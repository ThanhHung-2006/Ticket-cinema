import { prisma } from '../prisma';
import { SeatType } from '@prisma/client';

export class CinemaService {
  public static async getCinemas() {
    return prisma.cinema.findMany({
      include: {
        rooms: {
          select: {
            id: true,
            name: true,
            totalRows: true,
            seatsPerRow: true,
            _count: {
              select: { seats: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  public static async getCinemaById(id: string) {
    const cinema = await prisma.cinema.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            seats: {
              orderBy: [{ row: 'asc' }, { number: 'asc' }],
            },
          },
        },
      },
    });

    if (!cinema) {
      const error: any = new Error('Không tìm thấy rạp chiếu.');
      error.statusCode = 404;
      throw error;
    }

    return cinema;
  }

  public static async createCinema(data: { name: string; address: string; city?: string }) {
    return prisma.cinema.create({
      data: {
        name: data.name,
        address: data.address,
        city: data.city || 'TP. Hồ Chí Minh',
      },
    });
  }

  public static async createRoom(data: {
    cinemaId: string;
    name: string;
    totalRows: number;
    seatsPerRow: number;
  }) {
    const cinema = await prisma.cinema.findUnique({ where: { id: data.cinemaId } });
    if (!cinema) {
      const error: any = new Error('Rạp chiếu không tồn tại.');
      error.statusCode = 404;
      throw error;
    }

    const room = await prisma.room.create({
      data: {
        cinemaId: data.cinemaId,
        name: data.name,
        totalRows: data.totalRows,
        seatsPerRow: data.seatsPerRow,
      },
    });

    // Tự động sinh danh sách ghế cho phòng mới
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'].slice(0, data.totalRows);
    const seats = [];

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx];
      for (let num = 1; num <= data.seatsPerRow; num++) {
        let type: SeatType = SeatType.STANDARD;
        let priceMultiplier = 1.0;

        if (row === 'C' || row === 'D') {
          type = SeatType.VIP;
          priceMultiplier = 1.25;
        } else if (rIdx === rows.length - 1 && num % 2 === 1) {
          type = SeatType.COUPLE;
          priceMultiplier = 1.5;
        }

        seats.push({
          roomId: room.id,
          row,
          number: num,
          type,
          priceMultiplier,
        });
      }
    }

    await prisma.seat.createMany({ data: seats });

    return this.getRoomSeats(room.id);
  }

  public static async getRoomSeats(roomId: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        cinema: true,
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

    return room;
  }
}
