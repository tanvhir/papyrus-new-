<?php

class ToolRegistry {
    private static $tools = [
        // Basic text formatting
        'bold' => [
            'enabled' => true,
            'htmlTag' => '<strong>',
            'description' => 'Bold text for emphasis',
            'category' => 'basic'
        ],
        'italic' => [
            'enabled' => true,
            'htmlTag' => '<em>',
            'description' => 'Italic text for emphasis',
            'category' => 'basic'
        ],
        'underline' => [
            'enabled' => true,
            'htmlTag' => '<u>',
            'description' => 'Underlined text',
            'category' => 'basic'
        ],
        'subscript' => [
            'enabled' => true,
            'htmlTag' => '<sub>',
            'description' => 'Subscript for scientific notation',
            'category' => 'advanced'
        ],
        'superscript' => [
            'enabled' => true,
            'htmlTag' => '<sup>',
            'description' => 'Superscript for exponents',
            'category' => 'advanced'
        ],
        
        // Structural elements
        'headings' => [
            'enabled' => true,
            'htmlTag' => '<h1>, <h2>, <h3>',
            'description' => 'Headings for hierarchy',
            'category' => 'structural'
        ],
        'lists' => [
            'enabled' => true,
            'htmlTag' => '<ul>, <ol>, <li>',
            'description' => 'Bullet and numbered lists',
            'category' => 'structural'
        ],
        'blockquotes' => [
            'enabled' => true,
            'htmlTag' => '<blockquote>',
            'description' => 'Block quotes for citations',
            'category' => 'structural'
        ],
        'code' => [
            'enabled' => true,
            'htmlTag' => '<code>, <pre>',
            'description' => 'Code blocks and inline code',
            'category' => 'structural'
        ],
        
        // Alignment and spacing
        'alignment' => [
            'enabled' => true,
            'htmlTag' => 'style="text-align: center/left/right/justify"',
            'description' => 'Text alignment',
            'category' => 'layout'
        ],
        'fontSize' => [
            'enabled' => true,
            'htmlTag' => 'style="font-size: 1.2em"',
            'description' => 'Font size adjustment',
            'category' => 'layout'
        ],
        
        // Colors and highlights
        'textColor' => [
            'enabled' => true,
            'htmlTag' => '<span style="color: #hex">',
            'description' => 'Text color changes',
            'category' => 'style'
        ],
        'highlight' => [
            'enabled' => true,
            'htmlTag' => '<mark>',
            'description' => 'Text highlighting',
            'category' => 'style'
        ],
        
        // Links and media
        'links' => [
            'enabled' => true,
            'htmlTag' => '<a href="url">',
            'description' => 'Hyperlinks',
            'category' => 'media'
        ],
        'images' => [
            'enabled' => true,
            'htmlTag' => '<img>',
            'description' => 'Images',
            'category' => 'media',
            'settingKey' => 'disableAIImages'
        ],
        
        // Math
        'math' => [
            'enabled' => true,
            'htmlTag' => '<span data-type="math" data-latex="...">',
            'description' => 'LaTeX mathematical equations',
            'category' => 'special'
        ],
        
        // Advanced layout
        'columns' => [
            'enabled' => true,
            'htmlTag' => '<div data-type="columns">',
            'description' => 'Multi-column layouts',
            'category' => 'layout',
            'settingKey' => 'disableAIColumns'
        ],
        'horizontalRule' => [
            'enabled' => true,
            'htmlTag' => '<hr>',
            'description' => 'Horizontal separators',
            'category' => 'structural'
        ],
        
        // Decorative elements
        'decorativeDividers' => [
            'enabled' => true,
            'htmlTag' => '<decorative-divider>',
            'description' => 'Decorative section dividers',
            'category' => 'decorative',
            'settingKey' => 'disableAIDividers'
        ],
        
        // Annotations
        'stickies' => [
            'enabled' => true,
            'htmlTag' => 'JSON array in response',
            'description' => 'Margin sticky notes',
            'category' => 'annotation',
            'settingKey' => 'disableAIStickies'
        ],
        'arrows' => [
            'enabled' => true,
            'htmlTag' => 'JSON array in response',
            'description' => 'Connection arrows',
            'category' => 'annotation',
            'settingKey' => 'disableAIArrows'
        ],
        
        // Flashcards
        'flashcards' => [
            'enabled' => true,
            'htmlTag' => 'Inline suggestions',
            'description' => 'Flashcard-style Q&A',
            'category' => 'educational',
            'settingKey' => 'disableAIFlashcards'
        ],
    ];
    
    public static function getEnabledTools($settings = []) {
        $enabled = [];
        foreach (self::$tools as $key => $tool) {
            $isEnabled = $tool['enabled'];
            if (isset($tool['settingKey']) && isset($settings[$tool['settingKey']])) {
                $isEnabled = !$settings[$tool['settingKey']];
            }
            if ($isEnabled) {
                $enabled[$key] = $tool;
            }
        }
        return $enabled;
    }
    
    public static function generatePromptInstructions($enabledTools) {
        $instructions = "\n\nAVAILABLE FORMATTING TOOLS:\n";
        
        $categories = [
            'basic' => 'Basic Text Formatting',
            'structural' => 'Structural Elements',
            'layout' => 'Layout & Alignment',
            'style' => 'Colors & Highlights',
            'media' => 'Links & Media',
            'special' => 'Special Elements',
            'decorative' => 'Decorative Elements',
            'annotation' => 'Annotations',
            'educational' => 'Educational Features',
            'advanced' => 'Advanced Formatting'
        ];
        
        foreach ($categories as $catKey => $catName) {
            $toolsInCat = array_filter($enabledTools, fn($t) => $t['category'] === $catKey);
            if (!empty($toolsInCat)) {
                $instructions .= "\n### {$catName}:\n";
                foreach ($toolsInCat as $tool) {
                    $instructions .= "- {$tool['description']}: Use {$tool['htmlTag']}\n";
                }
            }
        }
        
        return $instructions;
    }
}
