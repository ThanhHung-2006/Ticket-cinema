import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { MovieCard, Movie } from '../components/MovieCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Search, Film, Calendar, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'NOW_SHOWING' | 'COMING_SOON'>('NOW_SHOWING');
  const [selectedGenre, setSelectedGenre] = useState<string>('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMovies();
  }, [activeTab]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res: any = await api.get(`/movies?status=${activeTab}`);
      setMovies(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const genresList = ['Tất cả', 'Hành Động', 'Khoa Học Viễn Tưởng', 'Tâm Lý - Tình Cảm', 'Hoạt Hình', 'Kinh Dị', 'Hài Hước', 'Gia Đình'];

  const filteredMovies = movies.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.englishTitle && m.englishTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchGenre = selectedGenre === 'Tất cả' || m.genres.includes(selectedGenre);
    return matchSearch && matchGenre;
  });

  const featuredMovie = movies[0];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Banner Carousel (Featured Movie) */}
      {featuredMovie && (
        <section className="relative w-full h-[480px] sm:h-[550px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={featuredMovie.posterUrl}
              alt={featuredMovie.title}
              className="w-full h-full object-cover object-center filter blur-md scale-110 opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1220] via-[#0F1220]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F1220] via-[#0F1220]/70 to-transparent" />
          </div>

          <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E11D48]/20 border border-[#E11D48]/40 text-[#E11D48] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Phim Nổi Bật Tuần Này
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {featuredMovie.title}
              </h1>
              <p className="text-sm text-[#9CA3AF] line-clamp-3 leading-relaxed">
                Đỉnh cao trải nghiệm điện ảnh với công nghệ âm thanh vòm sống động và kỹ xảo mãn nhãn trên màn ảnh rộng CineStar.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={`/movies/${featuredMovie.id}`}
                  className="px-6 py-3.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-sm font-bold shadow-lg shadow-[#E11D48]/40 transition-all hover:scale-105"
                >
                  🎟️ Đặt Vé Xem Ngay
                </Link>
                <Link
                  to={`/movies/${featuredMovie.id}`}
                  className="px-6 py-3.5 rounded-xl bg-[#181C2E] hover:bg-[#2A2F45] text-white text-sm font-semibold border border-[#2A2F45] transition-colors"
                >
                  Xem Trailer & Chi Tiết
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Movie Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Controls Bar: Tabs & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#2A2F45]">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#181C2E] border border-[#2A2F45]">
            <button
              onClick={() => setActiveTab('NOW_SHOWING')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'NOW_SHOWING'
                  ? 'bg-[#E11D48] text-white shadow-lg shadow-[#E11D48]/30'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Phim Đang Chiếu</span>
            </button>
            <button
              id="coming-soon"
              onClick={() => setActiveTab('COMING_SOON')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'COMING_SOON'
                  ? 'bg-[#E11D48] text-white shadow-lg shadow-[#E11D48]/30'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Phim Sắp Chiếu</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm phim theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181C2E] border border-[#2A2F45] text-xs text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#E11D48] transition-colors"
            />
          </div>
        </div>

        {/* Genre Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {genresList.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedGenre === g
                  ? 'bg-[#F5B301] text-black font-bold'
                  : 'bg-[#181C2E] border border-[#2A2F45] text-[#9CA3AF] hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Movie Grid */}
        {loading ? (
          <LoadingSpinner message="Đang tải danh sách phim..." />
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20 bg-[#181C2E]/40 border border-[#2A2F45] rounded-3xl space-y-3">
            <Film className="w-12 h-12 text-[#9CA3AF] mx-auto opacity-40" />
            <h3 className="text-base font-bold text-white">Không tìm thấy phim phù hợp</h3>
            <p className="text-xs text-[#9CA3AF]">Vui lòng thử tìm với từ khóa hoặc thể loại khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* Cinema Complexes Info Section */}
      <section id="cinemas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-gradient-to-r from-[#181C2E] to-[#141728] border border-[#2A2F45] rounded-3xl p-8 sm:p-12">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-bold text-[#F5B301] uppercase tracking-wider">Hệ Thống Cụm Rạp Hiện Đại</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Trải Nghiệm Điện Ảnh Đẳng Cấp</h2>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              CineStar Landmark 81 và CineStar Hai Bà Trưng được trang bị máy chiếu Laser IMAX, hệ thống ghế sofa êm ái và quầy bắp nước chuẩn quốc tế.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="p-6 rounded-2xl bg-[#0F1220]/80 border border-[#2A2F45] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#E11D48]/20 border border-[#E11D48]/40 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#E11D48]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">CineStar Landmark 81</h4>
                <p className="text-xs text-[#9CA3AF] mt-1">720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM</p>
                <div className="mt-3 flex gap-2 text-[10px] font-bold text-emerald-400">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">2D Standard</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">IMAX Laser</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F1220]/80 border border-[#2A2F45] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#F5B301]/20 border border-[#F5B301]/40 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#F5B301]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">CineStar Hai Bà Trưng</h4>
                <p className="text-xs text-[#9CA3AF] mt-1">135 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP.HCM</p>
                <div className="mt-3 flex gap-2 text-[10px] font-bold text-emerald-400">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Premiere Cinema</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Dolby 7.1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
