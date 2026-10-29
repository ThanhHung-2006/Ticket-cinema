import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Film, Plus, Edit2, Trash2, ArrowLeft, X } from 'lucide-react';

export const AdminMoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [englishTitle, setEnglishTitle] = useState('');
  const [genres, setGenres] = useState('Hành Động, Khoa Học Viễn Tưởng');
  const [duration, setDuration] = useState(120);
  const [releaseDate, setReleaseDate] = useState('2026-03-01');
  const [ageRating, setAgeRating] = useState('T16');
  const [posterUrl, setPosterUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'NOW_SHOWING' | 'COMING_SOON' | 'ENDED'>('NOW_SHOWING');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/movies');
      setMovies(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setTitle('');
    setEnglishTitle('');
    setGenres('Hành Động, Khoa Học Viễn Tưởng');
    setDuration(120);
    setReleaseDate(new Date().toISOString().slice(0, 10));
    setAgeRating('T16');
    setPosterUrl('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80');
    setTrailerUrl('');
    setDescription('');
    setStatus('NOW_SHOWING');
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (movie: any) => {
    setEditingMovie(movie);
    setTitle(movie.title);
    setEnglishTitle(movie.englishTitle || '');
    setGenres(movie.genres);
    setDuration(movie.duration);
    setReleaseDate(movie.releaseDate.slice(0, 10));
    setAgeRating(movie.ageRating);
    setPosterUrl(movie.posterUrl);
    setTrailerUrl(movie.trailerUrl || '');
    setDescription(movie.description);
    setStatus(movie.status);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phim này? Các suất chiếu liên quan cũng sẽ bị ảnh hưởng.')) {
      return;
    }

    try {
      await api.delete(`/movies/${id}`);
      fetchMovies();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa phim.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const payload = {
        title,
        englishTitle: englishTitle || undefined,
        genres,
        duration: Number(duration),
        releaseDate,
        ageRating,
        posterUrl,
        trailerUrl: trailerUrl || undefined,
        description,
        status,
      };

      if (editingMovie) {
        await api.put(`/movies/${editingMovie.id}`, payload);
      } else {
        await api.post('/movies', payload);
      }

      setModalOpen(false);
      fetchMovies();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu thông tin phim.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải danh sách phim..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2A2F45]">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#E11D48] transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Bảng điều khiển Admin
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-[#E11D48]" /> Quản Lý Danh Mục Phim
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-xs font-bold text-white shadow-lg shadow-[#E11D48]/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Thêm Phim Mới
        </button>
      </div>

      {/* Movies Table */}
      <div className="bg-[#181C2E] border border-[#2A2F45] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2A2F45] text-[#9CA3AF] font-bold uppercase bg-[#0F1220]">
                <th className="py-4 px-6">Poster</th>
                <th className="py-4 px-6">Tên Phim</th>
                <th className="py-4 px-6">Thể Loại</th>
                <th className="py-4 px-6 text-center">Thời Lượng</th>
                <th className="py-4 px-6 text-center">Độ Tuổi</th>
                <th className="py-4 px-6 text-center">Trạng Thái</th>
                <th className="py-4 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2F45]/50">
              {movies.map((m) => (
                <tr key={m.id} className="hover:bg-[#0F1220]/50 transition-colors">
                  <td className="py-3 px-6">
                    <img src={m.posterUrl} alt="" className="w-10 h-14 object-cover rounded-lg border border-[#2A2F45]" />
                  </td>
                  <td className="py-3 px-6">
                    <div className="font-bold text-white text-sm line-clamp-1">{m.title}</div>
                    {m.englishTitle && <div className="text-[#9CA3AF] text-[11px] italic">{m.englishTitle}</div>}
                  </td>
                  <td className="py-3 px-6 text-[#9CA3AF]">{m.genres}</td>
                  <td className="py-3 px-6 text-center text-white">{m.duration} phút</td>
                  <td className="py-3 px-6 text-center font-bold text-[#F5B301]">{m.ageRating}</td>
                  <td className="py-3 px-6 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        m.status === 'NOW_SHOWING'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {m.status === 'NOW_SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-2 rounded-lg bg-[#0F1220] hover:bg-[#2A2F45] text-[#9CA3AF] hover:text-white transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Movie Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#181C2E] border border-[#2A2F45] rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2F45]">
              <h2 className="text-lg font-black text-white">
                {editingMovie ? 'Chỉnh Sửa Thông Tin Phim' : 'Thêm Phim Mới'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#9CA3AF] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs font-bold text-rose-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#9CA3AF]">Tên Phim (Tiếng Việt) *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#9CA3AF]">Tên Gốc (Tiếng Anh)</label>
                  <input
                    type="text"
                    value={englishTitle}
                    onChange={(e) => setEnglishTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#9CA3AF]">Thời Lượng (Phút) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#9CA3AF]">Ngày Khởi Chiếu *</label>
                  <input
                    type="date"
                    required
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#9CA3AF]">Độ Tuổi</label>
                  <select
                    value={ageRating}
                    onChange={(e) => setAgeRating(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                  >
                    <option value="P">P (Mọi lứa tuổi)</option>
                    <option value="T13">T13 (Từ 13 tuổi)</option>
                    <option value="T16">T16 (Từ 16 tuổi)</option>
                    <option value="T18">T18 (Từ 18 tuổi)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#9CA3AF]">Thể Loại Phim *</label>
                <input
                  type="text"
                  required
                  placeholder="Hành Động, Khoa Học Viễn Tưởng, Phiêu Lưu"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#9CA3AF]">URL Poster Ảnh *</label>
                  <input
                    type="url"
                    required
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#9CA3AF]">URL Trailer YouTube</label>
                  <input
                    type="url"
                    value={trailerUrl}
                    onChange={(e) => setTrailerUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#9CA3AF]">Trạng Thái Chiếu</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                >
                  <option value="NOW_SHOWING">Đang Chiếu (NOW_SHOWING)</option>
                  <option value="COMING_SOON">Sắp Chiếu (COMING_SOON)</option>
                  <option value="ENDED">Ngừng Chiếu (ENDED)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#9CA3AF]">Mô Tả Nội Dung Phim *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2F45]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white hover:bg-[#2A2F45] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu Thông Tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
