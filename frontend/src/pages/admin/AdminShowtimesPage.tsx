import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Calendar, Plus, Trash2, ArrowLeft, X, Clock, MapPin } from 'lucide-react';

export const AdminShowtimesPage: React.FC = () => {
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [basePrice, setBasePrice] = useState(85000);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stRes, mRes, cRes]: any = await Promise.all([
        api.get('/showtimes'),
        api.get('/movies?status=NOW_SHOWING'),
        api.get('/cinemas'),
      ]);

      setShowtimes(stRes.data || []);
      setMovies(mRes.data || []);
      setCinemas(cRes.data || []);

      if (mRes.data?.[0]) setSelectedMovieId(mRes.data[0].id);
      if (cRes.data?.[0]) {
        setSelectedCinemaId(cRes.data[0].id);
        if (cRes.data[0].rooms?.[0]) setSelectedRoomId(cRes.data[0].rooms[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentRooms = cinemas.find((c) => c.id === selectedCinemaId)?.rooms || [];

  const handleOpenAdd = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2, 0, 0, 0);
    const startStr = now.toISOString().slice(0, 16);

    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const endStr = end.toISOString().slice(0, 16);

    setStartTime(startStr);
    setEndTime(endStr);
    setBasePrice(85000);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy suất chiếu này không?')) return;

    try {
      await api.delete(`/showtimes/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi hủy suất chiếu.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovieId || !selectedRoomId || !startTime || !endTime) {
      setErrorMsg('Vui lòng chọn đầy đủ thông tin bắt buộc.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      await api.post('/showtimes', {
        movieId: selectedMovieId,
        roomId: selectedRoomId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        basePrice: Number(basePrice),
      });

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi tạo suất chiếu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải danh sách suất chiếu..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2A2F45]">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#E11D48] transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Bảng điều khiển Admin
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#E11D48]" /> Quản Lý Suất Chiếu
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-xs font-bold text-white shadow-lg shadow-[#E11D48]/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Thêm Suất Chiếu Mới
        </button>
      </div>

      {/* Showtimes Table */}
      <div className="bg-[#181C2E] border border-[#2A2F45] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2A2F45] text-[#9CA3AF] font-bold uppercase bg-[#0F1220]">
                <th className="py-4 px-6">Phim</th>
                <th className="py-4 px-6">Rạp & Phòng Chiếu</th>
                <th className="py-4 px-6">Giờ Chiếu</th>
                <th className="py-4 px-6 text-right">Giá Vé Gốc</th>
                <th className="py-4 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2F45]/50">
              {showtimes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#9CA3AF]">
                    Chưa có suất chiếu nào được tạo.
                  </td>
                </tr>
              ) : (
                showtimes.map((st) => {
                  const startStr = new Date(st.startTime).toLocaleString('vi-VN');
                  const endStr = new Date(st.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <tr key={st.id} className="hover:bg-[#0F1220]/50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-white">
                        <div className="flex items-center gap-3">
                          <img src={st.movie.posterUrl} alt="" className="w-9 h-12 object-cover rounded-md" />
                          <div>
                            <div className="line-clamp-1">{st.movie.title}</div>
                            <span className="text-[10px] text-[#9CA3AF]">{st.movie.duration} phút</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-white">{st.room.cinema.name}</div>
                        <div className="text-[11px] text-[#F5B301]">{st.room.name}</div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-white">{startStr}</div>
                        <div className="text-[11px] text-[#9CA3AF]">Đến: {endStr}</div>
                      </td>
                      <td className="py-3.5 px-6 text-right font-black text-[#F5B301]">
                        {st.basePrice.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleDelete(st.id)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors"
                          title="Hủy suất chiếu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Showtime Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#181C2E] border border-[#2A2F45] rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2F45]">
              <h2 className="text-lg font-black text-white">Thêm Suất Chiếu Mới</h2>
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
              <div className="space-y-1.5">
                <label className="font-semibold text-[#9CA3AF]">Chọn Phim *</label>
                <select
                  required
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.duration} phút)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#9CA3AF]">Chọn Cụm Rạp *</label>
                  <select
                    required
                    value={selectedCinemaId}
                    onChange={(e) => {
                      setSelectedCinemaId(e.target.value);
                      const cinema = cinemas.find((c) => c.id === e.target.value);
                      if (cinema?.rooms?.[0]) setSelectedRoomId(cinema.rooms[0].id);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                  >
                    {cinemas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#9CA3AF]">Chọn Phòng Chiếu *</label>
                  <select
                    required
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                  >
                    {currentRooms.map((r: any) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#9CA3AF]">Bắt Đầu *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#9CA3AF]">Kết Thúc *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-white focus:border-[#E11D48] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#9CA3AF]">Giá Vé Cơ Bản (VNĐ) *</label>
                <input
                  type="number"
                  required
                  min={10000}
                  step={5000}
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
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
                  {submitting ? 'Đang tạo...' : 'Tạo Suất Chiếu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
