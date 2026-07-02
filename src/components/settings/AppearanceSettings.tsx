import React from 'react';
import { THEMES } from '@/src/types';
import { SelectButton } from './CommonSettings';
import { cn } from '@/lib/utils';

const ACCENT_COLORS = [
  { name: 'Stone', value: '#1c1917' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
];

interface AppearanceSettingsProps {
  theme: any;
  onThemeChange: (theme: any) => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  theme,
  onThemeChange,
}) => {
  const [accentColor, setAccentColor] = React.useState('#1c1917');

  return (
    <div className="space-y-8 w-full">
      <div>
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">Appearance</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400">Customize your editor look</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">Theme</h3>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => (
            <SelectButton
              key={t.id}
              selected={theme.id === t.id}
              onClick={() => onThemeChange(t)}
            >
              <span>{t.name}</span>
            </SelectButton>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">Accent Color</h3>
        <div className="flex gap-2">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setAccentColor(color.value)}
              className={cn(
                "w-10 h-10 rounded-full border-2 transition-all duration-200",
                accentColor === color.value
                  ? "border-stone-900 dark:border-stone-100 scale-110"
                  : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700"
              )}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
