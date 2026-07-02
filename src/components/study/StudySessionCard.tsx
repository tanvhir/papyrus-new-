import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit, Trash2 } from 'lucide-react';
import { Flashcard, NoteTheme, PaperTexture } from '@/src/types';
import { cn } from '@/lib/utils';

interface StudySessionCardProps {
  card: Flashcard;
  currentIndex: number;
  totalCards: number;
  isRevealed: boolean;
  isEditing: boolean;
  editFront: string;
  editBack: string;
  theme: NoteTheme;
  texture: PaperTexture;
  isHandwriting: boolean;
  direction: number;
  onToggleReveal: () => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onEditFrontChange: (value: string) => void;
  onEditBackChange: (value: string) => void;
}

export const StudySessionCard: React.FC<StudySessionCardProps> = ({
  card,
  currentIndex,
  totalCards,
  isRevealed,
  isEditing,
  editFront,
  editBack,
  theme,
  texture,
  isHandwriting,
  direction,
  onToggleReveal,
  onEdit,
  onSaveEdit,
  onDelete,
  onEditFrontChange,
  onEditBackChange,
}) => {
  const remainingCardsCount = totalCards - 1 - currentIndex;
  const visibleSheets = Math.min(3, remainingCardsCount);

  const isDark = theme?.id === 'dark';
  const paperBg = theme?.paperColor || '#FFFCF5';
  const inkColor = theme?.inkColor || '#1A1A1A';

  const ruleLineColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(56, 139, 214, 0.12)';
  const marginLineColor = isDark ? 'rgba(239, 68, 68, 0.22)' : 'rgba(239, 68, 68, 0.20)';

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

  const combinedBack = card.points && card.points.length > 0
    ? [card.back, ...card.points.map(p => `- ${p}`)].join('\n')
    : card.back;

  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, scale: 0.97, y: direction * 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: direction * -12 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="relative w-full aspect-[5/3] min-h-[280px] sm:min-h-[335px]"
    >
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

      <div 
        className="relative w-full h-full cursor-pointer rounded-2xl z-10 select-none animate-fade-in"
        style={{ perspective: '1600px' }}
        onClick={() => {
          if (isEditing) return;
          onToggleReveal();
        }}
      >
        <div 
          className="w-full h-full relative transition-transform duration-[550ms]"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          <div 
            className="absolute inset-0 backface-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45),_0_1px_4px_rgba(0,0,0,0.1),_inset_0_-1px_3px_rgba(0,0,0,0.06),_inset_0_1.5px_3.5px_rgba(255,255,255,0.8)] p-5 sm:p-6 flex flex-col justify-between overflow-hidden ring-1 ring-black/5"
            style={{ 
              zIndex: 2,
              ...getCardPaperStyles()
            }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-10 border-r border-dashed border-stone-500/10 flex flex-col justify-around py-4 items-center z-20 pointer-events-none">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="relative w-4 h-4 flex items-center justify-center">
                  <div className="w-[14px] h-[14px] rounded-full bg-stone-955 dark:bg-black shadow-[inset_0_2.5px_4px_rgba(0,0,0,0.95),_0_1.5px_0_rgba(255,255,255,0.75)] border border-stone-500/25 relative z-10" />
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

            <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

            <div className="flex items-center justify-between relative z-10 w-full text-stone-400 dark:text-stone-500 pr-2 pl-20">
              <span className="text-[9px] font-mono tracking-wider font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase leading-none">
                {isEditing ? 'EDITING FRONT' : 'QUESTION'}
              </span>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      className="p-1 hover:bg-stone-500/10 rounded-full text-[#A89F8B] hover:text-stone-850 dark:hover:text-[#f8f6f2] transition-colors"
                      title="Edit question text"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="p-1 hover:bg-red-500/10 rounded-full text-[#A89F8B] hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete flashcard"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <div className="flex items-center gap-1 opacity-[0.8] font-mono text-[9px] tracking-wider font-extrabold bg-stone-500/5 px-2.5 py-1 rounded-md border border-stone-500/10">
                  <span>CARD</span>
                  <span className="text-stone-700 dark:text-stone-350">{currentIndex + 1}</span>
                  <span className="opacity-40">/</span>
                  <span className="opacity-75">{totalCards}</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex-1 flex items-center justify-center pl-16 pr-4">
              {isEditing ? (
                <textarea
                  value={editFront}
                  onChange={(e) => onEditFrontChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-full bg-transparent border-none outline-none resize-none text-center text-lg font-serif leading-relaxed"
                  autoFocus
                />
              ) : (
                <div className={cn("text-lg font-serif leading-relaxed text-center", cardFontClass)}>
                  {card.front}
                </div>
              )}
            </div>

            <div className="relative z-10 text-center text-stone-400 dark:text-stone-500 text-[9px] font-mono tracking-wider uppercase pl-16">
              Click to reveal answer
            </div>
          </div>

          <div 
            className="absolute inset-0 backface-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45),_0_1px_4px_rgba(0,0,0,0.1),_inset_0_-1px_3px_rgba(0,0,0,0.06),_inset_0_1.5px_3.5px_rgba(255,255,255,0.8)] p-5 sm:p-6 flex flex-col justify-between overflow-hidden ring-1 ring-black/5"
            style={{ 
              zIndex: 2,
              transform: 'rotateY(180deg)',
              ...getCardPaperStyles()
            }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-10 border-r border-dashed border-stone-500/10 flex flex-col justify-around py-4 items-center z-20 pointer-events-none">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="relative w-4 h-4 flex items-center justify-center">
                  <div className="w-[14px] h-[14px] rounded-full bg-stone-955 dark:bg-black shadow-[inset_0_2.5px_4px_rgba(0,0,0,0.95),_0_1.5px_0_rgba(255,255,255,0.75)] border border-stone-500/25 relative z-10" />
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

            <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

            <div className="flex items-center justify-between relative z-10 w-full text-stone-400 dark:text-stone-500 pr-2 pl-20">
              <span className="text-[9px] font-mono tracking-wider font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase leading-none">
                {isEditing ? 'EDITING BACK' : 'ANSWER'}
              </span>
              {isEditing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveEdit();
                  }}
                  className="text-[9px] font-mono tracking-wider font-extrabold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 px-3 py-1 rounded-md uppercase"
                >
                  Save
                </button>
              )}
            </div>

            <div className="relative z-10 flex-1 flex items-center justify-center pl-16 pr-4">
              {isEditing ? (
                <textarea
                  value={editBack}
                  onChange={(e) => onEditBackChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-full bg-transparent border-none outline-none resize-none text-center text-lg font-serif leading-relaxed"
                />
              ) : (
                <div className={cn("text-lg font-serif leading-relaxed text-center whitespace-pre-wrap", cardFontClass)}>
                  {combinedBack}
                </div>
              )}
            </div>

            <div className="relative z-10 text-center text-stone-400 dark:text-stone-500 text-[9px] font-mono tracking-wider uppercase pl-16">
              Rate your recall
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
