# 🎬 Ticket Cinema - Hệ Thống Đặt Vé Xem Phim Trực Tuyến

Ticket Cinema là ứng dụng web đặt vé xem phim hiện đại, hoàn chỉnh từ giao diện người dùng (Customer) đến hệ thống quản trị rạp (Admin Dashboard). Dự án được thiết kế kiến trúc chuẩn Clean Architecture, xử lý concurrency chống đặt trùng ghế bằng transaction CSDL và triển khai nhanh chóng với Docker Compose.

---

## 🚀 Công Nghệ Sử Dụng

### Frontend
- **Framework**: React 18 (Vite) + TypeScript
- **Styling**: Tailwind CSS (Cinema dark theme sang trọng)
- **Icons & Animation**: Lucide React, Canvas Confetti
- **QR Code**: `qrcode.react` (Sinh mã QR vé điện tử)
- **HTTP Client**: Axios với Interceptor tự động gắn Bearer JWT

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **ORM & Database**: Prisma ORM + PostgreSQL
- **Xác thực**: JWT (JSON Web Token) + `bcryptjs`
- **Validation**: Zod schema validation middleware
- **Concurrency & Transaction**: Prisma Interactive Transaction khóa ghế an toàn trong 5 phút

### DevOps & Container
- **Docker & Docker Compose**: Quản lý đa dịch vụ (PostgreSQL, Backend, Frontend Nginx)
- **Nginx**: Phục vụ Frontend SPA và proxy API

---

## 🌟 Tính Năng Chính

### 1. Phân Hệ Khách Hàng (Customer)
- **Xác thực**: Đăng ký, đăng nhập JWT, tự động lưu phiên và bảo vệ route.
- **Khám phá phim**:
  - Danh sách phim *Đang chiếu* & *Sắp chiếu*.
  - Bộ lọc tìm kiếm nhanh theo tên phim và thể loại.
  - Trang chi tiết phim: Thông tin thời lượng, đạo diễn, diễn viên, ngày chiếu và video trailer YouTube nhúng trực tiếp.
- **Chọn suất chiếu & Ghế ngồi**:
  - Lọc suất chiếu theo ngày và cụm rạp.
  - Sơ đồ ghế trực quan phân loại: **Thường (Standard)**, **VIP**, **Couple**.
  - Trạng thái ghế động: Trống, Đang chọn, Đã đặt, Đang được giữ bởi người khác.
- **Giữ ghế tạm thời (5 phút)**:
  - Đồng hồ đếm ngược 5 phút khi chuyển sang trang thanh toán.
  - Cơ chế Prisma Interactive Transaction khóa ghế an toàn, tự động mở lại ghế nếu người dùng không hoàn tất thanh toán sau 5 phút.
- **Thanh toán & Vé điện tử**:
  - Cổng thanh toán giả lập đa phương thức (MoMo, VNPay, Thẻ tín dụng/ATM).
  - Tự động sinh vé điện tử kèm **mã QR Code** phục vụ việc soát vé tại quầy.
  - Hiệu ứng pháo hoa chúc mừng đặt vé thành công.
- **Quản lý vé**:
  - Xem danh sách lịch sử đặt vé chi tiết.
  - Cho phép hủy vé và hoàn lại trạng thái ghế trống (nếu trước giờ chiếu tối thiểu 60 phút).

### 2. Phân Hệ Quản Trị Viên (Admin)
- **Dashboard Thống kê**:
  - Tổng doanh thu, tổng số vé bán ra, tổng số phim và khách hàng.
  - Biểu đồ thống kê doanh thu theo ngày và doanh thu theo từng phim.
- **Quản lý Phim (CRUD Movies)**:
  - Thêm phim mới, chỉnh sửa thông tin, đổi trạng thái (Đang chiếu / Sắp chiếu / Ngừng chiếu), xóa phim.
- **Quản lý Suất chiếu (Showtimes)**:
  - Lập lịch chiếu mới theo Rạp, Phòng chiếu, Thời gian và Giá vé cơ bản.
  - Kiểm tra xung đột khung giờ chiếu.
- **Quản lý Đặt vé (Bookings)**:
  - Xem toàn bộ danh sách giao dịch đặt vé, mã booking, thông tin khách hàng, số ghế và trạng thái thanh toán.

---

## 📂 Cấu Trúc Dự Án

```
Ticket-cinema/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Mô hình CSDL PostgreSQL
│   │   └── seed.ts             # Dữ liệu khởi tạo (Users, Phim, Rạp, Ghế, Suất chiếu)
│   ├── src/
│   │   ├── config/             # Cấu hình biến môi trường
│   │   ├── controllers/        # Điều hướng request/response
│   │   ├── middlewares/        # Auth, Role, Validate Zod, Error handler
│   │   ├── prisma/             # Prisma client singleton
│   │   ├── routes/             # Định tuyến REST API
│   │   ├── services/           # Nghiệp vụ core & Transaction giữ ghế
│   │   ├── tests/              # Unit test Vitest (Seat hold & Race condition)
│   │   ├── types/              # Type definitions
│   │   ├── utils/              # Helper functions (mã vé, format response)
│   │   ├── validators/         # Schema xác thực Zod
│   │   ├── app.ts              # Khởi tạo Express app
│   │   └── index.ts            # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/                # Cấu hình Axios client & endpoints
│   │   ├── components/         # Navbar, Footer, MovieCard, SeatMap, Timer, etc.
│   │   ├── pages/              # HomePage, MovieDetailPage, SeatBooking, Checkout, Admin...
│   │   ├── store/              # Auth Context & State management
│   │   ├── types/              # Frontend TypeScript interfaces
│   │   ├── App.tsx             # React Router v6
│   │   ├── main.tsx
│   │   └── index.css           # Tailwind custom classes
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml           # Khởi chạy fullstack với 1 câu lệnh
├── .env.example                # Mẫu cấu hình môi trường
├── .gitignore
├── LICENSE                     # Giấy phép MIT
└── README.md
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Cách 1: Chạy bằng Docker Compose (Khuyên dùng)

Yêu cầu máy đã cài đặt Docker & Docker Compose.

1. Clone repository:
   ```bash
   git clone https://github.com/ThanhHung-2006/Ticket-cinema.git
   cd Ticket-cinema
   ```

2. Tạo file `.env` từ `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Khởi chạy toàn bộ hệ thống (PostgreSQL + Backend + Frontend):
   ```bash
   docker-compose up -d --build
   ```

4. Chạy migration và nạp dữ liệu mẫu vào PostgreSQL:
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   docker-compose exec backend npm run seed
   ```

5. Truy cập ứng dụng:
   - **Giao diện người dùng (Frontend)**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
   - **Kiểm tra tình trạng API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Cách 2: Chạy cục bộ (Local Development)

#### 1. Yêu cầu môi trường
- Node.js >= 18.x
- PostgreSQL >= 14.x

#### 2. Cấu hình Backend
```bash
cd backend
npm install

# Tạo file .env cho backend
cp ../.env.example .env
# Chỉnh sửa chuỗi DATABASE_URL trong .env trỏ tới PostgreSQL của bạn, ví dụ:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ticket_cinema?schema=public"

# Tạo bảng và nạp dữ liệu mẫu
npx prisma migrate dev --name init
npm run seed

# Khởi động máy chủ backend dev
npm run dev
```
Backend sẽ lắng nghe tại `http://localhost:5000`.

#### 3. Cấu hình Frontend
```bash
cd ../frontend
npm install

# Khởi chạy Vite dev server
npm run dev
```
Frontend sẽ mở tại `http://localhost:5173` (hoặc `http://localhost:3000`).

---

## 🔑 Tài Khoản Trải Nghiệm Mặc Định (Seed Data)

| Vai trò | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@cinema.com` | `admin123` | Quản lý toàn bộ phim, suất chiếu, doanh thu, vé |
| **Khách hàng (Customer)** | `customer@cinema.com` | `user123` | Đặt vé, giữ ghế, thanh toán, hủy vé |

*(Bạn cũng có thể dễ dàng tạo tài khoản mới ngay trên trang Đăng ký).*

---

## 📑 Danh Sách REST API

Tất cả các route đều bắt đầu bằng prefix `/api`:

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Public | Kiểm tra trạng thái máy chủ |
| **POST** | `/api/auth/register` | Public | Đăng ký tài khoản mới |
| **POST** | `/api/auth/login` | Public | Đăng nhập nhận JWT Token |
| **GET** | `/api/auth/profile` | Authenticated | Lấy thông tin cá nhân hiện tại |
| **GET** | `/api/movies` | Public | Lấy danh sách phim (hỗ trợ lọc status, search, genre) |
| **GET** | `/api/movies/:id` | Public | Lấy thông tin chi tiết phim |
| **POST** | `/api/movies` | Admin | Thêm phim mới |
| **PUT** | `/api/movies/:id` | Admin | Cập nhật phim |
| **DELETE** | `/api/movies/:id` | Admin | Xóa phim |
| **GET** | `/api/cinemas` | Public | Lấy danh sách rạp và phòng chiếu |
| **GET** | `/api/showtimes` | Public | Lấy danh sách suất chiếu theo phim / ngày |
| **GET** | `/api/showtimes/:id` | Public | Lấy chi tiết suất chiếu & sơ đồ ghế (kèm trạng thái) |
| **POST** | `/api/showtimes` | Admin | Tạo suất chiếu mới |
| **POST** | `/api/bookings/hold` | Customer / Admin | Giữ ghế trong 5 phút (Chống race condition) |
| **POST** | `/api/bookings/confirm` | Customer / Admin | Xác nhận thanh toán và sinh mã vé QR |
| **GET** | `/api/bookings/my-bookings`| Customer / Admin | Lịch sử đặt vé của tài khoản |
| **POST** | `/api/bookings/:id/cancel`| Customer / Admin | Hủy vé đã đặt (trước giờ chiếu) |
| **GET** | `/api/admin/dashboard` | Admin | Thống kê doanh thu, vé, phim theo ngày |
| **GET** | `/api/admin/bookings` | Admin | Quản lý danh sách tất cả vé trong hệ thống |

---

## 🧪 Kiểm Thử (Unit Tests)

Dự án cung cấp bộ test tự động kiểm thử nghiệp vụ giữ ghế 5 phút và chống race condition khi 2 khách hàng cùng đặt 1 ghế:

```bash
cd backend
npm run test
```

---

## 📜 Giấy Phép

Dự án được phân phối dưới giấy phép **MIT License**. Xem chi tiết tại [LICENSE](./LICENSE).
