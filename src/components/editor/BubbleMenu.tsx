import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BubbleMenu } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  Pipette,
  ChevronDown,
  Undo2,
  Layout,
  Brain,
  Sparkles,
  Loader2,
  ArrowLeft,
  Send,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type SubMenu = 'main' | 'highlight' | 'color' | 'ai-prompt';

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', color: '#ffff00' },
  { name: 'Blue', color: '#bfdbfe' },
  { name: 'Deep green', color: '#15803d' },
  { name: 'Pink', color: '#f9a8d4' },
  { name: 'Orange', color: '#fed7aa' },
];

const TEXT_COLORS = [
  { name: 'Stone', color: '#1c1917' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Gold', color: '#d97706' },
];

interface EditorBubbleMenuProps {
  editor: any;
  onFormat?: (type: string, value?: any) => void;
  onCreateFlashcard?: (text: string) => void;
  onAISelectionFormat?: (selectionText: string, selectionHTML: string, instruction: string) => Promise<{ formattedHTML: string; stickies?: any[]; arrows?: any[]; dividers?: any[] }>;
}

export const EditorBubbleMenu: React.FC<EditorBubbleMenuProps> = ({
  editor,
  onFormat,
  onCreateFlashcard,
  onAISelectionFormat
}) => {
  const [activeSubMenu, setActiveSubMenu] = useState<SubMenu>('main');
  const [aiPromptText, setAiPromptText] = useState('');
  const [isAISelectionLoading, setIsAISelectionLoading] = useState(false);
  const [headingLevel, setHeadingLevel] = useState<3 | 2 | 1>(3);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  const handleAISelectionSubmit = async () => {
    if (!editor || !onAISelectionFormat || !aiPromptText.trim()) return;
    setIsAISelectionLoading(true);

    try {
      const { from, to } = editor.state.selection;
      let selectionText = '';

      editor.state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.isText) {
          selectionText += node.text;
        } else if (node.type.name === 'math') {
          selectionText += `$${node.attrs.latex}$`;
        }
      });

      const slice = editor.state.selection.content();
      const fragment = slice.content;
      const { DOMSerializer } = await import('@tiptap/pm/model');
      const serializer = DOMSerializer.fromSchema(editor.schema);
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(serializer.serializeFragment(fragment));
      const selectionHTML = tempDiv.innerHTML;

      const result = await onAISelectionFormat(selectionText, selectionHTML, aiPromptText);
      if (result && result.formattedHTML) {
        editor.chain().focus().insertContentAt({ from, to }, result.formattedHTML).run();
        setAiPromptText('');
        setActiveSubMenu('main');
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsAISelectionLoading(false);
    }
  };

  if (!editor) return null;

  return (
    <BubbleMenu 
      editor={editor} 
      className="flex items-center gap-0.5 bg-white/95 dark:bg-stone-900/95 border border-stone-200 dark:border-stone-800 shadow-xl rounded-full p-1 backdrop-blur-md animate-in fade-in zoom-in duration-200 min-h-[40px]"
    >
      {activeSubMenu === 'main' ? (
        <>
          <button
            onClick={() => {
              const { from, to } = editor.state.selection;
              let text = '';
              editor.state.doc.nodesBetween(from, to, (node, pos) => {
                if (node.isText) {
                  text += node.text;
                } else if (node.type.name === 'math') {
                  text += `$${node.attrs.latex}$`;
                }
              });
              if (text && onCreateFlashcard) {
                onCreateFlashcard(text);
              }
            }}
            className="p-1.5 rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/40 text-amber-600 transition-colors"
            title="Create Flashcard from Selection"
          >
            <Brain className="w-3.5 h-3.5" />
          </button>

          <Separator orientation="vertical" className="h-4 mx-0.5" />

          <button
            onClick={() => onFormat?.('bold')}
            className={cn(
              "p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors",
              editor.isActive('bold') && "text-blue-600 bg-blue-50 dark:bg-blue-900/40"
            )}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onFormat?.('italic')}
            className={cn(
              "p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors",
              editor.isActive('italic') && "text-blue-600 bg-blue-50 dark:bg-blue-900/40"
            )}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onFormat?.('underline')}
            className={cn(
              "p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors",
              editor.isActive('underline') && "text-blue-600 bg-blue-50 dark:bg-blue-900/40"
            )}
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>

          <Separator orientation="vertical" className="h-4 mx-0.5" />

          <button
            onClick={() => {
              const nextLevel = headingLevel === 3 ? 2 : headingLevel === 2 ? 1 : 3;
              setHeadingLevel(nextLevel);
              onFormat?.('heading', `h${nextLevel}`);
            }}
            className={cn(
              "p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors",
              editor.isActive('heading', { level: headingLevel }) && "text-blue-600 bg-blue-50 dark:bg-blue-900/40"
            )}
            title={`Heading ${headingLevel}`}
          >
            {headingLevel === 1 && <Heading1 className="w-3.5 h-3.5" />}
            {headingLevel === 2 && <Heading2 className="w-3.5 h-3.5" />}
            {headingLevel === 3 && <Heading3 className="w-3.5 h-3.5" />}
          </button>

          <Separator orientation="vertical" className="h-4 mx-0.5" />

          <button
            onClick={() => {
              const nextAlign = textAlign === 'left' ? 'center' : textAlign === 'center' ? 'right' : 'left';
              setTextAlign(nextAlign);
              onFormat?.('textAlign', nextAlign);
            }}
            className={cn(
              "p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors",
              editor.isActive({ textAlign }) && "text-blue-600 bg-blue-50 dark:bg-blue-900/40"
            )}
            title={`Align ${textAlign}`}
          >
            {textAlign === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
            {textAlign === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
            {textAlign === 'right' && <AlignRight className="w-3.5 h-3.5" />}
          </button>

          <Separator orientation="vertical" className="h-4 mx-0.5" />

          <button
            onClick={() => setActiveSubMenu('highlight')}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-0.5"
          >
            <Highlighter className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
            <ChevronDown className="w-2.5 h-2.5 opacity-50" />
          </button>

          <button
            onClick={() => setActiveSubMenu('color')}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-0.5"
          >
            <Pipette className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <ChevronDown className="w-2.5 h-2.5 opacity-50" />
          </button>

          <Separator orientation="vertical" className="h-4 mx-0.5" />

          <button
            onClick={() => setActiveSubMenu('ai-prompt')}
            className="p-1.5 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 transition-colors"
            title="AI Selection Formatter"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {editor.isActive('columns') && (
            <>
              <Separator orientation="vertical" className="h-4 mx-0.5" />
              <button
                onClick={() => onFormat?.('columns', 'single')}
                className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 transition-colors"
                title="Remove Split Layout"
              >
                <Layout className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </>
      ) : activeSubMenu === 'ai-prompt' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex items-center gap-1.5 px-1.5 py-0.5 min-w-[240px]"
        >
          <button
            onClick={() => {
              setAiPromptText('');
              setActiveSubMenu('main');
            }}
            disabled={isAISelectionLoading}
            className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-stone-500" />
          </button>

          <input
            type="text"
            placeholder="Ask AI to format selection..."
            value={aiPromptText}
            onChange={(e) => setAiPromptText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isAISelectionLoading) {
                e.preventDefault();
                handleAISelectionSubmit();
              }
            }}
            disabled={isAISelectionLoading}
            className="flex-1 bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 outline-none focus:ring-1 focus:ring-purple-500 rounded-md px-2 py-1 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500"
            autoFocus
          />

          <button
            onClick={handleAISelectionSubmit}
            disabled={isAISelectionLoading || !aiPromptText.trim()}
            className="p-1.5 rounded-full bg-purple-500 hover:bg-purple-600 disabled:bg-stone-100 dark:disabled:bg-stone-800 text-white disabled:text-stone-400 transition-all shadow-sm flex items-center justify-center"
            title="Submit to AI"
          >
            {isAISelectionLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
          </button>
        </motion.div>
      ) : (
        <div className="flex items-center gap-2 px-1">
          <button 
            onClick={() => setActiveSubMenu('main')}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Back"
          >
            <Undo2 className="w-3.5 h-3.5 text-stone-500" />
          </button>
          
          <div className="flex items-center gap-1.5">
            {(activeSubMenu === 'highlight' ? HIGHLIGHT_COLORS : TEXT_COLORS).map(c => (
              <button
                key={c.color}
                className="w-5 h-5 rounded-full border border-black/10 hover:scale-110 active:scale-95 transition-all shadow-sm"
                style={{ backgroundColor: c.color }}
                onClick={() => {
                  onFormat?.(activeSubMenu === 'highlight' ? 'highlight' : 'color', c.color);
                }}
                title={c.name}
              />
            ))}
          </div>

          <button 
            onClick={() => onFormat?.(activeSubMenu === 'highlight' ? 'highlight' : 'color', null)}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs font-medium text-stone-500"
            title="Remove formatting"
          >
            X
          </button>
        </div>
      )}
    </BubbleMenu>
  );
};
