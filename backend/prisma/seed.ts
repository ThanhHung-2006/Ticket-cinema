import { PrismaClient, Role, MovieStatus, SeatType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- BẮT ĐẦU SEED DỮ LIỆU TICKET CINEMA ---');

  // 1. Xóa dữ liệu cũ (theo thứ tự quan hệ)
  await prisma.ticket.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.room.deleteMany();
  await prisma.cinema.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();

  // 2. Tạo Tài Khoản (Admin & Khách Hàng)
  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashUser = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@cinema.com',
      password: passwordHashAdmin,
      fullName: 'Quản Trị Viên Hệ Thống',
      phone: '0901234567',
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@cinema.com',
      password: passwordHashUser,
      fullName: 'Nguyễn Văn Khách',
      phone: '0987654321',
      role: Role.CUSTOMER,
    },
  });

  console.log(`Đã tạo tài khoản: Admin (${admin.email}), Khách hàng (${customer.email})`);

  // 3. Tạo Rạp Chiếu Phim (2 Rạp)
  const cinema1 = await prisma.cinema.create({
    data: {
      name: 'CineStar Landmark 81',
      address: '720A Điện Biên Phủ, Phường 22, Bình Thạnh',
      city: 'TP. Hồ Chí Minh',
    },
  });

  const cinema2 = await prisma.cinema.create({
    data: {
      name: 'CineStar Hai Bà Trưng',
      address: '135 Hai Bà Trưng, Phường Bến Nghé, Quận 1',
      city: 'TP. Hồ Chí Minh',
    },
  });

  // 4. Tạo Phòng Chiếu & Ghế
  const room1 = await prisma.room.create({
    data: {
      cinemaId: cinema1.id,
      name: 'Phòng Chiếu 1 (2D Standard)',
      totalRows: 6, // Hàng A -> F
      seatsPerRow: 10, // 1 -> 10
    },
  });

  const room2 = await prisma.room.create({
    data: {
      cinemaId: cinema1.id,
      name: 'Phòng Chiếu 2 (IMAX Laser)',
      totalRows: 6,
      seatsPerRow: 10,
    },
  });

  const room3 = await prisma.room.create({
    data: {
      cinemaId: cinema2.id,
      name: 'Phòng Chiếu Premiere',
      totalRows: 5,
      seatsPerRow: 8,
    },
  });

  // Helper sinh danh sách ghế cho 1 phòng
  async function generateSeats(roomId: string, totalRows: number, seatsPerRow: number) {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, totalRows);
    const seatData = [];

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx];
      for (let num = 1; num <= seatsPerRow; num++) {
        let type: SeatType = SeatType.STANDARD;
        let priceMultiplier = 1.0;

        // Hàng C, D là hàng VIP trung tâm
        if (row === 'C' || row === 'D') {
          type = SeatType.VIP;
          priceMultiplier = 1.25;
        } else if (rIdx === rows.length - 1 && num % 2 === 1) {
          // Hàng cuối cùng là ghế đôi (COUPLE)
          type = SeatType.COUPLE;
          priceMultiplier = 1.5;
        }

        seatData.push({
          roomId,
          row,
          number: num,
          type,
          priceMultiplier,
        });
      }
    }

    await prisma.seat.createMany({ data: seatData });
  }

  await generateSeats(room1.id, room1.totalRows, room1.seatsPerRow);
  await generateSeats(room2.id, room2.totalRows, room2.seatsPerRow);
  await generateSeats(room3.id, room3.totalRows, room3.seatsPerRow);
  console.log('Đã tạo danh sách phòng và sơ đồ ghế chi tiết.');

  // 5. Tạo Phim (Đang chiếu & Sắp chiếu)
  const movies = await Promise.all([
    prisma.movie.create({
      data: {
        title: 'Dune: Hành Tinh Cát - Phần 2',
        englishTitle: 'Dune: Part Two',
        genres: 'Khoa Học Viễn Tưởng, Hành Động, Phiêu Lưu',
        duration: 166,
        releaseDate: new Date('2026-03-01'),
        ageRating: 'T16',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        description: 'Paul Atreides hội ngộ cùng Chani và tộc người Fremen khi anh tìm kiếm sự báo thù chống lại những kẻ đã hủy diệt gia tộc mình. Đứng trước sự lựa chọn giữa tình yêu và số phận vũ trụ, Paul phải ngăn chặn một tương lai tăm tối mà chỉ anh mới có thể nhìn thấy trước.',
        status: MovieStatus.NOW_SHOWING,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Mai',
        englishTitle: 'Mai',
        genres: 'Tâm Lý - Tình Cảm, Hài Hước',
        duration: 131,
        releaseDate: new Date('2026-02-10'),
        ageRating: 'T18',
        posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
        trailerUrl: 'https://www.youtube.com',
        description: 'Mai - người phụ nữ gần 40 tuổi làm nghề massage trị liệu, luôn khao khát một tình yêu chân thành nhưng bị bủa vây bởi định kiến xã hội và vết thương quá khứ. Cuộc gặp gỡ tình cờ với chàng nhạc công lãng tử Dương mang lại tia sáng mới nhưng cũng mở ra thử thách cam go.',
        status: MovieStatus.NOW_SHOWING,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Godzilla x Kong: Đế Chế Mới',
        englishTitle: 'Godzilla x Kong: The New Empire',
        genres: 'Hành Động, Khoa Học Viễn Tưởng, Quái Thú',
        duration: 115,
        releaseDate: new Date('2026-03-29'),
        ageRating: 'T13',
        posterUrl: 'https://images.unsplash.com/photo-1579566346927-c68383817a25?w=800&q=80',
        trailerUrl: 'https://www.youtube.com',
        description: 'Cuộc chiến bùng nổ khi hai quái thú huyền thoại Godzilla và Kong phải gạt bỏ tranh chấp để liên minh chống lại hiểm họa khổng lồ chưa từng thấy ẩn sâu trong Trái Đất Rỗng, đe dọa sự tồn vong của loài người.',
        status: MovieStatus.NOW_SHOWING,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Kung Fu Panda 4',
        englishTitle: 'Kung Fu Panda 4',
        genres: 'Hoạt Hình, Hài Hước, Gia Đình',
        duration: 94,
        releaseDate: new Date('2026-03-08'),
        ageRating: 'P',
        posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
        trailerUrl: 'https://www.youtube.com',
        description: 'Sau nhiều năm bảo vệ hòa bình, Po được kêu gọi trở thành Thủ lĩnh Tinh thần Thung lũng Bình Yên. Trước khi nhậm chức, Po phải tìm và đào tạo một Thần Long Đại Hiệp kế nhiệm, đồng thời đối đầu với mụ phù thủy Tắc Kè Hoa có khả năng biến hình nguy hiểm.',
        status: MovieStatus.NOW_SHOWING,
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Lật Mặt 7: Một Điều Ước',
        englishTitle: 'Face Off 7: One Wish',
        genres: 'Tâm Lý - Tình Cảm, Gia Đình',
        duration: 138,
        releaseDate: new Date('2026-11-20'),
        ageRating: 'P',
        posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80',
        trailerUrl: 'https://www.youtube.com',
        description: 'Câu chuyện xúc động về bà Hai (73 tuổi) nuôi nấng 5 người con khôn lớn. Khi bà gặp biến cố bất ngờ, trách nhiệm chăm sóc mẹ già được đặt lên vai 5 người con với những hoàn cảnh và góc nhìn cuộc sống hoàn toàn khác biệt.',
        status: MovieStatus.COMING_SOON,
      },
    }),
  ]);

  console.log(`Đã tạo ${movies.length} bộ phim.`);

  // 6. Tạo Suất Chiếu (Showtimes)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const showtime1 = await prisma.showtime.create({
    data: {
      movieId: movies[0].id, // Dune 2
      roomId: room1.id,
      startTime: new Date(today.getTime() + 19 * 60 * 60 * 1000 + 30 * 60 * 1000), // 19:30 hôm nay
      endTime: new Date(today.getTime() + 22 * 60 * 60 * 1000 + 15 * 60 * 1000),
      basePrice: 85000,
    },
  });

  const showtime2 = await prisma.showtime.create({
    data: {
      movieId: movies[1].id, // Mai
      roomId: room2.id,
      startTime: new Date(today.getTime() + 20 * 60 * 60 * 1000), // 20:00 hôm nay
      endTime: new Date(today.getTime() + 22 * 60 * 60 * 1000 + 15 * 60 * 1000),
      basePrice: 95000,
    },
  });

  const showtime3 = await prisma.showtime.create({
    data: {
      movieId: movies[2].id, // Godzilla x Kong
      roomId: room3.id,
      startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // 15:00 ngày mai
      endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
      basePrice: 80000,
    },
  });

  console.log('Đã tạo các suất chiếu mẫu.');
  console.log('--- SEED DỮ LIỆU HOÀN TẤT THÀNH CÔNG ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
