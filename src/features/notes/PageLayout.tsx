import { useMemo, useCallback } from 'react';
import { Point } from '@/src/types';

interface PageLayoutProps {
  pageLayout: 'pageless' | 'a4-portrait' | 'a4-landscape';
  pageMargin: 'normal' | 'narrow' | 'none';
  pageLayoutMode: 'single' | 'book';
  canvasWidth: number;
}

export const usePageLayout = ({
  pageLayout,
  pageMargin,
  pageLayoutMode,
  canvasWidth
}: PageLayoutProps) => {
  const PAGE_GAP = 36;
  const isBookMode = pageLayout !== 'pageless' && pageLayoutMode === 'book';
  const pageHeight = pageLayout === 'a4-portrait' ? 1160 : pageLayout === 'a4-landscape' ? 820 : 0;

  const marginX = useMemo(() => {
    if (pageLayout === 'pageless') return 0;
    return pageMargin === 'none' ? 0 : pageMargin === 'narrow' ? 32 : 64;
  }, [pageLayout, pageMargin]);

  const marginY = useMemo(() => {
    if (pageLayout === 'pageless') return 0;
    return pageMargin === 'none' ? 0 : pageMargin === 'narrow' ? 32 : 64;
  }, [pageLayout, pageMargin]);

  const getVisualPosition = useCallback((pos: Point) => {
    if (pageLayout === 'pageless' || pageHeight <= 0) return pos;

    if (isBookMode) {
      const usableHeight = pageHeight - 2 * marginY;
      const pageIndex = Math.floor(pos.y / Math.max(1, usableHeight));
      const offsetY = pos.y % Math.max(1, usableHeight);

      return {
        x: pageIndex * (canvasWidth + PAGE_GAP) + marginX + pos.x,
        y: marginY + offsetY
      };
    } else {
      const pageIndex = Math.floor(pos.y / pageHeight);
      const offsetY = pos.y % pageHeight;
      return {
        x: pos.x,
        y: pageIndex * (pageHeight + 64) + 24 + offsetY
      };
    }
  }, [pageLayout, isBookMode, pageHeight, canvasWidth, marginX, marginY]);

  const getCanvasPosition = useCallback((visualX: number, visualY: number) => {
    if (pageLayout === 'pageless' || pageHeight <= 0) return { x: visualX, y: visualY };

    if (isBookMode) {
      const usableHeight = pageHeight - 2 * marginY;
      const usableWidth = canvasWidth - 2 * marginX;
      
      const pageSlotWidth = canvasWidth + PAGE_GAP;
      const pageIndex = Math.floor(visualX / Math.max(1, pageSlotWidth));
      const offsetX = visualX % Math.max(1, pageSlotWidth);

      const canvasX = Math.max(0, Math.min(offsetX - marginX, usableWidth));
      const canvasY = pageIndex * usableHeight + Math.max(0, Math.min(visualY - marginY, usableHeight));

      return { x: canvasX, y: canvasY };
    } else {
      const y_normalized = visualY - 24;
      let pageIndex = Math.floor(y_normalized / (pageHeight + 64));
      let offsetY_candidate = y_normalized % (pageHeight + 64);

      if (offsetY_candidate < 0) {
        pageIndex = 0;
        offsetY_candidate = 0;
      }

      let offsetY = offsetY_candidate;
      if (offsetY_candidate >= pageHeight) {
        const gapOffset = offsetY_candidate - pageHeight;
        if (gapOffset < 32) {
          offsetY = pageHeight - 1;
        } else {
          pageIndex += 1;
          offsetY = 0;
        }
      }

      const canvasY = pageIndex * pageHeight + offsetY;
      return { x: visualX, y: canvasY };
    }
  }, [pageLayout, isBookMode, pageHeight, canvasWidth, marginX, marginY]);

  const adjustStickyPos = useCallback((pos: Point, height = 240) => {
    if (pageLayout === 'pageless' || pageHeight <= 0) return pos;
    
    const pageIndex = Math.max(0, Math.floor((pos.y + height / 2) / pageHeight));
    const pageStart = pageIndex * pageHeight + marginY + 12;
    const pageEnd = (pageIndex + 1) * pageHeight - marginY - 12;
    
    let adjustedY = pos.y;
    if (adjustedY < pageStart) {
      adjustedY = pageStart;
    } else if (adjustedY + height > pageEnd) {
      adjustedY = pageEnd - height;
    }
    
    return { x: pos.x, y: adjustedY };
  }, [pageLayout, pageHeight, marginY]);

  const adjustDividerPos = useCallback((pos: Point, orientation: 'horizontal' | 'vertical', length = 200) => {
    if (pageLayout === 'pageless' || pageHeight <= 0) return pos;
    
    const height = orientation === 'vertical' ? length : 20;
    const pageIndex = Math.max(0, Math.floor((pos.y + height / 2) / pageHeight));
    const pageStart = pageIndex * pageHeight + marginY + 8;
    const pageEnd = (pageIndex + 1) * pageHeight - marginY - 8;
    
    let adjustedY = pos.y;
    if (adjustedY < pageStart) {
      adjustedY = pageStart;
    } else if (adjustedY + height > pageEnd) {
      adjustedY = pageEnd - height;
    }
    
    return { x: pos.x, y: adjustedY };
  }, [pageLayout, pageHeight, marginY]);

  return {
    PAGE_GAP,
    isBookMode,
    pageHeight,
    marginX,
    marginY,
    canvasWidth,
    getVisualPosition,
    getCanvasPosition,
    adjustStickyPos,
    adjustDividerPos
  };
};
