import { useState } from 'react';
import { THEMES } from '@/src/types';

export interface ImageData {
  id: string;
  url: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
}

export interface ArrowData {
  id: string;
  start: { x: number; y: number };
  mid: { x: number; y: number };
  end: { x: number; y: number };
  color: string;
}

export interface DividerData {
  id: string;
  position: { x: number; y: number };
  orientation: 'horizontal' | 'vertical';
  length: number;
  style: string;
  color: string;
}

export type PaperTexture = 'laid' | 'plain' | 'grid' | 'lined' | 'dot';

export interface NoteTheme {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

export const useNoteContentState = () => {
  const [content, setContent] = useState('');
  const [texture, setTexture] = useState<PaperTexture>('laid');
  const [theme, setTheme] = useState<NoteTheme>(THEMES[0]);
  const [notebookStyle, setNotebookStyle] = useState<'classic' | 'spiral'>('spiral');
  const [stickies, setStickies] = useState<{ id: string, text: string, color: string, position?: { x: number; y: number }, fontSize?: number, isPinned?: boolean }[]>([]);
  const [arrows, setArrows] = useState<ArrowData[]>([]);
  const [dividers, setDividers] = useState<DividerData[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [isHandwriting, setIsHandwriting] = useState(true);
  const [fontSize, setFontSize] = useState(18);

  return {
    content,
    setContent,
    texture,
    setTexture,
    theme,
    setTheme,
    notebookStyle,
    setNotebookStyle,
    stickies,
    setStickies,
    arrows,
    setArrows,
    dividers,
    setDividers,
    images,
    setImages,
    isHandwriting,
    setIsHandwriting,
    fontSize,
    setFontSize,
  };
};
