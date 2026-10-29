import { z } from 'zod';

export const holdSeatsSchema = z.object({
  showtimeId: z.string().uuid('Mã suất chiếu không hợp lệ'),
  seatIds: z.array(z.string().uuid('Mã ghế không hợp lệ')).min(1, 'Chọn tối thiểu 1 ghế').max(8, 'Chỉ được chọn tối đa 8 ghế mỗi lần'),
});

export const confirmPaymentSchema = z.object({
  paymentMethod: z.enum(['MOCK_MOMO', 'MOCK_VNPAY', 'MOCK_CARD'], {
    errorMap: () => ({ message: 'Phương thức thanh toán phải là MOCK_MOMO, MOCK_VNPAY hoặc MOCK_CARD' }),
  }),
});
