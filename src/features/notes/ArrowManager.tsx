import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Check, X, Move } from 'lucide-react';
import { ArrowData, NoteTheme, Point } from '@/src/types';
import { cn } from '@/lib/utils';

interface CurvedArrowProps {
  arrow: ArrowData;
  onUpdate: (id: string, updates: Partial<ArrowData>) => void;
  onRemove: (id: string) => void;
  isCleanMode: boolean;
  theme: NoteTheme;
  scale: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const CurvedArrow = React.memo(({ 
  arrow, 
  onUpdate, 
  onRemove,
  isCleanMode,
  theme,
  scale,
  isSelected,
  onSelect
}: CurvedArrowProps) => {
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

  const minX = Math.min(arrow.start.x, arrow.end.x, arrow.mid.x);
  const maxX = Math.max(arrow.start.x, arrow.end.x, arrow.mid.x);
  const minY = Math.min(arrow.start.y, arrow.end.y, arrow.mid.y);
  const maxY = Math.max(arrow.start.y, arrow.end.y, arrow.mid.y);

  const centerX = (minX + maxX) / 2;

  const arrowLength = Math.sqrt((arrow.end.x - arrow.start.x)**2 + (arrow.end.y - arrow.start.y)**2);
  const isSmallArrow = arrowLength < 110;
  const toolbarOffset = isSmallArrow ? 68 : 48;

  const toolbarY = (minY - toolbarOffset) < 15 ? (maxY + toolbarOffset) : (minY - toolbarOffset);
  const toolbarX = Math.max(120, Math.min(850 - 120, centerX));

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

        <path
          d={getPath()}
          stroke={arrow.color}
          strokeWidth={isSelected ? "3.5" : "2"}
          fill="none"
          markerEnd={`url(#arrowhead-${arrow.id})`}
          style={{ strokeLinecap: 'round' }}
          className="transition-all duration-200 pointer-events-none"
        />

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
};
