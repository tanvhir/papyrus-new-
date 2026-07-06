import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown } from 'lucide-react';

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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
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
      
      // Auto-expand all items by default
      const allIds = new Set(items.map(h => h.id));
      setExpandedItems(allIds);
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

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getIndentWidth = (level: number) => {
    switch (level) {
      case 1: return 0;
      case 2: return 14;
      case 3: return 28;
      default: return 0;
    }
  };

  const getTypographyClass = (level: number, isActive: boolean) => {
    const baseClass = "truncate transition-all duration-200 ";
    
    if (isActive) {
      switch (level) {
        case 1: return baseClass + "font-semibold text-sm text-stone-900 dark:text-stone-100";
        case 2: return baseClass + "font-medium text-xs text-stone-800 dark:text-stone-200";
        case 3: return baseClass + "font-normal text-[11px] text-stone-700 dark:text-stone-300";
        default: return baseClass + "text-sm text-stone-900 dark:text-stone-100";
      }
    } else {
      switch (level) {
        case 1: return baseClass + "font-medium text-sm text-stone-600 dark:text-stone-400";
        case 2: return baseClass + "font-normal text-xs text-stone-500 dark:text-stone-500";
        case 3: return baseClass + "font-normal text-[11px] text-stone-400 dark:text-stone-600";
        default: return baseClass + "text-sm text-stone-600 dark:text-stone-400";
      }
    }
  };

  const getVerticalSpacing = (level: number) => {
    switch (level) {
      case 1: return 'pt-3';
      case 2: return 'pt-1';
      case 3: return 'pt-0.5';
      default: return 'pt-1';
    }
  };

  const renderTreeItem = (item: HeadingItem, depth: number = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeHeading === item.id;
    const indent = getIndentWidth(item.level);
    const verticalSpacing = getVerticalSpacing(item.level);
    
    // Hierarchy rail position - fixed distance from right edge
    const railPosition = 16; // px from right edge
    
    return (
      <div key={item.id} className="relative">
        {/* Connector line from text to hierarchy rail */}
        <div 
          className={cn(
            "absolute top-1/2 -translate-y-1/2 transition-all duration-200",
            isActive ? "bg-stone-400 dark:bg-stone-500" : "bg-stone-300/20 dark:bg-stone-700/20"
          )}
          style={{
            right: `${railPosition}px`,
            width: `${indent + 8}px`,
            height: '1px',
            opacity: isActive ? 0.5 : 0.2
          }}
        />
        
        {/* Tree item button */}
        <button
          onClick={() => {
            scrollToHeading(item.position);
            if (hasChildren) {
              toggleExpanded(item.id);
            }
          }}
          className={cn(
            "relative w-full text-left transition-all duration-200",
            "hover:bg-stone-50/40 dark:hover:bg-stone-900/20",
            "group flex items-center",
            verticalSpacing,
            isActive ? "py-2" : "py-1"
          )}
          style={{ paddingLeft: `${8 + indent}px`, paddingRight: `${railPosition + 12}px` }}
        >
          {/* Expand/collapse indicator on hierarchy rail */}
          {hasChildren && (
            <div 
              className={cn(
                "absolute top-1/2 -translate-y-1/2 transition-all duration-200",
                "opacity-0 group-hover:opacity-100"
              )}
              style={{ right: `${railPosition - 5}px` }}
            >
              {isExpanded ? (
                <ChevronDown className="w-2.5 h-2.5 text-stone-400 dark:text-stone-600" />
              ) : (
                <ChevronRight className="w-2.5 h-2.5 text-stone-400 dark:text-stone-600" />
              )}
            </div>
          )}
          
          {/* Node indicator on hierarchy rail */}
          <div 
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-200",
              isActive ? "bg-stone-500 dark:bg-stone-400" : "bg-stone-300/40 dark:bg-stone-700/40"
            )}
            style={{ 
              right: `${railPosition - 2}px`,
              opacity: isActive ? 0.8 : 0.3
            }}
          />
          
          {/* Heading text */}
          <span className={getTypographyClass(item.level, isActive)}>
            {item.text}
          </span>
        </button>
        
        {/* Vertical connector line on hierarchy rail for children */}
        {hasChildren && isExpanded && (
          <div 
            className="absolute transition-all duration-200"
            style={{
              right: `${railPosition - 1.5}px`,
              top: '28px',
              bottom: '0',
              width: '1px',
              background: 'linear-gradient(to bottom, rgba(115, 115, 115, 0.12) 0%, rgba(115, 115, 115, 0.04) 100%)'
            }}
          />
        )}
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="relative">
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
        paddingTop: 'calc(6rem + 24px)', // Align with notebook top edge
        // Position TOC to hug the notebook with ~20px before spiral binding
        // Canvas width is 820px (a4-portrait), half is 410px
        // Spiral binding is 36px wide at left edge of notebook
        // TOC right edge should be 20px before spiral: 50% - 410px - 20px = 50% - 430px
        // TOC width is 200px, so left edge: 50% - 430px - 200px = 50% - 630px
        left: 'calc(50% - 630px)',
        width: '200px'
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
      
      {/* Fade effect at top */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-stone-50/60 dark:from-stone-950/60 to-transparent pointer-events-none" />
      
      {/* Fade effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-stone-50/60 dark:from-stone-950/60 to-transparent pointer-events-none" />
      
      {/* TOC Content - no padding to make it float naturally */}
      <div className="px-3 pb-6">
        {/* Contents heading - minimal and subtle */}
        <div className="text-[9px] font-medium text-stone-400 dark:text-stone-500 mb-3 tracking-widest uppercase opacity-60 pl-2">
          Contents
        </div>
        
        {/* Tree structure with dedicated hierarchy rail */}
        <div className="space-y-0">
          {headings.map(heading => renderTreeItem(heading))}
        </div>
      </div>
    </div>
  );
};
