import React from 'react';
import { Toggle } from './CommonSettings';
import { cn } from '@/lib/utils';

const MODELS = [
  { id: 'gemma-4-31b-it', name: 'Gemma 4 31B' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
];

const HIGHLIGHT_STYLES = [
  { id: 'balanced', name: 'Balanced' },
  { id: 'generous', name: 'Generous' },
  { id: 'none', name: 'None' },
];

interface AISettingsProps {
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
}

export const AISettings: React.FC<AISettingsProps> = ({
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
}) => {
  return (
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
                <span className="w-5 h-5 flex items-center justify-center text-stone-900 dark:text-stone-100">✓</span>
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
            {isCustomModelActive && <span className="w-5 h-5 flex items-center justify-center text-stone-900 dark:text-stone-100">✓</span>}
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
  );
};
