import React from 'react';
import { Info, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalloutProps {
  type?: 'info' | 'warning' | 'success';
  className?: string;
  children: React.ReactNode;
}

export const Callout = ({ type = 'info', className, children }: CalloutProps) => {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
  };
  
  const icons = {
    info: Info,
    warning: AlertCircle,
    success: CheckCircle,
  };
  
  const Icon = icons[type];
  
  return (
    <div className={cn('p-4 rounded-lg border flex gap-3', styles[type], className)}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
};

interface KeyShortcutProps {
  keys: string[];
}

export const KeyShortcut = ({ keys }: KeyShortcutProps) => (
  <div className="flex gap-1">
    {keys.map((key, idx) => (
      <React.Fragment key={key}>
        {idx > 0 && <span className="text-stone-400">+</span>}
        <kbd className="px-2 py-1 text-xs font-mono bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded text-stone-700 dark:text-stone-300">
          {key}
        </kbd>
      </React.Fragment>
    ))}
  </div>
);
