import React from 'react';
import { cn } from '@/lib/utils';
import { DividerData } from '@/src/types';

interface DividerRenderProps {
  data: DividerData;
  className?: string;
  isDragging?: boolean;
}

export const DividerRender: React.FC<DividerRenderProps> = ({ data, className, isDragging }) => {
  const { type, orientation, size, length, color } = data;
  const isHorizontal = orientation === 'horizontal';
  const strokeColor = color || 'currentColor';

  const ZigzagDivider = () => {
    const patternSize = Math.max(16, size * 4);
    const h = Math.max(6, size * 3); // Ensure minimum height for visibility
    const patternId = `pattern-${data.id}`;
    
    return (
      <div 
        className={cn("relative overflow-hidden flex items-center justify-center", isHorizontal ? "w-full" : "h-full inline-block")}
        style={{ 
          height: isHorizontal ? `${h}px` : '100%',
          width: isHorizontal ? '100%' : `${h}px`
        }}
      >
        <svg width={isHorizontal ? "100%" : h} height={isHorizontal ? h : "100%"} className="overflow-visible">
          <defs>
            <pattern 
              id={patternId} 
              x="0" y="0" 
              width={isHorizontal ? patternSize : h} 
              height={isHorizontal ? h : patternSize} 
              patternUnits="userSpaceOnUse"
            >
              {isHorizontal ? (
                <path d={`M 0 ${h} L ${patternSize/2} 0 L ${patternSize} ${h}`} fill="none" stroke={strokeColor} strokeWidth={size} strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d={`M ${h} 0 L 0 ${patternSize/2} L ${h} ${patternSize}`} fill="none" stroke={strokeColor} strokeWidth={size} strokeLinecap="round" strokeLinejoin="round" />
              )}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      </div>
    );
  };

  if (type === 'zigzag' || type === 'wave') {
    return (
      <div className={cn("flex items-center justify-center w-full h-full", className)}>
        <ZigzagDivider />
      </div>
    );
  }

  const borderStyle = type === 'dashed' || type === 'dotted' ? type : 'solid';

  return (
    <div className={cn("flex items-center justify-center w-full h-full", className)}>
      <div 
        style={{
          width: isHorizontal ? '100%' : (type === 'solid' ? `${size}px` : '0'),
          height: isHorizontal ? (type === 'solid' ? `${size}px` : '0') : '100%',
          backgroundColor: type === 'solid' ? strokeColor : 'transparent',
          borderBottom: isHorizontal && (type === 'dashed' || type === 'dotted') ? `${size}px ${borderStyle} ${strokeColor}` : 'none',
          borderLeft: !isHorizontal && (type === 'dashed' || type === 'dotted') ? `${size}px ${borderStyle} ${strokeColor}` : 'none',
        }}
      />
    </div>
  );
};
