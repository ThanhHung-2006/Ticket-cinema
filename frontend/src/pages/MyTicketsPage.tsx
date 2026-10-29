import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../store/auth.context';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Ticket, Calendar, Clock, MapPin, QrCode, AlertCircle, XCircle } from 'lucide-react';

export const MyTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/bookings/my');
      setBookings(res.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn vé này không? Thao tác này không thể hoàn tác.')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      setMessage(null);
      await api.post(`/bookings/${bookingId}/cancel`, {});
      setMessage({ text: 'Hủy vé thành công!', type: 'success' });
      fetchMyBookings();
    } catch (err: any) {
      setMessage({ text: err.message || 'Không thể hủy vé.', type: 'error' });
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải danh sách vé đã đặt..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#2A2F45]">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-[#E11D48]" /> Lịch Sử Đặt Vé Của Tôi
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Quản lý tất cả vé đã đặt và trạng thái giao dịch của bạn tại Ticket Cinema.
          </p>
        </div>
        <Link
          to="/"
          className="px-4 py-2 rounded-xl bg-[#181C2E] border border-[#2A2F45] text-xs font-semibold text-white hover:border-[#E11D48] transition-colors"
        >
          + Đặt Thêm Vé
        </Link>
      </div>

      {/* Message alert */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold ${
            message.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#181C2E] border border-[#2A2F45] space-y-4">
          <Ticket className="w-12 h-12 text-[#9CA3AF] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-white">Bạn chưa có đơn đặt vé nào</h3>
          <p className="text-xs text-[#9CA3AF]">
            Hãy khám phá các tác phẩm điện ảnh bom tấn đang chiếu và đặt vé ngay hôm nay!
          </p>
          <Link
            to="/"
            className="inline-block mt-2 px-6 py-3 rounded-xl bg-[#E11D48] text-white text-xs font-bold shadow-lg shadow-[#E11D48]/30 hover:scale-105 transition-all"
          >
            Khám Phá Phim Ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const { showtime } = booking;
            const now = Date.now();
            const showtimeStart = new Date(showtime.startTime).getTime();
            const canCancel =
              booking.status === 'CONFIRMED' && showtimeStart - now > 30 * 60 * 1000;

            const timeStr = new Date(showtime.startTime).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
            const dateStr = new Date(showtime.startTime).toLocaleDateString('vi-VN');
            const seatsStr = booking.tickets.map((t: any) => `${t.seat.row}${t.seat.number}`).join(', ');

            let statusBadge = (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Đã Thanh Toán
              </span>
            );

            if (booking.status === 'HOLDING') {
              statusBadge = (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Chờ Thanh Toán
                </span>
              );
            } else if (booking.status === 'CANCELLED') {
              statusBadge = (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-neutral-500/20 text-neutral-400 border border-neutral-500/30">
                  Đã Hủy Vé
                </span>
              );
            } else if (booking.status === 'EXPIRED') {
              statusBadge = (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  Hết Hạn Giữ Chỗ
                </span>
              );
            }

            return (
              <div
                key={booking.id}
                className="bg-[#181C2E] border border-[#2A2F45] rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#2A2F45]/80 transition-colors"
              >
                {/* Movie & Showtime info */}
                <div className="flex items-start gap-4">
                  <img
                    src={showtime.movie.posterUrl}
                    alt=""
                    className="w-16 h-24 object-cover rounded-xl shadow-md shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-black text-white">{showtime.movie.title}</h3>
                      {statusBadge}
                    </div>

                    <p className="text-xs text-[#9CA3AF] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E11D48]" />
                      <span>{showtime.room.cinema.name} • <strong className="text-white">{showtime.room.name}</strong></span>
                    </p>

                    <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#F5B301]" /> {timeStr}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" /> {dateStr}
                      </span>
                    </div>

                    <div className="text-xs pt-1">
                      Ghế: <strong className="text-[#F5B301]">{seatsStr}</strong> • Mã vé:{' '}
                      <span className="font-mono text-white font-bold">{booking.bookingCode}</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-[#2A2F45] gap-3">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block">Tổng tiền</span>
                    <span className="text-base font-black text-[#F5B301]">
                      {booking.totalPrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.status === 'CONFIRMED' && (
                      <>
                        <Link
                          to={`/booking-success/${booking.id}`}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F1220] border border-[#2A2F45] hover:border-white/30 text-white text-xs font-semibold transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#E11D48]" />
                          <span>Xem Vé & QR</span>
                        </Link>

                        {canCancel && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-semibold border border-rose-500/30 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{cancellingId === booking.id ? 'Đang hủy...' : 'Hủy Vé'}</span>
                          </button>
                        )}
                      </>
                    )}

                    {booking.status === 'HOLDING' && (
                      <Link
                        to={`/checkout/${booking.id}`}
                        className="px-4 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-bold shadow-md shadow-[#E11D48]/30 hover:bg-[#BE123C] transition-all"
                      >
                        Thanh Toán Ngay
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
