import React, { useState } from 'react';
import { Subject, Note } from '@/src/types';

interface SubjectManagerProps {
  subjects: Subject[];
  activeNoteId: string;
  onSubjectsChange: (subjects: Subject[]) => void;
  onActiveNoteIdChange: (id: string) => void;
}

export const useSubjectManager = () => {
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

  const getActiveContext = () => {
    for (const subject of subjects) {
      const note = subject.notes.find(n => n.id === activeNoteId);
      if (note) return { subject, note };
    }
    return null;
  };

  const addSubject = (name: string) => {
    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name,
      notes: []
    };
    setSubjects([...subjects, newSubject]);
  };

  const addNote = (subjectId: string, title: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title,
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
    };
    
    setSubjects(subjects.map(s => 
      s.id === subjectId 
        ? { ...s, notes: [...s.notes, newNote] }
        : s
    ));
    setActiveNoteId(newNote.id);
  };

  const deleteNote = (noteId: string) => {
    setSubjects(subjects.map(s => ({
      ...s,
      notes: s.notes.filter(n => n.id !== noteId)
    })));
    
    if (activeNoteId === noteId) {
      const remainingNotes = subjects.flatMap(s => s.notes).filter(n => n.id !== noteId);
      if (remainingNotes.length > 0) {
        setActiveNoteId(remainingNotes[0].id);
      }
    }
  };

  const deleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter(s => s.id !== subjectId));
    
    if (subjects.find(s => s.id === subjectId)?.notes.some(n => n.id === activeNoteId)) {
      const remainingSubjects = subjects.filter(s => s.id !== subjectId);
      if (remainingSubjects.length > 0 && remainingSubjects[0].notes.length > 0) {
        setActiveNoteId(remainingSubjects[0].notes[0].id);
      }
    }
  };

  return {
    subjects,
    setSubjects,
    activeNoteId,
    setActiveNoteId,
    getActiveContext,
    addSubject,
    addNote,
    deleteNote,
    deleteSubject
  };
};
