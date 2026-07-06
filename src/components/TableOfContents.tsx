import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface HeadingItem {
  id: string;
  level: 1 | 2 | 3;
  text: string;
  position: number;
  children?: HeadingItem[];
  expanded?: boolean;
}

interface TableOfContentsProps {
  editor: any;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ editor, scrollContainerRef }) => {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const tocRef = useRef<HTMLDivElement>(null);

  // Extract headings from editor and build tree structure
  useEffect(() => {
    if (!editor) return;

    const extractHeadings = () => {
      const items: HeadingItem[] = [];
      let position = 0;

      editor.state.doc.descendants((node: any, pos: number) => {
        if (node.type.name === 'heading') {
          const level = node.attrs.level as 1 | 2 | 3;
          const text = node.textContent;
          const id = `heading-${pos}`;
          
          items.push({
            id,
            level,
            text: text || 'Untitled',
            position: pos
          });
        }
      });

      // Build tree structure based on heading levels
      const buildTree = (flatItems: HeadingItem[]): HeadingItem[] => {
        const result: HeadingItem[] = [];
        const stack: { level: number; node: HeadingItem }[] = [];

        flatItems.forEach(item => {
          const newNode = { ...item, children: [] };

          // Pop items from stack that are at or below current level
          while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
            stack.pop();
          }

          if (stack.length === 0) {
            result.push(newNode);
          } else {
            const parent = stack[stack.length - 1].node;
            if (!parent.children) parent.children = [];
            parent.children.push(newNode);
          }

          stack.push({ level: item.level, node: newNode });
        });

        return result;
      };

      const tree = buildTree(items);
      setHeadings(tree);
    };

    extractHeadings();

    // Update headings on document changes
    const handleUpdate = () => {
      extractHeadings();
    };

    editor.on('update', handleUpdate);
    editor.on('transaction', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('transaction', handleUpdate);
    };
  }, [editor]);

  // Track active heading on scroll
  useEffect(() => {
    if (!editor || headings.length === 0) return;

    const handleScroll = () => {
      const { from } = editor.state.selection;
      
      // Flatten all headings to find the active one
      const flattenHeadings = (items: HeadingItem[]): HeadingItem[] => {
        const result: HeadingItem[] = [];
        const traverse = (node: HeadingItem) => {
          result.push(node);
          if (node.children) {
            node.children.forEach(traverse);
          }
        };
        items.forEach(traverse);
        return result;
      };

      const flatHeadings = flattenHeadings(headings);
      
      // Find the last heading before the current cursor position
      let activeId: string | null = null;
      for (let i = flatHeadings.length - 1; i >= 0; i--) {
        if (flatHeadings[i].position <= from) {
          activeId = flatHeadings[i].id;
          break;
        }
      }
      
      setActiveHeading(activeId);
    };

    // Check on selection changes
    editor.on('selectionUpdate', handleScroll);
    
    // Also check on scroll events in the editor view
    const editorView = editor.view.dom;
    editorView.addEventListener('scroll', handleScroll);

    return () => {
      editor.off('selectionUpdate', handleScroll);
      editorView.removeEventListener('scroll', handleScroll);
    };
  }, [editor, headings]);

  const scrollToHeading = (position: number) => {
    if (!editor) return;
    
    // Set cursor to heading position first
    editor.chain().focus().setTextSelection({ from: position, to: position }).run();
    
    // Use a more reliable scroll method
    setTimeout(() => {
      const { view } = editor;
      const coords = view.coordsAtPos(position);
      if (!coords) return;
      
      // Use the provided scroll container ref if available
      const scrollContainer = scrollContainerRef?.current || view.dom.closest('[style*="overflow"]') || view.dom.parentElement || view.dom;
      
      if (scrollContainer) {
        // Calculate the scroll position relative to the scroll container
        const containerRect = scrollContainer.getBoundingClientRect();
        const targetScrollTop = coords.top - containerRect.top + scrollContainer.scrollTop - 80;
        
        scrollContainer.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  };


  const getIndentWidth = (level: number) => {
    // Mathematical 4px grid alignment with more breathing room
    switch (level) {
      case 1: return 0;
      case 2: return 20;
      case 3: return 40;
      default: return 0;
    }
  };

  const getTypographyClass = (level: number, isActive: boolean) => {
    const baseClass = "truncate transition-all duration-200 ";
    
    if (isActive) {
      switch (level) {
        case 1: return baseClass + "font-normal text-xs text-stone-800 dark:text-stone-200";
        case 2: return baseClass + "font-normal text-[11px] text-stone-700 dark:text-stone-300";
        case 3: return baseClass + "font-normal text-[10px] text-stone-600 dark:text-stone-400";
        default: return baseClass + "font-normal text-xs text-stone-800 dark:text-stone-200";
      }
    } else {
      switch (level) {
        case 1: return baseClass + "font-normal text-xs text-stone-500 dark:text-stone-500";
        case 2: return baseClass + "font-normal text-[11px] text-stone-400 dark:text-stone-600";
        case 3: return baseClass + "font-normal text-[10px] text-stone-350 dark:text-stone-650";
        default: return baseClass + "font-normal text-xs text-stone-500 dark:text-stone-500";
      }
    }
  };

  const getVerticalSpacing = (level: number) => {
    switch (level) {
      case 1: return 'pt-8';
      case 2: return 'pt-4';
      case 3: return 'pt-3';
      default: return 'pt-4';
    }
  };

  const getRowHeight = (level: number) => {
    return 'py-3';
  };

  const renderTreeItem = (item: HeadingItem, depth: number = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = activeHeading === item.id;
    const indent = getIndentWidth(item.level);
    const verticalSpacing = getVerticalSpacing(item.level);
    const rowHeight = getRowHeight(item.level);
    
    return (
      <div key={item.id}>
        <button
          onClick={() => scrollToHeading(item.position)}
          className={cn(
            "w-full text-left transition-all duration-180",
            "hover:bg-stone-50/25 dark:hover:bg-stone-900/10",
            verticalSpacing,
            rowHeight
          )}
          style={{ paddingLeft: `${16 + indent}px` }}
        >
          <span className={getTypographyClass(item.level, isActive)}>
            {item.text}
          </span>
        </button>
        
        {hasChildren && (
          <div>
            {item.children!.map(child => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div 
      ref={tocRef}
      className="fixed top-0 z-10 max-h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        paddingTop: 'calc(6rem + 8px)', // Align Contents with notebook's first content area (header 6rem + pt-2 8px)
        // Position TOC to hug the notebook with 7px before spiral binding
        // Canvas width is 820px (a4-portrait), half is 410px
        // Spiral binding is 36px wide at left edge of notebook
        // TOC right edge should be 7px before spiral: 50% - 410px - 7px = 50% - 417px
        // TOC width is 215px, so left edge: 50% - 417px - 215px = 50% - 632px
        left: 'calc(50% - 632px)',
        width: '215px'
      }}
    >
      {/* Custom scrollbar hiding */}
      <style>{`
        .toc-scroll::-webkit-scrollbar {
          display: none;
        }
        .toc-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* TOC Content - generous padding like printed book margin */}
      <div className="px-4 pb-8">
        {/* Contents heading - extremely subtle, like printed margin text */}
        <div className="text-[8px] font-medium text-stone-400 dark:text-stone-500 mb-8 tracking-widest uppercase opacity-45 pl-2">
          Contents
        </div>
        
        {/* Tree structure with precise navigation rail */}
        <div className="space-y-0">
          {headings.map(heading => renderTreeItem(heading))}
        </div>
      </div>
    </div>
  );
};
