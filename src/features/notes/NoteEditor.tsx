import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { Note, Subject, PaperTexture, NoteTheme, Point, ArrowData, DividerData, ImageData } from '@/src/types';
import { THEMES } from '@/src/types';
import Editor from '@/src/components/editor';
import { StationeryBar } from '@/src/components/StationeryBar';
import { SpiralBinding } from '@/src/components/SpiralBinding';
import { StickyNote } from './StickyNoteManager';
import { CurvedArrow } from './ArrowManager';
import { FloatingDivider } from './DividerManager';
import { ImageManager } from './ImageManager';
import { usePageLayout } from './PageLayout';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  activeNoteId: string;
  subjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  mainAreaRef: React.RefObject<HTMLDivElement>;
  isCleanMode: boolean;
  pageLayout: 'pageless' | 'a4-portrait' | 'a4-landscape';
  pageMargin: 'normal' | 'narrow' | 'none';
  pageLayoutMode: 'single' | 'book';
  setPageLayout: (layout: 'pageless' | 'a4-portrait' | 'a4-landscape') => void;
  setPageMargin: (margin: 'normal' | 'narrow' | 'none') => void;
  setPageLayoutMode: (mode: 'single' | 'book') => void;
  scale: number;
  mainHeight: number;
  spiralHeight: number;
  bookScrollWidth: number;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  activeNoteId,
  subjects,
  onSubjectsChange,
  containerRef,
  mainAreaRef,
  isCleanMode,
  pageLayout,
  pageMargin,
  pageLayoutMode,
  setPageLayout,
  setPageMargin,
  setPageLayoutMode,
  scale,
  mainHeight,
  spiralHeight,
  bookScrollWidth
}) => {
  const [content, setContent] = useState('');
  const [texture, setTexture] = useState<PaperTexture>('laid');
  const [theme, setTheme] = useState<NoteTheme>(THEMES[0]);
  const [notebookStyle, setNotebookStyle] = useState<'classic' | 'spiral'>('spiral');
  const [stickies, setStickies] = useState<{ id: string, text: string, color: string, position?: Point, fontSize?: number, isPinned?: boolean }[]>([]);
  const [arrows, setArrows] = useState<ArrowData[]>([]);
  const [dividers, setDividers] = useState<DividerData[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [isHandwriting, setIsHandwriting] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [selectedArrowId, setSelectedArrowId] = useState<string | null>(null);
  const [editor, setEditor] = useState<any>(null);

  const { getVisualPosition, canvasWidth } = usePageLayout({
    pageLayout,
    pageMargin,
    pageLayoutMode,
    canvasWidth: pageLayout === 'a4-landscape' ? 1160 : pageLayout === 'a4-portrait' ? 820 : 850
  });

  const getActiveNote = () => {
    for (const subject of subjects) {
      const note = subject.notes.find(n => n.id === activeNoteId);
      if (note) return note;
    }
    return null;
  };

  useEffect(() => {
    const note = getActiveNote();
    if (note) {
      setContent(note.content);
      setTexture(note.texture);
      const matchedTheme = THEMES.find(t => t.id === note.themeId) || THEMES[0];
      setTheme(matchedTheme);
      setStickies(note.stickies);
      setArrows(note.arrows || []);
      setDividers(note.dividers || []);
      setImages(note.images || []);
      setIsHandwriting(note.isHandwriting);
      setFontSize(note.fontSize || 18);
      setPageLayout(note.pageLayout || 'a4-portrait');
      setPageMargin(note.pageMargin || 'normal');
      setPageLayoutMode(note.pageLayoutMode || 'single');
    }
  }, [activeNoteId, subjects]);

  useEffect(() => {
    onSubjectsChange(subjects.map(s => ({
      ...s,
      notes: s.notes.map(n => n.id === activeNoteId ? {
        ...n,
        content,
        texture,
        themeId: theme.id,
        stickies,
        arrows,
        dividers,
        images,
        isHandwriting,
        fontSize,
        pageLayout,
        pageMargin,
        pageLayoutMode,
        notebookStyle
      } : n)
    })));
  }, [content, texture, theme, stickies, arrows, dividers, images, isHandwriting, fontSize, pageLayout, pageMargin, pageLayoutMode, notebookStyle, activeNoteId]);

  const handleAddSticky = () => {
    const newSticky = {
      id: `sticky-${Date.now()}`,
      text: '',
      color: 'yellow',
      position: { x: 100, y: 100 },
      fontSize: 14,
      isPinned: false
    };
    setStickies([...stickies, newSticky]);
  };

  const handleUpdateSticky = (id: string, updates: any) => {
    setStickies(stickies.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleRemoveSticky = (id: string) => {
    setStickies(stickies.filter(s => s.id !== id));
  };

  const handleUpdateArrow = (id: string, updates: Partial<ArrowData>) => {
    setArrows(arrows.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleRemoveArrow = (id: string) => {
    setArrows(arrows.filter(a => a.id !== id));
  };

  const handleUpdateDivider = (id: string, updates: Partial<DividerData>) => {
    setDividers(dividers.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleRemoveDivider = (id: string) => {
    setDividers(dividers.filter(d => d.id !== id));
  };

  const handleUpdateImage = (id: string, updates: Partial<ImageData>) => {
    setImages(images.map(img => img.id === id ? { ...img, ...updates } : img));
  };

  const handleRemoveImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const newImage: ImageData = {
              id: `image-${Date.now()}`,
              src: reader.result as string,
              position: { x: 100, y: 100 },
              width: 300,
              height: 200
            };
            setImages([...images, newImage]);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  return (
    <div 
      ref={mainAreaRef}
      className="flex-1 overflow-auto custom-scrollbar relative"
      onPaste={handlePaste}
    >
      <div 
        ref={containerRef}
        className={cn(
          "relative mx-auto transition-all duration-300",
          pageLayout === 'pageless' ? "w-[850px] min-h-[1000px]" : "",
          pageLayout === 'a4-portrait' ? "w-[820px]" : "",
          pageLayout === 'a4-landscape' ? "w-[1160px]" : ""
        )}
        style={{
          minHeight: mainHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top center'
        }}
      >
        <div className={cn(
          "relative bg-white dark:bg-stone-900 transition-colors duration-300",
          theme.className
        )}>
          {notebookStyle === 'spiral' && pageLayout !== 'pageless' && (
            <SpiralBinding height={spiralHeight} />
          )}

          <div className={cn(
            "print-paper-content",
            pageLayout === 'pageless' ? "p-12" : "",
            pageMargin === 'none' ? "p-4" : "",
            pageMargin === 'narrow' ? "p-8" : "",
            pageMargin === 'normal' ? "p-16" : ""
          )}>
            <Editor
              content={content}
              onChange={setContent}
              editable={!isCleanMode}
              fontSize={fontSize}
              isHandwriting={isHandwriting}
              editor={editor}
              setEditor={setEditor}
              theme={theme}
            />

            {!isCleanMode && (
              <>
                <AnimatePresence>
                  {stickies.map(sticky => (
                    <StickyNote
                      key={sticky.id}
                      id={sticky.id}
                      content={sticky.text}
                      color={sticky.color}
                      position={getVisualPosition(sticky.position || { x: 100, y: 100 })}
                      onRemove={() => handleRemoveSticky(sticky.id)}
                      onEdit={handleUpdateSticky}
                      onTogglePin={() => handleUpdateSticky(sticky.id, { isPinned: !sticky.isPinned })}
                      onUpdate={(updates) => handleUpdateSticky(sticky.id, updates)}
                      containerRef={containerRef}
                      isHandwriting={isHandwriting}
                      fontSize={sticky.fontSize}
                      isPinned={sticky.isPinned}
                    />
                  ))}
                </AnimatePresence>

                {arrows.map(arrow => (
                  <CurvedArrow
                    key={arrow.id}
                    arrow={arrow}
                    onUpdate={handleUpdateArrow}
                    onRemove={handleRemoveArrow}
                    isCleanMode={isCleanMode}
                    theme={theme}
                    scale={scale}
                    isSelected={selectedArrowId === arrow.id}
                    onSelect={setSelectedArrowId}
                  />
                ))}

                {dividers.map(divider => (
                  <FloatingDivider
                    key={divider.id}
                    divider={divider}
                    onUpdate={handleUpdateDivider}
                    onRemove={handleRemoveDivider}
                    isCleanMode={isCleanMode}
                    containerRef={containerRef}
                  />
                ))}

                <ImageManager
                  images={images}
                  onUpdate={handleUpdateImage}
                  onRemove={handleRemoveImage}
                  containerRef={containerRef}
                  isCleanMode={isCleanMode}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {!isCleanMode && (
        <StationeryBar
          onAddSticky={handleAddSticky}
          texture={texture}
          onTextureChange={setTexture}
          theme={theme}
          onThemeChange={setTheme}
          isHandwriting={isHandwriting}
          onHandwritingToggle={() => setIsHandwriting(!isHandwriting)}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          notebookStyle={notebookStyle}
          onNotebookStyleChange={setNotebookStyle}
          pageLayout={pageLayout}
          onPageLayoutChange={setPageLayout}
          pageMargin={pageMargin}
          onPageMarginChange={setPageMargin}
          pageLayoutMode={pageLayoutMode}
          onPageLayoutModeChange={setPageLayoutMode}
        />
      )}
    </div>
  );
};
