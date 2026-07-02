import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AISettings, AppearanceSettings, PageSettings, EditorSettings, GeneralSettings, KeyboardSettings, AboutSettings } from './index';

type SettingsTab = 'general' | 'ai' | 'editor' | 'appearance' | 'page' | 'keyboard' | 'about';

const TABS = [
  { id: 'general' as SettingsTab, label: 'General', icon: 'Settings' },
  { id: 'ai' as SettingsTab, label: 'AI', icon: 'Sparkles' },
  { id: 'editor' as SettingsTab, label: 'Editor', icon: 'Type' },
  { id: 'appearance' as SettingsTab, label: 'Appearance', icon: 'Palette' },
  { id: 'page' as SettingsTab, label: 'Page', icon: 'FileText' },
  { id: 'keyboard' as SettingsTab, label: 'Keyboard', icon: 'Keyboard' },
  { id: 'about' as SettingsTab, label: 'About', icon: 'Info' },
];

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
}

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
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const ICONS: Record<string, React.ElementType> = {
    Settings: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Sparkles: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    Type: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>,
    Palette: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
    FileText: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Keyboard: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
    Info: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };

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
          <div className="w-56 border-r border-stone-200/50 dark:border-stone-800/50 bg-white/50 dark:bg-stone-950/50 backdrop-blur-sm flex-shrink-0">
            <div className="p-4">
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4">Settings</h2>
              <nav className="space-y-0.5">
                {TABS.map((tab) => {
                  const Icon = ICONS[tab.icon];
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
                      {Icon && <Icon />}
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
                  <AISettings
                    customApiKey={customApiKey}
                    customModel={customModel}
                    isCustomModelActive={isCustomModelActive}
                    customModelInput={customModelInput}
                    highlightStyle={highlightStyle}
                    disableAIFlashcards={disableAIFlashcards}
                    disableAIArrows={disableAIArrows}
                    disableAIStickies={disableAIStickies}
                    disableAIDividers={disableAIDividers}
                    disableAIImages={disableAIImages}
                    disableAIColumns={disableAIColumns}
                    allowNoteEnhancement={allowNoteEnhancement}
                    enableCleaning={enableCleaning}
                    onUpdateCustomApiKey={onUpdateCustomApiKey}
                    onUpdateCustomModel={onUpdateCustomModel}
                    onUpdateHighlightStyle={onUpdateHighlightStyle}
                    onUpdateDisableAIFlashcards={onUpdateDisableAIFlashcards}
                    onUpdateDisableAIArrows={onUpdateDisableAIArrows}
                    onUpdateDisableAIStickies={onUpdateDisableAIStickies}
                    onUpdateDisableAIDividers={onUpdateDisableAIDividers}
                    onUpdateDisableAIImages={onUpdateDisableAIImages}
                    onUpdateDisableAIColumns={onUpdateDisableAIColumns}
                    onUpdateAllowNoteEnhancement={onUpdateAllowNoteEnhancement}
                    onUpdateEnableCleaning={onUpdateEnableCleaning}
                    onSetCustomModelActive={onSetCustomModelActive}
                    onSetCustomModelInput={onSetCustomModelInput}
                  />
                )}

                {activeTab === 'appearance' && (
                  <AppearanceSettings
                    theme={theme}
                    onThemeChange={onThemeChange}
                  />
                )}

                {activeTab === 'page' && (
                  <PageSettings
                    pageLayout={pageLayout}
                    pageMargin={pageMargin}
                    pageLayoutMode={pageLayoutMode}
                    notebookStyle={notebookStyle}
                    fontSize={fontSize}
                    isHandwriting={isHandwriting}
                    onPageLayoutChange={onPageLayoutChange}
                    onPageMarginChange={onPageMarginChange}
                    onPageLayoutModeChange={onPageLayoutModeChange}
                    onNotebookStyleChange={onNotebookStyleChange}
                    onFontSizeChange={onFontSizeChange}
                    onHandwritingToggle={onHandwritingToggle}
                  />
                )}

                {activeTab === 'editor' && (
                  <EditorSettings
                    fontSize={fontSize}
                    onFontSizeChange={onFontSizeChange}
                  />
                )}

                {activeTab === 'general' && <GeneralSettings />}

                {activeTab === 'keyboard' && <KeyboardSettings />}

                {activeTab === 'about' && <AboutSettings />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
