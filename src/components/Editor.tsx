import React from 'react';
import { useEditor, EditorContent, Extension, BubbleMenu } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import { PageExtension } from './PageExtension';
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
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Highlighter, 
  Pipette,
  Pencil,
  Type,
  ChevronDown,
  X,
  Undo2,
  Layout,
  Brain,
  Sparkles,
  Loader2,
  ArrowLeft,
  Send
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NoteTheme } from '../types';

interface EditorProps {
  content: string;
  onChange?: (html: string) => void;
  className?: string;
  editorClass?: string;
  onInit?: (editor: any) => void;
  editable?: boolean;
  activeHighlighterColor?: string | null;
  fontSize?: number;
  onFormat?: (type: string, value?: any) => void;
  isDrawingArrowMode?: boolean;
  onToggleDrawingArrowMode?: () => void;
  pageLayout?: 'pageless' | 'a4-portrait' | 'a4-landscape';
  pageMargin?: 'normal' | 'narrow' | 'none';
  theme?: NoteTheme;
  texture?: 'plain' | 'laid' | 'grid' | 'linen';
  onCreateFlashcard?: (text: string) => void;
  isSimpleMode?: boolean;
  onAISelectionFormat?: (selectionText: string, selectionHTML: string, instruction: string) => Promise<{ formattedHTML: string; stickies?: any[]; arrows?: any[]; dividers?: any[] }>;
  notebookStyle?: 'classic' | 'spiral';
  typewriterMode?: boolean;
}

const CustomDocument = Document.extend({
  content: 'page+',
});


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

        // Check if we are at the very beginning of a text block
        if ($from.parentOffset === 0) {
          const currentBlockStart = $from.before($from.depth);
          const tr = state.tr;
          
          // Let's not delete out of the very first block of the entire document (pos <= 2)
          if (currentBlockStart > 2) {
            // Scan backward for the previous content block or text
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
              if (view) {
                // If previous block is an empty paragraph, we can delete it entirely to pull content up faster
                const resolvedPrev = tr.doc.resolve(targetDeletePos);
                const prevNode = resolvedPrev.parent;
                if (prevNode && prevNode.isBlock && prevNode.textContent.trim() === '' && prevNode.childCount === 0) {
                  const prevBlockStart = resolvedPrev.before(resolvedPrev.depth);
                  tr.delete(prevBlockStart, $from.pos);
                } else {
                  tr.delete(targetDeletePos, $from.pos);
                }
                view.dispatch(tr);
              }
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

        // Check if we are at the very end of our block
        if ($from.parentOffset === $from.parent.content.size) {
          const currentBlockEnd = $from.after($from.depth);
          const docSize = state.doc.content.size;
          const tr = state.tr;
          
          if (currentBlockEnd < docSize - 2) {
            // Scan forward for the next content block or text
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
              if (view) {
                tr.delete($from.pos, targetDeletePos);
                view.dispatch(tr);
              }
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

const Editor: React.FC<EditorProps> = ({ 
  content, 
  onChange, 
  className, 
  editorClass, 
  onInit, 
  editable = true,
  activeHighlighterColor,
  fontSize = 18,
  onFormat,
  isDrawingArrowMode,
  onToggleDrawingArrowMode,
  pageLayout = 'a4-portrait',
  pageMargin = 'normal',
  theme,
  texture = 'plain',
  onCreateFlashcard,
  isSimpleMode = false,
  onAISelectionFormat,
  notebookStyle = 'classic',
  typewriterMode = false
}) => {
  const [activeSubMenu, setActiveSubMenu] = React.useState<SubMenu>('main');
  const [editingMath, setEditingMath] = React.useState<{ pos: number; latex: string } | null>(null);
  const [mathInputVal, setMathInputVal] = React.useState('');
  const [aiPromptText, setAiPromptText] = React.useState('');
  const [isAISelectionLoading, setIsAISelectionLoading] = React.useState(false);

  const handleAISelectionSubmit = async () => {
    if (!editor || !onAISelectionFormat || !aiPromptText.trim()) return;
    setIsAISelectionLoading(true);

    try {
      const { from, to } = editor.state.selection;
      const selectionText = editor.state.doc.textBetween(from, to, ' ');
      
      const slice = editor.state.selection.content();
      const fragment = slice.content;
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
      alert('Error formatting selection: ' + (e.message || e));
    } finally {
      setIsAISelectionLoading(false);
    }
  };

  const isPaintingRef = React.useRef(false);
  const lastPaintedPosRef = React.useRef<number | null>(null);

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
    editorProps: {
      attributes: {
        class: cn(
          editorClass || 'prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[700px] font-serif leading-[1.6] antialiased',
          activeHighlighterColor && "cursor-crosshair selection:bg-transparent",
          !isSimpleMode && texture === 'laid' && "texture-laid",
          !isSimpleMode && texture === 'grid' && "texture-grid",
          !isSimpleMode && texture === 'linen' && "texture-linen",
          !isSimpleMode && texture === 'plain' && "texture-plain",
          !isSimpleMode && notebookStyle === 'spiral' && "notebook-style-spiral",
          !isSimpleMode && notebookStyle === 'classic' && "notebook-style-classic"
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
        },
        dblclick: (view, event) => {
          const target = event.target as HTMLElement;
          const mathNode = target.closest('.math-node');
          if (mathNode) {
            event.preventDefault();
            event.stopPropagation();
            const latex = mathNode.getAttribute('data-latex') || '';
            const pos = view.posAtDOM(mathNode, 0);
            
            setEditingMath({
              pos,
              latex,
            });
            setMathInputVal(latex);
            return true;
          }
          return false;
        }
      },
      transformPastedHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const unsafeTags = ['script', 'iframe', 'object', 'embed', 'link', 'style', 'meta', 'base'];
        unsafeTags.forEach(tag => {
          doc.querySelectorAll(tag).forEach(el => el.remove());
        });

        doc.querySelectorAll('*').forEach(el => {
          Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('on')) {
              el.removeAttribute(attr.name);
            } else if (['src', 'href'].includes(attr.name) && attr.value.trim().toLowerCase().startsWith('javascript:')) {
              el.removeAttribute(attr.name);
            }
          });
          
          if (el.getAttribute('data-type') === 'page') {
            el.removeAttribute('data-type');
          }
        });

        return doc.body.innerHTML;
      },
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find(item => item.type.startsWith('image/'));
        if (imageItem) {
          const file = imageItem.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const src = e.target?.result as string;
              if (src && !view.state.destroyed) {
                const { schema, tr } = view.state;
                const nodeType = schema.nodes.image || schema.nodes.resizableImage;
                if (nodeType) {
                  const node = nodeType.create({ src });
                  view.dispatch(tr.replaceSelectionWith(node));
                }
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      }
    }
  });

  const handleSaveMath = React.useCallback(() => {
    if (editingMath && editor) {
      editor.chain().focus().command(({ tr, dispatch }) => {
        const node = tr.doc.nodeAt(editingMath.pos);
        if (node && node.type.name === 'math') {
          if (dispatch) {
            if (mathInputVal.trim() === '') {
              tr.delete(editingMath.pos, editingMath.pos + node.nodeSize);
            } else {
              tr.replaceWith(
                editingMath.pos,
                editingMath.pos + node.nodeSize,
                editor.schema.nodes.math.create({ latex: mathInputVal })
              );
            }
          }
          return true;
        }
        return false;
      }).run();
      setEditingMath(null);
      setMathInputVal('');
    }
  }, [editingMath, mathInputVal, editor]);

  const reflowLayout = React.useCallback(() => {
    if (!editor || editor.isDestroyed) return;

    const doc = editor.state.doc;
    const schema = editor.state.schema;

    if (pageLayout === 'pageless') {
      // In pageless mode, we flatten all blocks into a single page node
      if (doc.childCount === 1 && doc.firstChild?.type.name === 'page') return;

      const children: any[] = [];
      doc.forEach(node => {
        if (node.type.name === 'page') {
          node.forEach(child => children.push(child));
        } else {
          children.push(node);
        }
      });
      
      if (children.length === 0) {
        children.push(schema.nodes.paragraph.create());
      }
      
      const newPage = schema.nodes.page.create(null, children);
      const tr = editor.state.tr;
      tr.setMeta('reflowing', true);
      tr.replaceWith(0, doc.content.size, [newPage]);
      editor.view.dispatch(tr);
      return;
    }

    const pageDoms = Array.from(editor.view.dom.querySelectorAll('.page-container-node')) as HTMLElement[];

    // Track active cursor position relative to block nodes to prevent cursor loss during layout update
    const selection = editor.state.selection;
    const anchor = selection.anchor;
    let activeBlock: any = null;
    let activeBlockOffset = 0;

    let trackPos = 0;
    doc.forEach((pageNode) => {
      trackPos += 1; // page open
      if (pageNode.type.name === 'page') {
        pageNode.forEach((child) => {
          const start = trackPos;
          const end = start + child.nodeSize;
          if (anchor >= start && anchor <= end) {
            activeBlock = child;
            activeBlockOffset = anchor - start;
          }
          trackPos += child.nodeSize;
        });
      }
      trackPos += 1; // page close
    });

    interface FlatBlock {
      node: any;
      elementHeight: number;
      marginTop: number;
      marginBottom: number;
    }
    const flatBlocks: FlatBlock[] = [];

    doc.forEach((pageNode, _, pageIndex) => {
      if (pageNode.type.name === 'page') {
        const pageDom = pageDoms[pageIndex];
        pageNode.forEach((child, _, childIndex) => {
          let elementHeight = 0;
          let marginTop = 0;
          let marginBottom = 0;

          if (pageDom && pageDom.children[childIndex]) {
            const childDom = pageDom.children[childIndex] as HTMLElement;
            // Native layout height in pixels (unaffected by CSS transform zoom levels)
            elementHeight = childDom.offsetHeight;
            const style = window.getComputedStyle(childDom);
            marginTop = parseFloat(style.marginTop) || 0;
            marginBottom = parseFloat(style.marginBottom) || 0;
          }

          // Safe fallback model estimations
          if (!elementHeight || elementHeight < 4) {
            marginTop = 12;
            marginBottom = 12;
            if (child.type.name === 'heading') {
              const level = child.attrs.level || 1;
              elementHeight = level === 1 ? 36 : (level === 2 ? 30 : 24);
              marginTop = level === 1 ? 24 : (level === 2 ? 20 : 16);
              marginBottom = level === 1 ? 16 : (level === 2 ? 12 : 8);
            } else if (child.type.name === 'bulletList' || child.type.name === 'orderedList') {
              elementHeight = child.childCount * (fontSize * 1.5);
              marginTop = 12;
              marginBottom = 12;
            } else if (child.type.name === 'paragraph') {
              const textLen = child.textContent.length;
              const approxLines = Math.max(1, Math.ceil(textLen / 80));
              elementHeight = approxLines * (fontSize * 1.5);
              marginTop = 8;
              marginBottom = 8;
            } else if (child.type.name === 'image' || child.type.name === 'resizableImage') {
              elementHeight = child.attrs.height || 200;
              marginTop = 12;
              marginBottom = 12;
            } else {
              elementHeight = 20;
              marginTop = 4;
              marginBottom = 4;
            }
          }

          flatBlocks.push({
            node: child,
            elementHeight,
            marginTop,
            marginBottom
          });
        });
      }
    });

    if (flatBlocks.length === 0) return;

    const pageHeight = pageLayout === 'a4-landscape' ? 820 : 1160;
    const marginY = pageMargin === 'none' ? 0 : pageMargin === 'narrow' ? 40 : 96;
    const maxContentHeight = pageHeight - marginY * 2 - 4; // Ultra tight safety buffer to maximize content space

    // Partition flat blocks into virtual page models
    const pages: any[][] = [[]];
    let currentPageHeight = 0;
    let lastBlockOnPage: FlatBlock | null = null;

    for (let idx = 0; idx < flatBlocks.length; idx++) {
      const block = flatBlocks[idx];
      const isFirstInPage = pages[pages.length - 1].length === 0;

      let candidateHeight = 0;
      if (isFirstInPage) {
        candidateHeight = block.marginTop + block.elementHeight + block.marginBottom;
      } else if (lastBlockOnPage) {
        candidateHeight = currentPageHeight - lastBlockOnPage.marginBottom +
                          Math.max(lastBlockOnPage.marginBottom, block.marginTop) +
                          block.elementHeight + block.marginBottom;
      }

      const blockTotalHeight = block.marginTop + block.elementHeight + block.marginBottom;

      if (!isFirstInPage && candidateHeight > maxContentHeight) {
        // Edge Case: Splitting extremely long paragraphs
        if (block.node.type.name === 'paragraph' && block.node.textContent.length > 80 && blockTotalHeight > maxContentHeight * 0.4) {
          const text = block.node.textContent;
          const remainingSpace = maxContentHeight - currentPageHeight;
          const ratio = Math.max(0.1, Math.min(0.9, (remainingSpace - block.marginTop) / block.elementHeight));
          let splitIndex = Math.floor(text.length * ratio);

          const leftSpace = text.lastIndexOf(' ', splitIndex);
          const rightSpace = text.indexOf(' ', splitIndex);
          if (leftSpace !== -1 && (splitIndex - leftSpace < rightSpace - splitIndex || rightSpace === -1)) {
            splitIndex = leftSpace;
          } else if (rightSpace !== -1) {
            splitIndex = rightSpace;
          }

          if (splitIndex > 15 && splitIndex < text.length - 15) {
            const leftText = text.substring(0, splitIndex).trim();
            const rightText = text.substring(splitIndex).trim();

            const leftNode = schema.nodes.paragraph.create(null, schema.text(leftText));
            const rightNode = schema.nodes.paragraph.create(null, schema.text(rightText));

            pages[pages.length - 1].push(leftNode);
            pages.push([rightNode]);

            // Save split selection mappings down to exact characters
            if (block.node === activeBlock) {
              const charOffset = activeBlockOffset - 1;
              if (charOffset <= splitIndex) {
                activeBlock = leftNode;
                activeBlockOffset = Math.min(activeBlockOffset, leftNode.nodeSize);
              } else {
                activeBlock = rightNode;
                activeBlockOffset = (charOffset - splitIndex) + 1;
                activeBlockOffset = Math.min(activeBlockOffset, rightNode.nodeSize);
              }
            }

            const leftRatio = splitIndex / text.length;
            const rightRatio = 1 - leftRatio;

            lastBlockOnPage = {
              node: rightNode,
              elementHeight: block.elementHeight * rightRatio,
              marginTop: 8,
              marginBottom: block.marginBottom
            };
            currentPageHeight = lastBlockOnPage.marginTop + lastBlockOnPage.elementHeight + lastBlockOnPage.marginBottom;
            continue;
          }
        }

        // Edge Case: Splitting lists (bulleted / ordered lists)
        if ((block.node.type.name === 'bulletList' || block.node.type.name === 'orderedList') && block.node.childCount > 1) {
          const listType = block.node.type;
          const listItems: any[] = [];
          block.node.forEach((item: any) => listItems.push(item));

          const approxLineHeight = fontSize * 1.5;
          const itemHeights = listItems.map((item: any) => {
            const textLen = item.textContent.length;
            const lines = Math.max(1, Math.ceil(textLen / 70));
            return lines * approxLineHeight + 8;
          });

          const remainingSpace = maxContentHeight - currentPageHeight;
          let acc = 0;
          let splitIdx = -1;
          for (let i = 0; i < itemHeights.length; i++) {
            const listMargin = i === 0 ? block.marginTop : 0;
            if (acc + itemHeights[i] + listMargin > remainingSpace) {
              splitIdx = i;
              break;
            }
            acc += itemHeights[i];
          }

          if (splitIdx > 0) {
            const leftItems = listItems.slice(0, splitIdx);
            const rightItems = listItems.slice(splitIdx);

            const leftListNode = listType.create(block.node.attrs, leftItems);
            const rightListNode = listType.create(block.node.attrs, rightItems);

            pages[pages.length - 1].push(leftListNode);
            pages.push([rightListNode]);

            const rightListHeight = itemHeights.slice(splitIdx).reduce((a: number, b: number) => a + b, 0);

            lastBlockOnPage = {
              node: rightListNode,
              elementHeight: rightListHeight,
              marginTop: 12,
              marginBottom: block.marginBottom
            };
            currentPageHeight = lastBlockOnPage.marginTop + lastBlockOnPage.elementHeight + lastBlockOnPage.marginBottom;
            continue;
          }
        }

        // Standard: Move overflow block block-by-block into the next page
        pages.push([block.node]);
        lastBlockOnPage = block;
        currentPageHeight = block.marginTop + block.elementHeight + block.marginBottom;
      } else {
        pages[pages.length - 1].push(block.node);
        currentPageHeight = candidateHeight;
        lastBlockOnPage = block;
      }
    }

    // Prevent creation of empty trailing pages caused by trailing whitespace-only nodes
    const isBlockEmpty = (node: any): boolean => {
      if (node.type.name === 'paragraph') {
        return node.textContent.trim().length === 0;
      }
      return false;
    };

    const isPageEmptyPlaceholder = (children: any[]): boolean => {
      return children.every(node => isBlockEmpty(node));
    };

    const pageContainsActiveBlock = (children: any[]): boolean => {
      return children.some(node => node === activeBlock);
    };

    while (pages.length > 1) {
      const lastPage = pages[pages.length - 1];
      if (isPageEmptyPlaceholder(lastPage) && !pageContainsActiveBlock(lastPage)) {
        pages.pop();
      } else {
        break;
      }
    }

    // Build the structural page nodes
    const PageNodeClass = schema.nodes.page;
    const newPageNodes: any[] = [];
    pages.forEach(children => {
      if (children.length === 0) {
        children.push(schema.nodes.paragraph.create());
      }
      newPageNodes.push(PageNodeClass.create(null, children));
    });

    // High performance reference comparison checks (allows 100% native typing with zero lag if pagination remains intact)
    const arePagesStructureEqual = (currentDoc: any, newNodes: any[]) => {
      if (currentDoc.childCount !== newNodes.length) return false;
      for (let i = 0; i < currentDoc.childCount; i++) {
        const oldPage = currentDoc.child(i);
        const newPage = newNodes[i];
        if (oldPage.childCount !== newPage.childCount) return false;
        for (let j = 0; j < oldPage.childCount; j++) {
          const oldChild = oldPage.child(j);
          const newChild = newPage.child(j);
          if (oldChild !== newChild) return false;
        }
      }
      return true;
    };

    if (arePagesStructureEqual(doc, newPageNodes)) return;

    // Execute atomic safe transaction
    const tr = editor.state.tr;
    tr.setMeta('reflowing', true);
    tr.replaceWith(0, doc.content.size, newPageNodes);

    // Map and restore cursor to matching block
    let targetPos = -1;
    let testPos = 0;
    for (let p = 0; p < newPageNodes.length; p++) {
      testPos += 1; // page open
      const pageNode = newPageNodes[p];
      for (let c = 0; c < pageNode.childCount; c++) {
        const child = pageNode.child(c);
        if (child === activeBlock) {
          targetPos = testPos + Math.min(activeBlockOffset, child.nodeSize);
          break;
        }
        testPos += child.nodeSize;
      }
      if (targetPos !== -1) break;
      testPos += 1; // page close
    }

    if (targetPos !== -1) {
      try {
        const resolved = tr.doc.resolve(Math.min(targetPos, tr.doc.content.size));
        const SelectionClass = selection.constructor;
        // @ts-ignore
        tr.setSelection(SelectionClass.near(resolved));
      } catch (e) {
        console.warn('Could not restore cursor to active block, using fallback map:', e);
      }
    } else {
      try {
        const mappedAnchor = tr.mapping.map(anchor);
        const resolved = tr.doc.resolve(Math.min(mappedAnchor, tr.doc.content.size));
        const SelectionClass = selection.constructor;
        // @ts-ignore
        tr.setSelection(SelectionClass.near(resolved));
      } catch (e) {
        console.warn('Fallback selection resolution failed:', e);
      }
    }

    editor.view.dispatch(tr);
  }, [editor, pageLayout, pageMargin]);

  // Handle global mouseup to ensure we stop painting even if mouse is released outside editor
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      isPaintingRef.current = false;
      lastPaintedPosRef.current = null;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  React.useEffect(() => {
    if (editor && onInit) {
      onInit(editor);
    }
  }, [editor, onInit]);

  React.useEffect(() => {
    if (editor) {
      const handler = () => setActiveSubMenu('main');
      editor.on('selectionUpdate', handler);
      return () => {
        editor.off('selectionUpdate', handler);
      };
    }
  }, [editor]);

  React.useEffect(() => {
    if (!editor || editor.isDestroyed || !typewriterMode) return;

    const handleSelection = () => {
      const { selection } = editor.state;
      if (!selection.empty) return;
      
      requestAnimationFrame(() => {
        try {
          const { view } = editor;
          if (view.state.destroyed) return;
          const coords = view.coordsAtPos(selection.from);
          const scrollContainer = view.dom.closest('main') || document.querySelector('main');
          if (scrollContainer) {
            const rect = scrollContainer.getBoundingClientRect();
            const relativeCursorTop = coords.top - rect.top;
            const targetCenter = rect.height / 2;
            const diff = relativeCursorTop - targetCenter;
            
            if (Math.abs(diff) > 20) {
              scrollContainer.scrollBy({
                top: diff,
                behavior: 'smooth'
              });
            }
          }
        } catch (e) {}
      });
    };

    editor.on('selectionUpdate', handleSelection);
    return () => {
      editor.off('selectionUpdate', handleSelection);
    };
  }, [editor, typewriterMode]);

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
    if (cleanContent !== currentHTML && cleanContent !== lastContentRef.current) {
      lastContentRef.current = cleanContent;
      queueMicrotask(() => {
        if (!editor.isDestroyed) {
          editor.commands.setContent(cleanContent, false);
        }
      });
    }
  }, [content, editor, getNormalizedContent]);

  // Update lastContentRef when editor updates internally
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

  React.useEffect(() => {
    if (!editor) return;
    if (isSimpleMode) return;

    let timer: any;
    const handleTransaction = (props: { transaction: any }) => {
      // Ignore transitions, selections, or metadata changes that do not modify doc structure
      if (props.transaction.getMeta('reflowing')) return;
      if (!props.transaction.docChanged) return;

      clearTimeout(timer);
      timer = setTimeout(() => {
        reflowLayout();
      }, 200); // 200ms debounce ensures zero lag while typing
    };

    editor.on('transaction', handleTransaction);
    reflowLayout();

    return () => {
      editor.off('transaction', handleTransaction);
      clearTimeout(timer);
    };
  }, [editor, reflowLayout, isSimpleMode]);

  return (
    <div className={className}>
      {editor && (
        <BubbleMenu 
          editor={editor} 
          className="flex items-center gap-0.5 bg-white/95 dark:bg-stone-900/95 border border-stone-200 dark:border-stone-800 shadow-xl rounded-full p-1 backdrop-blur-md animate-in fade-in zoom-in duration-200 min-h-[40px]"
        >
          {activeSubMenu === 'main' ? (
            <>
              <button
                onClick={() => {
                  const { from, to } = editor.state.selection;
                  const text = editor.state.doc.textBetween(from, to, ' ');
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

              <Separator orientation="vertical" className="h-4 mx-0.5" />

              <button
                onClick={() => onToggleDrawingArrowMode?.()}
                className={cn(
                  "p-1.5 rounded-full transition-all relative overflow-hidden",
                  isDrawingArrowMode 
                    ? "bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-cyan-600 dark:text-stone-900" 
                    : "hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400"
                )}
                title="Draw Arrow"
              >
                <Pencil className="w-3.5 h-3.5" />
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
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 min-w-[240px]">
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
            </div>
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
                      // Don't auto-close, let user pick multiple if needed or click back
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
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />

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
