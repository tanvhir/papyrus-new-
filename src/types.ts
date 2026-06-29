export interface Subject {
  id: string;
  name: string;
  notes: Note[];
}

export type PaperTexture = 'plain' | 'laid' | 'grid' | 'linen';

export interface NoteTheme {
  id: string;
  name: string;
  bgColor: string;
  paperColor: string;
  inkColor: string;
  accentColor: string;
}

export const THEMES: NoteTheme[] = [
  {
    id: 'classic',
    name: 'Classic Cream',
    bgColor: '#F4F1EA',
    paperColor: '#FFFCF5',
    inkColor: '#1A1A1A',
    accentColor: '#C0A080',
  },
  {
    id: 'dark',
    name: 'Midnight Ink',
    bgColor: '#1A1A1A',
    paperColor: '#262626',
    inkColor: '#E4E4E4',
    accentColor: '#3B82F6',
  },
  {
    id: 'botanical',
    name: 'Botanical',
    bgColor: '#EBEFE7',
    paperColor: '#F7FAF5',
    inkColor: '#2D3436',
    accentColor: '#6B8E23',
  }
];

export interface Point {
  x: number;
  y: number;
}

export interface ArrowData {
  id: string;
  start: Point;
  end: Point;
  mid: Point;
  color: string;
}

export interface DividerData {
  id: string;
  type: 'solid' | 'dashed' | 'zigzag' | 'dotted' | 'wave';
  orientation: 'horizontal' | 'vertical';
  size: number;
  length: string;
  color: string;
  position: Point;
}

export type FlashcardType = 'basic' | 'cloze' | 'definition' | 'formula' | 'multi-point' | 'image' | 'true-false';

export interface Flashcard {
  id: string;
  type: FlashcardType;
  front: string;
  back: string;
  clozeData?: string; 
  points?: string[];  
  subjectId: string;
  chapterId: string;
  sourceNoteId: string;
  sourceBlockId?: string;
  tags: string[];
  interval: number;
  easeFactor: number;
  reviewCount: number;
  difficulty: number;
  nextReviewDate: string;
  createdAt: string;
  lastStudiedAt?: string;
}

export interface StudyStats {
  totalStudied: number;
  streak: number;
  lastStudyDate: string;
  weakConceptIds: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  stickies: { id: string, text: string, color: string, position?: Point, fontSize?: number, isPinned?: boolean }[];
  arrows: ArrowData[];
  dividers: DividerData[];
  texture: PaperTexture;
  themeId: string;
  isHandwriting: boolean;
  fontSize?: number;
  pageLayout?: 'pageless' | 'a4-portrait' | 'a4-landscape';
  pageMargin?: 'normal' | 'narrow' | 'none';
  pageLayoutMode?: 'single' | 'book';
  flashcardIds?: string[];
}
