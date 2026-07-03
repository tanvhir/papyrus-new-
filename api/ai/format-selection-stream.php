<?php
/**
 * AI Selection Formatter Streaming Endpoint
 * Streams AI responses in real-time for thinking display
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/tool-registry.php';
require_once __DIR__ . '/prompt-builder.php';
require_once __DIR__ . '/gemini-client.php';

// Set headers for streaming
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no');
// Disable output buffering
ini_set('output_buffering', 'off');
ini_set('zlib.output_compression', false);
while (@ob_end_flush());
ob_implicit_flush(true); // Disable nginx buffering

// Safe authentication
startSecureSession();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo "data: " . json_encode(['error' => 'Invalid request method. Only POST allowed.']) . "\n\n";
    exit;
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
    echo "data: " . json_encode(['error' => 'Invalid JSON request payload.']) . "\n\n";
    exit;
}

// Override API key or Model from client-provided settings
$customApiKey = $_SERVER['HTTP_X_GEMINI_API_KEY'] ?? ($input['customApiKey'] ?? '');
if (!empty($customApiKey)) {
    $apiKey = $customApiKey;
}

$modelName = $_SERVER['HTTP_X_GEMINI_MODEL'] ?? ($input['customModel'] ?? 'gemini-2.5-flash');

if (empty($apiKey)) {
    echo "data: " . json_encode(['error' => 'GEMINI_API_KEY is not configured.']) . "\n\n";
    exit;
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
    echo "data: " . json_encode(['error' => 'No text or HTML selected for formatting.']) . "\n\n";
    exit;
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

// Stream the response
$fullResponse = '';
$ch = curl_init();
$url = 'https://generativelanguage.googleapis.com/v1beta/models/' . $modelName . ':streamGenerateContent?key=' . $apiKey;

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'contents' => [['parts' => [['text' => $prompt]]]],
    'generationConfig' => [
        'temperature' => 0.7,
        'topK' => 40,
        'topP' => 0.95,
        'maxOutputTokens' => 8192
    ]
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 300);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $data) use (&$fullResponse) {
    $fullResponse .= $data;
    
    // Parse streaming chunks - Gemini sends JSON objects separated by newlines
    $lines = explode("\n", $data);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line)) continue;
        
        // Try to parse as JSON (Gemini streaming format)
        $chunkData = json_decode($line, true);
        
        if ($chunkData && isset($chunkData['candidates'][0]['content']['parts'][0]['text'])) {
            $text = $chunkData['candidates'][0]['content']['parts'][0]['text'];
            
            // Send raw text chunk to frontend (ChatGPT-style)
            echo "data: " . json_encode(['text' => $text]) . "\n\n";
            
            // Ensure output is sent immediately
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        }
    }
    
    return strlen($data);
});

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// If there was an error but we received some data, try to process it
if ($error) {
    // If we have accumulated data, try to process it as partial response
    if (!empty($fullResponse)) {
        error_log("cURL error but received data: " . strlen($fullResponse) . " bytes");
        // Continue to processing below
    } else {
        echo "data: " . json_encode(['error' => 'cURL error: ' . $error, 'bytesReceived' => strlen($fullResponse)]) . "\n\n";
        exit;
    }
}

if ($httpCode !== 200 && empty($fullResponse)) {
    echo "data: " . json_encode(['error' => 'HTTP error: ' . $httpCode, 'response' => substr($fullResponse, 0, 500)]) . "\n\n";
    exit;
}

// Send the full accumulated text for final parsing
// Reconstruct the full text from all chunks
$fullText = '';
$lines = explode("\n", $fullResponse);
foreach ($lines as $line) {
    $line = trim($line);
    if (empty($line)) continue;
    
    $chunkData = json_decode($line, true);
    if ($chunkData && isset($chunkData['candidates'][0]['content']['parts'][0]['text'])) {
        $fullText .= $chunkData['candidates'][0]['content']['parts'][0]['text'];
    }
}

// Try to extract JSON from the full text
$candidateJson = trim($fullText);

// First, try to extract from markdown code blocks
if (preg_match('/```(?:json)?\s*(.*?)\s*```/s', $candidateJson, $matches)) {
    $candidateJson = $matches[1];
}

// Try to find JSON object in the response
if (preg_match('/\{[^{}]*"formattedHTML"[^{}]*\}/s', $candidateJson, $matches)) {
    $candidateJson = $matches[0];
}

$formattedResult = json_decode($candidateJson, true);
if ($formattedResult) {
    echo "data: " . json_encode(['done' => true, 'result' => $formattedResult]) . "\n\n";
} else {
    // If JSON parsing failed, check if it's direct HTML
    // Remove "html" prefix if present
    $htmlContent = $candidateJson;
    if (preg_match('/^html\s*\n/i', $htmlContent)) {
        $htmlContent = preg_replace('/^html\s*\n/i', '', $htmlContent);
    }
    
    // If it looks like HTML (starts with <), wrap it in JSON structure
    if (preg_match('/^\s*</', $htmlContent)) {
        $fallbackResult = [
            'formattedHTML' => trim($htmlContent),
            'stickies' => [],
            'arrows' => [],
            'dividers' => []
        ];
        echo "data: " . json_encode(['done' => true, 'result' => $fallbackResult]) . "\n\n";
    } else {
        // Last resort: use the full text as formattedHTML
        $fallbackResult = [
            'formattedHTML' => trim($fullText),
            'stickies' => [],
            'arrows' => [],
            'dividers' => []
        ];
        echo "data: " . json_encode(['done' => true, 'result' => $fallbackResult]) . "\n\n";
    }
}

echo "data: [DONE]\n\n";
