import React from 'react';

const variantStyles = {
  default: 'bg-slate-800 text-slate-300 border-slate-700',
  brand: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export const Badge = ({ children, variant = 'default', className = '', size = 'md' }) => {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant] || variantStyles.default} ${sizeStyles} ${className}`}
    >
      {children}
    </span>
  );
};
