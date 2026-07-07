import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Pin, PinOff, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Point, ImageData } from '@/src/types';

interface DraggableImageProps {
  image: ImageData;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ImageData>) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const DraggableImage: React.FC<DraggableImageProps> = ({
  image,
  onRemove,
  onUpdate,
  containerRef,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: image.width, height: image.height });
  const imgRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = (
    e: React.MouseEvent,
    direction: 'nw' | 'ne' | 'sw' | 'se'
  ) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: image.width, height: image.height });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !resizeDirection) return;

    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;

    let newWidth = startSize.width;
    let newHeight = startSize.height;
    let newX = image.position.x;
    let newY = image.position.y;

    const minSize = 50;

    switch (resizeDirection) {
      case 'se':
        newWidth = Math.max(minSize, startSize.width + dx);
        newHeight = Math.max(minSize, startSize.height + dy);
        break;
      case 'sw':
        newWidth = Math.max(minSize, startSize.width - dx);
        newHeight = Math.max(minSize, startSize.height + dy);
        newX = image.position.x + (startSize.width - newWidth);
        break;
      case 'ne':
        newWidth = Math.max(minSize, startSize.width + dx);
        newHeight = Math.max(minSize, startSize.height - dy);
        newY = image.position.y + (startSize.height - newHeight);
        break;
      case 'nw':
        newWidth = Math.max(minSize, startSize.width - dx);
        newHeight = Math.max(minSize, startSize.height - dy);
        newX = image.position.x + (startSize.width - newWidth);
        newY = image.position.y + (startSize.height - newHeight);
        break;
    }

    onUpdate(image.id, {
      width: newWidth,
      height: newHeight,
      position: { x: newX, y: newY },
    });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeDirection(null);
  };

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, resizeDirection, image, startPos, startSize, onUpdate]);

  return (
    <motion.div
      drag={!image.isPinned}
      dragConstraints={containerRef}
      dragElastic={0}
      dragMomentum={false}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: image.position.x,
        y: image.position.y,
      }}
      exit={{ scale: 0.5, opacity: 0, filter: 'blur(4px)' }}
      whileDrag={{ scale: 1.02, zIndex: 100 }}
      onDragEnd={(_, info) => {
        onUpdate(image.id, {
          position: {
            x: image.position.x + info.offset.x,
            y: image.position.y + info.offset.y,
          },
        });
      }}
      className={cn(
        'absolute z-40 group overflow-visible select-none',
        !image.isPinned && 'cursor-move',
        image.isPinned && 'ring-2 ring-blue-400/30'
      )}
      style={{
        left: 0,
        top: 0,
        width: image.width,
        height: image.height,
      }}
      ref={imgRef}
    >
      <div className="relative w-full h-full">
        {/* Image - no frame/border */}
        <img
          src={image.src}
          alt=""
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />

        {/* Controls overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {/* Top controls */}
          <div className="absolute top-2 right-2 flex gap-1 pointer-events-auto">
            <button
              onClick={() => onUpdate(image.id, { isPinned: !image.isPinned })}
              className="p-1.5 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-md shadow-md hover:bg-white dark:hover:bg-stone-800 transition-colors"
              title={image.isPinned ? 'Unpin' : 'Pin'}
            >
              {image.isPinned ? (
                <PinOff className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
              ) : (
                <Pin className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
              )}
            </button>
            <button
              onClick={() => onRemove(image.id)}
              className="p-1.5 bg-red-500/90 backdrop-blur-sm rounded-md shadow-md hover:bg-red-600 transition-colors"
              title="Remove"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Resize handles */}
          {!image.isPinned && (
            <>
              {/* Top-left */}
              <div
                onMouseDown={(e) => handleResizeStart(e, 'nw')}
                className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize pointer-events-auto"
              >
                <div className="w-full h-full bg-white/50 dark:bg-stone-700/50 hover:bg-white dark:hover:bg-stone-600 transition-colors" />
              </div>
              {/* Top-right */}
              <div
                onMouseDown={(e) => handleResizeStart(e, 'ne')}
                className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize pointer-events-auto"
              >
                <div className="w-full h-full bg-white/50 dark:bg-stone-700/50 hover:bg-white dark:hover:bg-stone-600 transition-colors" />
              </div>
              {/* Bottom-left */}
              <div
                onMouseDown={(e) => handleResizeStart(e, 'sw')}
                className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize pointer-events-auto"
              >
                <div className="w-full h-full bg-white/50 dark:bg-stone-700/50 hover:bg-white dark:hover:bg-stone-600 transition-colors" />
              </div>
              {/* Bottom-right */}
              <div
                onMouseDown={(e) => handleResizeStart(e, 'se')}
                className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize pointer-events-auto"
              >
                <div className="w-full h-full bg-white/50 dark:bg-stone-700/50 hover:bg-white dark:hover:bg-stone-600 transition-colors" />
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
