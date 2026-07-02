import { motion } from 'motion/react';
import { Palette, Feather, Plus, Settings, HelpCircle, BookOpen, Download, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface AppHeaderProps {
  isCleanMode: boolean;
  activeNoteId: string;
  subjects: any[];
  getActiveContext: () => any;
  onToggleCleanMode: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onExportPDF: () => void;
  onDeleteNote: () => void;
  onAddNote: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isCleanMode,
  activeNoteId,
  subjects,
  getActiveContext,
  onToggleCleanMode,
  onOpenSettings,
  onOpenHelp,
  onExportPDF,
  onDeleteNote,
  onAddNote,
}) => {
  const activeContext = getActiveContext();
  const currentTitle = activeContext?.note.title || 'Untitled Note';

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="w-full max-w-4xl flex justify-between items-center mb-12 shrink-0"
    >
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center shadow-lg"
        >
          <Feather className="w-6 h-6 text-stone-700" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">{currentTitle}</h1>
          <p className="text-sm text-stone-500">{activeContext?.subject.name || 'General Notes'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCleanMode}
          className={isCleanMode ? 'bg-stone-200' : ''}
        >
          <Palette className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenSettings}>
          <Settings className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenHelp}>
          <HelpCircle className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onExportPDF}>
          <Download className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDeleteNote}>
          <Trash2 className="w-5 h-5 text-red-500" />
        </Button>
        <Button onClick={onAddNote}>
          <Plus className="w-5 h-5 mr-2" />
          New Note
        </Button>
      </div>
    </motion.header>
  );
};
