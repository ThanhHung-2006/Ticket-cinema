import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../store/auth.context';
import { SeatMap, Seat } from '../components/SeatMap';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ArrowLeft, Ticket, AlertCircle, ShieldCheck } from 'lucide-react';

interface ShowtimeSeatData {
  showtime: {
    id: string;
    movieTitle: string;
    moviePoster: string;
    cinemaName: string;
    roomName: string;
    startTime: string;
    endTime: string;
    basePrice: number;
  };
  totalSeats: number;
  availableSeats: number;
  rows: { [row: string]: Seat[] };
  seats: Seat[];
}

export const SeatBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [seatData, setSeatData] = useState<ShowtimeSeatData | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSeatMap();
  }, [id]);

  const fetchSeatMap = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res: any = await api.get(`/showtimes/${id}/seats`);
      setSeatData(res.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tải sơ đồ ghế.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSeat = (seat: Seat) => {
    setErrorMsg(null);
    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds((prev) => prev.filter((sId) => sId !== seat.id));
    } else {
      if (selectedSeatIds.length >= 8) {
        setErrorMsg('Bạn chỉ được chọn tối đa 8 ghế trong một lần đặt.');
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat.id]);
    }
  };

  const selectedSeatsList = seatData?.seats.filter((s) => selectedSeatIds.includes(s.id)) || [];
  const totalPrice = selectedSeatsList.reduce((sum, s) => sum + s.price, 0);

  const handleProceedToCheckout = async () => {
    if (selectedSeatIds.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 1 ghế trước khi tiếp tục.');
      return;
    }

    if (!user) {
      // Chuyển sang trang đăng nhập kèm redirect
      navigate(`/login?redirect=/booking/${id}`);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      const res: any = await api.post('/bookings/hold', {
        showtimeId: id,
        seatIds: selectedSeatIds,
      });

      // Giữ ghế thành công -> chuyển sang trang thanh toán
      navigate(`/checkout/${res.data.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể giữ ghế. Vui lòng thử lại.');
      // Tải lại sơ đồ ghế để cập nhật ghế vừa bị người khác chọn
      fetchSeatMap();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải sơ đồ phòng chiếu & tình trạng ghế..." />;

  if (!seatData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Không thể hiển thị sơ đồ ghế</h2>
        <p className="text-xs text-[#9CA3AF]">{errorMsg || 'Suất chiếu không tồn tại.'}</p>
        <Link to="/" className="text-xs font-bold text-[#E11D48] hover:underline">
          ← Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const { showtime } = seatData;
  const startTimeStr = new Date(showtime.startTime).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const dateStr = new Date(showtime.startTime).toLocaleDateString('vi-VN');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2A2F45]">
        <Link to={`/movies`} className="inline-flex items-center gap-2 text-xs font-bold text-[#9CA3AF] hover:text-[#E11D48] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </Link>

        <div className="text-left sm:text-right">
          <h1 className="text-xl font-black text-white">{showtime.movieTitle}</h1>
          <p className="text-xs text-[#9CA3AF]">
            {showtime.cinemaName} • <strong className="text-white">{showtime.roomName}</strong> • {startTimeStr} ({dateStr})
          </p>
        </div>
      </div>

      {/* Error notification banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs font-bold text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Layout: Seat Map (Left) + Booking Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Seat Map */}
        <div className="lg:col-span-8 bg-[#181C2E] border border-[#2A2F45] rounded-3xl p-6 sm:p-8 flex flex-col items-center">
          <SeatMap
            rows={seatData.rows}
            selectedSeatIds={selectedSeatIds}
            onToggleSeat={handleToggleSeat}
          />
        </div>

        {/* Right: Booking Summary Card */}
        <div className="lg:col-span-4 bg-[#181C2E] border border-[#2A2F45] rounded-3xl p-6 space-y-6 sticky top-28">
          <div className="flex items-center gap-3 pb-4 border-b border-[#2A2F45]">
            <img src={showtime.moviePoster} alt="" className="w-12 h-16 object-cover rounded-lg" />
            <div>
              <h3 className="text-sm font-bold text-white line-clamp-1">{showtime.movieTitle}</h3>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">{showtime.cinemaName}</p>
              <p className="text-[11px] text-[#F5B301] font-semibold">{showtime.roomName}</p>
            </div>
          </div>

          {/* Selected Seats info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
              <span>Ghế đang chọn:</span>
              <span className="font-bold text-white">
                {selectedSeatsList.length > 0
                  ? selectedSeatsList.map((s) => s.code).join(', ')
                  : 'Chưa chọn ghế'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
              <span>Suất chiếu:</span>
              <span className="font-semibold text-white">{startTimeStr} - {dateStr}</span>
            </div>

            <div className="pt-3 border-t border-[#2A2F45] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase">Tổng Tiền:</span>
              <span className="text-xl font-black text-[#F5B301]">
                {totalPrice.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          {/* Hold Notice */}
          <div className="p-3.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-[11px] text-[#9CA3AF] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Giữ ghế 5 phút an toàn
            </div>
            <p>Sau khi bấm tiếp tục, ghế của bạn sẽ được giữ độc quyền trong 5 phút để hoàn tất thanh toán.</p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleProceedToCheckout}
            disabled={selectedSeatIds.length === 0 || submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] disabled:bg-[#2A2F45] disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#E11D48]/30 transition-all flex items-center justify-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            <span>{submitting ? 'Đang giữ ghế...' : 'Tiếp Tục Đặt Vé'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
