import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { CountdownTimer } from '../components/CountdownTimer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface BookingDetail {
  id: string;
  bookingCode: string;
  totalPrice: number;
  status: string;
  holdExpiresAt: string;
  showtime: {
    id: string;
    movie: {
      title: string;
      posterUrl: string;
      duration: number;
    };
    room: {
      name: string;
      cinema: {
        name: string;
        address: string;
      };
    };
    startTime: string;
  };
  tickets: Array<{
    id: string;
    ticketCode: string;
    price: number;
    seat: {
      row: string;
      number: number;
      type: string;
    };
  }>;
}

export const CheckoutPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'MOCK_MOMO' | 'MOCK_VNPAY' | 'MOCK_CARD'>('MOCK_MOMO');
  const [isExpired, setIsExpired] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res: any = await api.get(`/bookings/${bookingId}`);
      setBooking(res.data);

      if (new Date(res.data.holdExpiresAt).getTime() <= Date.now()) {
        setIsExpired(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tải thông tin đơn vé.');
    } finally {
      setLoading(false);
    }
  };

  const handleExpire = () => {
    setIsExpired(true);
  };

  const handleConfirmPayment = async () => {
    if (isExpired) {
      setErrorMsg('Thời gian giữ ghế đã hết hạn. Vui lòng quay lại chọn ghế.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await api.post(`/bookings/${bookingId}/confirm`, {
        paymentMethod,
      });

      navigate(`/booking-success/${bookingId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Thanh toán thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải thông tin thanh toán..." />;

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Không tìm thấy đơn đặt vé</h2>
        <p className="text-xs text-[#9CA3AF]">{errorMsg || 'Đơn vé không hợp lệ.'}</p>
        <Link to="/" className="text-xs font-bold text-[#E11D48] hover:underline">
          ← Quay lại trang chủ
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header with Countdown Timer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2A2F45]">
        <Link
          to={`/booking/${showtime.id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#9CA3AF] hover:text-[#E11D48] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Chọn lại ghế
        </Link>

        <div>
          <CountdownTimer expiresAt={booking.holdExpiresAt} onExpire={handleExpire} />
        </div>
      </div>

      {/* Expired Alert */}
      {isExpired && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-3 text-center">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Đã hết 5 phút giữ ghế!</h3>
          <p className="text-xs text-[#9CA3AF]">
            Ghế của bạn đã được nhả cho người khác để tránh tình trạng giữ chỗ ảo.
          </p>
          <Link
            to={`/booking/${showtime.id}`}
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-[#E11D48] text-white text-xs font-bold"
          >
            Chọn Lại Ghế Ngay
          </Link>
        </div>
      )}

      {errorMsg && !isExpired && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Checkout Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Payment Method Selection */}
        <div className="md:col-span-7 bg-[#181C2E] border border-[#2A2F45] rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-black text-white tracking-tight">Phương Thức Thanh Toán</h2>
          <p className="text-xs text-[#9CA3AF] -mt-4">
            Chọn phương thức thanh toán giả lập (Mock Payment) để hoàn tất đặt vé ngay lập tức.
          </p>

          <div className="space-y-3">
            {/* MoMo Option */}
            <label
              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'MOCK_MOMO'
                  ? 'bg-[#A50064]/10 border-[#A50064] text-white ring-1 ring-[#A50064]'
                  : 'bg-[#0F1220] border-[#2A2F45] text-[#9CA3AF] hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'MOCK_MOMO'}
                  onChange={() => setPaymentMethod('MOCK_MOMO')}
                  className="accent-[#A50064]"
                />
                <span className="w-8 h-8 rounded-lg bg-[#A50064] text-white flex items-center justify-center font-bold text-xs">
                  M
                </span>
                <div>
                  <div className="text-xs font-bold text-white">Ví Điện Tử MoMo (Mock)</div>
                  <div className="text-[10px] text-[#9CA3AF]">Xác nhận thanh toán tức thì</div>
                </div>
              </div>
              <CheckCircle2 className={`w-4 h-4 ${paymentMethod === 'MOCK_MOMO' ? 'text-[#A50064]' : 'opacity-0'}`} />
            </label>

            {/* VNPay Option */}
            <label
              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'MOCK_VNPAY'
                  ? 'bg-blue-500/10 border-blue-500 text-white ring-1 ring-blue-500'
                  : 'bg-[#0F1220] border-[#2A2F45] text-[#9CA3AF] hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'MOCK_VNPAY'}
                  onChange={() => setPaymentMethod('MOCK_VNPAY')}
                  className="accent-blue-500"
                />
                <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  V
                </span>
                <div>
                  <div className="text-xs font-bold text-white">Cổng Thanh Toán VNPay (Mock)</div>
                  <div className="text-[10px] text-[#9CA3AF]">Hỗ trợ 40+ ứng dụng ngân hàng</div>
                </div>
              </div>
              <CheckCircle2 className={`w-4 h-4 ${paymentMethod === 'MOCK_VNPAY' ? 'text-blue-500' : 'opacity-0'}`} />
            </label>

            {/* Credit Card Option */}
            <label
              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'MOCK_CARD'
                  ? 'bg-[#E11D48]/10 border-[#E11D48] text-white ring-1 ring-[#E11D48]'
                  : 'bg-[#0F1220] border-[#2A2F45] text-[#9CA3AF] hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'MOCK_CARD'}
                  onChange={() => setPaymentMethod('MOCK_CARD')}
                  className="accent-[#E11D48]"
                />
                <span className="w-8 h-8 rounded-lg bg-[#E11D48] text-white flex items-center justify-center font-bold text-xs">
                  <CreditCard className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-white">Thẻ Quốc Tế Visa / Master (Mock)</div>
                  <div className="text-[10px] text-[#9CA3AF]">Bảo mật theo tiêu chuẩn PCI DSS</div>
                </div>
              </div>
              <CheckCircle2 className={`w-4 h-4 ${paymentMethod === 'MOCK_CARD' ? 'text-[#E11D48]' : 'opacity-0'}`} />
            </label>
          </div>

          <div className="pt-4 border-t border-[#2A2F45] flex items-center gap-2 text-[11px] text-[#9CA3AF]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Môi trường thanh toán thử nghiệm an toàn, không trừ tiền thật.</span>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="md:col-span-5 bg-[#181C2E] border border-[#2A2F45] rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-black text-white tracking-tight">Chi Tiết Đơn Vé</h2>

          <div className="flex gap-4 pb-4 border-b border-[#2A2F45]">
            <img src={showtime.movie.posterUrl} alt="" className="w-16 h-24 object-cover rounded-xl" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white line-clamp-1">{showtime.movie.title}</h3>
              <p className="text-xs text-[#9CA3AF]">{showtime.room.cinema.name}</p>
              <p className="text-xs text-[#F5B301] font-semibold">{showtime.room.name}</p>
              <p className="text-xs text-[#9CA3AF]">{timeStr} • {dateStr}</p>
            </div>
          </div>

          {/* Seat breakdown */}
          <div className="space-y-2 text-xs">
            <div className="text-[#9CA3AF]">Danh sách ghế đã chọn:</div>
            <div className="space-y-1.5">
              {booking.tickets.map((t) => (
                <div key={t.id} className="flex justify-between items-center text-white">
                  <span>
                    Ghế <strong>{t.seat.row}{t.seat.number}</strong> ({t.seat.type})
                  </span>
                  <span className="font-semibold">{t.price.toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#2A2F45] flex justify-between items-center text-xs">
              <span className="font-bold text-white uppercase">Tổng Thanh Toán:</span>
              <span className="text-xl font-black text-[#F5B301]">
                {booking.totalPrice.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmPayment}
            disabled={isExpired || submitting}
            className="w-full py-4 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] disabled:bg-[#2A2F45] disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#E11D48]/30 transition-all flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Đang xác nhận...' : 'Xác Nhận & Thanh Toán Ngay'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
