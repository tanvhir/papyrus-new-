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
    // Right-aligned indentation - hierarchy grows toward notebook (right side)
    // Level 1: furthest from rail (most left)
    // Level 2: closer to rail
    // Level 3: closest to rail (most right)
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

  const getVerticalSpacing = (level: number) => {
    switch (level) {
      case 1: return 'pt-5';
      case 2: return 'pt-1.5';
      case 3: return 'pt-1';
      default: return 'pt-1.5';
    }
  };

  const getRowHeight = (level: number) => {
    switch (level) {
      case 1: return 'py-2';
      case 2: return 'py-1.5';
      case 3: return 'py-1';
      default: return 'py-1.5';
    }
  };

  const renderTreeItem = (item: HeadingItem, depth: number = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeHeading === item.id;
    const indent = getIndentWidth(item.level);
    const verticalSpacing = getVerticalSpacing(item.level);
    const rowHeight = getRowHeight(item.level);
    
    // Navigation rail position - fixed distance from right edge, anchored to spiral
    const railPosition = 10; // px from right edge
    
    // TOC width is 215px, rail is at 215 - railPosition = 205px from left
    // Right-aligned indentation: text starts at different positions based on level
    // Level 1: 10px from left (furthest from rail)
    // Level 2: 10 + 16 = 26px from left (closer to rail)
    // Level 3: 10 + 32 = 42px from left (closest to rail)
    const textStart = 10 + indent;
    const railFromLeft = 215 - railPosition;
    const connectorWidth = railFromLeft - textStart;
    
    return (
      <div key={item.id} className="relative">
        {/* Connector line from text to navigation rail - extends fully to rail */}
        <div 
          className={cn(
            "absolute top-1/2 -translate-y-1/2 transition-all duration-180",
            isActive ? "bg-stone-400 dark:bg-stone-500" : "bg-stone-300/12 dark:bg-stone-700/12"
          )}
          style={{
            left: `${textStart}px`,
            width: `${connectorWidth}px`,
            height: '1px',
            opacity: isActive ? 0.5 : 0.15
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
            "relative w-full text-left transition-all duration-180",
            "hover:bg-stone-50/25 dark:hover:bg-stone-900/10",
            "group flex items-center",
            verticalSpacing,
            rowHeight
          )}
          style={{ paddingLeft: `${textStart}px`, paddingRight: `${railPosition + 12}px` }}
        >
          {/* Expand/collapse indicator on navigation rail */}
          {hasChildren && (
            <div 
              className={cn(
                "absolute top-1/2 -translate-y-1/2 transition-all duration-180",
                "opacity-0 group-hover:opacity-100"
              )}
              style={{ right: `${railPosition - 3}px` }}
            >
              {isExpanded ? (
                <ChevronDown className="w-1.5 h-1.5 text-stone-400 dark:text-stone-600" />
              ) : (
                <ChevronRight className="w-1.5 h-1.5 text-stone-400 dark:text-stone-600" />
              )}
            </div>
          )}
          
          {/* Node indicator on navigation rail - subtle dot */}
          <div 
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-0.5 h-0.5 rounded-full transition-all duration-180",
              isActive ? "bg-stone-500 dark:bg-stone-400" : "bg-stone-300/25 dark:bg-stone-700/25"
            )}
            style={{ 
              right: `${railPosition - 1}px`,
              opacity: isActive ? 0.6 : 0.2
            }}
          />
          
          {/* Heading text */}
          <span className={getTypographyClass(item.level, isActive)}>
            {item.text}
          </span>
        </button>
        
        {/* Vertical connector line on navigation rail for children */}
        {hasChildren && isExpanded && (
          <div 
            className="absolute transition-all duration-180"
            style={{
              right: `${railPosition - 1}px`,
              top: '28px',
              bottom: '0',
              width: '0.5px',
              background: 'linear-gradient(to bottom, rgba(115, 115, 115, 0.08) 0%, rgba(115, 115, 115, 0.02) 100%)'
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
      
      {/* TOC Content - minimal padding to feel like printed margin */}
      <div className="px-2 pb-4">
        {/* Contents heading - extremely subtle, like printed margin text */}
        <div className="text-[8px] font-medium text-stone-400 dark:text-stone-500 mb-5 tracking-widest uppercase opacity-45 pl-3">
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
