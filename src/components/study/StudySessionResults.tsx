import React from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoteTheme, PaperTexture } from '@/src/types';
import { cn } from '@/lib/utils';

interface StudySessionResultsProps {
  sessionResults: { cardId: string; difficulty: number }[];
  totalCards: number;
  startTime: number;
  theme: NoteTheme;
  texture: PaperTexture;
  onFinish: () => void;
  onClose: () => void;
}

export const StudySessionResults: React.FC<StudySessionResultsProps> = ({
  sessionResults,
  totalCards,
  startTime,
  theme,
  texture,
  onFinish,
  onClose,
}) => {
  const totalReviewed = sessionResults.length || totalCards;
  const againCount = sessionResults.filter(r => r.difficulty === 1).length;
  const hardCount = sessionResults.filter(r => r.difficulty === 2).length;
  const goodCount = sessionResults.filter(r => r.difficulty === 3).length;
  const easyCount = sessionResults.filter(r => r.difficulty === 4).length;
  const passRate = totalReviewed > 0 ? Math.round(((easyCount + goodCount) / totalReviewed) * 100) : 0;
  const activeMins = Math.round((Date.now() - startTime) / 60000);

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
      <div className="absolute left-0 top-0 bottom-0 w-10 border-r border-dashed border-stone-500/10 flex flex-col justify-around py-4 items-center z-20 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
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
           \Active Time
          </div>
        </div>
      </div>

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
          onClick={onFinish}
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
};
