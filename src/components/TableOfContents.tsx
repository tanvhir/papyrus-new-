import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { List, X, ChevronRight, ChevronDown, Heading1, Heading2, Heading3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeadingItem {
  id: string;
  level: 1 | 2 | 3;
  text: string;
  position: number;
}

interface TableOfContentsProps {
  editor: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ editor, isOpen, onOpenChange }) => {
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
      case 1: return <Heading1 className="w-3.5 h-3.5" />;
      case 2: return <Heading2 className="w-3.5 h-3.5" />;
      case 3: return <Heading3 className="w-3.5 h-3.5" />;
      default: return <List className="w-3.5 h-3.5" />;
    }
  };

  const getIndentClass = (level: number) => {
    switch (level) {
      case 1: return 'ml-0';
      case 2: return 'ml-4';
      case 3: return 'ml-8';
      default: return 'ml-0';
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => onOpenChange(!isOpen)}
        className={cn(
          "fixed top-24 right-4 z-40 p-3 rounded-full shadow-lg transition-all duration-200",
          "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800",
          "hover:bg-stone-50 dark:hover:bg-stone-800",
          "text-stone-600 dark:text-stone-400"
        )}
        title="Table of Contents"
      >
        {isOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
      </motion.button>

      {/* Table of Contents Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-24 right-4 z-40 w-80 max-h-[calc(100vh-8rem)] overflow-hidden"
          >
            <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Table of Contents
                  </h3>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {headings.length} sections
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(100vh-10rem)] p-2">
                <div className="space-y-1">
                  {headings.map((heading) => (
                    <button
                      key={heading.id}
                      onClick={() => scrollToHeading(heading.position)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-all duration-150",
                        "flex items-center gap-2 group",
                        "hover:bg-stone-100 dark:hover:bg-stone-800",
                        activeHeading === heading.id
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-stone-700 dark:text-stone-300",
                        getIndentClass(heading.level)
                      )}
                    >
                      {getHeadingIcon(heading.level)}
                      <span className="flex-1 text-sm truncate">
                        {heading.text}
                      </span>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
