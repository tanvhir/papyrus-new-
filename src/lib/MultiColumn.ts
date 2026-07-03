import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columns: {
      setColumns: (layout: 'layout-two-column' | 'layout-three-column' | 'layout-left-sidebar' | 'layout-right-sidebar') => ReturnType,
      unsetColumns: () => ReturnType,
    }
  }
}

export const Column = Node.create({
  name: 'column',
  
  content: 'block+',
  
  isolating: true,
  
  parseHTML() {
    return [
      {
        tag: 'div[data-type="column"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column', class: 'flex-1 min-w-0 p-2 border border-transparent hover:border-stone-200/50 rounded transition-colors' }), 0]
  },
})

export const Columns = Node.create({
  name: 'columns',
  
  group: 'block',
  
  content: 'column{2,3}',
  
  defining: true,
  
  isolating: true,

  addAttributes() {
    return {
      layout: {
        default: 'layout-two-column',
        parseHTML: element => element.getAttribute('data-layout'),
        renderHTML: attributes => {
          return {
            'data-layout': attributes.layout,
            class: `multi-column-layout-base my-4 ${attributes.layout}`
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="columns"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'columns' }), 0]
  },

  addKeyboardShortcuts() {
    return {
      'Backspace': () => {
        const { state, commands } = this.editor;
        const { selection } = state;
        const { empty, $anchor } = selection;

        if (!empty) return false;

        // Find if we are in a column structure
        let columnsDepth = -1;
        for (let d = $anchor.depth; d > 0; d--) {
          if ($anchor.node(d).type.name === 'columns') {
            columnsDepth = d;
            break;
          }
        }

        if (columnsDepth === -1) return false;

        const columnsNode = $anchor.node(columnsDepth);
        const columnDepth = columnsDepth + 1;
        const columnNode = $anchor.node(columnDepth);
        
        // Are we at the start of the first block of the first column?
        const colIndex = $anchor.index(columnsDepth);
        const blockIndex = $anchor.index(columnDepth);

        if (colIndex === 0 && blockIndex === 0 && $anchor.parentOffset === 0) {
          return commands.unsetColumns();
        }

        // Check if the entire column structure is "empty" (all paragraphs are empty)
        let isTotallyEmpty = true;
        columnsNode.forEach(column => {
          column.forEach(block => {
            if (block.textContent.length > 0) isTotallyEmpty = false;
          });
        });

        if (isTotallyEmpty && $anchor.parentOffset === 0) {
          return commands.unsetColumns();
        }

        return false;
      },
      'Delete': () => {
        const { state, commands } = this.editor;
        const { selection } = state;
        const { empty, $anchor } = selection;

        if (!empty) return false;

        let columnsDepth = -1;
        for (let d = $anchor.depth; d > 0; d--) {
          if ($anchor.node(d).type.name === 'columns') {
            columnsDepth = d;
            break;
          }
        }

        if (columnsDepth === -1) return false;

        const columnsNode = $anchor.node(columnsDepth);
        
        // Check if totally empty
        let isTotallyEmpty = true;
        columnsNode.forEach(column => {
          column.forEach(block => {
            if (block.textContent.length > 0) isTotallyEmpty = false;
          });
        });

        if (isTotallyEmpty) {
          return commands.unsetColumns();
        }

        return false;
      }
    }
  },

  addCommands() {
    return {
      setColumns: (layout: string) => ({ commands }) => {
        let cols = 2;
        if (layout === 'layout-three-column') cols = 3;
        
        const content = Array.from({ length: cols }).map(() => ({
          type: 'column',
          content: [
            {
              type: 'paragraph',
            }
          ]
        }));
        
        return commands.insertContent({
          type: this.name,
          attrs: { layout },
          content,
        });
      },
      unsetColumns: () => ({ commands, state }) => {
        const { selection } = state;
        const { $from } = selection;
        
        // Find the columns node
        let columnsPos = -1;
        let columnsNode = null;
        
        for (let depth = $from.depth; depth > 0; depth--) {
          const node = $from.node(depth);
          if (node.type.name === 'columns') {
            columnsPos = $from.before(depth);
            columnsNode = node;
            break;
          }
        }

        if (columnsPos === -1 || !columnsNode) {
          return false;
        }

        // Collect all content from all columns
        const allContent: any[] = [];
        columnsNode.forEach((column: any) => {
          column.forEach((child: any) => {
            allContent.push(child.toJSON());
          });
        });

        // Replace the columns node with the collected content
        return commands.insertContentAt({
          from: columnsPos,
          to: columnsPos + columnsNode.nodeSize,
        }, allContent);
      },
    }
  }
})
