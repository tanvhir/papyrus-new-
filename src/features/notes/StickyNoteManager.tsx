import React from 'react';
import { motion } from 'motion/react';
import Editor from '@/src/components/editor';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Edit2, Trash2, Pin, PinOff } from 'lucide-react';
import { Point } from '@/src/types';
import { cn } from '@/lib/utils';

const STICKY_COLORS = [
  { id: 'yellow', bg: 'bg-yellow-200', dot: '#fef08a' },
  { id: 'blue', bg: 'bg-blue-200', dot: '#bfdbfe' },
  { id: 'pink', bg: 'bg-pink-300', dot: '#f9a8d4' },
  { id: 'green', bg: 'bg-green-200', dot: '#bbf7d0' },
  { id: 'orange', bg: 'bg-orange-200', dot: '#fed7aa' },
  { id: 'purple', bg: 'bg-purple-200', dot: '#e9d5ff' },
];

interface StickyNoteProps {
  id: string;
  content: string;
  color: string;
  position: Point;
  onRemove: () => void;
  onEdit: (sticky: {id: string, text: string, color: string, fontSize?: number}) => void;
  onTogglePin: () => void;
  onUpdate: (updates: Partial<{ text: string, color: string, position: Point, isPinned: boolean }>) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  isHandwriting?: boolean;
  fontSize?: number;
  isPinned?: boolean;
}

export const StickyNote = React.memo(({ 
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
}: StickyNoteProps) => {
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

export { STICKY_COLORS };
