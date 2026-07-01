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

// Add JSON schema instructions to prompt
$prompt .= "\n\nYour response MUST follow this JSON schema:\n";
$prompt .= "{\n";
$prompt .= "  \"formattedHTML\": \"string (required)\",\n";
$prompt .= "  \"stickies\": \"array of sticky note objects (optional)\",\n";
$prompt .= "  \"arrows\": \"array of arrow objects (optional)\",\n";
$prompt .= "  \"dividers\": \"array of divider objects (optional)\"\n";
$prompt .= "}\n\n";
$prompt .= "Sticky note format: { \"id\": \"string\", \"text\": \"string\", \"color\": \"#ffff99|#ffccff|#ccffff|#ffcc99\", \"position\": { \"x\": number, \"y\": number }, \"fontSize\": number }\n";
$prompt .= "Arrow format: { \"id\": \"string\", \"start\": { \"x\": number, \"y\": number }, \"end\": { \"x\": number, \"y\": number }, \"mid\": { \"x\": number, \"y\": number }, \"color\": \"string\" }\n";
$prompt .= "Divider format: { \"id\": \"string\", \"type\": \"solid|dashed|dotted|zigzag|wave\", \"orientation\": \"horizontal|vertical\", \"size\": number, \"length\": string, \"color\": string, \"position\": { \"x\": number, \"y\": number } }\n";
$prompt .= "\nPlacement: Stickies on right margin (x: 850-920), y near centerY. Arrows from text (x: 600) to sticky.\n";
$prompt .= "Do not wrap JSON output in markdown backticks.";

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

// Parse response
$candidateJson = $result['text'] ?? null;

if (!$candidateJson) {
    errorResponse('Gemini did not return any content.', 500, 'GEMINI_EMPTY_RESPONSE');
}

// Log the raw response for debugging
error_log("Raw Gemini response: " . substr($candidateJson, 0, 500));

// Try to extract JSON from markdown code blocks if present
$jsonToParse = $candidateJson;
if (preg_match('/```(?:json)?\s*(.*?)\s*```/s', $candidateJson, $matches)) {
    $jsonToParse = $matches[1];
    error_log("Extracted JSON from markdown");
}

// Try parsing
$formattedResult = json_decode(trim($jsonToParse), true);
if (!$formattedResult) {
    // JSON parsing failed, try to return the raw HTML as fallback
    error_log("JSON parsing failed, attempting fallback");
    
    // Check if response contains HTML
    if (preg_match('/<[^>]+>/', $candidateJson)) {
        // Return raw HTML as formattedHTML
        $fallbackResult = [
            'formattedHTML' => $candidateJson,
            'stickies' => [],
            'arrows' => [],
            'dividers' => []
        ];
        successResponse($fallbackResult, 'Selection formatted (raw HTML fallback due to JSON parsing issue)!');
    } else {
        // Return as plain text in formattedHTML
        $fallbackResult = [
            'formattedHTML' => '<p>' . htmlspecialchars($candidateJson) . '</p>',
            'stickies' => [],
            'arrows' => [],
            'dividers' => []
        ];
        successResponse($fallbackResult, 'Selection formatted (text fallback due to JSON parsing issue)!');
    }
}

successResponse($formattedResult, 'Selection formatted successfully by Gemini AI!');
