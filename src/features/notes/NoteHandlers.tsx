import { useCallback } from 'react';
import localforage from 'localforage';

export interface NoteHandlersProps {
  activeNoteId: string;
  subjects: any[];
  content: string;
  stickies: any[];
  arrows: any[];
  dividers: any[];
  images: any[];
  texture: string;
  theme: any;
  isHandwriting: boolean;
  fontSize: number;
  pageLayout: string;
  setSubjects: (subjects: any[]) => void;
  setContent: (content: string) => void;
  setStickies: (stickies: any[]) => void;
  setArrows: (arrows: any[]) => void;
  setDividers: (dividers: any[]) => void;
  setImages: (images: any[]) => void;
  updateNote: (noteId: string, updates: any) => void;
  setLastSaved: (date: Date | null) => void;
  setIsSaving: (saving: boolean) => void;
  getActiveContext: () => any;
}

export const useNoteHandlers = (props: NoteHandlersProps) => {
  const {
    activeNoteId,
    subjects,
    content,
    stickies,
    arrows,
    dividers,
    images,
    texture,
    theme,
    isHandwriting,
    fontSize,
    pageLayout,
    setSubjects,
    setContent,
    setStickies,
    setArrows,
    setDividers,
    setImages,
    updateNote,
    setLastSaved,
    setIsSaving,
    getActiveContext,
  } = props;

  const handleSaveNote = useCallback(async () => {
    setIsSaving(true);
    try {
      const activeContext = getActiveContext();
      if (!activeContext) return;

      const updatedSubjects = subjects.map(subject => ({
        ...subject,
        notes: subject.notes.map(note => {
          if (note.id === activeNoteId) {
            return {
              ...note,
              content,
              stickies,
              arrows,
              dividers,
              images,
              texture,
              themeId: theme.id,
              isHandwriting,
              fontSize,
              pageLayout,
            };
          }
          return note;
        })
      }));

      setSubjects(updatedSubjects);
      await localforage.setItem('papyrus_subjects', updatedSubjects);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [
    activeNoteId,
    subjects,
    content,
    stickies,
    arrows,
    dividers,
    images,
    texture,
    theme,
    isHandwriting,
    fontSize,
    pageLayout,
    setSubjects,
    setLastSaved,
    setIsSaving,
    getActiveContext,
  ]);

  const handleAddSticky = useCallback((position: { x: number; y: number }) => {
    const newSticky = {
      id: `sticky-${Date.now()}`,
      text: '',
      color: 'yellow',
      position,
      fontSize: 14,
      isPinned: false,
    };
    setStickies([...stickies, newSticky]);
  }, [stickies, setStickies]);

  const handleUpdateSticky = useCallback((id: string, updates: any) => {
    setStickies(stickies.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [stickies, setStickies]);

  const handleDeleteSticky = useCallback((id: string) => {
    setStickies(stickies.filter(s => s.id !== id));
  }, [stickies, setStickies]);

  const handleAddArrow = useCallback((arrow: any) => {
    setArrows([...arrows, arrow]);
  }, [arrows, setArrows]);

  const handleUpdateArrow = useCallback((id: string, updates: any) => {
    setArrows(arrows.map(a => a.id === id ? { ...a, ...updates } : a));
  }, [arrows, setArrows]);

  const handleDeleteArrow = useCallback((id: string) => {
    setArrows(arrows.filter(a => a.id !== id));
  }, [arrows, setArrows]);

  const handleAddDivider = useCallback((divider: any) => {
    setDividers([...dividers, divider]);
  }, [dividers, setDividers]);

  const handleUpdateDivider = useCallback((id: string, updates: any) => {
    setDividers(dividers.map(d => d.id === id ? { ...d, ...updates } : d));
  }, [dividers, setDividers]);

  const handleDeleteDivider = useCallback((id: string) => {
    setDividers(dividers.filter(d => d.id !== id));
  }, [dividers, setDividers]);

  const handleAddImage = useCallback((image: any) => {
    setImages([...images, image]);
  }, [images, setImages]);

  const handleUpdateImage = useCallback((id: string, updates: any) => {
    setImages(images.map(i => i.id === id ? { ...i, ...updates } : i));
  }, [images, setImages]);

  const handleDeleteImage = useCallback((id: string) => {
    setImages(images.filter(i => i.id !== id));
  }, [images, setImages]);

  return {
    handleSaveNote,
    handleAddSticky,
    handleUpdateSticky,
    handleDeleteSticky,
    handleAddArrow,
    handleUpdateArrow,
    handleDeleteArrow,
    handleAddDivider,
    handleUpdateDivider,
    handleDeleteDivider,
    handleAddImage,
    handleUpdateImage,
    handleDeleteImage,
  };
};
