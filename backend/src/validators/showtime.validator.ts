import { z } from 'zod';

export const createShowtimeSchema = z.object({
  movieId: z.string().uuid('Mã phim không hợp lệ'),
  roomId: z.string().uuid('Mã phòng chiếu không hợp lệ'),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Thời gian bắt đầu không hợp lệ',
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Thời gian kết thúc không hợp lệ',
  }),
  basePrice: z.number().positive('Giá vé cơ bản phải lớn hơn 0'),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
  path: ['endTime'],
});
