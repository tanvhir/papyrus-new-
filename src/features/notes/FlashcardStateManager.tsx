import { useState } from 'react';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: 'basic' | 'cloze' | 'image';
  noteId?: string;
  conceptId?: string;
  nextReview: string;
  interval: number;
  easeFactor: number;
  dueCount: number;
}

export interface StudyStats {
  totalStudied: number;
  streak: number;
  lastStudyDate: string;
  weakConceptIds: string[];
}

export type FlashcardType = 'basic' | 'cloze' | 'image';

export const useFlashcardState = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [studyStats, setStudyStats] = useState<StudyStats>({
    totalStudied: 0,
    streak: 0,
    lastStudyDate: new Date().toISOString(),
    weakConceptIds: []
  });
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [isStudySessionActive, setIsStudySessionActive] = useState(false);
  const [creationCardData, setCreationCardData] = useState<{ front: string; back: string; type: FlashcardType } | null>(null);
  const [isSelectingBackActive, setIsSelectingBackActive] = useState(false);

  const addFlashcard = (flashcard: Flashcard) => {
    setFlashcards(prev => [...prev, flashcard]);
  };

  const updateFlashcard = (id: string, updates: Partial<Flashcard>) => {
    setFlashcards(prev => prev.map(fc => fc.id === id ? { ...fc, ...updates } : fc));
  };

  const deleteFlashcard = (id: string) => {
    setFlashcards(prev => prev.filter(fc => fc.id !== id));
  };

  const updateStudyStats = (updates: Partial<StudyStats>) => {
    setStudyStats(prev => ({ ...prev, ...updates }));
  };

  return {
    flashcards,
    setFlashcards,
    studyStats,
    setStudyStats,
    studyQueue,
    setStudyQueue,
    isStudySessionActive,
    setIsStudySessionActive,
    creationCardData,
    setCreationCardData,
    isSelectingBackActive,
    setIsSelectingBackActive,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    updateStudyStats,
  };
};
