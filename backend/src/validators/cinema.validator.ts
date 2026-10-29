import { z } from 'zod';

export const createCinemaSchema = z.object({
  name: z.string().min(1, 'Tên rạp là bắt buộc'),
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
  city: z.string().default('TP. Hồ Chí Minh'),
});

export const createRoomSchema = z.object({
  cinemaId: z.string().uuid('Mã rạp không hợp lệ'),
  name: z.string().min(1, 'Tên phòng chiếu là bắt buộc'),
  totalRows: z.number().int().min(1).max(15, 'Tối đa 15 hàng ghế'),
  seatsPerRow: z.number().int().min(1).max(20, 'Tối đa 20 ghế mỗi hàng'),
});
