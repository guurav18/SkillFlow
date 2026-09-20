import React from 'react';

const variants = {
  primary:
    'bg-[#3157d5] hover:bg-[#2648c3] text-white font-bold shadow-md shadow-blue-900/15 active:translate-y-0.5 border border-[#3157d5]',
  secondary:
    'bg-slate-800/80 hover:bg-slate-700 text-slate-100 border border-slate-600/80 hover:border-slate-500 shadow-sm active:translate-y-0.5',
  outline:
    'border border-[#3157d5]/40 text-[#3157d5] hover:bg-[#eef2ff] active:translate-y-0.5',
  ghost:
    'text-slate-300 hover:text-white hover:bg-slate-800/80',
  danger:
    'bg-rose-600/90 hover:bg-rose-600 text-white font-medium shadow-md shadow-rose-600/20 border border-rose-500/30',
  success:
    'bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-600/20 border border-emerald-500/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-base rounded-xl gap-2.5',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};
