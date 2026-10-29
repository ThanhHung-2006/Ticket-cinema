import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingService } from '../services/booking.service';
import { prisma } from '../prisma';
import { BookingStatus, TicketStatus } from '@prisma/client';

// Mock Prisma Client for unit testing
vi.mock('../prisma', () => {
  const mPrisma = {
    $transaction: vi.fn((callback) => callback(mPrisma)),
    booking: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    ticket: {
      findMany: vi.fn(),
      createMany: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    showtime: {
      findUnique: vi.fn(),
    },
    seat: {
      findMany: vi.fn(),
    },
  };
  return { prisma: mPrisma };
});

describe('BookingService - Concurrency & Seat Holding Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nên giữ ghế thành công khi ghế còn trống và tạo hạn giữ 5 phút', async () => {
    const userId = 'user-001';
    const showtimeId = 'showtime-001';
    const seatIds = ['seat-e5'];
    const now = new Date();

    // 1. Mock expired bookings cleanup
    (prisma.booking.findMany as any).mockResolvedValueOnce([]);

    // 2. Mock showtime check
    (prisma.showtime.findUnique as any).mockResolvedValueOnce({
      id: showtimeId,
      isActive: true,
      startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 tiếng nữa
      roomId: 'room-001',
      basePrice: 80000,
      room: { id: 'room-001' },
    });

    // 3. Mock seats check
    (prisma.seat.findMany as any).mockResolvedValueOnce([
      { id: 'seat-e5', roomId: 'room-001', row: 'E', number: 5, priceMultiplier: 1.0 },
    ]);

    // 4. Mock conflicting tickets check (không có xung đột)
    (prisma.ticket.findMany as any).mockResolvedValueOnce([]);

    // 5. Mock booking creation
    (prisma.booking.create as any).mockResolvedValueOnce({
      id: 'booking-001',
      bookingCode: 'BK-TEST-123',
      userId,
      showtimeId,
      totalPrice: 80000,
      status: BookingStatus.HOLDING,
      holdExpiresAt: new Date(now.getTime() + 5 * 60 * 1000),
    });

    (prisma.ticket.createMany as any).mockResolvedValueOnce({ count: 1 });

    (prisma.booking.findUnique as any).mockResolvedValueOnce({
      id: 'booking-001',
      bookingCode: 'BK-TEST-123',
      status: BookingStatus.HOLDING,
      totalPrice: 80000,
    });

    const result = await BookingService.holdSeats(userId, showtimeId, seatIds);

    expect(result).toBeDefined();
    expect(result?.status).toBe(BookingStatus.HOLDING);
    expect(prisma.ticket.createMany).toHaveBeenCalledTimes(1);
  });

  it('phải chặn và ném lỗi 409 khi 2 người cùng đặt 1 ghế (Chống Race Condition)', async () => {
    const userId = 'user-002';
    const showtimeId = 'showtime-001';
    const seatIds = ['seat-e5'];
    const now = new Date();

    (prisma.booking.findMany as any).mockResolvedValueOnce([]);

    (prisma.showtime.findUnique as any).mockResolvedValueOnce({
      id: showtimeId,
      isActive: true,
      startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      roomId: 'room-001',
      basePrice: 80000,
    });

    (prisma.seat.findMany as any).mockResolvedValueOnce([
      { id: 'seat-e5', roomId: 'room-001', row: 'E', number: 5, priceMultiplier: 1.0 },
    ]);

    // Giả lập ghế E5 đã có người khác giữ chỗ
    (prisma.ticket.findMany as any).mockResolvedValueOnce([
      {
        id: 'tkt-001',
        showtimeId,
        seatId: 'seat-e5',
        status: TicketStatus.HELD,
        seat: { row: 'E', number: 5 },
      },
    ]);

    await expect(BookingService.holdSeats(userId, showtimeId, seatIds)).rejects.toThrow(
      'Ghế [E5] vừa có người khác đặt hoặc đang giữ chỗ'
    );
  });

  it('phải từ chối thanh toán khi thời gian giữ ghế 5 phút đã hết hạn', async () => {
    const userId = 'user-001';
    const bookingId = 'booking-001';
    const expiredTime = new Date(Date.now() - 1000); // Đã hết hạn cách đây 1s

    (prisma.booking.findUnique as any).mockResolvedValueOnce({
      id: bookingId,
      userId,
      status: BookingStatus.HOLDING,
      holdExpiresAt: expiredTime,
      showtime: { movie: {}, room: { cinema: {} } },
      tickets: [],
    });

    (prisma.ticket.deleteMany as any).mockResolvedValueOnce({ count: 1 });
    (prisma.booking.update as any).mockResolvedValueOnce({});

    await expect(BookingService.confirmPayment(userId, bookingId, 'MOCK_MOMO')).rejects.toThrow(
      'Thời gian giữ ghế 5 phút đã hết'
    );
  });
});
