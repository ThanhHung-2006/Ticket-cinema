import React, { useState, useEffect } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string | Date;
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    const calculate = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      setTimeLeft(diff);

      if (diff === 0 && onExpire) {
        onExpire();
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isUrgent = timeLeft < 60; // Dưới 1 phút cảnh báo đỏ

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
        isUrgent
          ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
          : 'bg-[#F5B301]/15 border-[#F5B301]/40 text-[#F5B301]'
      }`}
    >
      {isUrgent ? <AlertTriangle className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
      <span>
        Thời gian giữ ghế: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
