import { useState } from 'react';

export const useUIState = () => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fileHandle, setFileHandle] = useState<any>(null);
  const [activeHighlighterColor, setActiveHighlighterColor] = useState<string | null>(null);
  const [isCleanMode, setIsCleanMode] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isDrawingArrowMode, setIsDrawingArrowMode] = useState(false);
  const [selectedArrowId, setSelectedArrowId] = useState<string | null>(null);
  const [editingStickyId, setEditingStickyId] = useState<string | null>(null);
  const [editingStickyText, setEditingStickyText] = useState('');
  const [editingStickyColor, setEditingStickyColor] = useState('yellow');
  const [editingStickyFontSize, setEditingStickyFontSize] = useState(14);

  return {
    isImportOpen,
    setIsImportOpen,
    isHelpOpen,
    setIsHelpOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    fileHandle,
    setFileHandle,
    activeHighlighterColor,
    setActiveHighlighterColor,
    isCleanMode,
    setIsCleanMode,
    isExportingPDF,
    setIsExportingPDF,
    isDrawingArrowMode,
    setIsDrawingArrowMode,
    selectedArrowId,
    setSelectedArrowId,
    editingStickyId,
    setEditingStickyId,
    editingStickyText,
    setEditingStickyText,
    editingStickyColor,
    setEditingStickyColor,
    editingStickyFontSize,
    setEditingStickyFontSize,
  };
};
