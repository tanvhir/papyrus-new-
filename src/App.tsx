import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Editor from '@/src/components/Editor';
import { StationeryBar } from '@/src/components/StationeryBar';
import { FlashcardImport } from '@/src/components/FlashcardImport';
import { StudySession } from '@/src/components/StudySession';
import { FlashcardCreator } from '@/src/components/FlashcardCreator';
import { SettingsModal } from '@/src/components/SettingsModal';
import { HelpCenter } from '@/src/components/HelpCenter';
import { TableOfContents } from '@/src/components/TableOfContents';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';
import { LoginScreen } from '@/src/components/LoginScreen';
import { InstallerOverlay } from '@/src/components/InstallerOverlay';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Palette, 
  Feather, 
  Plus, 
  Check,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Book,
  X,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  PenTool,
  Save,
  Download,
  Upload,
  Clock,
  CloudOff,
  FileText,
  Code,
  ArrowUpRight,
  Divide,
  Minus,
  Pin,
  PinOff,
  Move,
  Printer,
  Scissors,
  Brain,
  GraduationCap,
  Settings,
  HelpCircle,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { CommandPalette } from '@/src/components/CommandPalette';
import { SpiralBinding } from '@/src/components/SpiralBinding';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { PaperTexture, NoteTheme, THEMES, Point, ArrowData, Flashcard, StudyStats, FlashcardType } from '@/src/types';
import { preserveSpaces } from '@/lib/utils';

import localforage from 'localforage';
import { DividerRender } from '@/src/components/DividerRender';
import { DividerData, ImageData } from '@/src/types';
import { DraggableImage } from '@/src/components/DraggableImage';

interface Note {
  id: string;
  title: string;
  content: string;
  stickies: { id: string, text: string, color: string, position?: Point, isPinned?: boolean }[];
  arrows: ArrowData[];
  dividers: DividerData[];
  images: ImageData[];
  texture: PaperTexture;
  themeId: string;
  isHandwriting: boolean;
  fontSize: number;
  pageLayout?: 'pageless' | 'a4-portrait' | 'a4-landscape';
  pageMargin?: 'normal' | 'narrow' | 'none';
  pageLayoutMode?: 'single' | 'book';
  flashcardIds?: string[];
}

interface Subject {
  id: string;
  name: string;
  notes: Note[];
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STICKY_COLORS = [
  { id: 'yellow', bg: 'bg-yellow-200', dot: '#fef08a' },
  { id: 'blue', bg: 'bg-blue-200', dot: '#bfdbfe' },
  { id: 'pink', bg: 'bg-pink-300', dot: '#f9a8d4' },
  { id: 'green', bg: 'bg-green-200', dot: '#bbf7d0' },
  { id: 'orange', bg: 'bg-orange-200', dot: '#fed7aa' },
  { id: 'purple', bg: 'bg-purple-200', dot: '#e9d5ff' },
];

const StickyNote = React.memo(({ 
  id, 
  content, 
  color, 
  position,
  onRemove, 
  onEdit, 
  onTogglePin, 
  onUpdate,
  containerRef, 
  isHandwriting, 
  fontSize, 
  isPinned 
}: { 
  id: string, 
  content: string, 
  color: string, 
  position: Point,
  onRemove: () => void, 
  onEdit: (sticky: {id: string, text: string, color: string, fontSize?: number}) => void, 
  onTogglePin: () => void, 
  onUpdate: (updates: Partial<{ text: string, color: string, position: Point, isPinned: boolean }>) => void,
  containerRef: React.RefObject<HTMLDivElement>, 
  isHandwriting?: boolean, 
  fontSize?: number, 
  isPinned?: boolean 
}) => {
  const colorConfig = STICKY_COLORS.find(c => c.id === color) || STICKY_COLORS[0];
  const bgClass = colorConfig.bg;
  
  const fontClass = isHandwriting ? "font-handwriting" : "font-bangla";
  const proseFontClass = isHandwriting ? "[&_.ProseMirror]:font-handwriting [&_.ProseMirror_p]:font-handwriting [&_.ProseMirror_h1]:font-handwriting [&_.ProseMirror_h2]:font-handwriting [&_.ProseMirror_h3]:font-handwriting" : "[&_.ProseMirror]:font-bangla [&_.ProseMirror_p]:font-bangla [&_.ProseMirror_h1]:font-bangla [&_.ProseMirror_h2]:font-bangla [&_.ProseMirror_h3]:font-bangla";

  return (
    <motion.div 
      drag={!isPinned}
      dragConstraints={containerRef}
      dragElastic={0}
      dragMomentum={false}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        rotate: isPinned ? 0 : 2, 
        opacity: 1,
        x: position.x,
        y: position.y
      }}
      exit={{ scale: 0.5, opacity: 0, filter: "blur(4px)" }}
      whileDrag={{ scale: 1.02, zIndex: 100, rotate: 0 }}
      onDragEnd={(_, info) => {
        onUpdate({ 
          position: { 
            x: position.x + info.offset.x, 
            y: position.y + info.offset.y 
          } 
        });
      }}
      className={cn(
        "absolute p-5 w-[280px] min-h-[240px] paper-shadow z-40 flex flex-col justify-between group overflow-visible select-none transition-shadow duration-300",
        !isPinned && "cursor-grab active:cursor-grabbing hover:shadow-xl",
        isPinned && "ring-2 ring-blue-400/30",
        bgClass,
        fontClass
      )}
      style={{ left: 0, top: 0 }}
    >
      <div className="flex-1 overflow-y-auto pr-1 overflow-x-hidden custom-scrollbar w-full text-stone-800">
        <Editor 
          content={content} 
          editable={false} 
          fontSize={fontSize || 14}
          className="w-full pointer-events-none" 
          editorClass={cn("prose prose-sm prose-stone max-w-none focus:outline-none leading-relaxed pt-2 break-words whitespace-pre-wrap text-stone-800",
                         proseFontClass, fontClass,
                         "[&_.katex-display]:my-2 [&_.katex]:text-base")}
          isSimpleMode={true}
        />
      </div>
      <div data-html2pdf-ignore="true" className="mt-4 flex justify-between items-center z-10 relative opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
        <div className="flex gap-4">
          <button 
            onClick={() => onEdit({id, text: content, color, fontSize})} 
            className="text-[10px] text-stone-500 hover:text-stone-900 uppercase tracking-[0.2em] font-mono font-bold transition-colors cursor-pointer pointer-events-auto flex items-center gap-1.5"
          >
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
          <button 
            onClick={onTogglePin} 
            className={cn(
              "text-[10px] uppercase tracking-[0.2em] font-mono font-bold transition-all cursor-pointer pointer-events-auto flex items-center gap-1.5", 
              isPinned ? "text-blue-600" : "text-stone-500 hover:text-stone-900"
            )}
          >
            {isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
            {isPinned ? 'Unpin' : 'Pin'}
          </button>
        </div>
        <button 
          onClick={onRemove} 
          className="text-[10px] text-stone-300 hover:text-red-500 uppercase tracking-[0.2em] font-mono font-bold transition-colors cursor-pointer pointer-events-auto flex items-center gap-1.5"
        >
          <Trash2 className="w-3 h-3" />
          Remove
        </button>
      </div>
      <div className="absolute top-0 right-0 w-8 h-8 bg-black/5 rounded-bl-full pointer-events-none" />
      {isPinned && (
        <div data-html2pdf-ignore="true" className="absolute -top-3 left-1/2 -translate-x-1/2 z-50 text-blue-500 drop-shadow-sm flex flex-col items-center">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mb-0.5 shadow-sm" />
          <Pin className="w-4 h-4 fill-current" />
        </div>
      )}
    </motion.div>
  );
});

const CurvedArrow = React.memo(({ 
  arrow, 
  onUpdate, 
  onRemove,
  isCleanMode,
  theme,
  scale,
  isSelected,
  onSelect
}: { 
  arrow: ArrowData, 
  onUpdate: (id: string, updates: Partial<ArrowData>) => void,
  onRemove: (id: string) => void,
  isCleanMode: boolean,
  theme: NoteTheme,
  scale: number,
  isSelected: boolean,
  onSelect: (id: string) => void
}) => {
  const [activeHandle, setActiveHandle] = useState<'start' | 'mid' | 'end' | 'move' | null>(null);

  const dragInfo = useRef<{
    active: 'start' | 'mid' | 'end' | 'move' | null;
    startX: number;
    startY: number;
    initialStart: { x: number; y: number };
    initialMid: { x: number; y: number };
    initialEnd: { x: number; y: number };
  }>({
    active: null,
    startX: 0,
    startY: 0,
    initialStart: { x: 0, y: 0 },
    initialMid: { x: 0, y: 0 },
    initialEnd: { x: 0, y: 0 }
  });

  const getPath = () => {
    return `M ${arrow.start.x} ${arrow.start.y} Q ${arrow.mid.x} ${arrow.mid.y} ${arrow.end.x} ${arrow.end.y}`;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, handle: 'start' | 'mid' | 'end' | 'move') => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set pointer capture to ensure smooth tracking even if the cursor moves off the handle element
    e.currentTarget.setPointerCapture(e.pointerId);

    dragInfo.current = {
      active: handle,
      startX: e.clientX,
      startY: e.clientY,
      initialStart: { ...arrow.start },
      initialMid: { ...arrow.mid },
      initialEnd: { ...arrow.end }
    };
    setActiveHandle(handle);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragInfo.current;
    if (!drag.active) return;

    e.preventDefault();
    e.stopPropagation();

    const clientDeltaX = e.clientX - drag.startX;
    const clientDeltaY = e.clientY - drag.startY;

    // Convert deltas based on current page scale factor to eliminate visual drift or offsets
    const deltaX = clientDeltaX / scale;
    const deltaY = clientDeltaY / scale;

    if (drag.active === 'start') {
      onUpdate(arrow.id, {
        start: {
          x: Math.round(drag.initialStart.x + deltaX),
          y: Math.round(drag.initialStart.y + deltaY)
        }
      });
    } else if (drag.active === 'mid') {
      onUpdate(arrow.id, {
        mid: {
          x: Math.round(drag.initialMid.x + deltaX),
          y: Math.round(drag.initialMid.y + deltaY)
        }
      });
    } else if (drag.active === 'end') {
      onUpdate(arrow.id, {
        end: {
          x: Math.round(drag.initialEnd.x + deltaX),
          y: Math.round(drag.initialEnd.y + deltaY)
        }
      });
    } else if (drag.active === 'move') {
      onUpdate(arrow.id, {
        start: {
          x: Math.round(drag.initialStart.x + deltaX),
          y: Math.round(drag.initialStart.y + deltaY)
        },
        mid: {
          x: Math.round(drag.initialMid.x + deltaX),
          y: Math.round(drag.initialMid.y + deltaY)
        },
        end: {
          x: Math.round(drag.initialEnd.x + deltaX),
          y: Math.round(drag.initialEnd.y + deltaY)
        }
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragInfo.current;
    if (!drag.active) return;

    e.currentTarget.releasePointerCapture(e.pointerId);
    dragInfo.current.active = null;
    setActiveHandle(null);
  };

  const showControls = !isCleanMode && (isSelected || activeHandle);

  // Calculate placement boundaries of the arrow to dynamically offset the controller bar
  const minX = Math.min(arrow.start.x, arrow.end.x, arrow.mid.x);
  const maxX = Math.max(arrow.start.x, arrow.end.x, arrow.mid.x);
  const minY = Math.min(arrow.start.y, arrow.end.y, arrow.mid.y);
  const maxY = Math.max(arrow.start.y, arrow.end.y, arrow.mid.y);

  const centerX = (minX + maxX) / 2;

  // Detect small arrow length - if small, shift toolbar more to prevent obstruction of center curve point
  const arrowLength = Math.sqrt((arrow.end.x - arrow.start.x)**2 + (arrow.end.y - arrow.start.y)**2);
  const isSmallArrow = arrowLength < 110;
  const toolbarOffset = isSmallArrow ? 68 : 48;

  // If the arrow is close to the top edge (Y < 50), float the toolbar cleanly below the arrow instead
  const toolbarY = (minY - toolbarOffset) < 15 ? (maxY + toolbarOffset) : (minY - toolbarOffset);
  // Keep the toolbar always within the page lateral margin bounds (850px page)
  const toolbarX = Math.max(120, Math.min(850 - 120, centerX));

  // Elegant collection of ink styles for paper theme
  const arrowColors = [
    { name: 'Contrast Ink', value: (theme.id === 'dark' || theme.id === 'premium-dark') ? '#f5f5f4' : '#1c1917' },
    { name: 'Red Pen', value: '#ef4444' },
    { name: 'Blue Pen', value: '#3b82f6' },
    { name: 'Green Pen', value: '#10b981' },
    { name: 'Purple Marker', value: '#8b5cf6' },
    { name: 'Orange Marker', value: '#f97316' },
  ];

  return (
    <div className={cn("absolute inset-0 pointer-events-none", isSelected ? "z-40" : "z-30")}>
      <svg className="w-full h-full overflow-visible pointer-events-none">
        <defs>
          <marker
            id={`arrowhead-${arrow.id}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={arrow.color} />
          </marker>
        </defs>
        
        {/* Widest Hit Area for Selection */}
        <path
          d={getPath()}
          stroke="transparent"
          strokeWidth="48"
          fill="none"
          className="pointer-events-auto cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(arrow.id);
          }}
        />

        {/* Visible Path */}
        <path
          d={getPath()}
          stroke={arrow.color}
          strokeWidth={isSelected ? "3.5" : "2"}
          fill="none"
          markerEnd={`url(#arrowhead-${arrow.id})`}
          style={{ strokeLinecap: 'round' }}
          className="transition-all duration-200 pointer-events-none"
        />

        {/* Halo Glow for selected */}
        {isSelected && (
          <path
            d={getPath()}
            stroke={arrow.color}
            strokeWidth="10"
            fill="none"
            opacity="0.2"
            className="pointer-events-none"
          />
        )}
      </svg>

      {showControls && (
        <div data-html2pdf-ignore="true" className="contents">
          {/* Start Point Handle */}
          <div
            onPointerDown={(e) => handlePointerDown(e, 'start')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute w-8 h-8 flex items-center justify-center cursor-crosshair pointer-events-auto z-45 group select-none"
            style={{ 
              left: arrow.start.x - 16, 
              top: arrow.start.y - 16,
              touchAction: 'none'
            }}
          >
            <div className={cn(
              "bg-white border-2 border-primary rounded-full shadow-lg transition-transform hover:scale-125",
              isSmallArrow ? "w-3 h-3" : "w-4 h-4"
            )} />
          </div>

          {/* End Point Handle */}
          <div
            onPointerDown={(e) => handlePointerDown(e, 'end')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute w-8 h-8 flex items-center justify-center cursor-crosshair pointer-events-auto z-45 group select-none"
            style={{ 
              left: arrow.end.x - 16, 
              top: arrow.end.y - 16,
              touchAction: 'none'
            }}
          >
            <div className={cn(
              "bg-white border-2 border-stone-800 rounded-full shadow-lg transition-transform hover:scale-125",
              isSmallArrow ? "w-3 h-3" : "w-4 h-4"
            )} />
          </div>

          {/* Curve Control Handle (Green) - Higher Z-Index than start/end handles to be always targets on small sizes */}
          <div
            onPointerDown={(e) => handlePointerDown(e, 'mid')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute w-8 h-8 flex items-center justify-center cursor-pointer pointer-events-auto z-[51] group select-none"
            style={{ 
              left: arrow.mid.x - 16, 
              top: arrow.mid.y - 16,
              touchAction: 'none'
            }}
          >
            <div className="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xl group-hover:scale-125 group-focus:scale-125 transition-all flex items-center justify-center" />
          </div>

          {/* Premium Floating Action Toolbar detached from the arrow bodies to avoid overlapping clutter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            className="absolute pointer-events-auto z-50 flex items-center gap-2 px-2.5 py-1.5 bg-white/95 dark:bg-stone-900/95 border border-stone-200 dark:border-stone-800 shadow-xl rounded-full backdrop-blur-md select-none"
            style={{ 
              left: toolbarX, 
              top: toolbarY,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Grab Grip handle to move the entire curved arrow */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'move')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="flex items-center gap-1 px-2 py-0.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 rounded-full cursor-grab active:cursor-grabbing text-[11px] font-semibold border border-stone-200/50 dark:border-stone-700 transition select-none"
              title="Drag to move arrow"
              style={{ touchAction: 'none' }}
            >
              <Move className="w-3 h-3 text-primary" />
              <span>Drag</span>
            </div>

            <div className="w-px h-3.5 bg-stone-200 dark:bg-stone-800 mx-0.5" />

            {/* Micro color pallet select options */}
            <div className="flex items-center gap-1 px-1">
              {arrowColors.map(c => {
                const isSelectedColor = arrow.color.toLowerCase() === c.value.toLowerCase();
                return (
                  <button
                    key={c.value}
                    onClick={() => onUpdate(arrow.id, { color: c.value })}
                    className={cn(
                      "w-3.5 h-3.5 rounded-full border shadow-sm transition-all hover:scale-125 focus:outline-none relative flex items-center justify-center",
                      isSelectedColor ? "ring-2 ring-primary ring-offset-1 dark:ring-offset-stone-900 scale-110" : "border-stone-300 dark:border-stone-700"
                    )}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  >
                    {isSelectedColor && <Check className="w-2 h-2 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />}
                  </button>
                );
              })}
            </div>

            <div className="w-px h-3.5 bg-stone-200 dark:bg-stone-800 mx-0.5" />

            {/* Quick action delete */}
            <button
              onClick={() => onRemove(arrow.id)}
              className="flex items-center justify-center p-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-colors border border-red-500/20"
              title="Delete Arrow"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
});


const FloatingDivider = React.memo(({ 
  divider, 
  onUpdate, 
  onRemove,
  isCleanMode,
  containerRef,
}: { 
  divider: DividerData, 
  onUpdate: (id: string, updates: Partial<DividerData>) => void,
  onRemove: (id: string) => void,
  isCleanMode: boolean,
  containerRef: React.RefObject<HTMLDivElement>
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragElastic={0.05}
      initial={{ scale: 0.8, opacity: 0, x: divider.position.x, y: divider.position.y }}
      animate={{ scale: 1, opacity: 1, x: divider.position.x, y: divider.position.y }}
      whileDrag={{ scale: 1.02, zIndex: 100 }}
      onDragEnd={(_, info) => {
        onUpdate(divider.id, { 
          position: { 
            x: divider.position.x + info.offset.x, 
            y: divider.position.y + info.offset.y 
          } 
        });
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "absolute cursor-move z-40 group flex items-center justify-center",
        divider.orientation === 'horizontal' ? "min-w-[40px]" : "min-h-[40px]"
      )}
      style={{ 
        left: 0, 
        top: 0,
        width: divider.orientation === 'horizontal' ? divider.length : 'auto',
        height: divider.orientation === 'vertical' ? divider.length : 'auto'
      }}
    >
      <DividerRender 
        data={divider} 
        className="transition-opacity duration-200 w-full h-full" 
      />
      
      {!isCleanMode && isHovered && (
        <button
          data-html2pdf-ignore="true"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(divider.id);
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-red-500 text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all z-50 hover:bg-red-600 hover:scale-110 flex items-center justify-center border-2 border-white dark:border-stone-900 pointer-events-auto"
          title="Remove Separator"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
});

export default function App() {
  const { loggedIn, installed, isLoading: authLoading, logout } = useAuth();
  const { showError, showWarning, showSuccess } = useToast();

  // Configure localforage on mount
  useEffect(() => {
    localforage.config({
      name: 'Papyrus',
      storeName: 'notes'
    });
  }, []);

  // Check for GEMINI_API_KEY on mount
  // Disabled to prevent circular dependency issues in production build
  /*
  useEffect(() => {
    const apiKey = import.meta.env.GEMINI_API_KEY || '';
    if (!apiKey || apiKey === '""' || apiKey === "''") {
      showWarning(
        'API Key Not Configured',
        'GEMINI_API_KEY is not configured on this host. Please set it in your environment or .env file.',
        10000
      );
    }
  }, [showWarning]);
  */

  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: 'default-subject',
      name: 'General Notes',
      notes: [
        {
          id: 'default-note',
          title: 'Chapter 1',
          content: '',
          stickies: [],
          arrows: [],
          dividers: [],
          images: [],
          texture: 'laid',
          themeId: 'light',
          isHandwriting: true,
          fontSize: 18,
          pageLayout: 'a4-portrait',
        }
      ]
    }
  ]);

  const [activeNoteId, setActiveNoteId] = useState('default-note');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [studyStats, setStudyStats] = useState<StudyStats>({
    totalStudied: 0,
    streak: 0,
    lastStudyDate: new Date().toISOString(),
    weakConceptIds: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [isStudySessionActive, setIsStudySessionActive] = useState(false);
  const [creationCardData, setCreationCardData] = useState<{ front: string; back: string; type: FlashcardType } | null>(null);
  const [isSelectingBackActive, setIsSelectingBackActive] = useState(false);
  const [fileHandle, setFileHandle] = useState<any>(null);
  const [activeHighlighterColor, setActiveHighlighterColor] = useState<string | null>(null);
  
  const [isCleanMode, setIsCleanMode] = useState(false);
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const notebookWrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [mainHeight, setMainHeight] = useState(1000);
  const [spiralHeight, setSpiralHeight] = useState(1000);
  const [pageLayout, setPageLayout] = useState<'pageless' | 'a4-portrait' | 'a4-landscape'>('a4-portrait');
  const [pageMargin, setPageMargin] = useState<'normal' | 'narrow' | 'none'>('normal');
  const [pageLayoutMode, setPageLayoutMode] = useState<'single' | 'book'>('single');
  const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem('academic_custom_api_key') || '');
  const [customModel, setCustomModel] = useState<string>(() => localStorage.getItem('academic_custom_model') || 'gemma-4-31b-it');
  const [highlightStyle, setHighlightStyle] = useState<'balanced' | 'generous' | 'none'>(() => (localStorage.getItem('academic_highlight_style') as 'balanced' | 'generous' | 'none') || 'balanced');
  
  // New toggles for disabling specific AI features as requested by the user
  const [disableAIFlashcards, setDisableAIFlashcards] = useState<boolean>(() => localStorage.getItem('academic_disable_ai_flashcards') !== 'false');
  const [disableAIArrows, setDisableAIArrows] = useState<boolean>(() => localStorage.getItem('academic_disable_ai_arrows') === 'true');
  const [disableAIStickies, setDisableAIStickies] = useState<boolean>(() => localStorage.getItem('academic_disable_ai_stickies') !== 'false');
  const [disableAIDividers, setDisableAIDividers] = useState<boolean>(() => localStorage.getItem('academic_disable_ai_dividers') === 'true');
  const [disableAIImages, setDisableAIImages] = useState<boolean>(() => localStorage.getItem('academic_disable_ai_images') !== 'false');
  const [disableAIColumns, setDisableAIColumns] = useState<boolean>(() => localStorage.getItem('academic_disable_ai_columns') === 'true');
  const [allowNoteEnhancement, setAllowNoteEnhancement] = useState<boolean>(() => localStorage.getItem('academic_allow_note_enhancement') !== 'false');
  const [enableCleaning, setEnableCleaning] = useState<boolean>(() => localStorage.getItem('academic_enable_cleaning') !== 'false');

  const handleUpdateCustomApiKey = (key: string) => {
    setCustomApiKey(key);
    localStorage.setItem('academic_custom_api_key', key);
  };

  const handleUpdateCustomModel = (model: string) => {
    setCustomModel(model);
    localStorage.setItem('academic_custom_model', model);
  };

  const handleUpdateHighlightStyle = (style: 'balanced' | 'generous' | 'none') => {
    setHighlightStyle(style);
    localStorage.setItem('academic_highlight_style', style);
  };

  const handleUpdateDisableAIFlashcards = (disabled: boolean) => {
    setDisableAIFlashcards(disabled);
    localStorage.setItem('academic_disable_ai_flashcards', String(disabled));
  };

  const handleUpdateDisableAIArrows = (disabled: boolean) => {
    setDisableAIArrows(disabled);
    localStorage.setItem('academic_disable_ai_arrows', String(disabled));
  };

  const handleUpdateDisableAIStickies = (disabled: boolean) => {
    setDisableAIStickies(disabled);
    localStorage.setItem('academic_disable_ai_stickies', String(disabled));
  };

  const handleUpdateDisableAIDividers = (disabled: boolean) => {
    setDisableAIDividers(disabled);
    localStorage.setItem('academic_disable_ai_dividers', String(disabled));
  };

  const handleUpdateDisableAIImages = (disabled: boolean) => {
    setDisableAIImages(disabled);
    localStorage.setItem('academic_disable_ai_images', String(disabled));
  };

  const handleUpdateDisableAIColumns = (disabled: boolean) => {
    setDisableAIColumns(disabled);
    localStorage.setItem('academic_disable_ai_columns', String(disabled));
  };

  const handleUpdateAllowNoteEnhancement = (allowed: boolean) => {
    setAllowNoteEnhancement(allowed);
    localStorage.setItem('academic_allow_note_enhancement', String(allowed));
  };

  const handleUpdateEnableCleaning = (enabled: boolean) => {
    setEnableCleaning(enabled);
    localStorage.setItem('academic_enable_cleaning', String(enabled));
  };

  const BUILTIN_MODELS = [
    'gemma-4-31b-it',
    'gemini-2.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
  ];

  const [isCustomModelActive, setIsCustomModelActive] = useState(() => {
    const model = localStorage.getItem('academic_custom_model') || 'gemini-2.5-flash';
    return !BUILTIN_MODELS.includes(model);
  });
  const [customModelInput, setCustomModelInput] = useState(() => {
    const model = localStorage.getItem('academic_custom_model') || '';
    return !BUILTIN_MODELS.includes(model) ? model : '';
  });
  const [bookScrollWidth, setBookScrollWidth] = useState(820);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const canvasWidth = pageLayout === 'a4-landscape' ? 1160 : pageLayout === 'a4-portrait' ? 820 : 850;

  const PAGE_GAP = 36;
  const isBookMode = pageLayout !== 'pageless' && pageLayoutMode === 'book';
  const pageHeight = pageLayout === 'a4-portrait' ? 1160 : pageLayout === 'a4-landscape' ? 820 : 0;

  const marginX = useMemo(() => {
    if (pageLayout === 'pageless') return 0;
    return pageMargin === 'none' ? 0 : pageMargin === 'narrow' ? 32 : 64;
  }, [pageLayout, pageMargin]);

  const marginY = useMemo(() => {
    if (pageLayout === 'pageless') return 0;
    return pageMargin === 'none' ? 0 : pageMargin === 'narrow' ? 32 : 64;
  }, [pageLayout, pageMargin]);

  const getVisualPosition = useCallback((pos: Point) => {
    if (pageLayout === 'pageless' || pageHeight <= 0) return pos;

    if (isBookMode) {
      const usableHeight = pageHeight - 2 * marginY;
      const pageIndex = Math.floor(pos.y / Math.max(1, usableHeight));
      const offsetY = pos.y % Math.max(1, usableHeight);

      return {
        x: pageIndex * (canvasWidth + PAGE_GAP) + marginX + pos.x,
        y: marginY + offsetY
      };
    } else {
      // Single continuous page mode
      const pageIndex = Math.floor(pos.y / pageHeight);
      const offsetY = pos.y % pageHeight;
      return {
        x: pos.x,
        y: pageIndex * (pageHeight + 64) + 24 + offsetY
      };
    }
  }, [pageLayout, isBookMode, pageHeight, canvasWidth, marginX, marginY]);

  const getCanvasPosition = useCallback((visualX: number, visualY: number) => {
    if (pageLayout === 'pageless' || pageHeight <= 0) return { x: visualX, y: visualY };

    if (isBookMode) {
      const usableHeight = pageHeight - 2 * marginY;
      const usableWidth = canvasWidth - 2 * marginX;
      
      const pageSlotWidth = canvasWidth + PAGE_GAP;
      const pageIndex = Math.floor(visualX / Math.max(1, pageSlotWidth));
      const offsetX = visualX % Math.max(1, pageSlotWidth);

      const canvasX = Math.max(0, Math.min(offsetX - marginX, usableWidth));
      const canvasY = pageIndex * usableHeight + Math.max(0, Math.min(visualY - marginY, usableHeight));

      return { x: canvasX, y: canvasY };
    } else {
      // Single continuous page mode
      const y_normalized = visualY - 24;
      let pageIndex = Math.floor(y_normalized / (pageHeight + 64));
      let offsetY_candidate = y_normalized % (pageHeight + 64);

      if (offsetY_candidate < 0) {
        pageIndex = 0;
        offsetY_candidate = 0;
      }

      let offsetY = offsetY_candidate;
      if (offsetY_candidate >= pageHeight) {
        const gapOffset = offsetY_candidate - pageHeight;
        if (gapOffset < 32) {
          offsetY = pageHeight - 1;
        } else {
          pageIndex += 1;
          offsetY = 0;
        }
      }

      const canvasY = pageIndex * pageHeight + offsetY;
      return { x: visualX, y: canvasY };
    }
  }, [pageLayout, isBookMode, pageHeight, canvasWidth, marginX, marginY]);

  const adjustStickyPos = useCallback((pos: Point, height = 240) => {
    if (pageLayout === 'pageless' || pageHeight <= 0) return pos;
    
    const pageIndex = Math.max(0, Math.floor((pos.y + height / 2) / pageHeight));
    const pageStart = pageIndex * pageHeight + marginY + 12;
    const pageEnd = (pageIndex + 1) * pageHeight - marginY - 12;
    
    let adjustedY = pos.y;
    if (adjustedY < pageStart) {
      adjustedY = pageStart;
    } else if (adjustedY + height > pageEnd) {
      adjustedY = pageEnd - height;
    }
    
    return { x: pos.x, y: adjustedY };
  }, [pageLayout, pageHeight, marginY]);

  const adjustDividerPos = useCallback((pos: Point, orientation: 'horizontal' | 'vertical', length = 200) => {
    if (pageLayout === 'pageless' || pageHeight <= 0) return pos;
    
    const height = orientation === 'vertical' ? length : 20;
    const pageIndex = Math.max(0, Math.floor((pos.y + height / 2) / pageHeight));
    const pageStart = pageIndex * pageHeight + marginY + 8;
    const pageEnd = (pageIndex + 1) * pageHeight - marginY - 8;
    
    let adjustedY = pos.y;
    if (adjustedY < pageStart) {
      adjustedY = pageStart;
    } else if (adjustedY + height > pageEnd) {
      adjustedY = pageEnd - height;
    }
    
    return { x: pos.x, y: adjustedY };
  }, [pageLayout, pageHeight, marginY]);

  const getViewportCenterY = useCallback(() => {
    if (!containerRef.current) return 200;
    const scrollY = containerRef.current.scrollTop || 0;
    const clientHeight = containerRef.current.clientHeight || 500;
    const targetScaledY = scrollY + (clientHeight / 3);
    return targetScaledY / Math.max(scale, 0.1);
  }, [scale]);

  // Load data from Cloud DB or IndexedDB fallback on mount
  useEffect(() => {
    async function loadData() {
      if (authLoading) return;
      
      if (!installed || !loggedIn) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch workspace from PHP notes list api
        const workspaceRes = await fetch('/api/notes/list.php');
        const workspaceData = await workspaceRes.json();
        
        if (workspaceData.success) {
          if (workspaceData.subjects && workspaceData.subjects.length > 0) {
            setSubjects(workspaceData.subjects);
          }
          if (workspaceData.activeNoteId) {
            setActiveNoteId(workspaceData.activeNoteId);
          }
          if (workspaceData.studyStats) {
            setStudyStats(workspaceData.studyStats);
          }
        } else {
          console.warn("Failed to load Cloud workspace, fall back to local:", workspaceData.message);
          const savedSubjects = await localforage.getItem<Subject[]>('papyrus-subjects');
          const savedActiveId = await localforage.getItem<string>('papyrus-active-note-id');
          const savedStudyStats = await localforage.getItem<StudyStats>('papyrus-study-stats');
          if (savedSubjects) setSubjects(savedSubjects);
          if (savedActiveId) setActiveNoteId(savedActiveId);
          if (savedStudyStats) setStudyStats(savedStudyStats);
        }

        // Fetch cards from PHP flashcards list api
        const cardsRes = await fetch('/api/flashcards/list.php');
        const cardsData = await cardsRes.json();
        
        if (cardsData.success && cardsData.flashcards) {
          setFlashcards(cardsData.flashcards);
        } else {
          console.warn("Failed to load Cloud flashcards, fall back to local:", cardsData.message);
          const savedFlashcards = await localforage.getItem<Flashcard[]>('papyrus-flashcards');
          if (savedFlashcards) setFlashcards(savedFlashcards);
        }
        
        // Handle native handles if needed
        const savedHandle = await localforage.getItem<any>('papyrus-file-handle');
        if (savedHandle) {
          try {
            if (await (savedHandle as any).queryPermission({ mode: 'readwrite' }) === 'granted') {
              setFileHandle(savedHandle);
            }
          } catch (e) {
            console.log('Permission to file lost or handle stale');
          }
        }
      } catch (err) {
        console.error('Failed to load data from persistence:', err);
      } finally {
        setIsLoading(false);
        setHasLoadedInitialData(true);
      }
    }
    loadData();
  }, [authLoading, loggedIn, installed]);

  // Keyboard shortcut for Clean Mode (Alt+Z) & Escape to cancel drawing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        setIsCleanMode(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsDrawingArrowMode(false);
        setDrawingPoints([]);
        setIsDraggingDraw(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle page scaling beautifully based on parent container width
  useEffect(() => {
    if (!containerRef.current) return;
    const parent = containerRef.current;
    
    const updateScale = () => {
      const parentWidth = parent.clientWidth;
      // Subtracting standard padding based on screens
      const padding = window.innerWidth >= 768 ? 96 : 64;
      const targetWidth = canvasWidth;
      
      const availableWidth = parentWidth - padding;
      if (availableWidth < targetWidth) {
        setScale(Math.max(0.1, availableWidth / targetWidth));
      } else {
        setScale(1);
      }
    };
    
    updateScale();
    
    const observer = new ResizeObserver(updateScale);
    observer.observe(parent);
    window.addEventListener('resize', updateScale);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [isCleanMode, canvasWidth]);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  // Volatile states for active note
  const [content, setContent] = useState('');
  const [texture, setTexture] = useState<PaperTexture>('laid');
  const [theme, setTheme] = useState<NoteTheme>(THEMES[0]);
  const [notebookStyle, setNotebookStyle] = useState<'classic' | 'spiral'>('spiral');
  const [stickies, setStickies] = useState<{ id: string, text: string, color: string, position?: Point, fontSize?: number, isPinned?: boolean }[]>([]);
  const [arrows, setArrows] = useState<ArrowData[]>([]);
  const [dividers, setDividers] = useState<DividerData[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [isHandwriting, setIsHandwriting] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [selectedArrowId, setSelectedArrowId] = useState<string | null>(null);

  // Pencil / Mouse Pen-to-Arrow Drawing Mode States
  const [isDrawingArrowMode, setIsDrawingArrowMode] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [isDraggingDraw, setIsDraggingDraw] = useState(false);

  const [editor, setEditor] = useState<any>(null);
  const [stickyEditor, setStickyEditor] = useState<any>(null);
  const [editingStickyId, setEditingStickyId] = useState<string | null>(null);

  // Keep track of mainAreaRef's exact boundary height to adjust wrapper cleanly
  useEffect(() => {
    if (!mainAreaRef.current) return;
    
    const container = mainAreaRef.current;
    let observer: ResizeObserver | null = null;
    let pmObserved: HTMLElement | null = null;
    let pcObserved: HTMLElement | null = null;

    const setupObserver = () => {
      if (observer) {
        observer.disconnect();
      }

      observer = new ResizeObserver(() => {
        if (!container) return;

        // Measure horizontal scroll width of paper content in book mode
        const paperContent = container.querySelector('.print-paper-content') as HTMLElement;
        if (paperContent) {
          setBookScrollWidth(paperContent.scrollWidth);
        }

        const proseMirror = container.querySelector('.ProseMirror') as HTMLElement;
        if (proseMirror) {
          // The true text height of the Editor flow
          const textHeight = proseMirror.offsetHeight || proseMirror.scrollHeight;
          
          let pageMarginsPadding = 192; // Default normal margin
          if (pageMargin === 'none') {
            pageMarginsPadding = 32;
          } else if (pageMargin === 'narrow') {
            pageMarginsPadding = 80;
          } else {
            pageMarginsPadding = 192;
          }

          const naturalHeight = textHeight + pageMarginsPadding;
          if (naturalHeight > 0) {
            setMainHeight(naturalHeight);
          }
          // Use actual content height for spiral binding to avoid extra loops beyond content
          setSpiralHeight(textHeight + 64);
        } else if (paperContent) {
          // Fallback if ProseMirror is not active yet
          const contentHeight = paperContent.scrollHeight || paperContent.offsetHeight;
          if (contentHeight > 0) {
            setMainHeight(contentHeight);
            setSpiralHeight(contentHeight);
          }
        } else {
          const rectHeight = container.getBoundingClientRect().height;
          if (rectHeight > 0) {
            setMainHeight(rectHeight);
            setSpiralHeight(rectHeight);
          }
        }

        // Dynamically attach/re-attach to ProseMirror or paperContent if we haven't yet
        const currentPm = container.querySelector('.ProseMirror') as HTMLElement;
        const currentPc = container.querySelector('.print-paper-content') as HTMLElement;
        
        if (currentPm && currentPm !== pmObserved && observer) {
          observer.observe(currentPm);
          pmObserved = currentPm;
        }
        if (currentPc && currentPc !== pcObserved && observer) {
          observer.observe(currentPc);
          pcObserved = currentPc;
        }
      });

      observer.observe(container);
      
      const currentPm = container.querySelector('.ProseMirror') as HTMLElement;
      const currentPc = container.querySelector('.print-paper-content') as HTMLElement;
      if (currentPm) {
        observer.observe(currentPm);
        pmObserved = currentPm;
      }
      if (currentPc) {
        observer.observe(currentPc);
        pcObserved = currentPc;
      }
    };

    setupObserver();

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [pageLayoutMode, pageMargin, editor]);

  // Auto-save logic
  useEffect(() => {
    if (isLoading || !hasLoadedInitialData) return; // Don't save while loading initial data

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        // Core DB Save
        await localforage.setItem('papyrus-subjects', subjects);
        await localforage.setItem('papyrus-active-note-id', activeNoteId);
        await localforage.setItem('papyrus-flashcards', flashcards);
        await localforage.setItem('papyrus-study-stats', studyStats);

        // Core Cloud Sync
        if (loggedIn && installed) {
          try {
            await fetch('/api/notes/save.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subjects, activeNoteId, studyStats })
            });
            await fetch('/api/flashcards/save.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ flashcards })
            });
          } catch (cloudErr) {
            console.error('Cloud Sync failed, data preserved locally:', cloudErr);
          }
        }

        // Native Sync Logic
        if (fileHandle) {
          try {
            const writable = await (fileHandle as any).createWritable();
            await writable.write(JSON.stringify({
              version: '1.2',
              lastModified: new Date().toISOString(),
              data: subjects,
              flashcards,
              studyStats
            }, null, 2));
            await writable.close();
          } catch (fileErr) {
            console.error('Native File Sync failed:', fileErr);
          }
        }

        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [subjects, activeNoteId, flashcards, studyStats, isLoading, hasLoadedInitialData, fileHandle, loggedIn, installed]);

  // Connect/Restore local file
  const requestNativeFile = async () => {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: 'my-notebook.papyrus',
        types: [{
          description: 'Papyrus Notebook',
          accept: { 'application/json': ['.papyrus'] },
        }],
      });
      
      setFileHandle(handle);
      await localforage.setItem('papyrus-file-handle', handle);
      
      // Initial write
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify({
        version: '1.2',
        lastModified: new Date().toISOString(),
        data: subjects
      }, null, 2));
      await writable.close();
    } catch (err) {
      console.error('Could not connect to file:', err);
    }
  };
  const getActiveContext = () => {
    for (const subject of subjects) {
      const note = subject.notes.find(n => n.id === activeNoteId);
      if (note) return { subject, note };
    }
    return null;
  };

  // Sync active note states when switching notes
  useEffect(() => {
    const context = getActiveContext();
    if (context) {
      const { note } = context;
      setContent(note.content);
      setTexture(note.texture);
      const matchedTheme = THEMES.find(t => t.id === note.themeId) || THEMES[0];
      setTheme(matchedTheme);
      setStickies(note.stickies);
      setArrows(note.arrows || []);
      setDividers(note.dividers || []);
      setImages(note.images || []);
      setIsHandwriting(note.isHandwriting);
      setFontSize(note.fontSize || 18);
      setPageLayout(note.pageLayout || 'a4-portrait');
      setPageMargin(note.pageMargin || 'normal');
      setPageLayoutMode(note.pageLayoutMode || 'single');
    }
  }, [activeNoteId]);

  // Update subjects collection when volatile states change
  useEffect(() => {
    setSubjects(prev => prev.map(s => ({
      ...s,
      notes: s.notes.map(n => n.id === activeNoteId ? {
        ...n,
        content,
        texture,
        themeId: theme.id,
        stickies,
        arrows,
        dividers,
        isHandwriting,
        fontSize,
        pageLayout,
        pageMargin,
        pageLayoutMode,
        notebookStyle
      } : n)
    })));
  }, [content, texture, theme, stickies, arrows, dividers, isHandwriting, fontSize, pageLayout, pageMargin, pageLayoutMode, notebookStyle, activeNoteId]);

  const exportPageToPDF = async () => {
    if (!mainAreaRef.current) return;
    
    const originalMode = pageLayoutMode;
    setIsExportingPDF(true);
    
    if (originalMode === 'book') {
      setPageLayoutMode('single');
    }
    
    // Small delay to ensure all transitions finish and the DOM is settled
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const activeContext = getActiveContext();
      const subjectName = activeContext?.subject.name || 'Subject';
      const noteTitle = activeContext?.note.title || 'Note';
      const fileName = `${subjectName} - ${noteTitle}.pdf`;
      
      const isLandscape = pageLayout === 'a4-landscape';
      const pdfWidth = isLandscape ? 841.89 : 595.28;
      const pdfHeight = isLandscape ? 595.28 : 841.89;
      
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const paperColorHex = theme.paperColor || '#ffffff';

      const html2canvasOptions = {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: notebookStyle === 'spiral' ? null : (theme.id === 'dark' || theme.id === 'charcoal' || theme.id === 'premium-dark') ? '#0A0A0A' : paperColorHex,
        scrollY: 0,
        scrollX: 0,
        windowWidth: mainAreaRef.current.offsetWidth,
        onclone: (clonedDoc: Document) => {
          const header = clonedDoc.querySelector('.no-print');
          if (header) (header as HTMLElement).style.display = 'none';
        }
      };

      if (pageLayout === 'pageless') {
        const element = mainAreaRef.current;
        const fullHeight = element.scrollHeight;
        const fullWidth = element.offsetWidth;

        const canvas = await html2canvas(element, {
          ...html2canvasOptions,
          width: fullWidth,
          height: fullHeight,
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const ratio = pdfWidth / fullWidth;
        const canvasPageHeight = pdfHeight / ratio;
        const totalPages = Math.ceil(fullHeight / canvasPageHeight);
        
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) pdf.addPage();
          const position = -(i * pdfHeight);
          const scaledHeight = fullHeight * ratio;
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight, undefined, 'FAST');
        }
      } else {
        // High fidelity PAGINATED export: exact node-by-node canvas export
        const editorEl = document.querySelector('.ProseMirror');
        if (!editorEl) throw new Error('Editor element not found');

        // For spiral notebook mode, capture the entire wrapper to include spiral binding and styling
        if (notebookStyle === 'spiral' && notebookWrapperRef.current) {
          const element = notebookWrapperRef.current;
          const fullHeight = element.scrollHeight + 50; // Add extra height for last page bottom border/shadow
          const fullWidth = element.offsetWidth;

          const canvas = await html2canvas(element, {
            ...html2canvasOptions,
            width: fullWidth,
            height: fullHeight,
            letterRendering: true,
          });

          const imgData = canvas.toDataURL('image/png');
          const ratio = pdfWidth / fullWidth;
          // Use actual DOM page height for slicing (pageHeight + PAGE_GAP)
          const domPageHeight = pageHeight + PAGE_GAP;
          const canvasPageHeight = domPageHeight * ratio;
          // Count actual page nodes to determine exact page count
          const editorEl = document.querySelector('.ProseMirror');
          const pageDoms = editorEl ? Array.from(editorEl.querySelectorAll('.page-container-node')) as HTMLElement[] : [];
          const totalPages = pageDoms.length > 0 ? pageDoms.length : Math.ceil(fullHeight / domPageHeight);

          for (let i = 0; i < totalPages; i++) {
            if (i > 0) pdf.addPage();
            const position = -(i * canvasPageHeight);
            const scaledHeight = fullHeight * ratio;
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight, undefined, 'FAST');
          }
        } else {
          // Classic mode: capture individual page nodes
          const pageDoms = Array.from(editorEl.querySelectorAll('.page-container-node')) as HTMLElement[];
          if (pageDoms.length === 0) {
            // Fallback to container canvas in case no page Doms were found
            const element = mainAreaRef.current;
            const canvas = await html2canvas(element, {
              ...html2canvasOptions,
              width: element.offsetWidth,
              height: element.offsetHeight,
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
          } else {
            for (let i = 0; i < pageDoms.length; i++) {
              if (i > 0) {
                pdf.addPage();
              }
              const pageEl = pageDoms[i];
              const canvas = await html2canvas(pageEl, {
                ...html2canvasOptions,
                backgroundColor: (theme.id === 'dark' || theme.id === 'charcoal' || theme.id === 'premium-dark') ? '#121212' : paperColorHex,
                width: pageEl.clientWidth,
                height: pageEl.clientHeight,
                scrollY: 0,
                scrollX: 0,
              });
              const imgData = canvas.toDataURL('image/jpeg', 0.98);
              pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            }
          }
        }
      }
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF client-side:', error);
    } finally {
      setIsExportingPDF(false);
      setPageLayoutMode(originalMode);
    }
  };

  const exportPDFPrint = () => {
    window.print();
  };

  const addNewSubject = (): string => {
    const newId = Date.now().toString();
    const newSubject: Subject = {
      id: newId,
      name: 'New Subject',
      notes: [
        {
          id: `note-${newId}`,
          title: 'New Chapter',
          content: '',
          stickies: [],
          arrows: [],
          dividers: [],
          images: [],
          texture: 'laid',
          themeId: 'light',
          isHandwriting: true,
          fontSize: 18,
          pageLayout: 'a4-portrait',
        }
      ]
    };
    setSubjects([...subjects, newSubject]);
    setActiveNoteId(`note-${newId}`);
    return newId;
  };

  const addNewNote = (subjectId: string): string => {
    const newId = Date.now().toString();
    const newNote: Note = {
      id: newId,
      title: 'New Chapter',
      content: '',
      stickies: [],
      arrows: [],
      dividers: [],
      images: [],
      texture: 'laid',
      themeId: 'light',
      isHandwriting: true,
      fontSize: 18,
      pageLayout: 'a4-portrait',
    };
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, notes: [...s.notes, newNote] } : s));
    setActiveNoteId(newId);
    return newId;
  };

  const handleStartStudy = (mode: 'all' | 'due' | 'weak' | 'deck' | 'note', targetId?: string) => {
    let queue: Flashcard[] = [];
    const now = new Date();

    if (mode === 'all') {
      queue = [...flashcards];
    } else if (mode === 'due') {
      queue = flashcards.filter(c => new Date(c.nextReviewDate) <= now);
    } else if (mode === 'weak') {
      queue = flashcards.filter(c => c.difficulty === 1 || c.difficulty === 2 || (c.reviewCount > 0 && c.easeFactor < 2.1));
    } else if (mode === 'deck' && targetId) {
      queue = flashcards.filter(c => c.subjectId === targetId);
    } else if (mode === 'note' && targetId) {
      queue = flashcards.filter(c => c.sourceNoteId === targetId);
    }

    if (queue.length === 0) {
      if (mode === 'weak') {
        showWarning("No weak concepts", "Excellent! You currently have no weak concepts flagged. Select 'Again' or 'Hard' on any card to repeat it!");
      } else {
        showWarning("No cards found", "No cards found for this criteria. Add and link study cards to get started.");
      }
      return;
    }

    setStudyQueue(queue.sort(() => Math.random() - 0.5));
    setIsStudySessionActive(true);
  };

  const handleCreateFlashcard = (text: string) => {
    const context = getActiveContext();
    if (!context) return;

    // Open high-fidelity inline card editor instead of silent alert!
    setCreationCardData({
      front: text,
      back: '',
      type: text.includes('{{') ? 'cloze' : 'basic'
    });
  };

  const finalizeFlashcardCreation = (front: string, back: string, type: FlashcardType) => {
    const context = getActiveContext();
    if (!context) return;

    const newCard: Flashcard = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      front,
      back,
      subjectId: context.subject.id,
      chapterId: context.note.id,
      sourceNoteId: context.note.id,
      tags: [],
      interval: 1,
      easeFactor: 2.5,
      reviewCount: 0,
      difficulty: 0,
      nextReviewDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setFlashcards(prev => [...prev, newCard]);
    setCreationCardData(null);
  };

  const handleRateSingleCard = (cardId: string, q: number) => {
    setFlashcards(prev => prev.map(card => {
      if (card.id !== cardId) return card;

      let { interval, easeFactor, reviewCount } = card;

      if (q >= 3) {
        if (reviewCount === 0) interval = 1;
        else if (reviewCount === 1) interval = 6;
        else interval = Math.round(interval * easeFactor);
        
        reviewCount += 1;
        easeFactor = Math.max(1.3, easeFactor + (0.1 - (4 - q) * (0.08 + (4 - q) * 0.02)));
      } else {
        reviewCount = 0;
        interval = 1;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
      }

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + interval);

      return {
        ...card,
        interval,
        easeFactor,
        reviewCount,
        difficulty: q,
        nextReviewDate: nextDate.toISOString(),
        lastStudiedAt: new Date().toISOString()
      };
    }));

    setStudyStats(prev => {
      const isCardWeak = q === 1 || q === 2;
      let newWeakIds = prev.weakConceptIds || [];
      if (isCardWeak) {
        if (!newWeakIds.includes(cardId)) {
          newWeakIds = [...newWeakIds, cardId];
        }
      } else {
        newWeakIds = newWeakIds.filter(id => id !== cardId);
      }

      const today = new Date().toDateString();
      const lastDateString = prev.lastStudyDate ? new Date(prev.lastStudyDate).toDateString() : '';
      let newStreak = prev.streak || 0;
      if (lastDateString !== today) {
        if (!prev.lastStudyDate) {
          newStreak = 1;
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastDateString === yesterday.toDateString()) {
            newStreak = (prev.streak || 0) + 1;
          } else {
            newStreak = 1;
          }
        }
      }

      return {
        ...prev,
        totalStudied: prev.totalStudied + 1,
        lastStudyDate: new Date().toISOString(),
        streak: newStreak,
        weakConceptIds: newWeakIds
      };
    });
  };

  const onStudyFinish = (results: { cardId: string; difficulty: number }[], stats: Partial<StudyStats>) => {
    setIsStudySessionActive(false);
  };

  const handleUpdateCardInSession = (updatedCard: Flashcard) => {
    setFlashcards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    setStudyQueue(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  const handleDeleteCardInSession = (cardId: string) => {
    setFlashcards(prev => prev.filter(c => c.id !== cardId));
    setStudyQueue(prev => prev.filter(c => c.id !== cardId));
  };

  const handleFlashcardImport = (newCards: Flashcard[]) => {
    setFlashcards(prev => [...prev, ...newCards]);
    setIsImportOpen(false);
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const allNotesCount = subjects.reduce((acc, s) => acc + s.notes.length, 0);
    if (allNotesCount === 1) return;

    setSubjects(prev => {
      const updated = prev.map(s => ({
        ...s,
        notes: s.notes.filter(n => n.id !== id)
      })).filter(s => s.notes.length > 0 || prev.length === 1); // Keep subjects with notes or at least one subject
      
      // If active note was deleted, switch to another
      if (activeNoteId === id) {
        const remainingNote = updated.find(s => s.notes.length > 0)?.notes[0];
        if (remainingNote) setActiveNoteId(remainingNote.id);
      }
      return updated;
    });
  };

  const deleteSubject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (subjects.length === 1) return;
    
    const subjectToDelete = subjects.find(s => s.id === id);
    const isDeletingActive = subjectToDelete?.notes.some(n => n.id === activeNoteId);
    
    const newSubjects = subjects.filter(s => s.id !== id);
    setSubjects(newSubjects);
    
    if (isDeletingActive) {
      setActiveNoteId(newSubjects[0].notes[0].id);
    }
  };

  const renameNote = (id: string, newTitle: string) => {
    setSubjects(prev => prev.map(s => ({
      ...s,
      notes: s.notes.map(n => n.id === id ? { ...n, title: newTitle } : n)
    })));
  };

  const renameSubject = (id: string, newName: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  // Modal States
  const [activeModal, setActiveModal] = useState<'sticky' | 'math' | 'image' | null>(null);
  const [modalInput, setModalInput] = useState('');
  const [stickyColor, setStickyColor] = useState('yellow');
  const [stickyFontSize, setStickyFontSize] = useState(14);

  const handleFormat = useCallback((type: string, value?: any) => {
    const targetEditor = activeModal === 'sticky' ? stickyEditor : editor;
    if (!targetEditor) return;
    targetEditor.chain().focus();
    
    if (type === 'bold') targetEditor.chain().focus().toggleBold().run();
    else if (type === 'italic') targetEditor.chain().focus().toggleItalic().run();
    else if (type === 'underline') targetEditor.chain().focus().toggleUnderline().run();
    else if (type === 'subscript') targetEditor.chain().focus().toggleSubscript().run();
    else if (type === 'superscript') targetEditor.chain().focus().toggleSuperscript().run();
    else if (type === 'h1') targetEditor.chain().focus().toggleHeading({ level: 1 }).run();
    else if (type === 'h2') targetEditor.chain().focus().toggleHeading({ level: 2 }).run();
    else if (type === 'h3') targetEditor.chain().focus().toggleHeading({ level: 3 }).run();
    else if (type === 'hr') targetEditor.chain().focus().setHorizontalRule().run();
    else if (type === 'decorative-hr') {
      if (activeModal === 'sticky') {
        targetEditor.chain().focus().insertContent({
          type: 'decorativeDivider',
          attrs: { ...value, id: Math.random().toString(36).substr(2, 9) }
        }).run();
        return;
      }

      if (!mainAreaRef.current) return;
      const centerY = getViewportCenterY();
      const centerX = window.innerWidth / 2;

      let initialX = centerX - 100;
      if (value.orientation === 'horizontal') {
        if (value.length === '100%') initialX = 0;
        else if (value.length === '75%') initialX = (window.innerWidth * 0.125);
        else if (value.length === '50%') initialX = (window.innerWidth * 0.25);
        else if (value.length === '25%') initialX = (window.innerWidth * 0.375);
        
        // Ensure it's relative to the main area if necessary
        // But since we use absolute in main area, x=0 is left of main area
        if (value.length === '100%') initialX = 0;
        else {
           // For non-100%, we just center it roughly for now
           initialX = 20; 
        }
      }

      const initialCanvasPos = getCanvasPosition(
        value.orientation === 'horizontal' && value.length === '100%' ? 0 : 40,
        centerY
      );
      const length = typeof value.length === 'number' ? value.length : (value.orientation === 'vertical' ? 240 : 20);
      const clampedCanvasPos = adjustDividerPos(initialCanvasPos, value.orientation, length);

      const newDivider: DividerData = {
        id: Math.random().toString(36).substr(2, 9),
        ...value,
        color: (theme.id === 'dark' || theme.id === 'premium-dark') ? '#57534e' : '#a8a29e',
        position: clampedCanvasPos
      };
      setDividers(prev => [...prev, newDivider]);
    }
    else if (type === 'highlight') {
      const { from, to } = targetEditor.state.selection;
      if (from === to) {
        // Toggle Highlighter Tool Mode if no selection
        setActiveHighlighterColor(prev => prev === value ? null : value);
      } else {
        targetEditor.chain().focus().toggleHighlight({ color: value || ((theme.id === 'dark' || theme.id === 'premium-dark') ? '#5E5E00' : '#ffff00') }).run();
      }
    } else if (type === 'color') {
      targetEditor.chain().focus().setColor(value).run();
    } else if (type === 'align') {
      targetEditor.chain().focus().setTextAlign(value).run();
    } else if (type === 'columns') {
      if (value === 'single') {
        targetEditor.chain().focus().unsetColumns().run();
      } else {
        targetEditor.chain().focus().setColumns(value).run();
      }
    }
  }, [activeModal, stickyEditor, editor, theme, getViewportCenterY]);

  const handleAIFormat = useCallback(async () => {
    if (!editor) return;
    setIsAILoading(true);

    const activeContext = getActiveContext();
    const currentTitle = activeContext?.note.title || 'Untitled Note';
    const currentHTML = editor.getHTML();

    try {
      const response = await fetch('/api/ai/format.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customApiKey ? { 'X-Gemini-API-Key': customApiKey } : {}),
          ...(customModel ? { 'X-Gemini-Model': customModel } : {}),
        },
        body: JSON.stringify({
          title: currentTitle,
          content: currentHTML,
          stickies: disableAIStickies ? [] : stickies,
          arrows: disableAIArrows ? [] : arrows,
          dividers: disableAIDividers ? [] : dividers,
          images: images,
          pageLayout,
          customApiKey,
          customModel,
          highlightStyle,
          disableAIFlashcards,
          disableAIArrows,
          disableAIStickies,
          disableAIDividers,
          disableAIImages,
          disableAIColumns,
          allowNoteEnhancement,
          enableCleaning,
        })
      });

      const data = await response.json();
      if (data.success) {
        if (data.title && activeNoteId) {
          renameNote(activeNoteId, data.title);
        }

        // Set content back to Tiptap editor
        editor.commands.setContent(data.content);

        // Map stickies, arrows, and dividers safely
        if (data.stickies && !disableAIStickies) {
          setStickies(data.stickies);
        }
        if (data.arrows && !disableAIArrows) {
          setArrows(data.arrows);
        }
        if (data.dividers && !disableAIDividers) {
          setDividers(data.dividers);
        }
      } else {
        showError('AI formatting failed', data.message || 'AI formatting failed.', undefined, data.debugInfo);
      }
    } catch (error: any) {
      console.error('Error during AI formatting:', error);
      showError('AI formatting error', 'An error occurred during AI formatting: ' + (error.message || error));
    } finally {
      setIsAILoading(false);
    }
  }, [
    editor, 
    stickies, 
    arrows, 
    dividers, 
    images,
    pageLayout, 
    customApiKey,
    customModel,
    highlightStyle,
    disableAIFlashcards,
    disableAIArrows,
    disableAIStickies,
    disableAIDividers,
    disableAIImages,
    disableAIColumns,
    allowNoteEnhancement,
    enableCleaning,
    activeNoteId, 
    getActiveContext, 
    renameNote,
    showError
  ]);

  const handleImagePaste = (src: string) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const maxWidth = 300;
      const newWidth = Math.min(img.width, maxWidth);
      const newHeight = newWidth / aspectRatio;

      const newImage: ImageData = {
        id: Date.now().toString(),
        src,
        position: { x: 100, y: 100 },
        width: newWidth,
        height: newHeight,
        isPinned: false,
      };

      setImages(prev => [...prev, newImage]);
    };
    img.src = src;
  };

  const handleAISelectionFormat = useCallback(async (selectionText: string, selectionHTML: string, instruction: string) => {
    const centerY = getViewportCenterY();

    try {
      const response = await fetch('/api/ai/format-selection.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customApiKey ? { 'X-Gemini-API-Key': customApiKey } : {}),
          ...(customModel ? { 'X-Gemini-Model': customModel } : {}),
        },
        body: JSON.stringify({
          selectionText,
          selectionHTML,
          instruction,
          centerY,
          customApiKey,
          customModel,
          highlightStyle,
          disableAIFlashcards,
          disableAIArrows,
          disableAIStickies,
          disableAIDividers,
          disableAIImages,
          disableAIColumns,
          allowNoteEnhancement,
          enableCleaning,
        })
      });

      const data = await response.json();
      if (data.success) {
        // Map returned stickies, arrows, and dividers safely
        if (data.stickies && data.stickies.length > 0 && !disableAIStickies) {
          setStickies(prev => [...prev, ...data.stickies]);
        }
        if (data.arrows && data.arrows.length > 0 && !disableAIArrows) {
          setArrows(prev => [...prev, ...data.arrows]);
        }
        if (data.dividers && data.dividers.length > 0 && !disableAIDividers) {
          setDividers(prev => [...prev, ...data.dividers]);
        }
        return { formattedHTML: data.formattedHTML };
      } else {
        showError('AI selection formatting failed', data.message || 'AI selection formatting failed.', undefined, data.debugInfo);
      }
    } catch (error: any) {
      console.error('AI selection format error:', error);
      showError('AI selection format error', 'Failed to format selection with AI. Please try again.');
      return null;
    }
  }, [customApiKey, customModel, highlightStyle, disableAIFlashcards, disableAIArrows, disableAIStickies, disableAIDividers, disableAIImages, disableAIColumns, allowNoteEnhancement, enableCleaning]);

  const updateArrow = useCallback((id: string, updates: Partial<ArrowData>) => {
    setArrows(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const handleDrawStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set target capturing so pointer events don't skip when cursor moves off the container
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setDrawingPoints([{ x, y }]);
    setIsDraggingDraw(true);
  }, [scale]);

  const handleDrawMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingDraw) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Filter duplicate or micro jitter offsets to keep point data highly clean and fast
    setDrawingPoints(prev => {
      const last = prev[prev.length - 1];
      if (last && Math.abs(last.x - x) < 2 && Math.abs(last.y - y) < 2) {
        return prev;
      }
      return [...prev, { x, y }];
    });
  }, [isDraggingDraw, scale]);

  const handleDrawEnd = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingDraw) return;
    setIsDraggingDraw(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (drawingPoints.length < 3) {
      setDrawingPoints([]);
      return;
    }

    const startPoint = drawingPoints[0];
    const endPoint = drawingPoints[drawingPoints.length - 1];

    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Filter out simple idle click actions
    if (distance < 12) {
      setDrawingPoints([]);
      return;
    }

    // High quality algorithm to locate the absolute best center peak curvature along the user's pen trace.
    // We compute the point that lies at the maximum perpendicular distance from the start -> end diagonal line.
    let maxDistancePoint = drawingPoints[Math.floor(drawingPoints.length / 2)];
    let maxDistance = -1;

    const x1 = startPoint.x;
    const y1 = startPoint.y;
    const x2 = endPoint.x;
    const y2 = endPoint.y;

    const denom = Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));
    
    if (denom > 0) {
      for (let i = 1; i < drawingPoints.length - 1; i++) {
        const p = drawingPoints[i];
        const num = Math.abs((y2 - y1) * p.x - (x2 - x1) * p.y + x2 * y1 - y2 * x1);
        const dist = num / denom;
        if (dist > maxDistance) {
          maxDistance = dist;
          maxDistancePoint = p;
        }
      }
    }

    const midPoint = { ...maxDistancePoint };

    // Standard arrow config mapped back to clean canvas coordinates
    const startCanvas = getCanvasPosition(startPoint.x, startPoint.y);
    const endCanvas = getCanvasPosition(endPoint.x, endPoint.y);
    const midCanvas = getCanvasPosition(midPoint.x, midPoint.y);

    const newArrow: ArrowData = {
      id: Date.now().toString(),
      start: startCanvas,
      end: endCanvas,
      mid: midCanvas,
      color: (theme.id === 'dark' || theme.id === 'premium-dark') ? '#3B82F6' : '#1c1917'
    };

    setArrows(prev => [...prev, newArrow]);
    setSelectedArrowId(newArrow.id);
    setDrawingPoints([]);
    setIsDrawingArrowMode(false);
  }, [isDraggingDraw, drawingPoints, theme, getCanvasPosition]);

  const handleModalSubmit = () => {
    const finalInput = activeModal === 'sticky' ? (stickyEditor?.getHTML() || '') : modalInput;
    
    if (!finalInput && activeModal !== 'math') {
      setActiveModal(null);
      setEditingStickyId(null);
      return;
    }

    if (activeModal === 'sticky') {
      if (editingStickyId) {
        setStickies(prev => prev.map(s => s.id === editingStickyId ? { 
          ...s, 
          text: finalInput, 
          color: stickyColor, 
          fontSize: stickyFontSize 
        } : s));
      } else {
        const centerY = getViewportCenterY();
        const pageCenterX = 425;
        const rawCanvasPos = getCanvasPosition(pageCenterX - 140, centerY);
        const adjustedPos = adjustStickyPos(rawCanvasPos);

        setStickies(prev => [...prev, { 
          id: Date.now().toString(), 
          text: finalInput, 
          color: stickyColor,
          fontSize: stickyFontSize,
          position: adjustedPos
        }]);
      }
      setEditingStickyId(null);
      setStickyFontSize(14);
    } else if (activeModal === 'math') {
      editor?.chain().focus().insertContent({
        type: 'math',
        attrs: { latex: modalInput || 'E = mc^2' }
      }).run();
    } else if (activeModal === 'image') {
      editor?.chain().focus().setImage({ src: modalInput }).run();
    }

    setModalInput('');
    setActiveModal(null);
  };

  const openEditSticky = (sticky: { id: string, text: string, color: string, fontSize?: number, isPinned?: boolean }) => {
    setEditingStickyId(sticky.id);
    setModalInput(sticky.text);
    setStickyColor(sticky.color);
    setStickyFontSize(sticky.fontSize || 14);
    setActiveModal('sticky');
  };

  const togglePinSticky = (id: string) => {
    setStickies(prev => prev.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s));
  };

  const handleExport = (format: 'bundle' | 'note' | 'md') => {
    if (format === 'note') {
      const context = getActiveContext();
      if (!context) return;
      
      const noteCards = flashcards.filter(c => c.sourceNoteId === context.note.id || c.chapterId === context.note.id);
      
      const payload = {
        type: 'note-with-flashcards',
        note: context.note,
        flashcards: noteCards,
        subjectName: context.subject.name,
        subjectId: context.subject.id,
        version: '1.2'
      };
      
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `note-${context.note.title.replace(/\s+/g, '-').toLowerCase()}.papyrus`;
      a.click();
    } else if (format === 'md') {
      // Simple HTML to MD conversion
      const md = content
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]*>?/gm, '');
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `note-${Date.now()}.md`;
      a.click();
    } else if (format === 'bundle') {
      const bundle = {
        type: 'full-notebook-bundle',
        subjects,
        flashcards,
        studyStats,
        activeNoteId,
        version: '1.2'
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `papyrus-backup-${new Date().toISOString().split('T')[0]}.papyrus`;
      a.click();
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (data.type === 'note-with-flashcards' || (data.note && data.type === undefined)) {
          // Single structured Note + associated Flashcards package
          const importNote: Note = data.note;
          const importCards: Flashcard[] = data.flashcards || [];
          const subjectName = data.subjectName || 'Imported';
          const subjectId = data.subjectId || `subj-${Date.now()}`;
          
          importNote.content = preserveSpaces(importNote.content);
          
          setSubjects(prev => {
            const newSubjects = [...prev];
            const existing = newSubjects.find(s => s.name === subjectName || s.id === subjectId);
            if (existing) {
              const noteIndex = existing.notes.findIndex(n => n.id === importNote.id || n.title === importNote.title);
              if (noteIndex >= 0) {
                existing.notes[noteIndex] = importNote;
              } else {
                existing.notes.push(importNote);
              }
            } else {
              newSubjects.push({
                id: subjectId,
                name: subjectName,
                notes: [importNote]
              });
            }
            return newSubjects;
          });
          
          if (importCards.length > 0) {
            setFlashcards(prev => {
              const merged = [...prev];
              importCards.forEach((newCard: Flashcard) => {
                const existingIdx = merged.findIndex(c => c.id === newCard.id);
                if (existingIdx >= 0) {
                  merged[existingIdx] = newCard;
                } else {
                  merged.push(newCard);
                }
              });
              return merged;
            });
          }
          
          setActiveNoteId(importNote.id);
          
        } else if (data.subjects && Array.isArray(data.subjects)) {
          // Full Notebook Bundle Import (with integrated Flashcards & stats support)
          setSubjects(prev => {
            const newSubjects = [...prev];
            data.subjects.forEach((importSubject: Subject) => {
              const existing = newSubjects.find(s => s.name === importSubject.name || s.id === importSubject.id);
              if (existing) {
                // Merge notes into existing subject
                importSubject.notes.forEach(note => {
                  const noteIndex = existing.notes.findIndex(n => n.id === note.id || n.title === note.title);
                  if (noteIndex >= 0) {
                    existing.notes[noteIndex] = { ...note, content: preserveSpaces(note.content) };
                  } else {
                    existing.notes.push({ ...note, content: preserveSpaces(note.content) });
                  }
                });
              } else {
                newSubjects.push({
                  ...importSubject,
                  notes: importSubject.notes.map(note => ({
                    ...note,
                    content: preserveSpaces(note.content)
                  }))
                });
              }
            });
            return newSubjects;
          });

          if (data.flashcards && Array.isArray(data.flashcards)) {
            setFlashcards(prev => {
              const merged = [...prev];
              data.flashcards.forEach((newCard: Flashcard) => {
                const existingIdx = merged.findIndex(c => c.id === newCard.id);
                if (existingIdx >= 0) {
                  merged[existingIdx] = newCard;
                } else {
                  merged.push(newCard);
                }
              });
              return merged;
            });
          }

          if (data.studyStats) {
            setStudyStats(data.studyStats);
          }

          if (data.activeNoteId) {
            setActiveNoteId(data.activeNoteId);
          }
          
        } else if (data.notes && Array.isArray(data.notes)) {
          // Notes collection import
          const importedNotes = data.notes.map((note: any) => ({
            ...note,
            content: preserveSpaces(note.content)
          }));
          setSubjects(prev => [
            ...prev,
            {
              id: `imported-${Date.now()}`,
              name: 'Imported Bundle',
              notes: importedNotes
            }
          ]);
          setActiveNoteId(importedNotes[0].id);

          if (data.flashcards && Array.isArray(data.flashcards)) {
            setFlashcards(prev => {
              const merged = [...prev];
              data.flashcards.forEach((newCard: Flashcard) => {
                const existingIdx = merged.findIndex(c => c.id === newCard.id);
                if (existingIdx >= 0) {
                  merged[existingIdx] = newCard;
                } else {
                  merged.push(newCard);
                }
              });
              return merged;
            });
          }
          
        } else if (data.content !== undefined) {
          // Legacy plain single note import
          const newId = Date.now().toString();
          const newNote: Note = {
            id: newId,
            title: 'Imported Note',
            content: preserveSpaces(data.content),
            stickies: data.stickies || [],
            arrows: data.arrows || [],
            dividers: data.dividers || [],
            images: data.images || [],
            texture: data.texture || 'laid',
            themeId: data.themeId || 'light',
            isHandwriting: data.isHandwriting || true,
            fontSize: data.fontSize || 18,
          };
          setSubjects(prev => {
            const first = prev[0];
            return [{ ...first, notes: [...first.notes, newNote] }, ...prev.slice(1)];
          });
          
          if (data.flashcards && Array.isArray(data.flashcards)) {
            setFlashcards(prev => {
              const merged = [...prev];
              data.flashcards.forEach((newCard: Flashcard) => {
                const existingIdx = merged.findIndex(c => c.id === newCard.id);
                if (existingIdx >= 0) {
                  merged[existingIdx] = newCard;
                } else {
                  merged.push(newCard);
                }
              });
              return merged;
            });
          }
          
          setActiveNoteId(newId);
        }
        
        showSuccess('Import successful', 'Data successfully imported and active elements updated!');
      } catch (err) {
        console.error('Import error:', err);
        showError('Import failed', 'Failed to import notebook data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset for next import
  };

  // High-fidelity page calculation considering both text flow and absolute-positioned design elements
  const numPages = useMemo(() => {
    if (pageHeight <= 0) return 1;
    
    if (pageLayoutMode === 'book') {
      const usableHeight = pageHeight - 2 * marginY;
      const columnSlotWidth = canvasWidth + PAGE_GAP;
      
      // In book mode, we estimate the number of pages based on horizontal scroll width
      const estPages = Math.max(2, Math.ceil((bookScrollWidth + PAGE_GAP) / Math.max(1, columnSlotWidth)));
      
      // Let's also verify that absolute items on later pages can be accommodated
      let maxPageIndex = estPages - 1;
      stickies.forEach(s => {
        const pageIndex = Math.floor((s.position?.y || 0) / Math.max(1, usableHeight));
        if (pageIndex > maxPageIndex) maxPageIndex = pageIndex;
      });
      dividers.forEach(d => {
        const pageIndex = Math.floor(d.position.y / Math.max(1, usableHeight));
        if (pageIndex > maxPageIndex) maxPageIndex = pageIndex;
      });
      arrows.forEach(a => {
        const maxY = Math.max(a.start.y, a.mid.y, a.end.y);
        const pageIndex = Math.floor(maxY / Math.max(1, usableHeight));
        if (pageIndex > maxPageIndex) maxPageIndex = pageIndex;
      });
      
      const targetPages = maxPageIndex + 1;
      // Ensure always even number for booklet facing pages
      return targetPages + (targetPages % 2);
    }
    
    // We start with the observed main area height (which includes text flow)
    let maxFoundY = mainHeight;
    
    // Then we factor in all floating stationery to ensure page breaks cover everything
    stickies.forEach(s => {
      const bottom = (s.position?.y || 0) + 260; // Approximate height of a note
      if (bottom > maxFoundY) maxFoundY = bottom;
    });
    dividers.forEach(d => {
      const len = parseFloat(d.length as any) || 0;
      const bottom = d.position.y * 1 + (d.orientation === 'vertical' ? len : 20);
      if (bottom > maxFoundY) maxFoundY = bottom;
    });
    arrows.forEach(a => {
      const bottom = Math.max(a.start.y, a.mid.y, a.end.y) + 40;
      if (bottom > maxFoundY) maxFoundY = bottom;
    });
    
    return Math.max(1, Math.ceil(maxFoundY / pageHeight));
  }, [mainHeight, stickies, dividers, arrows, pageHeight, pageLayoutMode, bookScrollWidth, canvasWidth, marginX, marginY]);

  const displayNumPages = useMemo(() => {
    if (isBookMode) {
      const rawNum = numPages;
      return Math.max(2, rawNum + (rawNum % 2));
    }
    return numPages;
  }, [numPages, isBookMode]);

  const displayWidth = isBookMode
    ? displayNumPages * canvasWidth + (displayNumPages - 1) * PAGE_GAP
    : canvasWidth;

  const displayHeight = isBookMode
    ? pageHeight
    : (pageLayout === 'pageless' ? mainHeight : numPages * (pageHeight + 64));

  // Automatically adjust absolute elements to prevent them from overlapping page breaks when page breaks change
  useEffect(() => {
    if (pageLayout === 'pageless' || pageHeight <= 0) return;

    let updated = false;
    const newStickies = stickies.map(s => {
      const adjusted = adjustStickyPos(s.position || { x: 20, y: 100 });
      if (!s.position || adjusted.y !== s.position.y || adjusted.x !== s.position.x) {
        updated = true;
        return { ...s, position: adjusted };
      }
      return s;
    });

    const newDividers = dividers.map(d => {
      const length = typeof d.length === 'number' ? d.length : (d.orientation === 'vertical' ? 240 : 20);
      const adjusted = adjustDividerPos(d.position, d.orientation, length);
      if (adjusted.y !== d.position.y || adjusted.x !== d.position.x) {
        updated = true;
        return { ...d, position: adjusted };
      }
      return d;
    });

    if (updated) {
      if (newStickies.length > 0) {
        setStickies(newStickies);
      }
      if (newDividers.length > 0) {
        setDividers(newDividers);
      }
    }
  }, [pageLayout, pageHeight, pageMargin, numPages, adjustStickyPos, adjustDividerPos]);



  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-[#121212] font-serif gap-4">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Book className="w-12 h-12 opacity-20 text-[#8c6d4f]" />
        </motion.div>
        <p className="text-[#8c6d4f] text-sm tracking-widest uppercase">Initializing Papyrus Portal...</p>
      </div>
    );
  }

  if (!installed) {
    return <InstallerOverlay />;
  }

  if (!loggedIn) {
    return <LoginScreen />;
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 font-serif gap-4">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Book className="w-12 h-12 opacity-20" />
        </motion.div>
        <p className="text-stone-400 text-sm tracking-widest uppercase">Opening Notebook...</p>
      </div>
    );
  }

  return (
    <>
      <div
      className={cn(
        "h-screen transition-colors duration-1000 flex overflow-hidden",
        theme.id === 'dark' && "dark",
        isCleanMode && "is-clean-mode"
      )}
      style={{ backgroundColor: theme.bgColor, color: theme.inkColor }}
      data-theme={theme.id === 'premium-dark' ? 'premium-dark' : undefined}
    >
      <CommandPalette 
        subjects={subjects} 
        flashcards={flashcards}
        onSelectNote={setActiveNoteId} 
        onNewNote={addNewNote} 
        onNewSubject={addNewSubject} 
        onDeleteNote={deleteNote}
        onDeleteSubject={deleteSubject}
        onRenameNote={renameNote}
        onRenameSubject={renameSubject}
        onStartStudy={handleStartStudy}
        onOpenImport={() => setIsImportOpen(true)}
      />

      <div 
        ref={containerRef}
        className={cn(
          "flex-1 overflow-auto custom-scrollbar flex flex-col items-center relative transition-all duration-400 ease-smooth min-w-0",
          isCleanMode ? "p-0" : "p-8 md:p-12"
        )}
      >
        {/* Floating Pen Drawing notification banner */}
        <AnimatePresence>
          {isDrawingArrowMode && (
            <motion.div
              key="pen-drawing-alert"
              initial={{ opacity: 0, y: -40, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -40, x: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-6 left-1/2 z-[100] flex items-center gap-3 px-4 py-2 bg-cyan-50/95 dark:bg-stone-900/95 border border-cyan-200 dark:border-cyan-950 shadow-2xl rounded-full backdrop-blur-md select-none text-xs font-semibold text-cyan-800 dark:text-cyan-300 pointer-events-auto"
            >
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping mr-0.5" />
              <span>✏️ Pen Drawing Mode: Draw a straight or curved line with mouse / stylus</span>
              <span className="opacity-40 font-mono font-normal">|</span>
              <button 
                onClick={() => {
                  setIsDrawingArrowMode(false);
                  setDrawingPoints([]);
                  setIsDraggingDraw(false);
                }}
                className="hover:scale-105 active:scale-95 text-cyan-600 dark:text-cyan-400 font-mono text-[10px] bg-white dark:bg-stone-800 border border-cyan-200 dark:border-cyan-900/50 rounded-full px-2.5 py-0.5 transition"
              >
                Cancel (Esc)
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="paper-shadow border-stone-200 dark:border-stone-800 sm:max-w-md bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl tracking-tight">
              {activeModal === 'sticky' ? (editingStickyId ? 'Refine Sticky Note' : 'Create New Sticky') : activeModal === 'math' ? 'Insert Equation' : 'Insert Image'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="modal-input" className="block text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">
                  {activeModal === 'sticky' ? 'Memory Snippet' : activeModal === 'math' ? 'LaTeX Snippet' : 'Image URL'}
                </Label>
                {activeModal === 'sticky' && (
                  <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-800/50 p-1 rounded-lg border border-stone-100 dark:border-stone-800">
                    {[12, 14, 16, 18].map(size => (
                      <button
                        key={size}
                        onClick={() => setStickyFontSize(size)}
                        className={cn(
                          "w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono transition-all",
                          stickyFontSize === size ? "bg-white dark:bg-stone-700 shadow-sm border border-stone-200 dark:border-stone-600 font-bold" : "opacity-40 hover:opacity-100"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {activeModal === 'sticky' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2 gap-1 overflow-x-auto">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleFormat('bold')} className="h-8 w-8 p-0 hover:bg-stone-100 dark:hover:bg-stone-800"><Bold className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleFormat('italic')} className="h-8 w-8 p-0 hover:bg-stone-100 dark:hover:bg-stone-800"><Italic className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleFormat('underline')} className="h-8 w-8 p-0 hover:bg-stone-100 dark:hover:bg-stone-800"><Underline className="w-3.5 h-3.5" /></Button>
                    </div>
                    <Separator orientation="vertical" className="h-4 dark:bg-stone-800" />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleFormat('align', 'left')} className="h-8 w-8 p-0 hover:bg-stone-100 dark:hover:bg-stone-800"><AlignLeft className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleFormat('align', 'center')} className="h-8 w-8 p-0 hover:bg-stone-100 dark:hover:bg-stone-800"><AlignCenter className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleFormat('align', 'right')} className="h-8 w-8 p-0 hover:bg-stone-100 dark:hover:bg-stone-800"><AlignRight className="w-3.5 h-3.5" /></Button>
                    </div>
                    <Separator orientation="vertical" className="h-4 dark:bg-stone-800" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => handleFormat('decorative-hr', { type: 'zigzag', orientation: 'horizontal', size: 1, length: '100%' })} className="h-8 w-8 p-0 hover:bg-stone-100 dark:hover:bg-stone-800"><Divide className="w-3.5 h-3.5" /></Button>
                        </TooltipTrigger>
                        <TooltipContent>Insert Zigzag Separator</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => handleFormat('decorative-hr', { type: 'solid', orientation: 'horizontal', size: 1, length: '100%' })} className="h-8 w-8 p-0 hover:bg-stone-100 dark:hover:bg-stone-800"><Minus className="w-3.5 h-3.5" /></Button>
                        </TooltipTrigger>
                        <TooltipContent>Insert Line Separator</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Editor 
                    content={modalInput} 
                    onChange={setModalInput} 
                    onInit={setStickyEditor}
                    fontSize={stickyFontSize}
                    onFormat={handleFormat}
                    className="w-full min-h-[180px] max-h-[300px] overflow-y-auto p-4 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 focus-within:ring-2 focus-within:ring-stone-200 dark:focus-within:ring-stone-800 transition-all font-serif text-sm prose prose-sm prose-stone dark:prose-invert [&_.ProseMirror]:min-h-[140px]"
                    isSimpleMode={true}
                  />
                </div>
              ) : (
                <Input 
                   id="modal-input" 
                   value={modalInput}
                   onChange={(e) => setModalInput(e.target.value)}
                   placeholder={activeModal === 'math' ? "E = mc^2" : "https://example.com/image.jpg"}
                   onKeyDown={(e) => e.key === 'Enter' && handleModalSubmit()}
                   autoFocus
                   className="dark:bg-stone-800 dark:border-stone-700"
                 />
              )}
            </div>

            {activeModal === 'sticky' && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest opacity-60">Color Variant</Label>
                <div className="flex gap-2">
                  {STICKY_COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setStickyColor(c.id)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                        stickyColor === c.id ? "border-stone-800 scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: c.dot }}
                    >
                      {stickyColor === c.id && <Check className="w-4 h-4 text-stone-800" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button onClick={handleModalSubmit} className="bg-stone-800 text-white hover:bg-stone-900 px-8">
              {editingStickyId ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
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
        onUpdateCustomApiKey={handleUpdateCustomApiKey}
        onUpdateCustomModel={handleUpdateCustomModel}
        onUpdateHighlightStyle={handleUpdateHighlightStyle}
        onUpdateDisableAIFlashcards={handleUpdateDisableAIFlashcards}
        onUpdateDisableAIArrows={handleUpdateDisableAIArrows}
        onUpdateDisableAIStickies={handleUpdateDisableAIStickies}
        onUpdateDisableAIDividers={handleUpdateDisableAIDividers}
        onUpdateDisableAIImages={handleUpdateDisableAIImages}
        onUpdateDisableAIColumns={handleUpdateDisableAIColumns}
        onUpdateAllowNoteEnhancement={handleUpdateAllowNoteEnhancement}
        onUpdateEnableCleaning={handleUpdateEnableCleaning}
        onSetCustomModelActive={setIsCustomModelActive}
        onSetCustomModelInput={setCustomModelInput}
        pageLayout={pageLayout}
        pageMargin={pageMargin}
        pageLayoutMode={pageLayoutMode}
        notebookStyle={notebookStyle}
        theme={theme}
        fontSize={fontSize}
        isHandwriting={isHandwriting}
        onPageLayoutChange={setPageLayout}
        onPageMarginChange={setPageMargin}
        onPageLayoutModeChange={setPageLayoutMode}
        onNotebookStyleChange={setNotebookStyle}
        onThemeChange={setTheme}
        onFontSizeChange={setFontSize}
        onHandwritingToggle={setIsHandwriting}
        onExportPDF={exportPageToPDF}
        onExportPDFPrint={exportPDFPrint}
        isExportingPDF={isExportingPDF}
      />

      {/* Help Center */}
      <HelpCenter open={isHelpOpen} onOpenChange={setIsHelpOpen} />

      {/* Table of Contents */}
      {editor && (
        <TableOfContents 
          editor={editor} 
          scrollContainerRef={containerRef}
          paperRef={mainAreaRef}
        />
      )}

      {/* Header */}
      <AnimatePresence>
        {!isCleanMode && (
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="w-full max-w-4xl flex justify-between items-center mb-6 md:mb-12 shrink-0 px-2 md:px-0"
          >
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              {/* Logo - smaller on mobile */}
              <div className="flex items-center gap-2 pr-2 md:pr-4 border-r border-stone-200 dark:border-stone-800 shrink-0">
                <img src="/papyruslogo.svg" alt="Papyrus Logo" className="w-6 h-8 md:w-9 md:h-11" />
              </div>

              <div className="flex flex-col relative group min-w-0 flex-1">
                <input
                  type="text"
                  placeholder="Subject"
                  value={getActiveContext()?.subject.name || ''}
                  onChange={(e) => {
                    const context = getActiveContext();
                    if (context) renameSubject(context.subject.id, e.target.value);
                  }}
                  className="text-[9px] md:text-[10px] font-sans font-bold tracking-[0.15em] md:tracking-[0.2em] opacity-40 uppercase bg-transparent border-none p-0 m-0 focus:outline-none focus:opacity-100 transition-opacity w-full max-w-[150px] md:max-w-[300px] placeholder:text-stone-300 dark:placeholder:text-stone-700 truncate"
                />
                <input
                  type="text"
                  placeholder="Chapter"
                  value={getActiveContext()?.note.title || ''}
                  onChange={(e) => {
                    const context = getActiveContext();
                    if (context) renameNote(context.note.id, e.target.value);
                  }}
                  className="text-lg md:text-2xl font-serif tracking-tighter opacity-80 uppercase bg-transparent border-none p-0 m-0 focus:outline-none focus:opacity-100 transition-opacity w-full max-w-[150px] md:max-w-[300px] placeholder:text-stone-300 dark:placeholder:text-stone-700 truncate"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              {/* Flashcards Button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-7 h-7 md:w-8 md:h-8 rounded-full relative transition-all duration-300",
                  flashcards.filter(c => c.sourceNoteId === activeNoteId).length > 0
                    ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 opacity-100 hover:scale-110"
                    : "opacity-60"
                )}
                onClick={() => handleStartStudy('note', activeNoteId)}
              >
                <Brain className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {flashcards.filter(c => c.sourceNoteId === activeNoteId).length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-3 h-3 md:min-w-4 md:h-4 px-0.5 md:px-1 rounded-full bg-amber-500 text-[#FFFCF5] text-[7px] md:text-[8px] font-mono font-bold flex items-center justify-center shadow-sm animate-bounce-slow">
                    {flashcards.filter(c => c.sourceNoteId === activeNoteId).length}
                  </span>
                )}
              </Button>

              {/* Help Button */}
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 md:w-8 md:h-8 rounded-full opacity-60 hover:opacity-100 transition-all hover:scale-105"
                onClick={() => setIsHelpOpen(true)}
              >
                <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600 dark:text-emerald-400" />
              </Button>

              {/* Settings Button */}
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 md:w-8 md:h-8 rounded-full opacity-60 hover:opacity-100 transition-all hover:scale-105"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="w-3.5 h-3.5 md:w-4 md:h-4 text-stone-700 dark:text-stone-300" />
              </Button>

              <div className="hidden md:block w-px h-4 bg-stone-200 dark:bg-stone-800 mx-1" />

              {/* Search Button - desktop only */}
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 h-auto text-xs font-medium border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm rounded-full transition-all"
                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', altKey: true }))}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search notes</span>
                <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌥</span>A
                </kbd>
              </Button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content Scroll Wrapper with Scaling */}
      <div
        className="relative transition-all duration-400 ease-smooth shrink-0 select-none flex items-start justify-center print-scale-container"
        style={{
          width: isExportingPDF ? `${displayWidth}px` : `${displayWidth * scale}px`,
          height: isExportingPDF ? `${displayHeight}px` : `${displayHeight * scale}px`,
          overflow: 'visible',
          marginBottom: isCleanMode ? '0px' : '128px',
        }}
      >
        <main 
          className={cn(
            "relative transition-all duration-400 ease-smooth shrink-0 print-main-canvas"
          )} 
          ref={mainAreaRef}
          onClick={() => setSelectedArrowId(null)}
          style={{
            transform: isExportingPDF ? 'none' : `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
          }}
        >


          <AnimatePresence>
            {stickies.map(s => {
              const visualPos = getVisualPosition(s.position || { x: 20, y: 100 });
              return (
                <StickyNote 
                  key={s.id} 
                  id={s.id}
                  content={s.text} 
                  color={s.color} 
                  fontSize={s.fontSize}
                  isPinned={s.isPinned}
                  position={visualPos}
                  containerRef={mainAreaRef}
                  isHandwriting={isHandwriting}
                  onEdit={openEditSticky}
                  onTogglePin={() => togglePinSticky(s.id)}
                  onUpdate={(updates) => {
                    const canvasUpdates = { ...updates };
                    if (updates.position) {
                      const rawCanvasPos = getCanvasPosition(updates.position.x, updates.position.y);
                      canvasUpdates.position = adjustStickyPos(rawCanvasPos);
                    }
                    setStickies(prev => prev.map(p => p.id === s.id ? { ...p, ...canvasUpdates } : p));
                  }}
                  onRemove={() => setStickies(prev => prev.filter(p => p.id !== s.id))} 
                />
              );
            })}
            {dividers.map(d => {
              const visualPos = getVisualPosition(d.position);
              const visualDivider = {
                ...d,
                position: visualPos
              };
              return (
                <FloatingDivider
                  key={d.id}
                  divider={visualDivider}
                  isCleanMode={isCleanMode}
                  containerRef={mainAreaRef}
                  onUpdate={(id, updates) => {
                    const canvasUpdates = { ...updates };
                    if (updates.position) {
                      const rawCanvasPos = getCanvasPosition(updates.position.x, updates.position.y);
                      const length = typeof d.length === 'number' ? d.length : (d.orientation === 'vertical' ? 240 : 20);
                      canvasUpdates.position = adjustDividerPos(rawCanvasPos, d.orientation, length);
                    }
                    setDividers(prev => prev.map(div => div.id === id ? { ...div, ...canvasUpdates } : div));
                  }}
                  onRemove={(id) => setDividers(prev => prev.filter(div => div.id !== id))}
                />
              );
            })}
            {images.map(img => {
              const visualPos = getVisualPosition(img.position);
              const visualImage = {
                ...img,
                position: visualPos
              };
              return (
                <DraggableImage
                  key={img.id}
                  image={visualImage}
                  containerRef={mainAreaRef}
                  onRemove={(id) => setImages(prev => prev.filter(i => i.id !== id))}
                  onUpdate={(id, updates) => {
                    const canvasUpdates = { ...updates };
                    if (updates.position) {
                      const rawCanvasPos = getCanvasPosition(updates.position.x, updates.position.y);
                      canvasUpdates.position = rawCanvasPos;
                    }
                    setImages(prev => prev.map(i => i.id === id ? { ...i, ...canvasUpdates } : i));
                  }}
                />
              );
            })}
            {arrows.map(a => {
              const visualArrow = {
                ...a,
                start: getVisualPosition(a.start),
                mid: getVisualPosition(a.mid),
                end: getVisualPosition(a.end)
              };
              return (
                <CurvedArrow
                  key={a.id}
                  arrow={visualArrow}
                  theme={theme}
                  isCleanMode={isCleanMode}
                  scale={scale}
                  onUpdate={updateArrow}
                  onRemove={(id) => setArrows(prev => prev.filter(p => p.id !== id))}
                  isSelected={selectedArrowId === a.id}
                  onSelect={(id) => setSelectedArrowId(id)}
                />
              );
            })}
          </AnimatePresence>

          {/* Real-time Pointer Drawing Stroke overlay */}
          {isDrawingArrowMode && (
            <div
              className="absolute inset-x-0 top-0 bottom-0 select-none cursor-crosshair z-45 touch-none"
              style={{ height: '100%', minHeight: `${displayHeight}px` }}
              onPointerDown={handleDrawStart}
              onPointerMove={handleDrawMove}
              onPointerUp={handleDrawEnd}
            >
              {drawingPoints.length > 1 && (
                <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible">
                  <path
                    d={`M ${drawingPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                    fill="none"
                    stroke={(theme.id === 'dark' || theme.id === 'premium-dark') ? '#3B82F6' : '#1c1917'}
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-75 drop-shadow-sm"
                  />
                  {/* Glowing stylus end point */}
                  <circle
                    cx={drawingPoints[drawingPoints.length - 1].x}
                    cy={drawingPoints[drawingPoints.length - 1].y}
                    r={4}
                    className="fill-cyan-500 animate-pulse"
                  />
                </svg>
              )}
            </div>
          )}

          {/* Spiral Notebook Wrapper */}
          <motion.div
            ref={notebookWrapperRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "relative transition-all duration-400 ease-smooth print-paper-content z-10",
              isHandwriting ? "font-handwriting" : "font-serif",
              notebookStyle === 'spiral' && "notebook-spiral"
            )}
            style={{
              backgroundColor: 'transparent',
              width: `${canvasWidth}px`,
              minHeight: '100%',
              paddingBottom: '80px',
            }}
          >
            {/* Premium Spiral Binding - SVG-based continuous metal wire */}
            {notebookStyle === 'spiral' && spiralHeight > 0 && (
              <SpiralBinding height={spiralHeight} pageHeight={pageHeight} pageGap={PAGE_GAP} />
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <Editor
                content={content}
                onChange={setContent}
                onInit={setEditor}
                onImagePaste={handleImagePaste}
                activeHighlighterColor={activeHighlighterColor}
                fontSize={fontSize}
                onFormat={handleFormat}
                isDrawingArrowMode={isDrawingArrowMode}
                onToggleDrawingArrowMode={() => setIsDrawingArrowMode(!isDrawingArrowMode)}
                pageLayout={pageLayout}
                pageMargin={pageMargin}
                theme={theme}
                texture={texture}
                onCreateFlashcard={handleCreateFlashcard}
                onAISelectionFormat={handleAISelectionFormat}
                className={cn(
                  "min-h-[700px]",
                  isHandwriting ? "[&_.ProseMirror]:font-handwriting [&_.ProseMirror_p]:font-handwriting [&_.ProseMirror_h1]:font-handwriting [&_.ProseMirror_h2]:font-handwriting [&_.ProseMirror_h3]:font-handwriting" : "[&_.ProseMirror]:font-bangla [&_.ProseMirror_p]:font-bangla [&_.ProseMirror_h1]:font-bangla [&_.ProseMirror_h2]:font-bangla [&_.ProseMirror_h3]:font-bangla",
                  "[&_.ProseMirror]:whitespace-pre-wrap"
                )}
              />
            </motion.div>
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {isImportOpen && (
          <FlashcardImport 
            subjects={subjects}
            initialSubjectId={getActiveContext()?.subject.id || ''}
            initialChapterId={activeNoteId}
            onCancel={() => setIsImportOpen(false)}
            onImport={handleFlashcardImport}
          />
        )}
        {isStudySessionActive && (
          <StudySession 
            cards={studyQueue}
            theme={theme}
            texture={texture}
            isHandwriting={isHandwriting}
            subjects={subjects}
            onClose={() => setIsStudySessionActive(false)}
            onFinish={onStudyFinish}
            onUpdateCard={handleUpdateCardInSession}
            onRateCard={handleRateSingleCard}
            onDeleteCard={handleDeleteCardInSession}
          />
        )}
        {creationCardData && !isSelectingBackActive && (
          <FlashcardCreator
            initialFront={creationCardData.front}
            initialBack={creationCardData.back}
            initialType={creationCardData.type}
            subjectName={getActiveContext()?.subject.name || 'Subject'}
            chapterName={getActiveContext()?.note.title || 'Chapter'}
            onSave={(front, back, type) => finalizeFlashcardCreation(front, back, type)}
            onCancel={() => setCreationCardData(null)}
            onSelectBackFromNote={(frontText, currentType) => {
              setCreationCardData({ front: frontText, back: '', type: currentType });
              setIsSelectingBackActive(true);
            }}
            theme={theme}
            isHandwriting={isHandwriting}
          />
        )}
        {isSelectingBackActive && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] w-[95%] max-w-md bg-stone-900/95 backdrop-blur-md border border-stone-800 text-[#FFFCF5] p-4.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0 animate-pulse border border-amber-500/30">
                <Brain className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">Selecting Answer</p>
                <p className="text-[10px] text-stone-400 truncate mt-0.5">Highlight text on page & click Set</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
              <Button 
                onClick={() => {
                  const sel = window.getSelection()?.toString() || '';
                  if (sel.trim()) {
                    setCreationCardData(prev => prev ? { ...prev, back: sel.trim() } : null);
                    setIsSelectingBackActive(false);
                  } else {
                    showWarning('Selection required', "Please highlight/select the answer text in your note first!");
                  }
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-xl font-bold text-[10px] uppercase tracking-wider rounded-xl px-4 h-8 flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-1 sm:flex-initial"
              >
                Set Answer
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsSelectingBackActive(false)}
                className="text-stone-500 hover:text-stone-300 text-[10px] uppercase font-bold px-3 h-8 rounded-xl flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Controls */}
      <AnimatePresence>
        {!isCleanMode && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          >
            <StationeryBar 
              onFormat={handleFormat}
              onTextureChange={setTexture}
              onImageUpload={() => setActiveModal('image')}
              onStickyAdd={() => setActiveModal('sticky')}
              onMathToggle={() => setActiveModal('math')}
              onExport={handleExport}
              onImport={handleImport}
              isSaving={isSaving}
              activeHighlighterColor={activeHighlighterColor}
              isDrawingArrowMode={isDrawingArrowMode}
              onToggleDrawingArrowMode={() => setIsDrawingArrowMode(prev => !prev)}
              onLogout={logout}
              onAIFormat={handleAIFormat}
              isAILoading={isAILoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange}
        accept=".papyrus,application/json"
        className="hidden"
      />
    </div>
    </div>
    </>
  );
}
