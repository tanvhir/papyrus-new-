import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw } from 'lucide-react';
import { Flashcard, StudyStats, NoteTheme, PaperTexture, Subject } from '@/src/types';
import { StudySessionCard } from './StudySessionCard';
import { StudySessionResults } from './StudySessionResults';
import { cn } from '@/lib/utils';

interface StudySessionProps {
  cards: Flashcard[];
  subjects: Subject[];
  theme: NoteTheme;
  texture?: PaperTexture;
  isHandwriting?: boolean;
  onFinish: (results: { cardId: string; difficulty: number }[], stats: Partial<StudyStats>) => void;
  onClose: () => void;
  onUpdateCard?: (updatedCard: Flashcard) => void;
  onRateCard?: (cardId: string, rating: number) => void;
  onDeleteCard?: (cardId: string) => void;
}

export function StudySession({ 
  cards, 
  subjects, 
  theme, 
  texture = 'laid', 
  isHandwriting = false, 
  onFinish, 
  onClose,
  onUpdateCard,
  onRateCard,
  onDeleteCard
}: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ cardId: string; difficulty: number }[]>([]);
  const [startTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [direction, setDirection] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  const currentCard = cards[currentIndex];

  useEffect(() => {
    if (currentCard) {
      setEditFront(currentCard.front);
      const combinedBack = currentCard.points && currentCard.points.length > 0
        ? [currentCard.back, ...currentCard.points.map(p => `- ${p}`)].join('\n')
        : currentCard.back;
      setEditBack(combinedBack);
      setIsEditing(false);
    }
  }, [currentCard]);

  const handleSaveInline = () => {
    if (!currentCard) return;

    const lines = editBack.split('\n').map(l => l.trim()).filter(Boolean);
    const newBack = lines[0] || '';
    const newPoints = lines.slice(1).map(l => l.replace(/^[-*•]\s*/, '').trim()).filter(Boolean);

    if (onUpdateCard) {
      onUpdateCard({
        ...currentCard,
        front: editFront.trim(),
        back: newBack,
        points: newPoints.length > 0 ? newPoints : undefined
      });
    }
    setIsEditing(false);
  };

  const handleDeleteCard = () => {
    if (!currentCard || !onDeleteCard) return;
    if (confirm('Are you sure you want to delete this flashcard?')) {
      onDeleteCard(currentCard.id);
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const progress = ((currentIndex + (isFinished ? 1 : 0)) / cards.length) * 100;

  const getChapterName = useCallback((card: Flashcard) => {
    if (!card) return 'General Study';
    for (const subject of subjects) {
      const note = subject.notes.find(n => n.id === card.sourceNoteId);
      if (note) return note.title;
    }
    return 'General Cards';
  }, [subjects]);

  const handleRate = useCallback((difficulty: number) => {
    setSessionResults(prev => [...prev, { cardId: currentCard.id, difficulty }]);
    
    if (onRateCard) {
      onRateCard(currentCard.id, difficulty);
    }
    
    if (currentIndex < cards.length - 1) {
      setDirection(1);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsRevealed(false);
        setDirection(0);
      }, 250);
    } else {
      setIsRevealed(false);
      setIsFinished(true);
    }
  }, [currentIndex, currentCard, cards.length, onRateCard]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (isFinished) return;
      if (isEditing) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsRevealed(prev => !prev);
      } else if (isRevealed) {
        if (e.key === '1') handleRate(1);
        if (e.key === '2') handleRate(2);
        if (e.key === '3') handleRate(3);
        if (e.key === '4') handleRate(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, isFinished, handleRate, onClose]);

  const finishSession = () => {
    onFinish(sessionResults, {
      totalStudied: sessionResults.length
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const accentColor = theme?.accentColor || '#C0A080';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[600] overflow-y-auto bg-[#0F0E0D]/75 backdrop-blur-[10px] p-4 flex justify-center items-start sm:items-center"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[580px] sm:max-w-[620px] my-auto flex flex-col items-center gap-4 sm:gap-5 z-10 py-6"
        onClick={(e) => e.stopPropagation()}
      >
        {!isFinished && (
          <div className="w-full flex items-center justify-between text-[#FFFCF5] px-1.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-mono tracking-[0.25em] text-amber-300 font-extrabold uppercase">
                STUDY DECK
              </span>
              <h1 className="text-sm font-semibold tracking-tight truncate max-w-[250px] opacity-90">
                {getChapterName(currentCard)}
              </h1>
            </div>
            
            <button 
              onClick={onClose}
              className="p-1.5 bg-white/5 hover:bg-white/10 active:bg-white/15 text-stone-200 hover:text-white rounded-full transition-all border border-white/10 shadow-sm"
              title="Close Study Mode (Esc)"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        )}

        <div className="w-full relative">
          <AnimatePresence mode="wait">
            {isFinished ? (
              <StudySessionResults
                sessionResults={sessionResults}
                totalCards={cards.length}
                startTime={startTime}
                theme={theme}
                texture={texture}
                onFinish={finishSession}
                onClose={onClose}
              />
            ) : (
              <StudySessionCard
                card={currentCard}
                currentIndex={currentIndex}
                totalCards={cards.length}
                isRevealed={isRevealed}
                isEditing={isEditing}
                editFront={editFront}
                editBack={editBack}
                theme={theme}
                texture={texture}
                isHandwriting={isHandwriting}
                direction={direction}
                onToggleReveal={() => setIsRevealed(prev => !prev)}
                onEdit={() => setIsEditing(true)}
                onSaveEdit={handleSaveInline}
                onDelete={handleDeleteCard}
                onEditFrontChange={setEditFront}
                onEditBackChange={setEditBack}
              />
            )}
          </AnimatePresence>
        </div>

        {!isFinished && (
          <div className="w-full flex flex-col items-center gap-4 mt-2">
            <div className="w-full max-w-[310px] h-[3px] bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full"
                style={{ backgroundColor: accentColor }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="w-full min-h-[58px] relative flex justify-center">
              <AnimatePresence>
                {isRevealed && (
                  <motion.div 
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="w-full flex gap-2"
                  >
                    {[
                      { label: 'Again', desc: 'Repeat', id: 1 },
                      { label: 'Hard', desc: 'Hard', id: 2 },
                      { label: 'Good', desc: 'Pass', id: 3 },
                      { label: 'Easy', desc: 'Perfect', id: 4 }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => handleRate(btn.id)}
                        className="flex-1 flex flex-col items-center justify-center h-[52px] active:scale-95 border border-stone-300/30 dark:border-stone-700/50 rounded-xl shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3),_inset_0_1.5px_0_rgba(255,255,255,0.65)] hover:scale-[1.02] transition-all group relative overflow-hidden"
                        style={{ backgroundColor: theme?.paperColor || '#FFFCF5' }}
                      >
                        <span className="text-xs font-bold font-sans tracking-tight leading-none relative z-10" style={{ color: theme?.inkColor || '#1A1A1A' }}>
                          {btn.label}
                        </span>
                        <span 
                          className="text-[8px] font-mono font-extrabold mt-1.5 leading-none relative z-10 opacity-60 group-hover:opacity-100 transition-opacity" 
                          style={{ color: theme?.inkColor || '#1A1A1A' }}
                        >
                          KEY {btn.id}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-5 text-[9px] text-[#C2B79F] font-sans font-extrabold tracking-[0.2em] uppercase opacity-85 mt-2">
              <div className="flex items-center gap-2">
                <span className="bg-white/10 text-[#FFFCF5] px-2 py-0.5 rounded font-mono text-[9px] border border-white/5 shadow-inner">
                  SPACE
                </span>
                <span>FLIP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white/10 text-[#FFFCF5] px-2 py-0.5 rounded font-mono text-[9px] border border-white/5 shadow-inner">
                  1-4
                </span>
                <span>RATE CARD</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
