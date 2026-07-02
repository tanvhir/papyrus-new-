import React from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import { PageExtension } from '../PageExtension';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import { MathExtension } from '@/src/lib/MathExtension';
import { ResizableImage } from '@/src/lib/ResizableImage';
import { DecorativeDivider } from '@/src/lib/DecorativeDivider';
import { Columns, Column } from '@/src/lib/MultiColumn';
import { DOMSerializer } from '@tiptap/pm/model';
import { cn, preserveSpaces } from '@/lib/utils';
import { NoteTheme } from '../../types';

interface EditorCoreProps {
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
}

const CustomDocument = Document.extend({
  content: 'page+',
});

const TabExtension = Extension.create({
  name: 'tab',
  addKeyboardShortcuts() {
    return {
      'Tab': ({ editor }) => {
        return editor.commands.insertContent('    ');
      },
      'Backspace': ({ editor }) => {
        const { state, view } = editor;
        const { selection } = state;
        const { empty, $from } = selection;

        if (!empty) return false;

        if ($from.parentOffset === 0) {
          const currentBlockStart = $from.before($from.depth);
          const tr = state.tr;
          
          if (currentBlockStart > 2) {
            let targetDeletePos = -1;
            for (let p = currentBlockStart - 1; p >= 0; p--) {
              try {
                const node = tr.doc.nodeAt(p);
                if (node && (node.isText || node.isBlock || node.type.name === 'math' || node.type.name === 'resizableImage' || node.type.name === 'paragraph')) {
                  targetDeletePos = p + (node.isText ? node.nodeSize : 0);
                  break;
                }
              } catch (e) {}
            }

            if (targetDeletePos !== -1 && targetDeletePos < $from.pos) {
              const resolvedPrev = tr.doc.resolve(targetDeletePos);
              const prevNode = resolvedPrev.parent;
              if (prevNode && prevNode.isBlock && prevNode.textContent.trim() === '' && prevNode.childCount === 0) {
                const prevBlockStart = resolvedPrev.before(resolvedPrev.depth);
                tr.delete(prevBlockStart, $from.pos);
              } else {
                tr.delete(targetDeletePos, $from.pos);
              }
              view.dispatch(tr);
              return true;
            }
          }
        }
        return false;
      },
      'Delete': ({ editor }) => {
        const { state, view } = editor;
        const { selection } = state;
        const { empty, $from } = selection;

        if (!empty) return false;

        if ($from.parentOffset === $from.parent.content.size) {
          const currentBlockEnd = $from.after($from.depth);
          const docSize = state.doc.content.size;
          const tr = state.tr;
          
          if (currentBlockEnd < docSize - 2) {
            let targetDeletePos = -1;
            for (let p = currentBlockEnd + 1; p < docSize; p++) {
              try {
                const node = tr.doc.nodeAt(p);
                if (node && (node.isText || node.isBlock || node.type.name === 'math' || node.type.name === 'resizableImage' || node.type.name === 'paragraph')) {
                  targetDeletePos = p;
                  break;
                }
              } catch (e) {}
            }

            if (targetDeletePos !== -1 && targetDeletePos > $from.pos) {
              tr.delete($from.pos, targetDeletePos);
              view.dispatch(tr);
              return true;
            }
          }
        }
        return false;
      }
    };
  },
});

const normalizeContent = (html: string) => {
  const preserved = preserveSpaces(html);
  if (!preserved) return '<div data-type="page"><p></p></div>';
  if (preserved.includes('data-type="page"')) return preserved;
  return `<div data-type="page">${preserved}</div>`;
};

export const EditorCore: React.FC<EditorCoreProps> = ({
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
  onTransaction
}) => {
  const isPaintingRef = React.useRef(false);
  const lastPaintedPosRef = React.useRef<number | null>(null);

  const handlePaste = (event: ClipboardEvent) => {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find(item => item.type.startsWith('image/'));

    if (imageItem && onImagePaste) {
      event.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          onImagePaste(src);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const extensions = React.useMemo(() => {
    const baseExtensions = [
      StarterKit.configure({
        document: false,
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-6 space-y-2',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal ml-6 space-y-2',
          },
        },
        horizontalRule: false,
      }),
      Underline,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      ResizableImage.configure({
        allowBase64: true,
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-12 border-t-2 border-stone-200 border-dashed',
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-stone-600 underline underline-offset-4 decoration-stone-300 hover:text-stone-900 transition-colors',
        },
      }),
      Placeholder.configure({
        placeholder: 'Begin your legacy on Papyrus...',
      }),
      BubbleMenuExtension,
      MathExtension,
      DecorativeDivider,
      Columns,
      Column,
      TabExtension,
    ];

    if (isSimpleMode) {
      return [Document, ...baseExtensions];
    } else {
      return [CustomDocument, PageExtension, ...baseExtensions];
    }
  }, [isSimpleMode]);

  const initialContent = React.useMemo(() => {
    if (isSimpleMode) {
      const preserved = preserveSpaces(content);
      if (!preserved) return '<p></p>';
      let stripped = preserved;
      if (stripped.includes('data-type="page"')) {
        stripped = stripped.replace(/<div[^>]*data-type="page"[^>]*>/g, '').replace(/<\/div>\s*$/g, '');
      }
      return stripped;
    } else {
      return normalizeContent(content);
    }
  }, [content, isSimpleMode]);

  const editor = useEditor({
    editable,
    extensions,
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(preserveSpaces(editor.getHTML()));
      }
    },
    onTransaction: onTransaction,
    editorProps: {
      attributes: {
        class: cn(
          editorClass || 'prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[700px] font-serif leading-[1.6] antialiased',
          activeHighlighterColor && "cursor-crosshair selection:bg-transparent",
          !isSimpleMode && texture === 'laid' && "texture-laid",
          !isSimpleMode && texture === 'grid' && "texture-grid",
          !isSimpleMode && texture === 'linen' && "texture-linen"
        ),
        style: isSimpleMode 
          ? `font-size: ${fontSize}px;` 
          : `font-size: ${fontSize}px; --page-height: ${
              pageLayout === 'pageless' ? 'auto' : pageLayout === 'a4-landscape' ? '820px' : '1160px'
            }; --page-width: ${
              pageLayout === 'pageless' ? '850px' : pageLayout === 'a4-landscape' ? '1160px' : '820px'
            }; --page-bg: ${
              theme?.paperColor || '#ffffff'
            }; --page-ink: ${
              theme?.inkColor || '#1a1a1a'
            }; --page-margin-x: ${
              pageMargin === 'none' ? '0px' : pageMargin === 'narrow' ? '40px' : '96px'
            }; --page-margin-y: ${
              pageMargin === 'none' ? '0px' : pageMargin === 'narrow' ? '40px' : '96px'
            };`,
      },
      transformPastedHTML: (html) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const pageElements = tempDiv.querySelectorAll('[data-type="page"], .page-container-node');
        pageElements.forEach(el => {
          while (el.firstChild) {
            el.parentNode?.insertBefore(el.firstChild, el);
          }
          el.remove();
        });
        
        const unwantedTags = ['script', 'style', 'meta', 'link'];
        unwantedTags.forEach(tag => {
          tempDiv.querySelectorAll(tag).forEach(el => el.remove());
        });
        
        return tempDiv.innerHTML;
      },
      handleDOMEvents: {
        mousedown: (view, event) => {
          if (activeHighlighterColor && event.button === 0) {
            const posAt = view.posAtCoords({ left: event.clientX, top: event.clientY });
            const pos = posAt?.pos;
            if (pos !== undefined && pos !== null) {
              isPaintingRef.current = true;
              const { state, dispatch } = view;
              const { tr } = state;
              const $pos = state.doc.resolve(pos);
              
              if ($pos.parent.isTextblock) {
                const docSize = state.doc.content.size;
                const from = Math.max(0, Math.min(pos, docSize));
                const to = Math.max(0, Math.min(pos + 1, docSize));
                if (from < to) {
                  try {
                    state.doc.resolve(from);
                    state.doc.resolve(to);
                    
                    tr.addMark(from, to, state.schema.marks.highlight.create({ color: activeHighlighterColor }));
                    dispatch(tr);
                    lastPaintedPosRef.current = pos;
                  } catch (e) {
                    console.error('Painting error:', e);
                  }
                }
              }
            }
            return true;
          }
          return false;
        },
        mousemove: (view, event) => {
          if (isPaintingRef.current && activeHighlighterColor) {
            const posAt = view.posAtCoords({ left: event.clientX, top: event.clientY });
            const pos = posAt?.pos;
            if (pos !== undefined && pos !== null && lastPaintedPosRef.current !== null && pos !== lastPaintedPosRef.current) {
              const { state, dispatch } = view;
              const { tr } = state;
              const docSize = state.doc.content.size;
              
              const start = Math.min(pos, lastPaintedPosRef.current);
              const end = Math.max(pos, lastPaintedPosRef.current);
              
              const safeStart = Math.max(0, Math.min(start, docSize));
              const safeEnd = Math.max(0, Math.min(end + 1, docSize));
              
              if (safeStart < safeEnd) {
                try {
                  state.doc.resolve(safeStart);
                  state.doc.resolve(safeEnd);
                  
                  tr.addMark(safeStart, safeEnd, state.schema.marks.highlight.create({ color: activeHighlighterColor }));
                  dispatch(tr);
                  lastPaintedPosRef.current = pos;
                } catch (e) {
                  console.warn('Painting move range error:', e);
                }
              }
            }
            return true;
          }
          return false;
        },
        mouseup: () => {
          isPaintingRef.current = false;
          lastPaintedPosRef.current = null;
          return false;
        },
        mouseleave: () => {
          isPaintingRef.current = false;
          lastPaintedPosRef.current = null;
          return false;
        }
      }
    }
  });

  React.useEffect(() => {
    if (editable && editor) {
      const editorElement = editor.view.dom;
      editorElement.addEventListener('paste', handlePaste);
      return () => {
        editorElement.removeEventListener('paste', handlePaste);
      };
    }
  }, [editable, editor, onImagePaste]);

  React.useEffect(() => {
    if (editor && onInit) {
      onInit(editor);
    }
  }, [editor, onInit]);

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      isPaintingRef.current = false;
      lastPaintedPosRef.current = null;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const getNormalizedContent = React.useCallback((html: string) => {
    if (isSimpleMode) {
      const preserved = preserveSpaces(html);
      if (!preserved) return '<p></p>';
      let stripped = preserved;
      if (stripped.includes('data-type="page"')) {
        stripped = stripped.replace(/<div[^>]*data-type="page"[^>]*>/g, '').replace(/<\/div>\s*$/g, '');
      }
      return stripped;
    } else {
      return normalizeContent(html);
    }
  }, [isSimpleMode]);

  const lastContentRef = React.useRef(getNormalizedContent(content));

  React.useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    
    const currentHTML = editor.getHTML();
    const cleanContent = getNormalizedContent(content);
    
    if (cleanContent !== currentHTML) {
      lastContentRef.current = cleanContent;
      queueMicrotask(() => {
        if (!editor.isDestroyed) {
          editor.commands.setContent(cleanContent, false);
        }
      });
    }
  }, [content, editor, getNormalizedContent]);

  React.useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
      lastContentRef.current = getNormalizedContent(editor.getHTML());
    };
    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, getNormalizedContent]);

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
};
