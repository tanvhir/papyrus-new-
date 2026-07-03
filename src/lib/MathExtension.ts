import { Node, mergeAttributes, nodeInputRule, nodePasteRule } from '@tiptap/core';
import katex from 'katex';

const inputRegex = /(?:^|\s)\$([^$]+)\$$/;
const pasteRegex = /\$([^$]+)\$/g;
const bracketPasteRegex = /\\\(|\\\[([\s\S]+?)\\\)|\\\]/g;

export const MathExtension = Node.create({
  name: 'math',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: 'E = mc^2',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math"]',
        getAttrs: element => ({
          latex: (element as HTMLElement).getAttribute('data-latex'),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return ['span', mergeAttributes(HTMLAttributes, { 
      'data-type': 'math',
      'data-latex': node.attrs.latex 
    })];
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: match => ({
          latex: match[1],
        }),
      }),
    ];
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: /\$([^$]+)\$/g,
        type: this.type,
        getAttributes: match => ({ latex: match[1] }),
      }),
      nodePasteRule({
        find: /\\\[([\s\S]+?)\\\]/g,
        type: this.type,
        getAttributes: match => ({ latex: match[1] }),
      }),
      nodePasteRule({
        find: /\\\(([\s\S]+?)\\\)/g,
        type: this.type,
        getAttributes: match => ({ latex: match[1] }),
      }),
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('span');
      dom.classList.add('math-node');
      dom.setAttribute('data-latex', node.attrs.latex);
      
      const latex = node.attrs.latex;
      try {
        katex.render(latex, dom, {
          throwOnError: false,
          displayMode: false,
        });
      } catch (e) {
        dom.textContent = latex;
      }
      
      return {
        dom,
      };
    };
  },
});
