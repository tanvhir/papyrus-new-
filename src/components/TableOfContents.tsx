import React, { useState, useEffect } from 'react';
import { Heading1, Heading2, Heading3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeadingItem {
  id: string;
  level: 1 | 2 | 3;
  text: string;
  position: number;
}

interface TableOfContentsProps {
  editor: any;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ editor }) => {
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
    
    const coords = editor.view.coordsAtPos(position);
    if (coords) {
      const editorView = editor.view.dom;
      const scrollTop = coords.top - editorView.getBoundingClientRect().top + editorView.scrollTop - 100;
      
      editorView.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });

      // Set cursor to heading position
      editor.chain().focus().setTextSelection({ from: position, to: position }).run();
    }
  };

  const getHeadingIcon = (level: number) => {
    switch (level) {
      case 1: return <Heading1 className="w-3 h-3" />;
      case 2: return <Heading2 className="w-3 h-3" />;
      case 3: return <Heading3 className="w-3 h-3" />;
      default: return null;
    }
  };

  const getIndentClass = (level: number) => {
    switch (level) {
      case 1: return 'ml-0';
      case 2: return 'ml-2';
      case 3: return 'ml-4';
      default: return 'ml-0';
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="fixed left-4 top-24 z-10 w-48 max-h-[calc(100vh-8rem)] overflow-hidden">
      <div className="opacity-40 hover:opacity-60 transition-opacity duration-200">
        <div className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2 px-1">
          Contents
        </div>
        <div className="space-y-0.5">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.position)}
              className={cn(
                "w-full text-left px-2 py-1 rounded transition-all duration-150",
                "flex items-center gap-1.5",
                "hover:bg-stone-200/50 dark:hover:bg-stone-700/50",
                activeHeading === heading.id
                  ? "bg-stone-300/50 dark:bg-stone-600/50 text-stone-900 dark:text-stone-100 font-medium"
                  : "text-stone-600 dark:text-stone-400",
                getIndentClass(heading.level)
              )}
            >
              {getHeadingIcon(heading.level)}
              <span className="text-xs truncate">
                {heading.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
