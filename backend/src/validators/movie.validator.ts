import { z } from 'zod';
import { MovieStatus } from '@prisma/client';

export const createMovieSchema = z.object({
  title: z.string().min(1, 'Tên phim là bắt buộc'),
  englishTitle: z.string().optional(),
  genres: z.string().min(1, 'Thể loại phim là bắt buộc'),
  duration: z.number().int().positive('Thời lượng phải lớn hơn 0'),
  releaseDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Ngày khởi chiếu không hợp lệ',
  }),
  ageRating: z.string().default('P'),
  posterUrl: z.string().url('Đường dẫn poster không hợp lệ'),
  trailerUrl: z.string().optional(),
  description: z.string().min(1, 'Mô tả phim là bắt buộc'),
  status: z.nativeEnum(MovieStatus).default(MovieStatus.NOW_SHOWING),
});

export const updateMovieSchema = createMovieSchema.partial();
