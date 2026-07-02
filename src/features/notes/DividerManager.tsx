import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { DividerData } from '@/src/types';
import { DividerRender } from '@/src/components/DividerRender';
import { cn } from '@/lib/utils';

interface FloatingDividerProps {
  divider: DividerData;
  onUpdate: (id: string, updates: Partial<DividerData>) => void;
  onRemove: (id: string) => void;
  isCleanMode: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const FloatingDivider = React.memo(({ 
  divider, 
  onUpdate, 
  onRemove,
  isCleanMode,
  containerRef,
}: FloatingDividerProps) => {
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
