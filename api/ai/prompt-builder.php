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
        return "You are an expert academic content designer. Your task is to format content based on user instructions.\n\n";
    }
    
    private function getModeSpecificInstructions() {
        if ($this->mode === 'selection') {
            return "\nSELECTION MODE: You are formatting ONLY a specific portion of a note. Return only the formatted replacement for the selected portion.\n";
        } else {
            return "\nFULL NOTE MODE: You are formatting an entire note. Restructure and enhance the entire document.\n";
        }
    }
    
    private function getHighlightInstruction() {
        if ($this->highlightStyle === 'generous') {
            return "\nHIGHLIGHT STYLE: Use highlights GENEROUSLY with `<mark data-color=\"#ffff00\" style=\"background-color: rgb(255, 255, 0); color: inherit;\">text</mark>` to highlight key terms, critical definitions, formulas, important concepts, examples, and any noteworthy information. Aim for 8-15 highlights per page. Use appropriate colors: Yellow for general, Blue for definitions, Deep green for formulas, Pink for examples, Orange for warnings.\n";
        } else if ($this->highlightStyle === 'none') {
            return "\nHIGHLIGHT STYLE: Do NOT use any highlights (`<mark>`) at all. Keep everything un-highlighted.\n";
        } else {
            return "\nHIGHLIGHT STYLE: Use highlights SPARINGLY with `<mark data-color=\"#ffff00\" style=\"background-color: rgb(255, 255, 0); color: inherit;\">text</mark>` ONLY for the most critical definitions, formulas, or key terms (maximum of 3-5 highlights per page). Be very selective. Use appropriate colors: Yellow for general, Blue for definitions, Deep green for formulas, Pink for examples, Orange for warnings.\n";
        }
    }
    private function getCriticalFormattingRules() {
        $rules = "\n\nCRITICAL FORMATTING RULES:\n";
        
        if ($this->mode === 'selection') {
            $rules .= "- CRITICAL: NEVER include `<div data-type=\"page\">` or any page wrapper tags in your formattedHTML output. Only return inline content (headings, paragraphs, lists, etc.) without page wrappers.\n";
        }
        
        $rules .= "- CRITICAL: Only use multi-column layouts when the user EXPLICITLY requests columns, side-by-side layout, comparison tables, or mnemonic layouts. DO NOT use columns for simple formatting requests like centering, highlighting, or basic text styling.\n";
        $rules .= "- When using multi-column elements, ensure valid structure: Each column MUST contain complete block-level elements (p, h1-h6, ul, ol, etc.). Never put inline text directly inside a column without a block wrapper.\n";
        $rules .= "- IMPORTANT DISTINCTION: When users say \"use an arrow to mark\" or \"point to\" something, they usually want you to generate a sticky note with an arrow annotation (in the \"stickies\" and \"arrows\" arrays), NOT create column layouts with inline SVG arrows. Only use the column+SVG arrow pattern for explicit mnemonic layouts.\n";
        $rules .= "- CRITICAL: Preserve ALL mathematical equations and formulas. If you see LaTeX equations wrapped in `$` delimiters (e.g., `$\\frac{d^2x}{dt^2} + \\omega^2x = 0$`), you MUST convert them to `<span data-type=\"math\" data-latex=\"...\"></span>` format by removing the `$` delimiters and placing the LaTeX content in the data-latex attribute. Never remove or drop equation content.\n";
        
        if (isset($this->settings['allowNoteEnhancement']) && !$this->settings['allowNoteEnhancement']) {
            $rules .= "- CRITICAL: DO NOT modify the actual text content or wording. Only apply formatting (headings, lists, highlights, etc.) without changing the meaning or words.\n";
        }
        
        if (isset($this->settings['enableCleaning']) && $this->settings['enableCleaning']) {
            $rules .= "- Clean up random numeric artifacts like (21), (2), [1], etc. that may appear in the text. Remove these artifacts while preserving the actual content.\n";
        }
        
        return $rules;
    }
    
    private function getContentSection() {
        if ($this->mode === 'selection') {
            $instruction = $this->content['instruction'] ?? '';
            $text = $this->content['text'] ?? '';
            $html = $this->content['html'] ?? '';
            $centerY = $this->content['centerY'] ?? 300;
            
            $section = "\n\nUSER'S CUSTOM FORMATTING INSTRUCTION: \"{$instruction}\"\n\n";
            $section .= "SELECTED TEXT TO FORMAT:\n{$text}\n\n";
            $section .= "SELECTED HTML OF SELECTION (if any structure exists):\n{$html}\n\n";
            $section .= "CURRENT VISUAL PAGE LINE HEIGHT (centerY): {$centerY}\n\n";
            
            $section .= "Your response MUST be a single structured JSON object with the following fields:\n";
            $section .= "1. \"formattedHTML\": The beautifully formatted HTML representing ONLY the replacement for the selected portion.\n";
            $section .= "2. \"stickies\": An array of optional staggered callout sticky notes ONLY if requested by the user's prompt or highly necessary (limit to 1 or 2 max).\n";
            $section .= "3. \"arrows\": An array of optional curved connection or callout arrows pointing from main concepts in the text block to relevant stickies.\n";
            $section .= "4. \"dividers\": An array of optional decorative background canvas dividers (keep empty unless requested).\n";
            $section .= "\nCRITICAL: Start your final JSON response with exactly: ===JSON_OUTPUT===\n";
            
            return $section;
        } else {
            $title = $this->content['title'] ?? '';
            $content = $this->content['content'] ?? '';
            
            $section = "\n\nNOTE TO FORMAT:\n";
            $section .= "Title: {$title}\n";
            $section .= "Content: {$content}\n\n";
            
            $section .= "Your response MUST be a structured JSON object with the following fields:\n";
            $section .= "1. \"title\": A polished, clear title for the note.\n";
            $section .= "2. \"content\": A beautifully structured HTML string that uses rich formatting features supported by our editor.\n";
            $section .= "3. \"stickies\": An array of sticky notes for key Callouts, Reminders, definitions, or Quick Flashcards.\n";
            $section .= "4. \"arrows\": An array of curved connection or callout arrows pointing from main concepts in the text block to relevant stickies.\n";
            $section .= "5. \"dividers\": An array of decorative background canvas dividers (keep empty unless requested).\n";
            $section .= "\nCRITICAL: Start your final JSON response with exactly: ===JSON_OUTPUT===\n";
            
            return $section;
        }
    }
}
