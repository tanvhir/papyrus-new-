import { useRef } from 'react';
import { Editor } from '@/src/components/editor';
import { StickyNote, STICKY_COLORS, CurvedArrow, FloatingDivider } from '@/src/features/notes';
import { SpiralBinding } from '@/src/components/SpiralBinding';

interface NoteCanvasProps {
  content: string;
  setContent: (content: string) => void;
  texture: string;
  theme: any;
  isHandwriting: boolean;
  fontSize: number;
  notebookStyle: string;
  pageLayout: string;
  pageMargin: string;
  pageLayoutMode: string;
  canvasWidth: number;
  mainHeight: number;
  spiralHeight: number;
  stickies: any[];
  arrows: any[];
  dividers: any[];
  images: any[];
  selectedArrowId: string | null;
  isDrawingArrowMode: boolean;
  drawingPoints: any[];
  isDraggingDraw: boolean;
  editor: any;
  stickyEditor: any;
  setEditor: (editor: any) => void;
  setStickyEditor: (editor: any) => void;
  onUpdateSticky: (id: string, updates: any) => void;
  onDeleteSticky: (id: string) => void;
  onUpdateArrow: (id: string, updates: any) => void;
  onDeleteArrow: (id: string) => void;
  onUpdateDivider: (id: string, updates: any) => void;
  onDeleteDivider: (id: string) => void;
  onUpdateImage: (id: string, updates: any) => void;
  onDeleteImage: (id: string) => void;
  onDrawStart: (e: React.PointerEvent<HTMLDivElement>) => void;
  onDrawMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onDrawEnd: () => void;
  onArrowClick: (id: string) => void;
  onArrowDoubleClick: (id: string) => void;
  mainAreaRef: React.RefObject<HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const NoteCanvas: React.FC<NoteCanvasProps> = ({
  content,
  setContent,
  texture,
  theme,
  isHandwriting,
  fontSize,
  notebookStyle,
  pageLayout,
  pageMargin,
  pageLayoutMode,
  canvasWidth,
  mainHeight,
  spiralHeight,
  stickies,
  arrows,
  dividers,
  images,
  selectedArrowId,
  isDrawingArrowMode,
  drawingPoints,
  isDraggingDraw,
  editor,
  stickyEditor,
  setEditor,
  setStickyEditor,
  onUpdateSticky,
  onDeleteSticky,
  onUpdateArrow,
  onDeleteArrow,
  onUpdateDivider,
  onDeleteDivider,
  onUpdateImage,
  onDeleteImage,
  onDrawStart,
  onDrawMove,
  onDrawEnd,
  onArrowClick,
  onArrowDoubleClick,
  mainAreaRef,
  containerRef,
}) => {
  return (
    <div
      ref={containerRef}
      className="relative transition-all duration-400 ease-smooth shrink-0 select-none flex items-start justify-center print-scale-container"
      style={{
        width: canvasWidth,
        height: mainHeight,
        overflow: 'visible',
      }}
    >
      <div
        ref={mainAreaRef}
        className={`relative transition-all duration-300 ${
          pageLayout === 'pageless' ? 'w-full' : 'w-[820px]'
        }`}
        style={{
          minHeight: mainHeight,
        }}
        onPointerDown={isDrawingArrowMode ? onDrawStart : undefined}
        onPointerMove={isDrawingArrowMode ? onDrawMove : undefined}
        onPointerUp={isDrawingArrowMode ? onDrawEnd : undefined}
        onPointerLeave={isDrawingArrowMode ? onDrawEnd : undefined}
      >
        {/* Spiral Binding for notebook style */}
        {notebookStyle === 'spiral' && pageLayout !== 'pageless' && (
          <SpiralBinding height={spiralHeight} />
        )}

        {/* Paper Content */}
        <div
          className={`print-paper-content relative transition-all duration-300 ${
            pageLayout === 'pageless' ? 'w-full min-h-screen' : 'w-[820px]'
          }`}
          style={{
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            minHeight: mainHeight,
          }}
        >
          {/* Texture Overlay */}
          {texture !== 'plain' && (
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: texture === 'laid' 
                  ? 'repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(0,0,0,0.03) 25px)'
                  : texture === 'lined'
                  ? 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(0,0,0,0.05) 29px)'
                  : texture === 'grid'
                  ? 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(0,0,0,0.05) 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(0,0,0,0.05) 29px)'
                  : texture === 'dot'
                  ? 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)'
                  : 'none',
                backgroundSize: texture === 'dot' ? '20px 20px' : 'auto',
              }}
            />
          )}

          {/* Editor */}
          <Editor
            content={content}
            onChange={setContent}
            isHandwriting={isHandwriting}
            fontSize={fontSize}
            theme={theme}
            editor={editor}
            setEditor={setEditor}
            stickyEditor={stickyEditor}
            setStickyEditor={setStickyEditor}
          />

          {/* Sticky Notes */}
          {stickies.map((sticky) => (
            <StickyNote
              key={sticky.id}
              {...sticky}
              onUpdate={(updates) => onUpdateSticky(sticky.id, updates)}
              onDelete={() => onDeleteSticky(sticky.id)}
            />
          ))}

          {/* Arrows */}
          {arrows.map((arrow) => (
            <CurvedArrow
              key={arrow.id}
              {...arrow}
              isSelected={selectedArrowId === arrow.id}
              onClick={() => onArrowClick(arrow.id)}
              onDoubleClick={() => onArrowDoubleClick(arrow.id)}
              onUpdate={(updates) => onUpdateArrow(arrow.id, updates)}
              onDelete={() => onDeleteArrow(arrow.id)}
            />
          ))}

          {/* Dividers */}
          {dividers.map((divider) => (
            <FloatingDivider
              key={divider.id}
              {...divider}
              onUpdate={(updates) => onUpdateDivider(divider.id, updates)}
              onDelete={() => onDeleteDivider(divider.id)}
            />
          ))}

          {/* Images */}
          {images.map((image) => (
            <div
              key={image.id}
              className="absolute cursor-move"
              style={{
                left: image.position.x,
                top: image.position.y,
                width: image.width || 200,
                height: image.height || 'auto',
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                // Handle image drag
              }}
            >
              <img
                src={image.url}
                alt="Uploaded"
                className="w-full h-full object-contain rounded-lg shadow-lg"
                draggable={false}
              />
              <button
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
                onClick={() => onDeleteImage(image.id)}
              >
                ×
              </button>
            </div>
          ))}

          {/* Drawing Arrow Mode Indicator */}
          {isDrawingArrowMode && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-stone-800 text-white px-4 py-2 rounded-full text-sm z-50">
              Drawing Arrow Mode - Click and drag to draw
            </div>
          )}

          {/* Drawing Points Visualization */}
          {isDrawingArrowMode && drawingPoints.length > 0 && (
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%' }}
            >
              <path
                d={`M ${drawingPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                stroke="#000"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
