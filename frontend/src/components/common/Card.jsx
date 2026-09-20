import React from 'react';

export const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-[#142126]/90 border border-[#294048] backdrop-blur-sm p-6 shadow-sm ${
        hover
          ? 'transition-all duration-200 hover:border-cyan-300/40 hover:bg-[#172a30] hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
