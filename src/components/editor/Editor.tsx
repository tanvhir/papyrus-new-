import React, { useState } from 'react';
import { EditorCore } from './EditorCore';
import { EditorBubbleMenu } from './BubbleMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NoteTheme } from '@/src/types';

interface EditorProps {
  content: string;
  onChange?: (html: string) => void;
  className?: string;
  editorClass?: string;
  onInit?: (editor: any) => void;
  editable?: boolean;
  onImagePaste?: (src: string) => void;
  activeHighlighterColor?: string | null;
  fontSize?: number;
  pageLayout?: 'pageless' | 'a4-portrait' | 'a4-landscape';
  pageMargin?: 'normal' | 'narrow' | 'none';
  theme?: NoteTheme;
  texture?: 'plain' | 'laid' | 'grid' | 'linen';
  isSimpleMode?: boolean;
  onTransaction?: (props: any) => void;
  onFormat?: (type: string, value?: any) => void;
  onCreateFlashcard?: (text: string) => void;
  onAISelectionFormat?: (selectionText: string, selectionHTML: string, instruction: string) => Promise<{ formattedHTML: string; stickies?: any[]; arrows?: any[]; dividers?: any[] }>;
  isDrawingArrowMode?: boolean;
  onToggleDrawingArrowMode?: () => void;
}

const Editor: React.FC<EditorProps> = ({
  content,
  onChange,
  className,
  editorClass,
  onInit,
  editable = true,
  onImagePaste,
  activeHighlighterColor,
  fontSize = 18,
  pageLayout = 'a4-portrait',
  pageMargin = 'normal',
  theme,
  texture = 'plain',
  isSimpleMode = false,
  onTransaction,
  onFormat,
  onCreateFlashcard,
  onAISelectionFormat,
  isDrawingArrowMode,
  onToggleDrawingArrowMode,
}) => {
  const [editor, setEditor] = useState<any>(null);
  const [editingMath, setEditingMath] = useState<{ pos: number; latex: string } | null>(null);
  const [mathInputVal, setMathInputVal] = useState('');

  const handleSaveMath = () => {
    if (!editor || !editingMath) return;
    const { pos, latex } = editingMath;
    const newLatex = mathInputVal.trim();
    if (newLatex) {
      const tr = editor.state.tr;
      const node = editor.state.doc.nodeAt(pos);
      if (node && node.type.name === 'math') {
        const newNode = node.type.create({ latex: newLatex });
        tr.setSelectionAround(pos);
        tr.replaceSelectionWith(newNode);
        editor.view.dispatch(tr);
      }
    }
    setEditingMath(null);
    setMathInputVal('');
  };

  return (
    <div className={className}>
      <EditorCore
        content={content}
        onChange={onChange}
        editorClass={editorClass}
        onInit={(ed) => {
          setEditor(ed);
          if (onInit) onInit(ed);
        }}
        editable={editable}
        onImagePaste={onImagePaste}
        activeHighlighterColor={activeHighlighterColor}
        fontSize={fontSize}
        pageLayout={pageLayout}
        pageMargin={pageMargin}
        theme={theme}
        texture={texture}
        isSimpleMode={isSimpleMode}
        onTransaction={onTransaction}
      />
      
      {editor && (
        <EditorBubbleMenu
          editor={editor}
          onFormat={onFormat}
          onCreateFlashcard={onCreateFlashcard}
          onAISelectionFormat={onAISelectionFormat}
        />
      )}

      <Dialog open={!!editingMath} onOpenChange={(open) => !open && setEditingMath(null)}>
        <DialogContent className="paper-shadow border-stone-200 dark:border-stone-800 sm:max-w-md bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl tracking-tight">
              Edit Equation
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div>
              <Label htmlFor="edit-math-input" className="block text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 mb-2">
                LaTeX Snippet
              </Label>
              <Input
                id="edit-math-input"
                value={mathInputVal}
                onChange={(e) => setMathInputVal(e.target.value)}
                placeholder="E = mc^2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveMath();
                  }
                }}
                autoFocus
                className="dark:bg-stone-800 dark:border-stone-700 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button variant="ghost" size="sm" onClick={() => setEditingMath(null)}>
                  Cancel
                </Button>
              </DialogClose>
              <Button size="sm" onClick={handleSaveMath} className="bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-95">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default React.memo(Editor);
