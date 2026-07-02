import React from 'react';
import { Toggle } from './CommonSettings';
import { cn } from '@/lib/utils';

interface PageSettingsProps {
  pageLayout: 'pageless' | 'a4-portrait' | 'a4-landscape';
  pageMargin: 'normal' | 'narrow' | 'none';
  pageLayoutMode: 'single' | 'book';
  notebookStyle: 'classic' | 'spiral';
  fontSize: number;
  isHandwriting: boolean;
  onPageLayoutChange: (layout: 'pageless' | 'a4-portrait' | 'a4-landscape') => void;
  onPageMarginChange: (margin: 'normal' | 'narrow' | 'none') => void;
  onPageLayoutModeChange: (mode: 'single' | 'book') => void;
  onNotebookStyleChange: (style: 'classic' | 'spiral') => void;
  onFontSizeChange: (size: number) => void;
  onHandwritingToggle: (enabled: boolean) => void;
}

export const PageSettings: React.FC<PageSettingsProps> = ({
  pageLayout,
  pageMargin,
  pageLayoutMode,
  notebookStyle,
  fontSize,
  isHandwriting,
  onPageLayoutChange,
  onPageMarginChange,
  onPageLayoutModeChange,
  onNotebookStyleChange,
  onFontSizeChange,
  onHandwritingToggle,
}) => {
  return (
    <div className="space-y-8 w-full">
      <div>
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">Page Setup</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400">Configure page layout and appearance</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">Page Layout</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onPageLayoutChange('pageless')}
            className={cn(
              "p-3 rounded-lg border-2 text-sm font-medium transition-all",
              pageLayout === 'pageless'
                ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900/30"
                : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950"
            )}
          >
            Pageless
          </button>
          <button
            onClick={() => onPageLayoutChange('a4-portrait')}
            className={cn(
              "p-3 rounded-lg border-2 text-sm font-medium transition-all",
              pageLayout === 'a4-portrait'
                ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900/30"
                : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950"
            )}
          >
            Portrait
          </button>
          <button
            onClick={() => onPageLayoutChange('a4-landscape')}
            className={cn(
              "p-3 rounded-lg border-2 text-sm font-medium transition-all",
              pageLayout === 'a4-landscape'
                ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900/30"
                : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950"
            )}
          >
            Landscape
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">Page Margin</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onPageMarginChange('normal')}
            disabled={pageLayout === 'pageless'}
            className={cn(
              "p-3 rounded-lg border-2 text-sm font-medium transition-all",
              pageMargin === 'normal'
                ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900/30"
                : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950",
              pageLayout === 'pageless' && "opacity-50 cursor-not-allowed"
            )}
          >
            Standard
          </button>
          <button
            onClick={() => onPageMarginChange('narrow')}
            disabled={pageLayout === 'pageless'}
            className={cn(
              "p-3 rounded-lg border-2 text-sm font-medium transition-all",
              pageMargin === 'narrow'
                ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900/30"
                : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950",
              pageLayout === 'pageless' && "opacity-50 cursor-not-allowed"
            )}
          >
            Narrow
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">Layout Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onPageLayoutModeChange('single')}
            disabled={pageLayout === 'pageless'}
            className={cn(
              "p-3 rounded-lg border-2 text-sm font-medium transition-all",
              pageLayoutMode === 'single'
                ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900/30"
                : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950",
              pageLayout === 'pageless' && "opacity-50 cursor-not-allowed"
            )}
          >
            Vertical
          </button>
          <button
            onClick={() => onPageLayoutModeChange('book')}
            disabled={pageLayout === 'pageless'}
            className={cn(
              "p-3 rounded-lg border-2 text-sm font-medium transition-all",
              pageLayoutMode === 'book'
                ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900/30"
                : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950",
              pageLayout === 'pageless' && "opacity-50 cursor-not-allowed"
            )}
          >
            Book
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">Notebook Style</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNotebookStyleChange('classic')}
            className={cn(
              "p-3 rounded-lg border-2 text-sm font-medium transition-all",
              notebookStyle === 'classic'
                ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900/30"
                : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950"
            )}
          >
            Classic Paper
          </button>
          <button
            onClick={() => onNotebookStyleChange('spiral')}
            className={cn(
              "p-3 rounded-lg border-2 text-sm font-medium transition-all",
              notebookStyle === 'spiral'
                ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900/30"
                : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950"
            )}
          >
            Spiral Notebook
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">Font Size</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onFontSizeChange(Math.max(10, fontSize - 1))}
            className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 hover:bg-stone-50 dark:hover:bg-stone-900/50 text-sm"
          >
            −
          </button>
          <span className="text-sm text-stone-600 dark:text-stone-400 w-12 text-center">{fontSize}px</span>
          <button
            onClick={() => onFontSizeChange(Math.min(72, fontSize + 1))}
            className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 hover:bg-stone-50 dark:hover:bg-stone-900/50 text-sm"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
        <span className="text-sm text-stone-700 dark:text-stone-300">Handwriting Mode</span>
        <Toggle enabled={isHandwriting} onToggle={() => onHandwritingToggle(!isHandwriting)} />
      </div>
    </div>
  );
};
