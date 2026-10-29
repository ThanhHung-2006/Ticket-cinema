import React from 'react';

export interface Seat {
  id: string;
  row: string;
  number: number;
  code: string;
  type: 'STANDARD' | 'VIP' | 'COUPLE';
  price: number;
  status: 'AVAILABLE' | 'HOLDING' | 'BOOKED';
}

interface SeatMapProps {
  rows: { [row: string]: Seat[] };
  selectedSeatIds: string[];
  onToggleSeat: (seat: Seat) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({ rows, selectedSeatIds, onToggleSeat }) => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Curved Screen */}
      <div className="w-full max-w-2xl flex flex-col items-center mb-10">
        <div className="w-full h-3 rounded-[100%] bg-gradient-to-r from-transparent via-[#E11D48] to-transparent shadow-[0_10px_25px_rgba(225,29,72,0.6)]" />
        <span className="text-[11px] font-bold tracking-widest text-[#9CA3AF] mt-3 uppercase">
          MÀN HÌNH CHIẾU
        </span>
      </div>

      {/* Seat Rows Grid */}
      <div className="flex flex-col gap-3 max-w-full overflow-x-auto p-4">
        {Object.keys(rows).sort().map((rowKey) => {
          const rowSeats = rows[rowKey].sort((a, b) => a.number - b.number);
          return (
            <div key={rowKey} className="flex items-center gap-2">
              {/* Row Label */}
              <span className="w-6 text-xs font-bold text-[#9CA3AF] text-center">
                {rowKey}
              </span>

              {/* Seats in Row */}
              <div className="flex gap-2">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeatIds.includes(seat.id);
                  const isBooked = seat.status === 'BOOKED';
                  const isHolding = seat.status === 'HOLDING';
                  const isAvailable = seat.status === 'AVAILABLE';

                  // Styling logic
                  let bgStyle = 'bg-[#2A2F45] text-white hover:border-[#E11D48]'; // STANDARD

                  if (seat.type === 'VIP') {
                    bgStyle = 'bg-[#3A3222] text-[#F5B301] border-[#F5B301]/40 hover:border-[#F5B301]';
                  } else if (seat.type === 'COUPLE') {
                    bgStyle = 'bg-[#3A1D2E] text-rose-300 border-rose-500/40 hover:border-rose-400';
                  }

                  if (isSelected) {
                    bgStyle = 'bg-emerald-500 text-white border-emerald-400 font-bold shadow-lg shadow-emerald-500/40 scale-105';
                  } else if (isBooked) {
                    bgStyle = 'bg-rose-950/40 text-rose-600/50 border-rose-900/30 cursor-not-allowed';
                  } else if (isHolding) {
                    bgStyle = 'bg-amber-950/40 text-amber-500/50 border-amber-800/40 cursor-not-allowed';
                  }

                  return (
                    <button
                      key={seat.id}
                      disabled={!isAvailable && !isSelected}
                      onClick={() => onToggleSeat(seat)}
                      title={`${seat.code} (${seat.type}) - ${seat.price.toLocaleString('vi-VN')}đ`}
                      className={`w-9 h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${bgStyle}`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>

              {/* Right Row Label */}
              <span className="w-6 text-xs font-bold text-[#9CA3AF] text-center">
                {rowKey}
              </span>
            </div>
          );
        })}
      </div>

      {/* Seat Map Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 p-4 rounded-2xl bg-[#181C2E] border border-[#2A2F45] text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#2A2F45] border border-[#3A405A]" />
          <span className="text-[#9CA3AF]">Thường (Standard)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#3A3222] border border-[#F5B301]/60 text-[#F5B301] flex items-center justify-center text-[10px] font-bold">
            ★
          </div>
          <span className="text-[#F5B301]">VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#3A1D2E] border border-rose-500/50 text-rose-300 flex items-center justify-center text-[10px] font-bold">
            ♥
          </div>
          <span className="text-rose-300">Ghế Đôi (Couple)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500 border border-emerald-400 flex items-center justify-center text-white text-[10px] font-bold">
            ✓
          </div>
          <span className="text-emerald-400">Đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-950/50 border border-amber-800/50 flex items-center justify-center text-amber-500 text-[10px]">
            ⏳
          </div>
          <span className="text-amber-500">Đang giữ 5 phút</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-rose-950/40 border border-rose-900/30 flex items-center justify-center text-rose-500 text-[10px]">
            ✕
          </div>
          <span className="text-rose-500">Đã đặt</span>
        </div>
      </div>
    </div>
  );
};
