import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className={cn(
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-stone-900",
      enabled ? "bg-emerald-500" : "bg-stone-200 dark:bg-stone-700"
    )}
  >
    <span
      className={cn(
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-in-out",
        enabled ? "translate-x-5" : "translate-x-0"
      )}
    />
  </button>
);

export const Slider = ({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number }) => (
  <div className="relative">
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-stone-100"
    />
    <div 
      className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-stone-900 dark:bg-stone-100 rounded-lg pointer-events-none transition-all"
      style={{ width: `${((value - min) / (max - min)) * 100}%` }}
    />
  </div>
);

export const SelectButton = ({ 
  selected, 
  onClick, 
  children,
  disabled = false 
}: { 
  selected: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "p-3 rounded-lg border-2 text-sm font-medium transition-all",
      selected
        ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900/30"
        : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <div className="flex items-center justify-between">
      {children}
      {selected && <Check className="w-4 h-4 text-stone-900 dark:text-stone-100" />}
    </div>
  </button>
);
