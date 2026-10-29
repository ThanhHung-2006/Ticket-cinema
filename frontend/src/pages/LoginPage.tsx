import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../store/auth.context';
import { Clapperboard, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res: any = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate(redirect);
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type: 'admin' | 'customer') => {
    if (type === 'admin') {
      setEmail('admin@cinema.com');
      setPassword('admin123');
    } else {
      setEmail('customer@cinema.com');
      setPassword('user123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#181C2E] border border-[#2A2F45] rounded-3xl p-8 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E11D48] to-[#F5B301] flex items-center justify-center mx-auto shadow-lg shadow-[#E11D48]/30">
            <Clapperboard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Đăng Nhập Tài Khoản</h1>
          <p className="text-xs text-[#9CA3AF]">
            Đăng nhập để xem lịch sử đặt vé và tích lũy điểm thưởng thành viên.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs font-bold text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#9CA3AF]">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#E11D48] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#9CA3AF]">Mật khẩu</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0F1220] border border-[#2A2F45] text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#E11D48] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#E11D48]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Fill Buttons */}
        <div className="pt-2 border-t border-[#2A2F45] space-y-2">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block text-center">
            Tài Khoản Dùng Thử Nhanh
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('customer')}
              className="py-2 px-3 rounded-lg bg-[#0F1220] hover:bg-[#1F2438] border border-[#2A2F45] text-[11px] font-semibold text-[#9CA3AF] hover:text-white transition-colors"
            >
              👤 Khách Hàng
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="py-2 px-3 rounded-lg bg-[#0F1220] hover:bg-[#1F2438] border border-[#2A2F45] text-[11px] font-semibold text-[#F5B301] transition-colors"
            >
              🛡️ Quản Trị Viên
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#9CA3AF]">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-[#E11D48] hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
