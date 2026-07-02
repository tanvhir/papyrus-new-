import React from 'react';
import { Toggle, Slider } from './CommonSettings';

interface EditorSettingsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export const EditorSettings: React.FC<EditorSettingsProps> = ({
  fontSize,
  onFontSizeChange,
}) => {
  const [editorWidth, setEditorWidth] = React.useState(850);
  const [paperTexture, setPaperTexture] = React.useState(true);
  const [autoSave, setAutoSave] = React.useState(true);
  const [typewriterMode, setTypewriterMode] = React.useState(false);

  return (
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
  );
};
