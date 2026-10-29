import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Đang tải dữ liệu...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="w-12 h-12 rounded-full border-4 border-[#2A2F45] border-t-[#E11D48] animate-spin" />
      <span className="text-xs font-semibold text-[#9CA3AF] tracking-wide">{message}</span>
    </div>
  );
};
