import { useState, useCallback } from 'react';
import localforage from 'localforage';

export interface Note {
  id: string;
  title: string;
  content: string;
  stickies: any[];
  arrows: any[];
  dividers: any[];
  images: any[];
  texture: string;
  themeId: string;
  isHandwriting: boolean;
  fontSize: number;
  pageLayout: 'pageless' | 'a4-portrait' | 'a4-landscape';
}

export interface Subject {
  id: string;
  name: string;
  notes: Note[];
}

export const useNoteState = () => {
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: 'default-subject',
      name: 'General Notes',
      notes: [
        {
          id: 'default-note',
          title: 'Chapter 1',
          content: '',
          stickies: [],
          arrows: [],
          dividers: [],
          images: [],
          texture: 'laid',
          themeId: 'light',
          isHandwriting: true,
          fontSize: 18,
          pageLayout: 'a4-portrait',
        }
      ]
    }
  ]);

  const [activeNoteId, setActiveNoteId] = useState('default-note');
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  const getActiveSubject = useCallback(() => {
    return subjects.find(s => s.notes.some(n => n.id === activeNoteId)) || subjects[0];
  }, [subjects, activeNoteId]);

  const getActiveNote = useCallback(() => {
    const subject = getActiveSubject();
    return subject?.notes.find(n => n.id === activeNoteId) || subject?.notes[0];
  }, [getActiveSubject, activeNoteId]);

  const updateNote = useCallback((noteId: string, updates: Partial<Note>) => {
    setSubjects(prev => prev.map(subject => ({
      ...subject,
      notes: subject.notes.map(note => 
        note.id === noteId ? { ...note, ...updates } : note
      )
    })));
  }, []);

  const addNote = useCallback((subjectId: string, note: Note) => {
    setSubjects(prev => prev.map(subject => 
      subject.id === subjectId 
        ? { ...subject, notes: [...subject.notes, note] }
        : subject
    ));
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setSubjects(prev => prev.map(subject => ({
      ...subject,
      notes: subject.notes.filter(n => n.id !== noteId)
    })));
  }, []);

  const addSubject = useCallback((subject: Subject) => {
    setSubjects(prev => [...prev, subject]);
  }, []);

  const deleteSubject = useCallback((subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
  }, []);

  return {
    subjects,
    setSubjects,
    activeNoteId,
    setActiveNoteId,
    isLoading,
    setIsLoading,
    hasLoadedInitialData,
    setHasLoadedInitialData,
    getActiveSubject,
    getActiveNote,
    updateNote,
    addNote,
    deleteNote,
    addSubject,
    deleteSubject,
  };
};
