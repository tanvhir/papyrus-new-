import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { HelpNavigation } from './HelpNavigation';
import { HelpContent } from './HelpContent';

type HelpSection = 'welcome' | 'getting-started' | 'writing-notes' | 'folders' | 'flashcards' | 'ai-features' | 'keyboard-shortcuts' | 'tips-tricks' | 'faq' | 'about';

interface HelpCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ open, onOpenChange }) => {
  const [activeSection, setActiveSection] = useState<HelpSection>('welcome');

  useEffect(() => {
    if (open) {
      setActiveSection('welcome');
    }
  }, [open]);

  const scrollToSection = (sectionId: HelpSection) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    const contentContainer = document.querySelector('[data-content-area]');
    if (element && contentContainer) {
      const elementTop = element.offsetTop;
      contentContainer.scrollTo({ top: elementTop, behavior: 'smooth' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[1000px] h-[85vh] max-h-[90vh] p-0 bg-[#FCFBF7] dark:bg-[#0A0A0A] border border-stone-200/50 dark:border-stone-800/50 rounded-2xl shadow-2xl overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex h-full min-h-0"
        >
        <div className="flex h-full min-h-0">
          <div className="w-64 border-r border-stone-200/50 dark:border-stone-800/50 bg-white/50 dark:bg-stone-950/50 backdrop-blur-sm flex flex-col flex-shrink-0">
            <div className="p-6 border-b border-stone-200/50 dark:border-stone-800/50">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Help Center</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Learn how to use Papyrus</p>
            </div>
            <HelpNavigation activeSection={activeSection} onSectionChange={scrollToSection} />
          </div>

          <div className="flex-1 overflow-y-auto bg-stone-50/40 dark:bg-stone-900/40 min-h-0" data-content-area>
            <HelpContent activeSection={activeSection} />
          </div>
        </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
