import React from 'react';
import { Clapperboard, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B0D17] border-t border-[#2A2F45] pt-14 pb-8 text-[#9CA3AF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#2A2F45]/60">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E11D48] to-[#F5B301] flex items-center justify-center">
                <Clapperboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white">
                TICKET<span className="text-[#E11D48]">CINEMA</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#9CA3AF]">
              Hệ thống đặt vé xem phim trực tuyến hiện đại, nhanh chóng và an toàn. Trải nghiệm điện ảnh đỉnh cao với âm thanh Dolby Atmos và màn hình Laser IMAX.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Khám Phá</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/" className="hover:text-[#E11D48] transition-colors">Phim Đang Chiếu</a></li>
              <li><a href="/#coming-soon" className="hover:text-[#E11D48] transition-colors">Phim Sắp Chiếu</a></li>
              <li><a href="/#cinemas" className="hover:text-[#E11D48] transition-colors">Cụm Rạp Chiếu</a></li>
              <li><a href="/#promotions" className="hover:text-[#E11D48] transition-colors">Ưu Đãi Thành Viên</a></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Chính Sách & Hỗ Trợ</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer">Quy chế hoạt động</span></li>
              <li><span className="hover:text-white cursor-pointer">Chính sách bảo mật</span></li>
              <li><span className="hover:text-white cursor-pointer">Chính sách hủy vé & hoàn tiền</span></li>
              <li><span className="hover:text-white cursor-pointer">Câu hỏi thường gặp (FAQ)</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Liên Hệ</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E11D48]" />
                <span>Landmark 81, Bình Thạnh, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F5B301]" />
                <span>Hotline: 1900 6868 (8:00 - 22:00)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E11D48]" />
                <span>support@ticketcinema.vn</span>
              </li>
              <li className="flex items-center gap-2 text-emerald-400 font-semibold pt-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Giao dịch an toàn 100%</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 text-center text-xs text-[#6B7280]">
          © 2026 Ticket Cinema Inc. Bản quyền thuộc về Nhóm Phát Triển Ticket Cinema.
        </div>
      </div>
    </footer>
  );
};
