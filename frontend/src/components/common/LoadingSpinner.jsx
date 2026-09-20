import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...', size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div
        className={`${sizeClass} border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3`}
      ></div>
      {text && <p className="text-sm font-medium text-slate-400">{text}</p>}
    </div>
  );
};
