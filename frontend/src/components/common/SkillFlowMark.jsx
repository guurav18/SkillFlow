import React from 'react';

export const SkillFlowMark = ({ className = '', compact = false }) => (
  <span className={`skillflow-mark ${compact ? 'skillflow-mark-compact' : ''} ${className}`} aria-hidden="true">
    <svg viewBox="0 0 40 40" role="img" focusable="false">
      <path d="M12 11.5C15.5 7.8 23.8 7.1 28 10.5C30.1 12.2 29.6 15 27.2 16.1L15.8 21.4C12.3 23 11.9 26.9 14.8 28.8C19.1 31.6 26 30.8 29 27.1" fill="none" stroke="currentColor" strokeWidth="3.8" strokeLinecap="round" />
      <path d="M11 11.5h3.2M27.2 16.1l2.2 2.1M14.8 28.8l-2.3 2.1M29 27.1h2" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="11" cy="11.5" r="2.4" fill="#a8d8ff" />
      <circle cx="31" cy="27.1" r="2.4" fill="#3157d5" />
    </svg>
  </span>
);
