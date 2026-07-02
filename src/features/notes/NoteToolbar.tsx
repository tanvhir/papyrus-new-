import React from 'react';
import { 
  Palette, 
  Feather, 
  Plus, 
  Save,
  Download,
  Upload,
  Clock,
  CloudOff,
  FileText,
  Printer,
  Brain,
  GraduationCap,
  Settings,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NoteToolbarProps {
  isCleanMode: boolean;
  onToggleCleanMode: () => void;
  onSave: () => void;
  onExportPDF: () => void;
  onImport: () => void;
  onOpenFlashcards: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  lastSaved: Date | null;
  isSaving: boolean;
  isOffline: boolean;
}

export const NoteToolbar: React.FC<NoteToolbarProps> = ({
  isCleanMode,
  onToggleCleanMode,
  onSave,
  onExportPDF,
  onImport,
  onOpenFlashcards,
  onOpenSettings,
  onOpenHelp,
  lastSaved,
  isSaving,
  isOffline
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isCleanMode ? "default" : "outline"}
        size="sm"
        onClick={onToggleCleanMode}
        className={cn(
          "transition-all",
          isCleanMode && "bg-primary text-primary-foreground"
        )}
      >
        <Feather className="w-4 h-4 mr-2" />
        {isCleanMode ? 'Editing' : 'Clean'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onSave}
        disabled={isSaving}
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onExportPDF}
      >
        <Printer className="w-4 h-4 mr-2" />
        Export PDF
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onImport}
      >
        <Upload className="w-4 h-4 mr-2" />
        Import
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onOpenFlashcards}
      >
        <GraduationCap className="w-4 h-4 mr-2" />
        Flashcards
      </Button>

      <div className="h-6 w-px bg-stone-200 dark:bg-stone-700 mx-2" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenSettings}
      >
        <Settings className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenHelp}
      >
        <HelpCircle className="w-4 h-4" />
      </Button>

      {isOffline && (
        <div className="flex items-center gap-1 text-amber-600 text-xs">
          <CloudOff className="w-3 h-3" />
          <span>Offline</span>
        </div>
      )}

      {lastSaved && (
        <div className="text-xs text-stone-500">
          {isSaving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString()}`}
        </div>
      )}
    </div>
  );
};
