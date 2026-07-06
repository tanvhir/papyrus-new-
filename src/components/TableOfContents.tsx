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
      case 2: return 16;
      case 3: return 32;
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

  const renderTreeItem = (item: HeadingItem, depth: number = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeHeading === item.id;
    const indent = getIndentWidth(item.level);
    
    return (
      <div key={item.id} className="relative">
        {/* Right-side connector line pointing to spiral */}
        <div 
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 w-8 transition-all duration-200",
            isActive ? "bg-stone-400 dark:bg-stone-500" : "bg-stone-300/30 dark:bg-stone-700/30"
          )}
          style={{
            height: '1px',
            opacity: isActive ? 0.6 : 0.25
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
            "relative w-full text-left py-1.5 pr-10 transition-all duration-200",
            "hover:bg-stone-100/50 dark:hover:bg-stone-800/30",
            "group flex items-center gap-2"
          )}
          style={{ paddingLeft: `${12 + indent}px` }}
        >
          {/* Expand/collapse indicator (right side) */}
          {hasChildren && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-stone-400 dark:text-stone-600" />
              ) : (
                <ChevronRight className="w-3 h-3 text-stone-400 dark:text-stone-600" />
              )}
            </div>
          )}
          
          {/* Heading text */}
          <span className={getTypographyClass(item.level, isActive)}>
            {item.text}
          </span>
        </button>
        
        {/* Vertical connector line for children */}
        {hasChildren && isExpanded && (
          <div 
            className="absolute right-3 top-8 bottom-0 w-px transition-all duration-200"
            style={{
              background: 'linear-gradient(to bottom, rgba(115, 115, 115, 0.15) 0%, rgba(115, 115, 115, 0.05) 100%)'
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
      className="fixed left-0 top-0 z-10 w-[230px] max-h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        paddingTop: 'calc(6rem + 24px)' // Align with notebook top edge (header height + padding)
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
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-stone-50/80 dark:from-stone-950/80 to-transparent pointer-events-none" />
      
      {/* Fade effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-stone-50/80 dark:from-stone-950/80 to-transparent pointer-events-none" />
      
      {/* TOC Content */}
      <div className="px-4 pb-8">
        {/* Contents heading - positioned slightly above notebook top */}
        <div className="text-[10px] font-medium text-stone-400 dark:text-stone-500 mb-2 tracking-widest uppercase opacity-70">
          Contents
        </div>
        
        {/* Tree structure with right-side connectors */}
        <div className="space-y-0">
          {headings.map(heading => renderTreeItem(heading))}
        </div>
      </div>
    </div>
  );
};
