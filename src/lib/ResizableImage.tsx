import Image from '@tiptap/extension-image';
import { mergeAttributes, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';

const ResizableImageComponent = ({ node, updateAttributes, editor }: any) => {
  const editable = editor?.isEditable;
  const [width, setWidth] = useState(node.attrs.width || '100%');
  const imgRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!editable) return;
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing || !imgRef.current) return;
      
      const rect = imgRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const finalWidth = Math.max(100, Math.min(newWidth, 800));
      setWidth(`${finalWidth}px`);
    };

    const onMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        updateAttributes({ width });
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, width, updateAttributes]);

  return (
    <NodeViewWrapper className="resizable-image-wrapper my-8 relative inline-block group">
      <div className="relative inline-block border-4 border-white shadow-xl rounded-xl overflow-hidden bg-white">
        <img
          ref={imgRef}
          src={node.attrs.src}
          style={{ width: width, height: 'auto', display: 'block' }}
          alt=""
          className="max-w-full"
        />
        {editable && (
          <div
            onMouseDown={onMouseDown}
            className="absolute bottom-0 right-0 w-6 h-6 bg-stone-800/20 backdrop-blur-sm cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-tl-lg"
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: attributes => ({
          style: `width: ${attributes.width}`,
        }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});
