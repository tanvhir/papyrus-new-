import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Settings as SettingsIcon,
  Sparkles,
  Palette,
  Type,
  Keyboard,
  Info,
  ChevronRight,
  Check,
  FileText,
  Download,
  Printer,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { THEMES } from '@/src/types';

type SettingsTab = 'general' | 'ai' | 'editor' | 'appearance' | 'page' | 'keyboard' | 'about';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customApiKey: string;
  customModel: string;
  isCustomModelActive: boolean;
  customModelInput: string;
  highlightStyle: 'balanced' | 'generous' | 'none';
  disableAIFlashcards: boolean;
  disableAIArrows: boolean;
  disableAIStickies: boolean;
  disableAIDividers: boolean;
  disableAIImages: boolean;
  disableAIColumns: boolean;
  allowNoteEnhancement: boolean;
  enableCleaning: boolean;
  onUpdateCustomApiKey: (key: string) => void;
  onUpdateCustomModel: (model: string) => void;
  onUpdateHighlightStyle: (style: 'balanced' | 'generous' | 'none') => void;
  onUpdateDisableAIFlashcards: (disabled: boolean) => void;
  onUpdateDisableAIArrows: (disabled: boolean) => void;
  onUpdateDisableAIStickies: (disabled: boolean) => void;
  onUpdateDisableAIDividers: (disabled: boolean) => void;
  onUpdateDisableAIImages: (disabled: boolean) => void;
  onUpdateDisableAIColumns: (disabled: boolean) => void;
  onUpdateAllowNoteEnhancement: (allowed: boolean) => void;
  onUpdateEnableCleaning: (enabled: boolean) => void;
  onSetCustomModelActive: (active: boolean) => void;
  onSetCustomModelInput: (input: string) => void;
  // Page setup props
  pageLayout: 'pageless' | 'a4-portrait' | 'a4-landscape';
  pageMargin: 'normal' | 'narrow' | 'none';
  pageLayoutMode: 'single' | 'book';
  notebookStyle: 'classic' | 'spiral';
  theme: any;
  fontSize: number;
  isHandwriting: boolean;
  onPageLayoutChange: (layout: 'pageless' | 'a4-portrait' | 'a4-landscape') => void;
  onPageMarginChange: (margin: 'normal' | 'narrow' | 'none') => void;
  onPageLayoutModeChange: (mode: 'single' | 'book') => void;
  onNotebookStyleChange: (style: 'classic' | 'spiral') => void;
  onThemeChange: (theme: any) => void;
  onFontSizeChange: (size: number) => void;
  onHandwritingToggle: (enabled: boolean) => void;
  // PDF export props
  onExportPDF: () => void;
  onExportPDFPrint: () => void;
  isExportingPDF: boolean;
}

const TABS = [
  { id: 'general' as SettingsTab, label: 'General', icon: SettingsIcon },
  { id: 'ai' as SettingsTab, label: 'AI', icon: Sparkles },
  { id: 'editor' as SettingsTab, label: 'Editor', icon: Type },
  { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette },
  { id: 'page' as SettingsTab, label: 'Page', icon: FileText },
  { id: 'keyboard' as SettingsTab, label: 'Keyboard', icon: Keyboard },
  { id: 'about' as SettingsTab, label: 'About', icon: Info },
];

const MODELS = [
  { id: 'gemma-4-31b-it', name: 'Gemma 4 31B' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
];

const ACCENT_COLORS = [
  { name: 'Stone', value: '#1c1917' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
];


const HIGHLIGHT_STYLES = [
  { id: 'balanced', name: 'Balanced' },
  { id: 'generous', name: 'Generous' },
  { id: 'none', name: 'None' },
];

const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
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

const Slider = ({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number }) => (
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

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onOpenChange,
  customApiKey,
  customModel,
  isCustomModelActive,
  customModelInput,
  highlightStyle,
  disableAIFlashcards,
  disableAIArrows,
  disableAIStickies,
  disableAIDividers,
  disableAIImages,
  disableAIColumns,
  allowNoteEnhancement,
  enableCleaning,
  onUpdateCustomApiKey,
  onUpdateCustomModel,
  onUpdateHighlightStyle,
  onUpdateDisableAIFlashcards,
  onUpdateDisableAIArrows,
  onUpdateDisableAIStickies,
  onUpdateDisableAIDividers,
  onUpdateDisableAIImages,
  onUpdateDisableAIColumns,
  onUpdateAllowNoteEnhancement,
  onUpdateEnableCleaning,
  onSetCustomModelActive,
  onSetCustomModelInput,
  pageLayout,
  pageMargin,
  pageLayoutMode,
  notebookStyle,
  theme,
  fontSize,
  isHandwriting,
  onPageLayoutChange,
  onPageMarginChange,
  onPageLayoutModeChange,
  onNotebookStyleChange,
  onThemeChange,
  onFontSizeChange,
  onHandwritingToggle,
  onExportPDF,
  onExportPDFPrint,
  isExportingPDF,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [accentColor, setAccentColor] = useState('#1c1917');
  const [editorWidth, setEditorWidth] = useState(850);
  const [paperTexture, setPaperTexture] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [typewriterMode, setTypewriterMode] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[900px] h-[650px] max-h-[90vh] p-0 bg-[#FCFBF7] dark:bg-[#0A0A0A] border border-stone-200/50 dark:border-stone-800/50 rounded-2xl shadow-2xl overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex h-full min-h-0"
        >
        <div className="flex h-full min-h-0 w-full">
          {/* Left Sidebar */}
          <div className="w-56 border-r border-stone-200/50 dark:border-stone-800/50 bg-white/50 dark:bg-stone-950/50 backdrop-blur-sm flex-shrink-0">
            <div className="p-4">
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4">Settings</h2>
              <nav className="space-y-0.5">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        activeTab === tab.id
                          ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                          : "text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/50 hover:text-stone-700 dark:hover:text-stone-300"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {activeTab === tab.id && (
                        <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="p-8 w-full max-w-none"
              >
                {activeTab === 'ai' && (
                  <div className="space-y-8 w-full">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">AI Model</h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400">Select your preferred AI model</p>
                    </div>

                    <div className="space-y-3">
                      {MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            onSetCustomModelActive(false);
                            onUpdateCustomModel(model.id);
                          }}
                          className={cn(
                            "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                            customModel === model.id && !isCustomModelActive
                              ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900/30"
                              : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-stone-900 dark:text-stone-100">{model.name}</span>
                            {customModel === model.id && !isCustomModelActive && (
                              <Check className="w-5 h-5 text-stone-900 dark:text-stone-100" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                      <button
                        onClick={() => onSetCustomModelActive(true)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                          isCustomModelActive
                            ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900/30"
                            : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-stone-900 dark:text-stone-100">Custom Model</span>
                          {isCustomModelActive && <Check className="w-5 h-5 text-stone-900 dark:text-stone-100" />}
                        </div>
                      </button>
                      {isCustomModelActive && (
                        <input
                          type="text"
                          placeholder="Enter custom model ID"
                          value={customModelInput}
                          onChange={(e) => {
                            onSetCustomModelInput(e.target.value);
                            onUpdateCustomModel(e.target.value);
                          }}
                          className="mt-3 w-full px-4 py-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm"
                        />
                      )}
                    </div>

                    <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">API Key</h3>
                      <input
                        type="password"
                        placeholder="Using default server key..."
                        value={customApiKey}
                        onChange={(e) => onUpdateCustomApiKey(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      />
                    </div>

                    <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">AI Formatting Permissions</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <span className="text-sm text-stone-700 dark:text-stone-300">Flashcards</span>
                          <Toggle enabled={!disableAIFlashcards} onToggle={() => onUpdateDisableAIFlashcards(!disableAIFlashcards)} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <span className="text-sm text-stone-700 dark:text-stone-300">Canvas Arrows</span>
                          <Toggle enabled={!disableAIArrows} onToggle={() => onUpdateDisableAIArrows(!disableAIArrows)} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <span className="text-sm text-stone-700 dark:text-stone-300">Margin Stickies</span>
                          <Toggle enabled={!disableAIStickies} onToggle={() => onUpdateDisableAIStickies(!disableAIStickies)} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <span className="text-sm text-stone-700 dark:text-stone-300">Images</span>
                          <Toggle enabled={!disableAIImages} onToggle={() => onUpdateDisableAIImages(!disableAIImages)} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <span className="text-sm text-stone-700 dark:text-stone-300">Split Sections (Columns)</span>
                          <Toggle enabled={!disableAIColumns} onToggle={() => onUpdateDisableAIColumns(!disableAIColumns)} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <span className="text-sm text-stone-700 dark:text-stone-300">Section Dividers</span>
                          <Toggle enabled={!disableAIDividers} onToggle={() => onUpdateDisableAIDividers(!disableAIDividers)} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">Highlight Style</h3>
                      <div className="inline-flex bg-stone-100 dark:bg-stone-900 rounded-lg p-1">
                        {HIGHLIGHT_STYLES.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => onUpdateHighlightStyle(style.id as any)}
                            className={cn(
                              "px-4 py-2 rounded-md text-sm font-medium transition-all",
                              highlightStyle === style.id
                                ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm"
                                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                            )}
                          >
                            {style.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">AI Behavior</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div>
                            <span className="text-sm text-stone-700 dark:text-stone-300 block">Note Enhancement</span>
                            <span className="text-xs text-stone-500 dark:text-stone-400">Allow AI to modify text content</span>
                          </div>
                          <Toggle enabled={allowNoteEnhancement} onToggle={() => onUpdateAllowNoteEnhancement(!allowNoteEnhancement)} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div>
                            <span className="text-sm text-stone-700 dark:text-stone-300 block">Clean Random Text</span>
                            <span className="text-xs text-stone-500 dark:text-stone-400">Remove (21) (2) type artifacts</span>
                          </div>
                          <Toggle enabled={enableCleaning} onToggle={() => onUpdateEnableCleaning(!enableCleaning)} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-8 w-full">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">Appearance</h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400">Customize your editor look</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">Theme</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {THEMES.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => onThemeChange(t)}
                            className={cn(
                              "p-3 rounded-lg border-2 text-sm font-medium transition-all",
                              theme.id === t.id
                                ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900/30"
                                : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span>{t.name}</span>
                              {theme.id === t.id && (
                                <Check className="w-4 h-4 text-stone-900 dark:text-stone-100" />
                              )}
                            </div>
                          </button>
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
                )}

                {activeTab === 'page' && (
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

                    <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">Export</h3>
                      <div className="space-y-2">
                        <button
                          onClick={onExportPDF}
                          disabled={isExportingPDF}
                          className={cn(
                            "w-full p-3 rounded-lg border-2 text-left transition-all duration-200 flex items-center gap-3",
                            "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950",
                            isExportingPDF && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isExportingPDF ? (
                            <Loader2 className="w-4 h-4 text-stone-500 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 text-stone-500" />
                          )}
                          <div>
                            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Export as PDF</span>
                            <p className="text-xs text-stone-500 dark:text-stone-400">High-quality client-side PDF generation</p>
                          </div>
                        </button>
                        <button
                          onClick={onExportPDFPrint}
                          className="w-full p-3 rounded-lg border-2 text-left transition-all duration-200 flex items-center gap-3 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-950"
                        >
                          <Printer className="w-4 h-4 text-stone-500" />
                          <div>
                            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Print / Save as PDF</span>
                            <p className="text-xs text-stone-500 dark:text-stone-400">Use browser's native print dialog</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'editor' && (
                  <div className="space-y-8 w-full">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">Editor</h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400">Configure editor behavior</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Editor Width</h3>
                        <span className="text-sm text-stone-500 dark:text-stone-400">{editorWidth}px</span>
                      </div>
                      <Slider value={editorWidth} onChange={setEditorWidth} min={600} max={1200} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Font Size</h3>
                        <span className="text-sm text-stone-500 dark:text-stone-400">{fontSize}px</span>
                      </div>
                      <Slider value={fontSize} onChange={onFontSizeChange} min={12} max={24} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                        <span className="text-sm text-stone-700 dark:text-stone-300">Paper Texture</span>
                        <Toggle enabled={paperTexture} onToggle={() => setPaperTexture(!paperTexture)} />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                        <span className="text-sm text-stone-700 dark:text-stone-300">Auto Save</span>
                        <Toggle enabled={autoSave} onToggle={() => setAutoSave(!autoSave)} />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                        <span className="text-sm text-stone-700 dark:text-stone-300">Typewriter Mode</span>
                        <Toggle enabled={typewriterMode} onToggle={() => setTypewriterMode(!typewriterMode)} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'general' && (
                  <div className="space-y-8 w-full">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">General</h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400">Basic application settings</p>
                    </div>
                    <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-800">
                      <p className="text-sm text-stone-600 dark:text-stone-400">General settings coming soon</p>
                    </div>
                  </div>
                )}

                {activeTab === 'keyboard' && (
                  <div className="space-y-8 w-full">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">Keyboard Shortcuts</h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400">Customize your shortcuts</p>
                    </div>
                    <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-800">
                      <p className="text-sm text-stone-600 dark:text-stone-400">Keyboard shortcuts coming soon</p>
                    </div>
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="space-y-8 w-full">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">About</h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400">Application information</p>
                    </div>
                    <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-800">
                      <p className="text-sm text-stone-600 dark:text-stone-400">Papyrus v1.0</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
