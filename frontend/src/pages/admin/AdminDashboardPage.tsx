import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { DollarSign, Ticket, ShoppingBag, Film, Calendar, TrendingUp } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/admin/revenue');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải báo cáo doanh thu..." />;

  const { summary, byMovie = [], daily = [] } = stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2A2F45]">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#F5B301]" /> Bảng Quản Trị Hệ Thống
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Tổng quan doanh thu bán vé, số lượng đơn hàng và hiệu suất phim.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/movies"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181C2E] border border-[#2A2F45] hover:border-[#E11D48] text-xs font-bold text-white transition-all"
          >
            <Film className="w-4 h-4 text-[#E11D48]" /> Quản Lý Phim
          </Link>
          <Link
            to="/admin/showtimes"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-xs font-bold text-white shadow-lg shadow-[#E11D48]/30 transition-all"
          >
            <Calendar className="w-4 h-4" /> Quản Lý Suất Chiếu
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#181C2E] border border-[#2A2F45] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#9CA3AF] uppercase">
            <span>Tổng Doanh Thu</span>
            <div className="w-8 h-8 rounded-lg bg-[#F5B301]/10 text-[#F5B301] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#F5B301]">
            {(summary?.totalRevenue || 0).toLocaleString('vi-VN')}đ
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">Tất cả đơn đã thanh toán thành công</div>
        </div>

        <div className="p-6 rounded-3xl bg-[#181C2E] border border-[#2A2F45] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#9CA3AF] uppercase">
            <span>Tổng Vé Đã Bán</span>
            <div className="w-8 h-8 rounded-lg bg-[#E11D48]/10 text-[#E11D48] flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{summary?.totalTicketsSold || 0} vé</div>
          <div className="text-[11px] text-[#9CA3AF]">Trạng thái BOOKED</div>
        </div>

        <div className="p-6 rounded-3xl bg-[#181C2E] border border-[#2A2F45] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#9CA3AF] uppercase">
            <span>Đơn Đặt Chỗ</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{summary?.totalOrders || 0} đơn</div>
          <div className="text-[11px] text-[#9CA3AF]">Giao dịch hoàn tất</div>
        </div>
      </div>

      {/* Revenue Breakdown by Movie */}
      <div className="bg-[#181C2E] border border-[#2A2F45] rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-black text-white tracking-tight">Doanh Thu Theo Từng Phim</h2>

        {byMovie.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#9CA3AF]">Chưa có dữ liệu bán vé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2A2F45] text-[#9CA3AF] font-bold uppercase">
                  <th className="pb-3">Tên Phim</th>
                  <th className="pb-3 text-center">Vé Đã Bán</th>
                  <th className="pb-3 text-right">Doanh Thu</th>
                  <th className="pb-3 text-right">Tỷ Trọng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2F45]/50">
                {byMovie.map((m: any) => {
                  const share = summary?.totalRevenue > 0
                    ? ((m.revenue / summary.totalRevenue) * 100).toFixed(1)
                    : 0;
                  return (
                    <tr key={m.movieId} className="hover:bg-[#0F1220]/50 transition-colors">
                      <td className="py-3.5 font-bold text-white">{m.title}</td>
                      <td className="py-3.5 text-center text-[#9CA3AF]">{m.tickets} vé</td>
                      <td className="py-3.5 text-right font-bold text-[#F5B301]">
                        {m.revenue.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="py-3.5 text-right text-emerald-400 font-semibold">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Revenue Table */}
      <div className="bg-[#181C2E] border border-[#2A2F45] rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-black text-white tracking-tight">Báo Cáo Doanh Thu Theo Ngày</h2>

        {daily.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#9CA3AF]">Chưa có dữ liệu ngày.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2A2F45] text-[#9CA3AF] font-bold uppercase">
                  <th className="pb-3">Ngày</th>
                  <th className="pb-3 text-center">Số Đơn Hàng</th>
                  <th className="pb-3 text-center">Số Vé Bán</th>
                  <th className="pb-3 text-right">Doanh Thu Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2F45]/50">
                {daily.map((d: any) => (
                  <tr key={d.date} className="hover:bg-[#0F1220]/50 transition-colors">
                    <td className="py-3.5 font-bold text-white">{d.date}</td>
                    <td className="py-3.5 text-center text-[#9CA3AF]">{d.orders} đơn</td>
                    <td className="py-3.5 text-center text-[#9CA3AF]">{d.tickets} vé</td>
                    <td className="py-3.5 text-right font-bold text-[#F5B301]">
                      {d.revenue.toLocaleString('vi-VN')}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
