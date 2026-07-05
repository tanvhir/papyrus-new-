import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { DividerRender } from '@/src/components/DividerRender';
import { DividerData } from '@/src/types';
import { X } from 'lucide-react';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export interface DecorativeDividerAttributes {
  type: 'solid' | 'zigzag' | 'wave' | 'dashed' | 'dotted';
  orientation: 'horizontal' | 'vertical';
  size: number;
  length: string;
  color: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    decorativeDivider: {
      setDecorativeDivider: (options?: Partial<DecorativeDividerAttributes>) => ReturnType;
    };
  }
}

const DividerComponent = ({ node, deleteNode, editor }: any) => {
  const isHorizontal = node.attrs.orientation === 'horizontal';
  const editable = editor?.isEditable;

  return (
    <NodeViewWrapper className="decorative-divider-wrapper group relative flex items-center justify-center">
      <DividerRender 
        data={node.attrs as DividerData} 
        className={cn(
          "w-full transition-opacity duration-200",
          isHorizontal ? "my-6" : "inline-flex mx-4 h-full align-middle min-h-[40px]"
        )}
      />
      {editable && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteNode();
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-red-500 text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all z-50 hover:bg-red-600 hover:scale-110 flex items-center justify-center border-2 border-white dark:border-stone-900"
          title="Remove Separator"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </NodeViewWrapper>
  );
};

export const DecorativeDivider = Node.create({
  name: 'decorativeDivider',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      type: { default: 'solid' },
      orientation: { default: 'horizontal' },
      size: { default: 2 },
      length: { default: '100%' },
      color: { default: '#78716c' },
      id: { default: null } // for pattern unique ids
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="decorative-divider"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'decorative-divider' })];
  },

  addCommands() {
    return {
      setDecorativeDivider: (options) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { ...options, id: Math.random().toString(36).substr(2, 9) }
          })
          .run();
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(DividerComponent);
  },
});
