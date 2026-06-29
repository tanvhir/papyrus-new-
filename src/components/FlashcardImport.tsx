import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Layers,
  Star,
  Clipboard
} from 'lucide-react';
import { Flashcard, FlashcardType, Subject } from '@/src/types';

interface FlashcardImportProps {
  subjects: Subject[];
  initialSubjectId: string;
  initialChapterId: string;
  onImport: (cards: Flashcard[]) => void;
  onCancel: () => void;
}

interface ParsedCard {
  id: string;
  type: FlashcardType;
  front: string;
  back: string;
  confidence: number;
}

export function FlashcardImport({ 
  subjects, 
  initialSubjectId, 
  initialChapterId, 
  onImport, 
  onCancel 
}: FlashcardImportProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId || (subjects[0]?.id || ''));
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId || (subjects.find(s => s.id === selectedSubjectId)?.notes[0]?.id || ''));
  const [inputText, setInputText] = useState('');
  const [parsedCards, setParsedCards] = useState<ParsedCard[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Sync selected chapter with subject changes safely
  const handleSubjectChange = (subjId: string) => {
    setSelectedSubjectId(subjId);
    const sub = subjects.find(s => s.id === subjId);
    if (sub && sub.notes.length > 0) {
      setSelectedChapterId(sub.notes[0].id);
    } else {
      setSelectedChapterId('');
    }
  };

  const currentNotes = useMemo(() => {
    const sub = subjects.find(s => s.id === selectedSubjectId);
    return sub ? sub.notes : [];
  }, [subjects, selectedSubjectId]);

  // Clean forensic parser to transform user text into cards block-by-block
  const smartParse = (text: string) => {
    const cards: ParsedCard[] = [];
    const blocks = text.split(/\n\n+|##\s+Flashcard\s*\n|---+\n/i).filter(b => b.trim());

    blocks.forEach(block => {
      const trimmed = block.trim();
      if (!trimmed) return;
      const qaMatch = trimmed.match(/Q:\s*(.+?)\n\s*A:\s*(.+)/is);
      if (qaMatch) {
        cards.push({ id: Math.random().toString(36).substr(2, 9), type: 'basic', front: qaMatch[1].trim(), back: qaMatch[2].trim(), confidence: 0.95 });
        return;
      }
      if (trimmed.includes('{{') && trimmed.includes('}}')) {
        cards.push({ id: Math.random().toString(36).substr(2, 9), type: 'cloze', front: trimmed, back: trimmed.match(/\{\{(.+?)\}\}/)?.[1] || '', confidence: 0.9 });
        return;
      }
      const mdMatch = trimmed.match(/^#+\s*(.+?)\n([\s\S]+)$/);
      if (mdMatch) {
        cards.push({ id: Math.random().toString(36).substr(2, 9), type: 'basic', front: mdMatch[1].trim(), back: mdMatch[2].trim(), confidence: 0.8 });
        return;
      }
      const lines = trimmed.split('\n');
      if (lines.length >= 2) {
        cards.push({ id: Math.random().toString(36).substr(2, 9), type: 'basic', front: lines[0].replace(/\?$/, '').trim() + '?', back: lines.slice(1).join('\n').trim(), confidence: 0.6 });
      }
    });

    setParsedCards(cards);
    setActiveCardIndex(0);
  };

  // Safe debounced deconstruction mapping
  useEffect(() => {
    if (!inputText.trim()) {
      setParsedCards([]);
      return;
    }
    const timer = setTimeout(() => {
      smartParse(inputText);
    }, 400);
    return () => clearTimeout(timer);
  }, [inputText]);

  const handleImport = () => {
    if (parsedCards.length === 0) return;
    const finalCards: Flashcard[] = parsedCards.map(pc => ({
      ...pc,
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      sourceNoteId: selectedChapterId,
      tags: [],
      interval: 1,
      easeFactor: 2.5,
      reviewCount: 0,
      difficulty: 0,
      nextReviewDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }));
    onImport(finalCards);
  };

  const updateCard = (id: string, updates: Partial<ParsedCard>) => {
    setParsedCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const loadExampleData = () => {
    setInputText(
      "Q: What is Active Recall?\nA: Stimulating memory by testing your mind through retrieval rather than passive reading.\n\n" +
      "Q: What is Spaced Repetition?\nA: Reviewing educational material at expanding intervals to optimize brain retention.\n\n" +
      "Q: What does the Leitner System use?\nA: Multiple flashcard card boxes to trace study intervals based on retention success."
    );
  };

  const activeCard = useMemo(() => {
    if (parsedCards.length === 0) return null;
    if (activeCardIndex >= parsedCards.length) return parsedCards[0];
    return parsedCards[activeCardIndex];
  }, [parsedCards, activeCardIndex]);

  const handleNextCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (parsedCards.length <= 1) return;
    setActiveCardIndex(prev => (prev + 1) % parsedCards.length);
  };

  const handlePrevCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (parsedCards.length <= 1) return;
    setActiveCardIndex(prev => (prev - 1 + parsedCards.length) % parsedCards.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#3C3630]/40 backdrop-blur-[12px]"
      id="flashcard-import-overlay"
    >
      <motion.div 
        initial={{ scale: 0.99, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
        className="w-full max-w-[1000px] h-[600px] rounded-[32px] shadow-[0_32px_80px_rgba(28,26,24,0.14),inset_0_1px_2px_rgba(255,255,255,0.4)] border border-[#DDD6C7]/50 flex overflow-hidden relative"
        id="flashcard-import-modal"
      >
        {/* LEFT PANEL: Warmer cream paper tone with a highly faint geometric grid */}
        <div 
          className="w-1/2 h-full bg-[#FAF7F1] p-10 flex flex-col relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(250, 247, 241, 0.985), rgba(250, 247, 241, 0.985)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='69.28' viewBox='0 0 120 69.28'%3E%3Cpath d='M0 0 L60 34.64 L120 0 M0 69.28 L60 34.64 L120 69.28 M60 0 L60 69.28 M0 34.64 L120 34.64' fill='none' stroke='%23C2B9A1' stroke-width='0.6'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 23.09px'
          }}
          id="import-left-panel"
        >
          {/* Header Selectors: soft pills matching layout precisely */}
          <div className="flex gap-4 mb-6 z-10" id="import-selectors-container">
            <div className="relative flex-1" id="subject-selector-wrapper">
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full h-[42px] pl-5 pr-10 bg-[#FAF8F5] border border-[#E5DECF] text-[#8B826E] text-[13px] font-sans font-medium rounded-full outline-none appearance-none cursor-pointer hover:border-[#D6CAB4] transition-all"
                id="subject-dropdown"
              >
                <option value="" disabled className="text-stone-400">Select subject</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
              <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-[#A89F8B]">
                <ChevronDown className="w-4 h-4 stroke-[1.5]" />
              </div>
            </div>

            <div className="relative flex-1" id="chapter-selector-wrapper">
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full h-[42px] pl-5 pr-10 bg-[#FAF8F5] border border-[#E5DECF] text-[#8B826E] text-[13px] font-sans font-medium rounded-full outline-none appearance-none cursor-pointer hover:border-[#D6CAB4] transition-all disabled:opacity-60"
                disabled={currentNotes.length === 0}
                id="chapter-dropdown"
              >
                <option value="" disabled className="text-stone-400">Select chapter</option>
                {currentNotes.map(n => (
                  <option key={n.id} value={n.id}>{n.title}</option>
                ))}
              </select>
              <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-[#A89F8B]">
                <ChevronDown className="w-4 h-4 stroke-[1.5]" />
              </div>
            </div>
          </div>

          {/* Text Area Container: visually melts into the panel */}
          <div className="w-full flex-1 bg-[#FAF8F4]/80 rounded-[24px] border border-[#E7E2D5] p-7 pb-10 flex flex-col relative z-10" id="textarea-container">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your questions, answers, or notes here..."
              className="w-full flex-1 bg-transparent border-none outline-none resize-none text-[14px] font-sans text-[#5D574E] placeholder-[#C2B79F] leading-relaxed overflow-y-auto custom-scrollbar focus:ring-0 p-0"
              id="import-textarea"
            />
            
            {/* Copy/Paste Helper icon absolute at bottom right */}
            <button 
              onClick={loadExampleData}
              title="Load example deck"
              className="absolute bottom-5 right-5 text-[#C2B8A3] hover:text-[#5D574E] hover:scale-105 active:scale-95 transition-all p-2 bg-[#FCFAF5] rounded-full border border-[#ECE6DA] shadow-sm cursor-pointer"
              id="load-example-btn"
            >
              <Clipboard className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* ORGANIC NOTEBOOK SPINE / PERFORATION TEAR: beautifully thin stitched look */}
        <div className="absolute top-0 bottom-0 left-[50%] -translate-x-[50%] w-[12px] z-30 pointer-events-none flex items-center justify-center opacity-45">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 12 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 6 0 L 6 100" stroke="#FAF8F5" strokeWidth="2.5" />
            <path d="M 6 0 L 6 100" stroke="#DDD6C7" strokeWidth="1.2" strokeDasharray="3 4" strokeLinecap="round" />
          </svg>
        </div>

        {/* RIGHT PANEL: Colder neutral paper-gray with subtle soft-lit felt grain texture */}
        <div 
          className="w-1/2 h-full p-10 flex flex-col justify-between relative overflow-hidden"
          style={{
            backgroundColor: '#ECE7DE',
            backgroundImage: `radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, transparent 80%), url("https://www.transparenttextures.com/patterns/felt.png")`,
            backgroundBlendMode: 'soft-light',
          }}
          id="import-right-panel"
        >
          {/* Top Header holding absolute quiet close panel */}
          <div className="flex justify-end z-30 font-sans" id="close-btn-container">
            <button 
              onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#DFD8CC] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]/90 text-[#9E9584] hover:text-[#5D574E] hover:scale-[1.02] active:scale-95 transition-all shadow-sm cursor-pointer"
              aria-label="Close"
              id="import-close-btn"
            >
              <X className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>

          {/* Centered highly-compressed stacked cards fanning out horizontally to the right */}
          <div className="flex-1 flex items-center justify-center relative my-4" id="cards-stack-center">
            <div className="relative w-[326px] h-[332px]" id="cards-stack-wrapper">
              
              {/* Back Card 4: Compressed & very faint */}
              <div className="absolute inset-0 bg-[#FAF9F5] rounded-[28px] border border-[#DDD5C0]/40 translate-x-[32px] scale-[0.985] opacity-[0.25] transition-all shadow-[0_4px_10px_rgba(0,0,0,0.01)]" />
              
              {/* Back Card 3 */}
              <div className="absolute inset-0 bg-[#FAF9F5] rounded-[28px] border border-[#DDD5C0]/50 translate-x-[24px] scale-[0.99] opacity-[0.55] transition-all shadow-[0_5px_12px_rgba(0,0,0,0.015)]" />
              
              {/* Back Card 2 */}
              <div className="absolute inset-0 bg-[#FAF9F5] rounded-[28px] border border-[#DDD5C0]/60 translate-x-[16px] scale-[0.995] opacity-[0.78] transition-all shadow-[0_6px_15px_rgba(0,0,0,0.02)]" />
              
              {/* Back Card 1 */}
              <div className="absolute inset-0 bg-[#FAF9F5] rounded-[28px] border border-[#DDD5C0]/70 translate-x-[8px] scale-[1.0] opacity-[0.94] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.03)]" />

              {/* Front Main Core Interactive Card: High-end physical paper look */}
              <div 
                className="relative w-full h-full bg-[#FAF8F5] rounded-[28px] border border-[#DDD5C0] shadow-[0_12px_28px_rgba(110,105,95,0.04),inset_0_1px_1.5px_white] p-6 flex flex-col justify-between z-10"
                id="main-interactive-card"
              >
                <div className="flex items-center justify-between" id="card-header">
                  {/* Rounded ochre bullet */}
                  <div className="w-[15px] h-[15px] rounded-full bg-[#CFBF9F] shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.06)]" id="ochre-bullet" />
                  
                  {/* Star Icon outline */}
                  <button className="text-[#AFAE9B] hover:text-[#5C564E] transition-colors cursor-pointer" id="star-btn">
                    <Star className="w-[17px] h-[17px] stroke-[1.2]" />
                  </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col justify-center my-3" id="card-inner-body">
                  <AnimatePresence mode="wait">
                    {!activeCard ? (
                      // Exquisite, extremely soft placeholder lines representing physical card layout
                      <motion.div 
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2.5 px-2 py-4"
                        id="empty-card-skeleton"
                      >
                        <div className="bg-[#EEEADF]/75 h-[11px] w-[85%] rounded-full" />
                        <div className="bg-[#EEEADF]/75 h-[11px] w-[85%] rounded-full" />
                        <div className="bg-[#EEEADF]/75 h-[11px] w-[42%] rounded-full" />
                        <div className="w-full h-[1px] bg-[#EFEAE0] my-5" />
                      </motion.div>
                    ) : (
                      // Interactive live edit preview
                      <motion.div 
                        key={activeCard.id}
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col h-full justify-between py-1 text-left"
                        id="active-card-editor"
                      >
                        {/* Prompt (Front) */}
                        <div className="px-1 pt-1 flex-1">
                          <span className="text-[9px] font-sans font-bold text-[#BBB29E] uppercase tracking-widest block mb-1">PROMPT</span>
                          <textarea 
                            value={activeCard.front}
                            onChange={(e) => updateCard(activeCard.id, { front: e.target.value })}
                            className="w-full text-[14px] font-sans font-bold text-[#433E37] bg-transparent border-none outline-none resize-none p-0 focus:ring-0 leading-snug custom-scrollbar placeholder-[#D1C8B4] overflow-y-auto"
                            placeholder="Add question front..."
                            rows={3}
                          />
                        </div>

                        {/* Mid separation line */}
                        <div className="w-full h-[1px] bg-[#EFEAE0] my-2" />

                        {/* Answer (Back) */}
                        <div className="px-1 pb-1 flex-1">
                          <span className="text-[9px] font-sans font-bold text-[#BBB29E] uppercase tracking-widest block mb-1">ANSWER</span>
                          <textarea 
                            value={activeCard.back}
                            onChange={(e) => updateCard(activeCard.id, { back: e.target.value })}
                            className="w-full text-[13px] font-sans font-normal text-[#5D574E] bg-transparent border-none outline-none resize-none p-0 focus:ring-0 leading-relaxed custom-scrollbar placeholder-[#D1C8B4] overflow-y-auto"
                            placeholder="Add answer back..."
                            rows={3}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* High precision divider to matching design spacing */}
                <div className="w-full h-[1px] bg-[#EFEAE0] mt-auto mb-4" />

                {/* Footer Controls matching reference exactly */}
                <div className="flex items-center justify-between text-[#9F9684] text-[13px] font-sans font-medium px-0.5" id="card-footer-controls">
                  <div className="flex items-center gap-1.5 text-[#9F9684] hover:text-[#5D574E] cursor-pointer" id="stack-indicator">
                    <Layers className="w-[17px] h-[17px] stroke-[1.3]" />
                  </div>
                  
                  <span className="text-[#9F9684] tracking-tight font-sans text-[13px]">
                    {parsedCards.length > 0 ? `${activeCardIndex + 1} / ${parsedCards.length}` : '1 / 6'}
                  </span>

                  <div className="flex items-center gap-2" id="nav-arrow-group">
                    {parsedCards.length > 1 && (
                      <button 
                        onClick={handlePrevCard}
                        className="p-1 hover:bg-[#F2ECE0]/50 rounded-full transition-colors cursor-pointer"
                        title="Previous card"
                      >
                        <ChevronLeft className="w-[17px] h-[17px] stroke-[1.3] text-[#9F9684]" />
                      </button>
                    )}
                    <button 
                      onClick={handleNextCard}
                      disabled={parsedCards.length <= 1}
                      className="p-1 hover:bg-[#F2ECE0]/50 rounded-full transition-colors cursor-pointer disabled:opacity-30"
                      title="Next card"
                    >
                      <ChevronRight className="w-[17px] h-[17px] stroke-[1.3] text-[#9F9684]" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Matte charcoal-brown capsule button: reduced visual weight, tactile capsule style */}
          <div className="flex justify-end p-1 z-30" id="import-submit-container">
            <button 
              onClick={handleImport}
              disabled={parsedCards.length === 0}
              className="px-5 h-[42px] bg-[#6B645D] hover:bg-[#5E5852] active:scale-[0.985] disabled:opacity-30 disabled:cursor-not-allowed text-white text-[11px] font-sans font-semibold uppercase tracking-wider rounded-[14px] shadow-[0_2px_8px_rgba(93,88,83,0.12)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              id="import-action-btn"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              IMPORT AS STUDY ITEMS
            </button>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
