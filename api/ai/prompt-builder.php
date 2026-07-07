<?php

require_once __DIR__ . '/tool-registry.php';

class PromptBuilder {
    private $settings;
    private $mode; // 'selection' or 'full-note'
    private $content;
    private $highlightStyle;
    
    public function __construct($settings, $mode, $content, $highlightStyle = 'balanced') {
        $this->settings = $settings;
        $this->mode = $mode;
        $this->content = $content;
        $this->highlightStyle = $highlightStyle;
    }
    
    public function build() {
        $enabledTools = ToolRegistry::getEnabledTools($this->settings);
        $toolInstructions = ToolRegistry::generatePromptInstructions($enabledTools);
        
        $prompt = $this->getBasePrompt();
        $prompt .= $this->getModeSpecificInstructions();
        $prompt .= $this->getHighlightInstruction();
        $prompt .= $toolInstructions;
        $prompt .= $this->getDynamicDisableInstructions();
        $prompt .= $this->getDynamicEnableInstructions();
        $prompt .= $this->getCriticalFormattingRules();
        $prompt .= $this->getContentSection();
        
        return $prompt;
    }
    
    public function buildSimplifiedPrompt($level = 'basic') {
        $prompt = $this->getBasePrompt();
        $prompt .= "\nSIMPLIFIED MODE ({$level}): Apply only basic formatting.\n";
        
        if ($level === 'basic') {
            $prompt .= "- Use <strong> for bold, <em> for italic, <u> for underline\n";
            $prompt .= "- Use <h1>, <h2>, <h3> for headings\n";
            $prompt .= "- Use <ul>, <ol> for lists\n";
        } else if ($level === 'minimal') {
            $prompt .= "- Use only <h1>, <h2>, <h3> for headings\n";
        }
        
        $prompt .= $this->getContentSection();
        
        return $prompt;
    }
    
    private function getBasePrompt() {
        return "Format content as JSON.\n\n";
    }
    
    private function getModeSpecificInstructions() {
        if ($this->mode === 'selection') {
            return "\nMode: Selection - format only selected portion\n";
        } else {
            return "\nMode: Full Note - format entire document\n";
        }
    }
    
    private function getHighlightInstruction() {
        if ($this->highlightStyle === 'generous') {
            return "\nHighlights: Generous (8-15 per page)\n";
        } else if ($this->highlightStyle === 'none') {
            return "\nHighlights: None\n";
        } else {
            return "\nHighlights: Sparse (3-5 per page)\n";
        }
    }
    
    private function getDynamicDisableInstructions() {
        $instructions = "\nDISABLED FEATURES (DO NOT USE):\n";
        $hasDisabled = false;
        
        foreach ($this->settings as $key => $value) {
            if ($value === true && strpos($key, 'disable') === 0) {
                $feature = str_replace('disableAI', '', $key);
                $feature = str_replace('disable', '', $feature);
                $instructions .= "- DO NOT use {$feature}\n";
                $hasDisabled = true;
            }
        }
        
        return $hasDisabled ? $instructions : '';
    }
    
    private function getDynamicEnableInstructions() {
        $instructions = "\nENABLED FEATURES (YOU MAY USE):\n";
        $enabledTools = ToolRegistry::getEnabledTools($this->settings);
        
        foreach ($enabledTools as $key => $tool) {
            if ($tool['category'] === 'annotation' || $tool['category'] === 'educational') {
                $instructions .= "- You MAY use {$key} ({$tool['description']}) when appropriate\n";
            }
        }
        
        return $instructions;
    }
    
    private function getCriticalFormattingRules() {
        $rules = "\n\nFORMATTING RULES:\n";
        
        if ($this->mode === 'selection') {
            $rules .= "- No page wrapper tags in formattedHTML\n";
        }
        
        $rules .= "- Convert LaTeX `$...$` to `<span data-type=\"math\" data-latex=\"...\"></span>`\n";
        
        if (isset($this->settings['allowNoteEnhancement']) && !$this->settings['allowNoteEnhancement']) {
            $rules .= "- Don't modify text content, only apply formatting\n";
        }
        
        if (isset($this->settings['enableCleaning']) && $this->settings['enableCleaning']) {
            $rules .= "- Remove numeric artifacts like (21), (2), [1]\n";
        }
        
        return $rules;
    }
    
    private function getContentSection() {
        if ($this->mode === 'selection') {
            $instruction = $this->content['instruction'] ?? '';
            $text = $this->content['text'] ?? '';
            $html = $this->content['html'] ?? '';
            $centerY = $this->content['centerY'] ?? 300;
            
            $section = "\nInstruction: \"{$instruction}\"\n";
            $section .= "Text: {$text}\n";
            $section .= "HTML: {$html}\n";
            $section .= "CenterY: {$centerY}\n\n";
            
            $section .= "JSON fields: formattedHTML (string), stickies (array), arrows (array), dividers (array)\n";
            $section .= "Wrap in <output> tags\n";
            
            return $section;
        } else {
            $title = $this->content['title'] ?? '';
            $content = $this->content['content'] ?? '';
            
            $section = "\nTitle: {$title}\n";
            $section .= "Content: {$content}\n\n";
            
            $section .= "JSON fields: title (string), content (string), stickies (array), arrows (array), dividers (array)\n";
            $section .= "Wrap in <output> tags\n";
            
            return $section;
        }
    }
}
