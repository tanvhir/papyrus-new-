import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Brain, BookOpen, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlashcardType, NoteTheme } from '@/src/types';
import { cn } from '@/lib/utils';

interface FlashcardCreatorProps {
  initialFront: string;
  initialBack?: string;
  initialType?: FlashcardType;
  onSave: (front: string, back: string, type: FlashcardType) => void;
  onCancel: () => void;
  subjectName: string;
  chapterName: string;
  onSelectBackFromNote?: (front: string, type: FlashcardType) => void;
  theme?: NoteTheme;
  isHandwriting?: boolean;
}

const CARD_TYPES: { value: FlashcardType; label: string; desc: string }[] = [
  { value: 'basic', label: 'Q & A', desc: 'Standard query & recall' },
  { value: 'cloze', label: 'Cloze Deletion', desc: 'Fill-in-the-blank spaces' },
  { value: 'definition', label: 'Definition', desc: 'Academic terms & meanings' },
  { value: 'formula', label: 'Formula', desc: 'Mathematical equations' },
  { value: 'multi-point', label: 'Multi-Point', desc: 'Bullet point lists' }
];

export function FlashcardCreator({
  initialFront,
  initialBack = '',
  initialType,
  onSave,
  onCancel,
  subjectName,
  chapterName,
  onSelectBackFromNote,
  theme,
  isHandwriting = false
}: FlashcardCreatorProps) {
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);
  const [type, setType] = useState<FlashcardType>(() => {
    if (initialType) return initialType;
    if (initialFront.includes('{{') && initialFront.includes('}}')) return 'cloze';
    return 'basic';
  });

  const handleSave = () => {
    if (!front.trim()) return;
    onSave(front, back, type);
  };

  const isDark = theme?.id === 'dark';
  const paperBg = theme?.paperColor || '#FFFCF5';
  const inkColor = theme?.inkColor || '#1A1A1A';
  const accentColor = theme?.accentColor || '#C0A080';

  const ruleLineColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(56, 139, 214, 0.12)';
  const marginLineColor = isDark ? 'rgba(239, 68, 68, 0.22)' : 'rgba(239, 68, 68, 0.20)';

  const getCreatorPaperStyles = (): React.CSSProperties => {
    return {
      backgroundColor: paperBg,
      color: inkColor,
      backgroundImage: `
        linear-gradient(to bottom, transparent 95%, ${ruleLineColor} 95%),
        linear-gradient(to right, transparent 3rem, ${marginLineColor} 3rem, ${marginLineColor} calc(3rem + 1px), transparent calc(3rem + 2px))
      `,
      backgroundSize: `100% 1.8rem, 100% 100%`,
    };
  };

  const cardFontClass = isHandwriting ? 'font-handwriting' : 'font-serif';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[#0F0E0D]/75 backdrop-blur-[10px]"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-stone-100 dark:bg-stone-900/90 w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200/50 dark:border-stone-800 flex flex-col overflow-hidden max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-stone-200/40 dark:border-stone-800 flex items-center justify-between bg-stone-50/60 dark:bg-stone-950/20 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-sm">
              <Brain className="w-[18px] h-[18px] stroke-[1.8]" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-extrabold text-stone-850 dark:text-stone-100 uppercase tracking-widest leading-none">Assemble Flashcard</h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-[#A89F8B] font-mono font-extrabold uppercase">
                <span className="truncate max-w-[100px]">{subjectName}</span>
                <span className="opacity-45">/</span>
                <span className="truncate max-w-[150px]">{chapterName}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 rounded-full transition-all text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - scrollable if needed */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Card Types Grid - visual choice pill segments */}
          <div className="space-y-2">
            <label className="text-[9px] font-mono text-[#A89F8B] uppercase tracking-widest font-extrabold flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-amber-500" /> Card Archetype
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CARD_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all duration-200 active:scale-[0.98]",
                    type === t.value
                      ? "bg-amber-500/10 border-amber-400/50 text-amber-600 dark:text-amber-400 font-bold shadow-sm"
                      : "bg-white dark:bg-stone-950/30 border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* FRONT PHYSICAL HARDCOPY CARD CONTAINER */}
          <div className="space-y-2">
            <label className="text-[9px] font-mono text-[#A89F8B] uppercase tracking-widest font-extrabold flex items-center justify-between">
              <span>Card Front (Question)</span>
              <span className="opacity-50 font-mono">Ruled Layout</span>
            </label>
            
            <div 
              className="relative w-full rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06),_inset_0_-1px_2px_rgba(0,0,0,0.04),_0_1px_1.5px_rgba(0,0,0,0.03)] border border-stone-200/40 dark:border-stone-800/70 p-4 min-h-[110px] flex items-stretch"
              style={getCreatorPaperStyles()}
            >
              {/* Quiet noise texture */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

              {/* Binder Spiral Holes Visual Spine */}
              <div className="absolute left-0 top-0 bottom-0 w-8 border-r border-dashed border-stone-500/10 flex flex-col justify-around py-3 items-center z-20 pointer-events-none">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="relative w-3 h-3 flex items-center justify-center">
                    <div className="w-[10px] h-[10px] rounded-full bg-stone-900 dark:bg-black shadow-[inset_0_2px_3px_rgba(0,0,0,0.95),_0_1px_0_rgba(255,255,255,0.4)] border border-stone-500/20 relative z-10" />
                    <div 
                      className="absolute left-[-8px] w-[20px] h-[5px] pointer-events-none z-30 opacity-85" 
                      style={{
                        background: 'linear-gradient(to bottom, #eaeae9 0%, #cacac2 25%, #8e8e86 50%, #4a4a44 75%, #ffffff 100%)',
                        boxShadow: '0 2px 3px rgba(0,0,0,0.3), inset 0 0.5px 0.5px rgba(255,255,255,0.5)',
                        borderRadius: '2.5px / 4.5px',
                        transform: 'rotate(-12deg)',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Zero-border Textarea */}
              <textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Write the focus question or active retrieval query..."
                className={cn(
                  "w-full bg-transparent focus:outline-none resize-none pl-12 pr-4 leading-[1.8rem] pt-1.5 align-middle select-text z-10 text-xs sm:text-sm md:text-md",
                  cardFontClass,
                  front ? 'opacity-100' : 'opacity-60 font-sans italic text-stone-400'
                )}
                style={{ color: inkColor, minHeight: '80px' }}
                rows={3}
              />
            </div>
          </div>

          {/* BACK PHYSICAL HARDCOPY CARD CONTAINER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-mono text-[#A89F8B] uppercase tracking-widest font-extrabold flex items-center gap-1">
                <span>Card Back (Answer)</span>
              </label>
              {onSelectBackFromNote && (
                <button
                  type="button"
                  onClick={() => onSelectBackFromNote(front, type)}
                  className="text-[9px] font-mono text-[#A89F8B] hover:text-amber-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5 bg-stone-200/50 dark:bg-stone-800/40 px-3 py-1.5 rounded-xl border border-stone-300/10 active:scale-95 transition-all shadow-sm"
                >
                  <BookOpen className="w-3 h-3 text-amber-500" />
                  Pick From Note
                </button>
              )}
            </div>

            <div 
              className="relative w-full rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06),_inset_0_-1px_2px_rgba(0,0,0,0.04),_0_1px_1.5px_rgba(0,0,0,0.03)] border border-stone-200/40 dark:border-stone-800/70 p-4 min-h-[110px] flex items-stretch"
              style={getCreatorPaperStyles()}
            >
              {/* Quiet noise texture */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

              {/* Binder Spiral Holes Visual Spine */}
              <div className="absolute left-0 top-0 bottom-0 w-8 border-r border-dashed border-stone-500/10 flex flex-col justify-around py-3 items-center z-20 pointer-events-none">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="relative w-3 h-3 flex items-center justify-center">
                    <div className="w-[10px] h-[10px] rounded-full bg-stone-900 dark:bg-black shadow-[inset_0_2px_3px_rgba(0,0,0,0.95),_0_1px_0_rgba(255,255,255,0.4)] border border-stone-500/20 relative z-10" />
                    <div 
                      className="absolute left-[-8px] w-[20px] h-[5px] pointer-events-none z-30 opacity-85" 
                      style={{
                        background: 'linear-gradient(to bottom, #eaeae9 0%, #cacac2 25%, #8e8e86 50%, #4a4a44 75%, #ffffff 100%)',
                        boxShadow: '0 2px 3px rgba(0,0,0,0.3), inset 0 0.5px 0.5px rgba(255,255,255,0.5)',
                        borderRadius: '2.5px / 4.5px',
                        transform: 'rotate(-12deg)',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Zero-border Textarea */}
              <textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Highlight/select from note or type complete answer recall details here..."
                className={cn(
                  "w-full bg-transparent focus:outline-none resize-none pl-12 pr-4 leading-[1.8rem] pt-1.5 align-middle select-text z-10 text-xs sm:text-sm md:text-md",
                  cardFontClass,
                  back ? 'opacity-100' : 'opacity-60 font-sans italic text-stone-400'
                )}
                style={{ color: inkColor, minHeight: '80px' }}
                rows={3}
                autoFocus={!back}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200/40 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/20 flex gap-2.5 backdrop-blur-sm z-30">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1 rounded-xl h-11 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors text-xs font-mono font-extrabold uppercase"
          >
            Discard Draft
          </Button>
          <Button
            onClick={handleSave}
            disabled={!front.trim() || !back.trim()}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-stone-950 font-sans font-bold rounded-xl h-11 flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/10 dark:shadow-amber-500/5 text-xs transition-all active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            Assemble Card
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
