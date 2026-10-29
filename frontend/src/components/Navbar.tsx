import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth.context';
import { Film, User, Ticket, ShieldAlert, LogOut, Clapperboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0F1220]/95 backdrop-blur border-b border-[#2A2F45]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#E11D48] to-[#F5B301] flex items-center justify-center shadow-lg shadow-[#E11D48]/30 group-hover:scale-105 transition-transform">
            <Clapperboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
              TICKET<span className="text-[#E11D48]">CINEMA</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#9CA3AF] block -mt-1">
              Hệ Thống Đặt Vé Trực Tuyến
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-semibold text-[#F3F4F6] hover:text-[#E11D48] transition-colors">
            Phim Đang Chiếu
          </Link>
          <a href="/#coming-soon" className="text-sm font-semibold text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors">
            Phim Sắp Chiếu
          </a>
          <a href="/#cinemas" className="text-sm font-semibold text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors">
            Hệ Thống Cụm Rạp
          </a>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/my-tickets"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#181C2E] border border-[#2A2F45] text-xs font-semibold text-[#F3F4F6] hover:border-[#E11D48] transition-all"
              >
                <Ticket className="w-4 h-4 text-[#F5B301]" />
                <span>Vé Của Tôi</span>
              </Link>

              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E11D48]/15 border border-[#E11D48]/40 text-xs font-bold text-[#E11D48] hover:bg-[#E11D48] hover:text-white transition-all"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Quản Trị</span>
                </Link>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-[#2A2F45]">
                <div className="w-8 h-8 rounded-full bg-[#181C2E] border border-[#2A2F45] flex items-center justify-center text-xs font-bold text-[#F5B301]">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-white line-clamp-1">{user.fullName}</div>
                  <div className="text-[10px] text-[#9CA3AF]">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 text-[#9CA3AF] hover:text-[#E11D48] transition-colors rounded-lg hover:bg-[#181C2E]"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-[#F3F4F6] hover:text-[#E11D48] px-4 py-2 transition-colors"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold bg-[#E11D48] hover:bg-[#BE123C] text-white px-4 py-2.5 rounded-xl shadow-lg shadow-[#E11D48]/30 transition-all hover:scale-[1.02]"
              >
                Đăng Ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
