import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HeadingItem {
  id: string;
  level: 1 | 2 | 3;
  text: string;
  position: number;
}

interface TableOfContentsProps {
  editor: any;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ editor, scrollContainerRef }) => {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);

  // Extract headings from editor
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

      setHeadings(items);
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
      
      // Find the last heading before the current cursor position
      let activeId: string | null = null;
      for (let i = headings.length - 1; i >= 0; i--) {
        if (headings[i].position <= from) {
          activeId = headings[i].id;
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

  const getIndentClass = (level: number) => {
    switch (level) {
      case 1: return 'ml-0';
      case 2: return 'ml-4';
      case 3: return 'ml-8';
      default: return 'ml-0';
    }
  };

  const getTreeLineClass = (level: number, index: number, totalHeadings: number) => {
    if (level === 1) return '';
    if (level === 2) return 'border-l-2 border-stone-300/30 dark:border-stone-600/30 pl-3';
    if (level === 3) return 'border-l-2 border-stone-300/30 dark:border-stone-600/30 pl-3 ml-4';
    return '';
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="fixed left-0 top-24 z-10 w-56 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="opacity-50 hover:opacity-70 transition-opacity duration-200 pr-2">
        <div className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-4 px-3 tracking-wide uppercase">
          Contents
        </div>
        <div className="space-y-1">
          {headings.map((heading, index) => (
            <div
              key={heading.id}
              className={cn(
                getTreeLineClass(heading.level, index, headings.length)
              )}
            >
              <button
                onClick={() => scrollToHeading(heading.position)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg transition-all duration-200",
                  "hover:bg-stone-200/70 dark:hover:bg-stone-700/70",
                  activeHeading === heading.id
                    ? "bg-stone-300/70 dark:bg-stone-600/70 text-stone-900 dark:text-stone-100 font-semibold"
                    : "text-stone-600 dark:text-stone-400"
                )}
              >
                <span className="text-sm truncate leading-tight">
                  {heading.text}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
