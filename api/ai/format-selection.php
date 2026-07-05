<?php
/**
 * AI Selection Formatter Endpoint using Google Gemini API
 * Compatible with PHP Shared Hosting & Node Dev Server emulation
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/tool-registry.php';
require_once __DIR__ . '/prompt-builder.php';
require_once __DIR__ . '/gemini-client.php';

// Safe authentication
startSecureSession();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Invalid request method. Only POST allowed.', 405);
}

// 1. Get GEMINI_API_KEY
$apiKey = getenv('GEMINI_API_KEY') ?: ($_ENV['GEMINI_API_KEY'] ?? '');
if (empty($apiKey)) {
    $envPath = __DIR__ . '/../../.env';
    if (file_exists($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($name, $value) = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value, " \t\n\r\0\x0B\"'");
                if ($name === 'GEMINI_API_KEY') {
                    $apiKey = $value;
                    break;
                }
            }
        }
    }
}

// 2. Read Request Payload
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    errorResponse('Invalid JSON request payload.', 400);
}

// Override API key or Model from client-provided settings
$customApiKey = $_SERVER['HTTP_X_GEMINI_API_KEY'] ?? ($input['customApiKey'] ?? '');
if (!empty($customApiKey)) {
    $apiKey = $customApiKey;
}

$modelName = $_SERVER['HTTP_X_GEMINI_MODEL'] ?? ($input['customModel'] ?? 'gemini-2.5-flash');

if (empty($apiKey)) {
    errorResponse('GEMINI_API_KEY is not configured. Please set it in your environment or .env file.', 500, 'MISSING_API_KEY');
}

$selectionText = $input['selectionText'] ?? '';
$selectionHTML = $input['selectionHTML'] ?? '';
$instruction = $input['instruction'] ?? '';
$centerY = floatval($input['centerY'] ?? 300);
$highlightStyle = $input['highlightStyle'] ?? 'balanced';

$disableAIFlashcards = ($input['disableAIFlashcards'] ?? false) === true;
$disableAIArrows = ($input['disableAIArrows'] ?? false) === true;
$disableAIStickies = ($input['disableAIStickies'] ?? false) === true;
$disableAIDividers = ($input['disableAIDividers'] ?? false) === true;
$disableAIImages = ($input['disableAIImages'] ?? false) === true;
$disableAIColumns = ($input['disableAIColumns'] ?? false) === true;
$allowNoteEnhancement = ($input['allowNoteEnhancement'] ?? false) === true;
$enableCleaning = ($input['enableCleaning'] ?? false) === true;

if (empty($selectionText) && empty($selectionHTML)) {
    errorResponse('No text or HTML selected for formatting.', 400);
}

// Build settings array
$settings = [
    'disableAIFlashcards' => $disableAIFlashcards,
    'disableAIArrows' => $disableAIArrows,
    'disableAIStickies' => $disableAIStickies,
    'disableAIDividers' => $disableAIDividers,
    'disableAIImages' => $disableAIImages,
    'disableAIColumns' => $disableAIColumns,
    'allowNoteEnhancement' => $allowNoteEnhancement,
    'enableCleaning' => $enableCleaning
];

// Build content array
$content = [
    'instruction' => $instruction,
    'text' => $selectionText,
    'html' => $selectionHTML,
    'centerY' => $centerY
];

// Use PromptBuilder to generate prompt
$promptBuilder = new PromptBuilder($settings, 'selection', $content, $highlightStyle);
$prompt = $promptBuilder->build();

// Add simple JSON instruction
$prompt .= "\n\nOUTPUT: Return JSON with fields: formattedHTML, stickies, arrows, dividers. No other text. Start with { end with }.\n";

// Call Gemini API with retry logic
$result = GeminiClient::call($prompt, $apiKey, $modelName);

if (!$result['success']) {
    // Try fallback with simplified prompt
    error_log("Primary formatting failed: " . $result['message']);
    
    if ($result['retries_exhausted'] ?? false) {
        $fallbackPrompt = $promptBuilder->buildSimplifiedPrompt('basic');
        $fallbackResult = GeminiClient::call($fallbackPrompt, $apiKey, $modelName);
        
        if ($fallbackResult['success']) {
            $result = $fallbackResult;
        } else {
            errorResponse('AI formatting failed after retries: ' . $result['message'], 500, 'GEMINI_API_ERROR');
        }
    } else {
        errorResponse('AI formatting failed: ' . $result['message'], 500, 'GEMINI_API_ERROR');
    }
}

// Parse response with smart JSON extraction
$candidateJson = $result['text'] ?? null;

if (!$candidateJson) {
    errorResponse('Gemini did not return any content.', 500, 'GEMINI_EMPTY_RESPONSE');
}

// Smart JSON extraction function with delimiter-based separation
function extractJson($text) {
    $text = trim($text);
    $extractionStrategy = 'unknown';
    
    // Strategy 0: Delimiter-based extraction (PRIMARY)
    if (strpos($text, '===JSON_OUTPUT===') !== false) {
        $parts = explode('===JSON_OUTPUT===', $text, 2);
        if (count($parts) === 2) {
            $jsonCandidate = trim($parts[1]);
            $parsed = json_decode($jsonCandidate, true);
            if ($parsed !== null) {
                $extractionStrategy = 'delimiter';
                return $jsonCandidate;
            }
        }
    }
    
    // Strategy 1: Try XML delimiters
    if (preg_match('/<output>(.*?)<\/output>/s', $text, $matches)) {
        $jsonCandidate = trim($matches[1]);
        $parsed = json_decode($jsonCandidate, true);
        if ($parsed !== null) {
            $extractionStrategy = 'xml_delimiter';
            return $jsonCandidate;
        }
    }
    
    // Strategy 2: Try markdown code blocks
    if (preg_match('/```(?:json)?\s*(.*?)\s*```/s', $text, $matches)) {
        $jsonCandidate = trim($matches[1]);
        $parsed = json_decode($jsonCandidate, true);
        if ($parsed !== null) {
            $extractionStrategy = 'markdown_code_block';
            return $jsonCandidate;
        }
    }
    
    // Strategy 3: Extract from field assignments (Gemma-4 reasoning format)
    $lines = explode("\n", $text);
    $jsonFields = [];
    $inJsonSection = false;
    
    foreach ($lines as $line) {
        $line = trim($line);
        
        // Look for patterns like "formattedHTML": "..." or *   "formattedHTML": "..."
        if (preg_match('/(?:\*?\s+)?["\']?([a-zA-Z_]+)["\']?\s*:\s*(.+)/', $line, $matches)) {
            $field = $matches[1];
            $value = $matches[2];
            
            // Clean up the value
            $value = trim($value, ' "\'*');
            
            // Only include valid JSON fields
            if (in_array($field, ['formattedHTML', 'stickies', 'arrows', 'dividers', 'title', 'content'])) {
                $jsonFields[$field] = $value;
                $inJsonSection = true;
            }
        }
    }
    
    // If we found JSON fields, construct a JSON object
    if (!empty($jsonFields) && $inJsonSection) {
        $jsonString = json_encode($jsonFields, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        
        // Try to parse it to ensure it's valid
        $parsed = json_decode($jsonString, true);
        if ($parsed !== null) {
            $extractionStrategy = 'field_assignments';
            return $jsonString;
        }
    }
    
    // Strategy 4: Find JSON between first { and last }
    $firstBrace = strpos($text, '{');
    $lastBrace = strrpos($text, '}');
    
    if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
        $jsonCandidate = substr($text, $firstBrace, $lastBrace - $firstBrace + 1);
        
        // Try to parse it
        $parsed = json_decode($jsonCandidate, true);
        if ($parsed !== null) {
            $extractionStrategy = 'brace_matching';
            return $jsonCandidate;
        }
    }
    
    // Strategy 5: Try to find any valid JSON object in the text
    preg_match_all('/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/s', $text, $matches);
    foreach ($matches[0] as $candidate) {
        $parsed = json_decode($candidate, true);
        if ($parsed !== null) {
            $extractionStrategy = 'json_object_search';
            return $candidate;
        }
    }
    
    // Strategy 6: Extract HTML from planned structure and construct fallback JSON
    $htmlContent = extractHtmlFromReasoning($text);
    if ($htmlContent) {
        $fallbackJson = json_encode(['formattedHTML' => $htmlContent], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $parsed = json_decode($fallbackJson, true);
        if ($parsed !== null) {
            $extractionStrategy = 'html_extraction_fallback';
            return $fallbackJson;
        }
    }
    
    // Strategy 7: Return original if nothing worked
    $extractionStrategy = 'original';
    return $text;
}

// Helper function to extract HTML from reasoning content
function extractHtmlFromReasoning($text) {
    $lines = explode("\n", $text);
    $htmlLines = [];
    $inHtmlSection = false;
    
    foreach ($lines as $line) {
        $line = trim($line);
        
        // Look for lines with actual HTML tags
        if (preg_match('/<[a-z][a-z0-9]*[^>]*>/', $line)) {
            $inHtmlSection = true;
            $htmlLines[] = $line;
        } elseif ($inHtmlSection && !empty($line)) {
            // Continue collecting if we're in an HTML section
            $htmlLines[] = $line;
        }
    }
    
    if (!empty($htmlLines)) {
        return implode("\n", $htmlLines);
    }
    
    return null;
}

$candidateJson = extractJson($candidateJson);

$formattedResult = json_decode($candidateJson, true);
if (!$formattedResult) {
    error_log("Failed to parse JSON. Raw response: " . substr($candidateJson, 0, 1000));
    $debugInfo = [
        'rawResponse' => $result['text'],
        'extractedJson' => $candidateJson,
        'model' => $modelName,
        'timestamp' => date('Y-m-d H:i:s'),
        'jsonError' => json_last_error_msg()
    ];
    errorResponse('Failed to parse Gemini output as structured format JSON.', 500, 'PARSE_ERROR', $debugInfo);
}

successResponse($formattedResult, 'Selection formatted successfully by Gemini AI!');
