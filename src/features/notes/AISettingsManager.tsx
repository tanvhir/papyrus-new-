import { useState, useCallback } from 'react';

export const useAISettings = () => {
  const [customApiKey, setCustomApiKey] = useState<string>(() => 
    localStorage.getItem('academic_custom_api_key') || ''
  );
  const [customModel, setCustomModel] = useState<string>(() => 
    localStorage.getItem('academic_custom_model') || 'gemma-4-31b-it'
  );
  const [highlightStyle, setHighlightStyle] = useState<'balanced' | 'generous' | 'none'>(() => 
    (localStorage.getItem('academic_highlight_style') as 'balanced' | 'generous' | 'none') || 'balanced'
  );
  
  // New toggles for disabling specific AI features
  const [disableAIFlashcards, setDisableAIFlashcards] = useState<boolean>(() => 
    localStorage.getItem('academic_disable_ai_flashcards') !== 'false'
  );
  const [disableAIArrows, setDisableAIArrows] = useState<boolean>(() => 
    localStorage.getItem('academic_disable_ai_arrows') === 'true'
  );
  const [disableAIStickies, setDisableAIStickies] = useState<boolean>(() => 
    localStorage.getItem('academic_disable_ai_stickies') !== 'false'
  );
  const [disableAIDividers, setDisableAIDividers] = useState<boolean>(() => 
    localStorage.getItem('academic_disable_ai_dividers') === 'true'
  );
  const [disableAIImages, setDisableAIImages] = useState<boolean>(() => 
    localStorage.getItem('academic_disable_ai_images') !== 'false'
  );
  const [disableAIColumns, setDisableAIColumns] = useState<boolean>(() => 
    localStorage.getItem('academic_disable_ai_columns') === 'true'
  );
  const [allowNoteEnhancement, setAllowNoteEnhancement] = useState<boolean>(() => 
    localStorage.getItem('academic_allow_note_enhancement') !== 'false'
  );
  const [enableCleaning, setEnableCleaning] = useState<boolean>(() => 
    localStorage.getItem('academic_enable_cleaning') !== 'false'
  );

  const BUILTIN_MODELS = [
    'gemma-4-31b',
    'gemini-2.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
  ];

  const [isCustomModelActive, setIsCustomModelActive] = useState(() => {
    const model = localStorage.getItem('academic_custom_model') || 'gemini-2.5-flash';
    return !BUILTIN_MODELS.includes(model);
  });
  
  const [customModelInput, setCustomModelInput] = useState(() => {
    const model = localStorage.getItem('academic_custom_model') || '';
    return !BUILTIN_MODELS.includes(model) ? model : '';
  });

  const handleUpdateCustomApiKey = useCallback((key: string) => {
    setCustomApiKey(key);
    localStorage.setItem('academic_custom_api_key', key);
  }, []);

  const handleUpdateCustomModel = useCallback((model: string) => {
    setCustomModel(model);
    localStorage.setItem('academic_custom_model', model);
  }, []);

  const handleUpdateHighlightStyle = useCallback((style: 'balanced' | 'generous' | 'none') => {
    setHighlightStyle(style);
    localStorage.setItem('academic_highlight_style', style);
  }, []);

  const handleUpdateDisableAIFlashcards = useCallback((disabled: boolean) => {
    setDisableAIFlashcards(disabled);
    localStorage.setItem('academic_disable_ai_flashcards', String(disabled));
  }, []);

  const handleUpdateDisableAIArrows = useCallback((disabled: boolean) => {
    setDisableAIArrows(disabled);
    localStorage.setItem('academic_disable_ai_arrows', String(disabled));
  }, []);

  const handleUpdateDisableAIStickies = useCallback((disabled: boolean) => {
    setDisableAIStickies(disabled);
    localStorage.setItem('academic_disable_ai_stickies', String(disabled));
  }, []);

  const handleUpdateDisableAIDividers = useCallback((disabled: boolean) => {
    setDisableAIDividers(disabled);
    localStorage.setItem('academic_disable_ai_dividers', String(disabled));
  }, []);

  const handleUpdateDisableAIImages = useCallback((disabled: boolean) => {
    setDisableAIImages(disabled);
    localStorage.setItem('academic_disable_ai_images', String(disabled));
  }, []);

  const handleUpdateDisableAIColumns = useCallback((disabled: boolean) => {
    setDisableAIColumns(disabled);
    localStorage.setItem('academic_disable_ai_columns', String(disabled));
  }, []);

  const handleUpdateAllowNoteEnhancement = useCallback((allowed: boolean) => {
    setAllowNoteEnhancement(allowed);
    localStorage.setItem('academic_allow_note_enhancement', String(allowed));
  }, []);

  const handleUpdateEnableCleaning = useCallback((enabled: boolean) => {
    setEnableCleaning(enabled);
    localStorage.setItem('academic_enable_cleaning', String(enabled));
  }, []);

  return {
    customApiKey,
    customModel,
    highlightStyle,
    disableAIFlashcards,
    disableAIArrows,
    disableAIStickies,
    disableAIDividers,
    disableAIImages,
    disableAIColumns,
    allowNoteEnhancement,
    enableCleaning,
    isCustomModelActive,
    customModelInput,
    BUILTIN_MODELS,
    setIsCustomModelActive,
    setCustomModelInput,
    handleUpdateCustomApiKey,
    handleUpdateCustomModel,
    handleUpdateHighlightStyle,
    handleUpdateDisableAIFlashcards,
    handleUpdateDisableAIArrows,
    handleUpdateDisableAIStickies,
    handleUpdateDisableAIDividers,
    handleUpdateDisableAIImages,
    handleUpdateDisableAIColumns,
    handleUpdateAllowNoteEnhancement,
    handleUpdateEnableCleaning,
  };
};
