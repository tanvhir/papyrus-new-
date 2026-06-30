import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Layers, 
  Star, 
  RotateCcw,
  Trophy,
  Check,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Flashcard, StudyStats, NoteTheme, Subject, PaperTexture } from '@/src/types';
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
  onRateCard
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

  // Keyboard Shortcuts (Space to flip, 1-4 to rate, Escape to close)
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

  const remainingCardsCount = cards.length - 1 - currentIndex;
  const visibleSheets = Math.min(3, remainingCardsCount);

  // Styling helpers matching Original Note theme exactly
  const isDark = theme?.id === 'dark';
  const paperBg = theme?.paperColor || '#FFFCF5';
  const inkColor = theme?.inkColor || '#1A1A1A';
  const accentColor = theme?.accentColor || '#C0A080';

  // Rule lines colors matching paper composition notebooks
  const ruleLineColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(56, 139, 214, 0.12)';
  const marginLineColor = isDark ? 'rgba(239, 68, 68, 0.22)' : 'rgba(239, 68, 68, 0.20)';

  // Dynamically constructed background styles mirroring note sheets
  const getCardPaperStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      backgroundColor: paperBg,
      color: inkColor,
    };

    if (texture === 'laid') {
      styles.backgroundImage = `
        linear-gradient(to bottom, transparent 95%, ${ruleLineColor} 95%),
        linear-gradient(to right, transparent 3.8rem, ${marginLineColor} 3.8rem, ${marginLineColor} calc(3.8rem + 1px), transparent calc(3.8rem + 2px))
      `;
      styles.backgroundSize = `100% 2.2rem, 100% 100%`;
    } else if (texture === 'grid') {
      styles.backgroundImage = `
        linear-gradient(to bottom, transparent 96%, ${ruleLineColor} 96%),
        linear-gradient(to right, transparent 96%, ${ruleLineColor} 96%)
      `;
      styles.backgroundSize = `1.8rem 1.8rem, 1.8rem 1.8rem`;
    } else if (texture === 'linen') {
      styles.backgroundImage = `
        linear-gradient(to bottom, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px),
        linear-gradient(to right, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)
      `;
      styles.backgroundSize = `4px 4px, 4px 4px`;
    }

    return styles;
  };

  const cardFontClass = isHandwriting ? 'font-handwriting' : 'font-serif';

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
        
        {/* UPPER ROW: Minimal integrated branding & Close button */}
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

        {/* MAIN DECK CONTAINER */}
        <div className="w-full relative">
          <AnimatePresence mode="wait">
            {isFinished ? (
              (() => {
                const totalReviewed = sessionResults.length || cards.length;
                const againCount = sessionResults.filter(r => r.difficulty === 1).length;
                const hardCount = sessionResults.filter(r => r.difficulty === 2).length;
                const goodCount = sessionResults.filter(r => r.difficulty === 3).length;
                const easyCount = sessionResults.filter(r => r.difficulty === 4).length;
                const passRate = totalReviewed > 0 ? Math.round(((easyCount + goodCount) / totalReviewed) * 100) : 0;
                const activeMins = Math.round((Date.now() - startTime) / 60000);

                return (
                  <motion.div 
                    key="finished-card"
                    initial={{ scale: 0.95, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    className="w-full min-h-[380px] sm:min-h-[415px] rounded-2xl p-6 sm:p-8 text-center shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45),_0_1px_4px_rgba(0,0,0,0.1),_inset_0_-1px_3px_rgba(0,0,0,0.06),_inset_0_1.5px_3.5px_rgba(255,255,255,0.8)] relative overflow-hidden ring-1 ring-black/5 flex flex-col justify-center items-center py-8"
                    style={getCardPaperStyles()}
                  >
                    {/* Spiral/Torn notebook spine effect on the left with 3D Metal Wire loops */}
                    <div className="absolute left-0 top-0 bottom-0 w-10 border-r border-dashed border-stone-500/10 flex flex-col justify-around py-4 items-center z-20 pointer-events-none">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="relative w-4 h-4 flex items-center justify-center">
                          {/* Deep black punched hole */}
                          <div className="w-[14px] h-[14px] rounded-full bg-stone-955 dark:bg-black shadow-[inset_0_2.5px_4px_rgba(0,0,0,0.95),_0_1.5px_0_rgba(255,255,255,0.75)] border border-stone-500/25 relative z-10" />
                          {/* Real 3D Chrome/Steel Metal binding loop wire */}
                          <div 
                            className="absolute left-[-11px] w-[26px] h-[7px] pointer-events-none z-30 opacity-90" 
                            style={{
                              background: 'linear-gradient(to bottom, #eaeae9 0%, #cacac2 25%, #8e8e86 50%, #4a4a44 75%, #ffffff 100%)',
                              boxShadow: '0 2.5px 4.5px rgba(0,0,0,0.38), inset 0 1px 0.5px rgba(255,255,255,0.7)',
                              borderRadius: '3.5px / 6.5px',
                              transform: 'rotate(-12deg)',
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Micro clean noise paper feeling */}
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2.5 text-amber-500 bg-amber-500/10"
                    >
                      <Trophy className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    
                    <h2 className="text-xl font-serif text-stone-800 dark:text-stone-100 font-extrabold leading-normal mb-1">
                      Session Logged
                    </h2>
                    <p className="text-stone-500 dark:text-stone-400 text-xs mb-3.5 pl-6 pr-2 font-mono uppercase tracking-wider opacity-60">
                      Spaced repetition intervals updated!
                    </p>
                    
                    {/* Primary Grid: Reviewed vs Time */}
                    <div className="grid grid-cols-2 gap-4 mb-4 bg-stone-500/5 p-3 rounded-xl ml-6 max-w-[280px] w-full">
                      <div>
                        <div className="text-xl font-serif font-black text-stone-850 dark:text-stone-100">
                          {totalReviewed}
                        </div>
                        <div className="text-[9px] text-[#A89F8B] font-bold tracking-widest uppercase mt-0.5">
                          Cards Studied
                        </div>
                      </div>
                      <div>
                        <div className="text-xl font-serif font-black text-stone-850 dark:text-stone-100 font-extrabold">
                          {activeMins}m
                        </div>
                        <div className="text-[9px] text-[#A89F8B] font-bold tracking-widest uppercase mt-0.5">
                          Active Time
                        </div>
                      </div>
                    </div>

                    {/* Performance Spread Graph Block */}
                    <div className="w-full max-w-[300px] pl-6 mb-4.5">
                      <div className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-[#A89F8B] text-left mb-1.5 flex justify-between pr-2">
                        <span>Success Spread</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{passRate}% Retention</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 flex overflow-hidden shadow-inner">
                        {againCount > 0 && <div className="h-full bg-red-400" style={{ width: `${(againCount / totalReviewed) * 100}%` }} title="Again" />}
                        {hardCount > 0 && <div className="h-full bg-amber-400" style={{ width: `${(hardCount / totalReviewed) * 100}%` }} title="Hard" />}
                        {goodCount > 0 && <div className="h-full bg-emerald-400" style={{ width: `${(goodCount / totalReviewed) * 100}%` }} title="Good" />}
                        {easyCount > 0 && <div className="h-full bg-sky-400" style={{ width: `${(easyCount / totalReviewed) * 100}%` }} title="Easy" />}
                        {totalReviewed === 0 && <div className="h-full bg-stone-300 w-full animate-pulse" />}
                      </div>
                      
                      {/* Metric label boxes */}
                      <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                        <div className="text-center">
                          <div className="text-xs font-bold text-red-500 font-mono leading-none">{againCount}</div>
                          <div className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-[#A89F8B] mt-1 leading-none">Again</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-amber-500 font-mono leading-none">{hardCount}</div>
                          <div className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-[#A89F8B] mt-1 leading-none">Hard</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-emerald-500 font-mono leading-none">{goodCount}</div>
                          <div className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-[#A89F8B] mt-1 leading-none">Good</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-sky-500 font-mono leading-none">{easyCount}</div>
                          <div className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-[#A89F8B] mt-1 leading-none">Easy</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pl-6 max-w-[300px] w-full">
                      <Button 
                        onClick={finishSession}
                        className="flex-1 h-10 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-950 rounded-xl font-bold shadow-md transition-all active:scale-[0.98] text-[10px] uppercase tracking-wider"
                      >
                        Keep Progress
                      </Button>
                      <Button 
                        variant="ghost"
                        onClick={onClose}
                        className="text-[#9E9075] hover:text-stone-800 dark:hover:text-stone-100 font-bold text-[10px] uppercase tracking-wider h-10 px-3"
                      >
                        Go Back
                      </Button>
                    </div>
                  </motion.div>
                );
              })()
            ) : (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.97, y: direction * 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: direction * -12 }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                className="relative w-full aspect-[5/3] min-h-[280px] sm:min-h-[335px]"
              >
                {/* MANY CARDS UNDERNEATH (Physical Solid stack, beautiful ambient occlusion shadows, zero border) */}
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: visibleSheets }).map((_, idx) => {
                    const sheetIndex = idx + 1;
                    const shiftX = sheetIndex * 6;
                    const shiftY = sheetIndex * 4;
                    const scale = 1 - (sheetIndex * 0.012);
                    const opacity = 1 - (sheetIndex * 0.25);
                    const rotation = sheetIndex * 0.8;
                    
                    return (
                      <div
                        key={`sheet-${sheetIndex}`}
                        className="absolute inset-0 rounded-2xl shadow-[0_15px_35px_-12px_rgba(0,0,0,0.35)] transition-all duration-300"
                        style={{
                          transformOrigin: 'center center',
                          transform: `translate(${shiftX}px, ${shiftY}px) scale(${scale}) rotate(${rotation}deg)`,
                          opacity: opacity,
                          zIndex: 10 - sheetIndex,
                          backgroundColor: paperBg,
                        }}
                      />
                    );
                  })}
                </div>

                {/* ACTIVE TOP CARD (Ruled composition paper layout with binder holes) */}
                <div 
                  className="relative w-full h-full cursor-pointer rounded-2xl z-10 select-none animate-fade-in"
                  style={{ perspective: '1600px' }}
                  onClick={() => {
                    if (isEditing) return;
                    setIsRevealed(prev => !prev);
                  }}
                >
                  <div 
                     className="w-full h-full relative transition-transform duration-[550ms]"
                    style={{ 
                      transformStyle: 'preserve-3d',
                      transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    
                    {/* CARD FRONT FACE */}
                    <div 
                      className="absolute inset-0 backface-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45),_0_1px_4px_rgba(0,0,0,0.1),_inset_0_-1px_3px_rgba(0,0,0,0.06),_inset_0_1.5px_3.5px_rgba(255,255,255,0.8)] p-5 sm:p-6 flex flex-col justify-between overflow-hidden ring-1 ring-black/5"
                      style={{ 
                        zIndex: 2,
                        ...getCardPaperStyles()
                      }}
                    >
                      {/* Spiral/Torn notebook spine effect on the left with shiny steel hoops */}
                      <div className="absolute left-0 top-0 bottom-0 w-10 border-r border-dashed border-stone-500/10 flex flex-col justify-around py-4 items-center z-20 pointer-events-none">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="relative w-4 h-4 flex items-center justify-center">
                            {/* Physical punched hole */}
                            <div className="w-[14px] h-[14px] rounded-full bg-stone-955 dark:bg-black shadow-[inset_0_2.5px_4px_rgba(0,0,0,0.95),_0_1.5px_0_rgba(255,255,255,0.75)] border border-stone-500/25 relative z-10" />
                            {/* Realistic chrome spiral loop */}
                            <div 
                              className="absolute left-[-11px] w-[26px] h-[7px] pointer-events-none z-30 opacity-90" 
                              style={{
                                background: 'linear-gradient(to bottom, #eaeae9 0%, #cacac2 25%, #8e8e86 50%, #4a4a44 75%, #ffffff 100%)',
                                boxShadow: '0 2.5px 4.5px rgba(0,0,0,0.38), inset 0 1px 0.5px rgba(255,255,255,0.7)',
                                borderRadius: '3.5px / 6.5px',
                                transform: 'rotate(-12deg)',
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Quiet texture mesh */}
                      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

                      {/* Header indicators - repositioned to top right & styled beautifully */}
                      <div className="flex items-center justify-between relative z-10 w-full text-stone-400 dark:text-stone-500 pr-2 pl-20">
                        <span className="text-[9px] font-mono tracking-wider font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase leading-none">
                          {isEditing ? 'EDITING FRONT' : 'QUESTION'}
                        </span>
                        <div className="flex items-center gap-2">
                          {!isEditing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                              }}
                              className="p-1 hover:bg-stone-500/10 rounded-full text-[#A89F8B] hover:text-stone-850 dark:hover:text-[#f8f6f2] transition-colors"
                              title="Edit question text"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="flex items-center gap-1 opacity-[0.8] font-mono text-[9px] tracking-wider font-extrabold bg-stone-500/5 px-2.5 py-1 rounded-md border border-stone-500/10">
                            <span>CARD</span>
                            <span className="text-stone-700 dark:text-stone-350">{currentIndex + 1}</span>
                            <span className="opacity-40">/</span>
                            <span className="opacity-75">{cards.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Question Text resting perfectly inside margin guidelines (aligned past margin line at pl-20) */}
                      <div 
                        className={cn(
                          "flex-1 flex flex-col justify-center px-2 py-3 relative z-10 text-center pl-20 pr-6"
                        )}
                      >
                        {isEditing ? (
                          <div className="w-full flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                            <textarea
                              value={editFront}
                              onChange={(e) => setEditFront(e.target.value)}
                              onKeyDown={(e) => {
                                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveInline();
                                }
                              }}
                              className={cn(
                                "w-full bg-transparent focus:outline-none resize-none border border-dashed border-[#A89F8B]/30 focus:border-[#A89F8B]/60 rounded-lg p-2 text-center text-sm sm:text-lg md:text-xl leading-relaxed text-[#1a1918] dark:text-[#f8f6f2]",
                                cardFontClass,
                                isHandwriting ? 'font-medium' : 'font-extrabold'
                              )}
                              rows={3}
                              autoFocus
                              placeholder="Type front of card..."
                            />
                            <div className="flex justify-center gap-1.5 mt-1">
                              <button
                                onClick={handleSaveInline}
                                className="px-2.5 py-1 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-950 font-sans font-bold text-[10px] rounded-md shadow-sm flex items-center gap-1 h-7"
                              >
                                <Check className="w-3 h-3" /> Save
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditing(false);
                                  setEditFront(currentCard.front);
                                }}
                                className="px-2.5 py-1 border border-stone-300 dark:border-stone-700 hover:bg-stone-500/5 text-stone-600 dark:text-stone-350 font-sans font-bold text-[10px] rounded-md h-7"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
                            <h2 
                              className={cn(
                                "text-[#1a1918] dark:text-[#f8f6f2] text-md sm:text-xl md:text-2xl leading-relaxed",
                                cardFontClass,
                                isHandwriting ? 'font-medium py-1' : 'font-extrabold'
                              )}
                            >
                              {currentCard.front}
                            </h2>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CARD BACK FACE */}
                    <div 
                      className="absolute inset-0 backface-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45),_0_1px_4px_rgba(0,0,0,0.1),_inset_0_-1px_3px_rgba(0,0,0,0.06),_inset_0_1.5px_3.5px_rgba(255,255,255,0.8)] p-5 sm:p-6 flex flex-col justify-between overflow-hidden ring-1 ring-black/5"
                      style={{ 
                        transform: 'rotateY(180deg)',
                        ...getCardPaperStyles()
                      }}
                    >
                      {/* SpiralPaper torn edge spine binding located on right when turned, also metal hoops */}
                      <div className="absolute right-0 top-0 bottom-0 w-10 border-l border-dashed border-stone-500/10 flex flex-col justify-around py-4 items-center z-20 pointer-events-none" style={{ transform: 'rotateY(180deg)' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="relative w-4 h-4 flex items-center justify-center">
                            {/* Punched hole representing back side */}
                            <div className="w-[14px] h-[14px] rounded-full bg-stone-955 dark:bg-black shadow-[inset_0_2.5px_4px_rgba(0,0,0,0.95),_0_1.5px_0_rgba(255,255,255,0.75)] border border-stone-500/25 relative z-10" />
                            {/* Realistic silver coil */}
                            <div 
                              className="absolute left-[-11px] w-[26px] h-[7px] pointer-events-none z-30 opacity-90" 
                              style={{
                                background: 'linear-gradient(to bottom, #eaeae9 0%, #cacac2 25%, #8e8e86 50%, #4a4a44 75%, #ffffff 100%)',
                                boxShadow: '0 2.5px 4.5px rgba(0,0,0,0.38), inset 0 1px 0.5px rgba(255,255,255,0.7)',
                                borderRadius: '3.5px / 6.5px',
                                transform: 'rotate(-12deg)',
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Quiet texture mesh */}
                      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

                      {/* Header indicator */}
                      <div className="flex items-center justify-between relative z-10 w-full pl-20 pr-2">
                        <span className="text-[9px] font-mono tracking-wider font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase leading-none">
                          {isEditing ? 'EDITING ANSWER' : 'ANSWER'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {!isEditing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                              }}
                              className="p-1 hover:bg-stone-500/10 rounded-full text-[#A89F8B] hover:text-stone-850 dark:hover:text-[#f8f6f2] transition-colors"
                              title="Edit answer text"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setIsRevealed(false); }}
                            className="p-1 hover:bg-stone-500/10 rounded-full text-[#A89F8B] hover:text-stone-850 dark:hover:text-stone-100 transition-colors"
                            title="Flip back"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Answer details (aligned beautifully past margin line) */}
                      <div 
                        className={cn(
                          "flex-1 flex flex-col justify-center px-2 py-3 relative z-10 text-center pl-20 pr-6"
                        )}
                      >
                        {isEditing ? (
                          <div className="w-full flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                            <textarea
                              value={editBack}
                              onChange={(e) => setEditBack(e.target.value)}
                              onKeyDown={(e) => {
                                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveInline();
                                }
                              }}
                              className={cn(
                                "w-full bg-transparent focus:outline-none resize-none border border-dashed border-[#A89F8B]/30 focus:border-[#A89F8B]/60 rounded-lg p-2 text-center text-sm sm:text-lg md:text-xl leading-relaxed text-[#1a1918] dark:text-[#f8f6f2]",
                                cardFontClass,
                                isHandwriting ? 'font-normal' : 'font-semibold'
                              )}
                              rows={3}
                              autoFocus
                              placeholder="Type back description (use newlines starting with - for subpoints)..."
                            />
                            <div className="flex justify-center gap-1.5 mt-1">
                              <button
                                onClick={handleSaveInline}
                                className="px-2.5 py-1 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-950 font-sans font-bold text-[10px] rounded-md shadow-sm flex items-center gap-1 h-7"
                              >
                                <Check className="w-3 h-3" /> Save
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditing(false);
                                  const combinedBack = currentCard.points && currentCard.points.length > 0
                                    ? [currentCard.back, ...currentCard.points.map(p => `- ${p}`)].join('\n')
                                    : currentCard.back;
                                  setEditBack(combinedBack);
                                }}
                                className="px-2.5 py-1 border border-stone-300 dark:border-stone-700 hover:bg-stone-500/5 text-stone-600 dark:text-stone-350 font-sans font-bold text-[10px] rounded-md h-7"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
                            <p 
                              className={cn(
                                "text-[#1a1918] dark:text-[#f8f6f2] text-md sm:text-xl leading-relaxed",
                                cardFontClass,
                                isHandwriting ? 'font-normal py-1' : 'font-semibold'
                              )}
                            >
                              {currentCard.back}
                            </p>

                            {/* Render subpoints if they are set on the card */}
                            {currentCard.points && currentCard.points.length > 0 && (
                              <ul className="mt-3 space-y-1.5 text-xs text-left max-w-xs mx-auto list-disc pl-4 opacity-90">
                                {currentCard.points.map((p, index) => (
                                  <li key={index} className={cn(cardFontClass, "text-stone-600 dark:text-stone-350")}>
                                    {p}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM RATING ACTION BAR & METADATA PROGRESS LINE */}
        {!isFinished && (
          <div className="w-full flex flex-col items-center gap-4 mt-2">
            
            {/* THIN ACCENT-COLORED PROGRESS TRACK */}
            <div className="w-full max-w-[310px] h-[3px] bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full"
                style={{ backgroundColor: accentColor }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* SPACER CONTAINER THAT HOVERS THE RATING ACTION CHIPS ON REVEAL */}
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
                        style={{ backgroundColor: paperBg }}
                      >
                        {/* Micro clean noise paper feeling */}
                        <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

                        {/* Tactile paper texture ribs */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_bottom,transparent_90%,rgba(138,126,115,0.45)_90%)] bg-[size:100%_4px]" />

                        <span className="text-xs font-bold font-sans tracking-tight leading-none relative z-10" style={{ color: inkColor }}>
                          {btn.label}
                        </span>
                        <span 
                          className="text-[8px] font-mono font-extrabold mt-1.5 leading-none relative z-10 opacity-60 group-hover:opacity-100 transition-opacity" 
                          style={{ color: inkColor }}
                        >
                          KEY {btn.id}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* KEYBOARD SHORTCUTS CONTROLS CHIPS */}
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

      {/* Backface utility overrides & premium minimal scrollbar implementation */}
      <style dangerouslySetInnerHTML={{ __html: `
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .custom-scrollbar::-webkit-scrollbar { 
          width: 3px; 
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(0,0,0,0.08); 
          border-radius: 10px; 
        }
        .animate-fade-in {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />

    </motion.div>
  );
}
