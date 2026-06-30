import { Node, mergeAttributes } from '@tiptap/core';

export const PageExtension = Node.create({
  name: 'page',
  content: 'block+',
  defining: true,

  parseHTML() {
    return [
      { tag: 'div[data-type="page"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'page', class: 'page-container-node' }), 0];
  },
});
