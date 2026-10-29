import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Clock, Calendar, Tag, Shield, Play, MapPin, Ticket, ArrowLeft } from 'lucide-react';

interface Showtime {
  id: string;
  startTime: string;
  endTime: string;
  basePrice: number;
  room: {
    id: string;
    name: string;
    cinema: {
      id: string;
      name: string;
      address: string;
    };
  };
}

interface MovieDetail {
  id: string;
  title: string;
  englishTitle?: string;
  genres: string;
  duration: number;
  releaseDate: string;
  ageRating: string;
  posterUrl: string;
  trailerUrl?: string;
  description: string;
  status: 'NOW_SHOWING' | 'COMING_SOON';
  showtimes: Showtime[];
}

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    fetchMovieDetail();
  }, [id]);

  const fetchMovieDetail = async () => {
    try {
      setLoading(true);
      const res: any = await api.get(`/movies/${id}`);
      setMovie(res.data);

      // Mặc định chọn ngày hiện tại
      const todayStr = new Date().toISOString().slice(0, 10);
      setSelectedDate(todayStr);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải thông tin phim..." />;
  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Không tìm thấy thông tin phim</h2>
        <Link to="/" className="text-xs font-bold text-[#E11D48] hover:underline">
          ← Quay lại trang chủ
        </Link>
      </div>
    );
  }

  // Chuyển link youtube thành link embed
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const embedUrl = getEmbedUrl(movie.trailerUrl);

  // Danh sách các ngày chiếu tiếp theo
  const dateOptions = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : `Thứ ${d.getDay() + 1 || 8}`;
    const formatted = `${d.getDate()}/${d.getMonth() + 1}`;
    return { dateStr, dayLabel, formatted };
  });

  // Lọc suất chiếu theo ngày được chọn
  const filteredShowtimes = (movie.showtimes || []).filter((s) => {
    if (!selectedDate) return true;
    return s.startTime.startsWith(selectedDate);
  });

  // Nhóm suất chiếu theo rạp chiếu
  const showtimesByCinema = filteredShowtimes.reduce((acc, st) => {
    const cId = st.room.cinema.id;
    if (!acc[cId]) {
      acc[cId] = {
        cinema: st.room.cinema,
        showtimes: [],
      };
    }
    acc[cId].showtimes.push(st);
    return acc;
  }, {} as { [key: string]: { cinema: Showtime['room']['cinema']; showtimes: Showtime[] } });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#9CA3AF] hover:text-[#E11D48] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách phim
      </Link>

      {/* Main Info Hero */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 bg-[#181C2E] border border-[#2A2F45] rounded-3xl p-6 sm:p-10">
        {/* Poster */}
        <div className="md:col-span-4 lg:col-span-4">
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-[#2A2F45]">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-black/75 backdrop-blur border border-white/20 text-[#F5B301]">
              {movie.ageRating}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-8 lg:col-span-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{movie.title}</h1>
              {movie.englishTitle && (
                <p className="text-sm font-semibold text-[#9CA3AF] italic mt-1">{movie.englishTitle}</p>
              )}
            </div>

            {/* Badges Info */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#9CA3AF]">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F1220] border border-[#2A2F45]">
                <Clock className="w-4 h-4 text-[#F5B301]" /> {movie.duration} phút
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F1220] border border-[#2A2F45]">
                <Calendar className="w-4 h-4 text-[#E11D48]" /> Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F1220] border border-[#2A2F45]">
                <Tag className="w-4 h-4 text-emerald-400" /> {movie.genres}
              </span>
            </div>

            {/* Synopsis */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Nội Dung Phim</h3>
              <p className="text-sm text-[#9CA3AF] leading-relaxed whitespace-pre-line">{movie.description}</p>
            </div>
          </div>

          {/* Quick jump to booking */}
          <div className="pt-6 border-t border-[#2A2F45]">
            <a
              href="#showtimes-section"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-lg shadow-[#E11D48]/30 transition-all hover:scale-105"
            >
              <Ticket className="w-4 h-4" /> Chọn Suất Chiếu & Đặt Vé
            </a>
          </div>
        </div>
      </div>

      {/* Trailer Video Section */}
      {embedUrl && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-[#E11D48]" /> Official Trailer
          </h2>
          <div className="aspect-video w-full rounded-3xl overflow-hidden border border-[#2A2F45] bg-[#181C2E]">
            <iframe
              src={embedUrl}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* Showtimes Selection Section */}
      <div id="showtimes-section" className="space-y-8 pt-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">Lịch Chiếu & Đặt Ghế</h2>
          <p className="text-xs text-[#9CA3AF]">Chọn ngày chiếu và suất chiếu phù hợp để tiếp tục bước chọn ghế.</p>
        </div>

        {/* Date Selector Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {dateOptions.map((opt) => (
            <button
              key={opt.dateStr}
              onClick={() => setSelectedDate(opt.dateStr)}
              className={`px-5 py-3 rounded-2xl border text-center transition-all min-w-[100px] ${
                selectedDate === opt.dateStr
                  ? 'bg-[#E11D48] text-white border-[#E11D48] shadow-lg shadow-[#E11D48]/30'
                  : 'bg-[#181C2E] text-[#9CA3AF] border-[#2A2F45] hover:border-[#E11D48]/60 hover:text-white'
              }`}
            >
              <div className="text-[11px] font-bold uppercase">{opt.dayLabel}</div>
              <div className="text-base font-extrabold mt-0.5">{opt.formatted}</div>
            </button>
          ))}
        </div>

        {/* Showtimes by Cinema List */}
        {Object.keys(showtimesByCinema).length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#181C2E]/40 border border-[#2A2F45] space-y-2">
            <Calendar className="w-8 h-8 text-[#9CA3AF] mx-auto opacity-50" />
            <h4 className="text-sm font-bold text-white">Chưa có suất chiếu nào cho ngày này</h4>
            <p className="text-xs text-[#9CA3AF]">Vui lòng chọn ngày khác hoặc quay lại sau.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(showtimesByCinema).map(({ cinema, showtimes }) => (
              <div key={cinema.id} className="p-6 rounded-3xl bg-[#181C2E] border border-[#2A2F45] space-y-5">
                {/* Cinema Header */}
                <div className="flex items-start gap-3 pb-4 border-b border-[#2A2F45]">
                  <div className="w-9 h-9 rounded-xl bg-[#E11D48]/15 border border-[#E11D48]/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#E11D48]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{cinema.name}</h3>
                    <p className="text-xs text-[#9CA3AF]">{cinema.address}</p>
                  </div>
                </div>

                {/* Showtimes Buttons */}
                <div className="flex flex-wrap gap-4">
                  {showtimes.map((st) => {
                    const time = new Date(st.startTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    });
                    return (
                      <Link
                        key={st.id}
                        to={`/booking/${st.id}`}
                        className="group flex flex-col items-center justify-center px-5 py-3 rounded-xl bg-[#0F1220] border border-[#2A2F45] hover:border-[#F5B301] transition-all hover:scale-105"
                      >
                        <span className="text-base font-extrabold text-[#F5B301] group-hover:text-white transition-colors">
                          {time}
                        </span>
                        <span className="text-[10px] text-[#9CA3AF] mt-0.5">{st.room.name}</span>
                        <span className="text-[10px] font-bold text-[#E11D48] mt-1">
                          {st.basePrice.toLocaleString('vi-VN')}đ
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
