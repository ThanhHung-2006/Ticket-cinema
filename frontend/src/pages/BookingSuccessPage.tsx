import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CheckCircle2, Ticket, Printer, Home, Calendar, Clock, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const BookingSuccessPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingSuccess();
  }, [bookingId]);

  const fetchBookingSuccess = async () => {
    try {
      setLoading(true);
      const res: any = await api.get(`/bookings/${bookingId}`);
      setBooking(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tạo mã vé điện tử..." />;

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Không tìm thấy thông tin vé</h2>
        <Link to="/" className="text-xs font-bold text-[#E11D48] hover:underline">
          ← Về trang chủ
        </Link>
      </div>
    );
  }

  const { showtime } = booking;
  const timeStr = new Date(showtime.startTime).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const dateStr = new Date(showtime.startTime).toLocaleDateString('vi-VN');
  const seatsStr = booking.tickets.map((t: any) => `${t.seat.row}${t.seat.number}`).join(', ');

  const qrPayload = JSON.stringify({
    code: booking.bookingCode,
    movie: showtime.movie.title,
    seats: seatsStr,
    time: timeStr,
    date: dateStr,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Success Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Đặt Vé Thành Công!</h1>
        <p className="text-xs text-[#9CA3AF]">
          Mã vé điện tử đã được kích hoạt. Bạn có thể xuất trình mã QR này tại quầy soát vé trước giờ chiếu.
        </p>
      </div>

      {/* Digital E-Ticket Pass Card */}
      <div className="relative bg-[#181C2E] border border-[#2A2F45] rounded-3xl overflow-hidden shadow-2xl print:bg-white print:text-black">
        {/* Ticket Header Banner */}
        <div className="bg-gradient-to-r from-[#E11D48] to-[#9F1239] p-6 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">VÉ XEM PHIM ĐIỆN TỬ</span>
            <h2 className="text-xl font-black tracking-tight mt-0.5">{showtime.movie.title}</h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">MÃ ĐẶT CHỖ</span>
            <div className="text-sm font-black tracking-wider text-[#F5B301]">{booking.bookingCode}</div>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Details */}
          <div className="md:col-span-7 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-white font-semibold">
              <MapPin className="w-4 h-4 text-[#E11D48]" />
              <span>{showtime.room.cinema.name} • <strong className="text-[#F5B301]">{showtime.room.name}</strong></span>
            </div>

            <div className="flex items-center gap-4 text-[#9CA3AF]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#F5B301]" /> {timeStr}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" /> {dateStr}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F1220] border border-[#2A2F45] flex justify-between items-center">
              <div>
                <span className="text-[10px] text-[#9CA3AF] uppercase font-bold">VỊ TRÍ GHẾ</span>
                <div className="text-lg font-black text-[#F5B301]">{seatsStr}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#9CA3AF] uppercase font-bold">TỔNG TIỀN</span>
                <div className="text-lg font-black text-white">{booking.totalPrice.toLocaleString('vi-VN')}đ</div>
              </div>
            </div>

            <div className="text-[11px] text-[#9CA3AF]">
              Phương thức: <strong className="text-white">{booking.paymentMethod || 'MOCK_MOMO'}</strong> • Trạng thái: <strong className="text-emerald-400">ĐÃ THANH TOÁN</strong>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0F1220] border border-[#2A2F45] text-center space-y-3">
            <div className="p-3 bg-white rounded-xl shadow-md">
              <QRCodeSVG value={qrPayload} size={150} level="M" />
            </div>
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
              Quét mã tại quầy soát vé
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F5B301] hover:bg-[#D99B00] text-black text-xs font-bold transition-all shadow-lg shadow-[#F5B301]/20"
        >
          <Printer className="w-4 h-4" /> In Vé / Lưu PDF
        </button>

        <Link
          to="/my-tickets"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#181C2E] hover:bg-[#2A2F45] text-white text-xs font-semibold border border-[#2A2F45] transition-colors"
        >
          <Ticket className="w-4 h-4 text-[#E11D48]" /> Lịch Sử Đặt Vé
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F1220] hover:bg-[#181C2E] text-[#9CA3AF] hover:text-white text-xs font-semibold border border-[#2A2F45] transition-colors"
        >
          <Home className="w-4 h-4" /> Về Trang Chủ
        </Link>
      </div>
    </div>
  );
};
