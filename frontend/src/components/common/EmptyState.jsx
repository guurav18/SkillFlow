import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records matching your current criteria.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 sm:p-12 text-center rounded-2xl border border-dashed border-[var(--sf-border)] bg-[var(--sf-surface)]/50 shadow-xs ${className}`}
    >
      <div className="w-13 h-13 rounded-2xl bg-[#eef2ff] dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-[#3157d5] dark:text-indigo-400 mb-4 shadow-xs">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[var(--sf-ink)] mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--sf-muted)] max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm" className="font-semibold shadow-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
