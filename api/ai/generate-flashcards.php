<?php
/**
 * AI Flashcard Generator Endpoint using Google Gemini API
 * Generates flashcards from note content with various card types
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

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

$noteContent = $input['noteContent'] ?? '';
$noteTitle = $input['noteTitle'] ?? '';
$instruction = $input['instruction'] ?? 'Generate flashcards from this note';
$maxCards = intval($input['maxCards'] ?? 10);
$highlightStyle = $input['highlightStyle'] ?? 'balanced';

if (empty($noteContent)) {
    errorResponse('Note content is required for flashcard generation.', 400);
}

// 3. Construct prompt for flashcard generation
$prompt = "You are an expert educational content creator. Your task is to generate high-quality flashcards from the provided note content.

Note Title: $noteTitle

Note Content:
$noteContent

User's instruction: \"$instruction\"

Generate up to $maxCards flashcards. Each flashcard should be meaningful and test important concepts.

Your response MUST be a single structured JSON object with the following fields:
1. \"flashcards\": An array of flashcard objects, each containing:
   - \"type\": One of: 'basic' (Q&A), 'cloze' (fill-in-the-blank), 'definition' (term & meaning), 'formula' (mathematical formula), 'multi-point' (multiple related points)
   - \"front\": The question, term, or prompt (for cloze, use {{answer}} format for the blank)
   - \"back\": The answer, definition, or explanation
   - \"clozeData\": (only for cloze type) The word that goes in the blank

Card Type Guidelines:
- Basic (Q&A): Use for factual questions, concepts, and direct recall
- Cloze Deletion: Use for sentences where removing a key word tests understanding. Format: \"The {{capital}} of France is Paris\" with clozeData: \"capital\"
- Definition: Use for academic terms, vocabulary, and technical concepts
- Formula: Use for mathematical equations, scientific formulas, and calculations
- Multi-Point: Use for lists, steps, or multiple related concepts that should be learned together

Quality Guidelines:
- Make flashcards challenging but fair
- Avoid trivial or too easy questions
- Ensure the back side provides complete, accurate information
- Use the highlight style setting ($highlightStyle) to determine if you should include hints in the back (generous = more hints, balanced = moderate hints)
- Mix different card types based on what fits the content best
- Focus on the most important concepts from the note

Do not wrap the JSON output in markdown backticks.";

// 4. Gemini API Call
$url = "https://generativelanguage.googleapis.com/v1beta/models/" . urlencode($modelName) . ":generateContent?key=" . urlencode($apiKey);

$payload = [
    'contents' => [
        [
            'parts' => [
                ['text' => $prompt]
            ]
        ]
    ],
    'generationConfig' => [
        'responseMimeType' => 'application/json',
        'responseSchema' => [
            'type' => 'OBJECT',
            'properties' => [
                'flashcards' => [
                    'type' => 'ARRAY',
                    'items' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'type' => [
                                'type' => 'STRING',
                                'enum' => ['basic', 'cloze', 'definition', 'formula', 'multi-point']
                            ],
                            'front' => ['type' => 'STRING'],
                            'back' => ['type' => 'STRING'],
                            'clozeData' => ['type' => 'STRING']
                        ],
                        'required' => ['type', 'front', 'back']
                    ]
                ]
            ],
            'required' => ['flashcards']
        ]
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    errorResponse('Gemini API request failed.', 500, 'GEMINI_API_ERROR');
}

$resData = json_decode($response, true);
$candidateJson = $resData['candidates'][0]['content']['parts'][0]['text'] ?? null;

if (!$candidateJson) {
    errorResponse('Gemini did not return any content.', 500, 'GEMINI_EMPTY_RESPONSE');
}

$formattedResult = json_decode(trim($candidateJson), true);
if (!$formattedResult) {
    errorResponse('Failed to parse Gemini output as structured format JSON.', 500, 'PARSE_ERROR');
}

successResponse($formattedResult, 'Flashcards generated successfully by Gemini AI!');
