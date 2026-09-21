import React from 'react';

export const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-[var(--sf-card)] border border-[var(--sf-border)] backdrop-blur-sm p-6 shadow-sm transition-all duration-200 ${
        hover
          ? 'hover:border-[#3157d5]/40 dark:hover:border-cyan-300/40 hover:shadow-lg hover:shadow-slate-900/5 dark:hover:shadow-black/30 hover:-translate-y-0.5 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
