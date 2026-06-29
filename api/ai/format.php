<?php
/**
 * AI Note Formatter Endpoint using Google Gemini API
 * Compatible with PHP Shared Hosting & Node Dev Server emulation
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

// Safe authentication (optional or required depending on session)
startSecureSession();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Invalid request method. Only POST allowed.', 405);
}

// 1. Get GEMINI_API_KEY from env, server, or .env file
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
    errorResponse('GEMINI_API_KEY is not configured on this host. Please set it in your environment or .env file.', 500, 'MISSING_API_KEY');
}

$title = $input['title'] ?? 'Untitled Note';
$content = $input['content'] ?? '';
$stickies = $input['stickies'] ?? [];
$arrows = $input['arrows'] ?? [];
$dividers = $input['dividers'] ?? [];
$pageLayout = $input['pageLayout'] ?? 'a4-portrait';
$highlightStyle = $input['highlightStyle'] ?? 'balanced';

$disableAIFlashcards = ($input['disableAIFlashcards'] ?? false) === true;
$disableAIArrows = ($input['disableAIArrows'] ?? false) === true;
$disableAIStickies = ($input['disableAIStickies'] ?? false) === true;
$disableAIDividers = ($input['disableAIDividers'] ?? false) === true;

$highlightInstruction = '';
if ($highlightStyle === 'generous') {
    $highlightInstruction = "2. GENEROUS HIGHLIGHTING:
   - Highlight all key terms, critical definitions, formulas, and important concepts generously to make the document extremely scan-friendly and visual. Use approved highlight colors (Yellow: #ffff00, Blue: #bfdbfe, Deep green: #15803d, Pink: #f9a8d4, Orange: #fed7aa) cleanly.";
} else if ($highlightStyle === 'none') {
    $highlightInstruction = "2. NO HIGHLIGHTING:
   - Do not generate any highlights (<mark>) at all. Keep the text format clean and un-highlighted.";
} else {
    $highlightInstruction = "2. NO RANDOM HIGHLIGHTS:
   - Do not highlight random individual words. Only use highlights (<mark>) for critical definitions, formulas, or key terms (maximum of 3 to 5 highlights per page). Use deep green (#15803d) or other approved highlight colors cleanly.";
}

$strictDisableInstructions = '';
if ($disableAIArrows) {
    $strictDisableInstructions .= "\n- DO NOT generate any connection or callout arrows in the \"arrows\" array. Keep the \"arrows\" array completely empty ([]) in your response.";
}
if ($disableAIStickies) {
    $strictDisableInstructions .= "\n- DO NOT generate any margin sticky notes in the \"stickies\" array. Keep the \"stickies\" array completely empty ([]) in your response.";
}
if ($disableAIDividers) {
    $strictDisableInstructions .= "\n- DO NOT generate any canvas dividers in the \"dividers\" array. Keep the \"dividers\" array completely empty ([]) in your response.";
}
if ($disableAIFlashcards) {
    $strictDisableInstructions .= "\n- DO NOT generate any flashcard-style inline question or answer suggestions.";
}

// Clean content HTML
$cleanContent = strip_tags($content, '<h1><h2><h3><h4><h5><h6><p><br><strong><em><u><ul><ol><li><span><mark><div><math-node><decorative-divider>');

// 3. Construct prompt
$prompt = "You are an expert academic scribe and content designer. Your task is to take the following rough, unformatted, or raw note titled \"$title\" and format it beautifully.

CRITICAL INSTRUCTIONS FOR HIGH-QUALITY FORMATTING:
1. STRICT SPARSITY RULE FOR STICKIES & ARROWS:
   - Only generate stickies or arrows if they are absolutely necessary as highly relevant callouts (e.g. key summaries, formulas, or mnemonic definitions).
   - If not absolutely essential, the \"stickies\" and \"arrows\" arrays MUST be empty ([]). Do not generate random definitions in stickies unless specifically requested or highly valuable! Limit stickies to a maximum of 1 or 2.
$highlightInstruction
3. STICKY PLACEMENT ALGORITHM:
   - Place all generated stickies in the right-hand margin area.
   - Set \"x\" between 850 and 920.
   - Stagger \"y\" values by at least 250px starting from 150 (e.g., y=150, 400, 650) to prevent overlapping.
4. ARROW ALGORITHM:
   - Connection arrows must start at a logical body coordinate on the page (e.g., x=600, y close to the relevant text) and end precisely at the target sticky's left edge (e.g., end.x = sticky_x - 10, end.y = sticky_y).
   - The \"mid\" coordinate MUST represent a slight, elegant curved bend to make it look hand-drawn and beautiful:
     mid.x = (start.x + end.x) / 2
     mid.y = (start.y + end.y) / 2 - 30

You must return a structured JSON object with the following fields:
1. \"title\": A polished, clear title for the note.
2. \"content\": A beautifully structured HTML string that uses rich formatting features supported by our editor:
   - Use headings (h1, h2, h3) and paragraph blocks.
   - Use lists (ul, ol) to organize lists of items.
   - Apply inline styles like bold (strong), italics (em), underlines (u).
   - Use highlights via `<mark data-color=\"#ffff00\" style=\"background-color: rgb(255, 255, 0); color: inherit;\">text</mark>`. (Highlight colors allowed: Yellow: #ffff00, Blue: #bfdbfe, Deep green: #15803d, Pink: #f9a8d4, Orange: #fed7aa)
   - Use side-by-side columns whenever information fits comparison or dual-structure layouts:
     `<div data-type=\"columns\"><div data-type=\"column\"><h3>Left</h3><p>...</p></div><div data-type=\"column\"><h3>Right</h3><p>...</p></div></div>`
   - Render mathematical equations or numerical derivations using `<math-node data-latex=\"LaTeX_Formula\"></math-node>`. E.g., `<math-node data-latex=\"E = mc^2\"></math-node>`.
   - Embed decorative separation lines between thematic sections using: `<decorative-divider data-type=\"solid|dashed|dotted|zigzag|wave\" data-color=\"#15803d\" data-size=\"2\" data-length=\"100%\"></decorative-divider>`.
   - Group page boundaries inside `<div data-type=\"page\">...</div>` containers.
3. \"stickies\": An array of sticky notes for key Callouts, Reminders, definitions, or Quick Flashcards (following the placement algorithm).
4. \"arrows\": An array of curved connection or callout arrows pointing from main concepts in the text block to relevant stickies (following the arrow algorithm).
5. \"dividers\": An array of decorative background canvas dividers (keep empty unless requested).

$strictDisableInstructions

Rough note to format:
Title: $title
Content: $cleanContent

Always keep the response as valid, pure JSON according to the requested schema. Do not include markdown codeblocks around the JSON response.";

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
                'title' => ['type' => 'STRING'],
                'content' => ['type' => 'STRING'],
                'stickies' => [
                    'type' => 'ARRAY',
                    'items' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'id' => ['type' => 'STRING'],
                            'text' => ['type' => 'STRING'],
                            'color' => ['type' => 'STRING'],
                            'position' => [
                                'type' => 'OBJECT',
                                'properties' => [
                                    'x' => ['type' => 'NUMBER'],
                                    'y' => ['type' => 'NUMBER']
                                ],
                                'required' => ['x', 'y']
                            ],
                            'fontSize' => ['type' => 'NUMBER']
                        ],
                        'required' => ['id', 'text', 'color', 'position']
                    ]
                ],
                'arrows' => [
                    'type' => 'ARRAY',
                    'items' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'id' => ['type' => 'STRING'],
                            'start' => [
                                'type' => 'OBJECT',
                                'properties' => [
                                    'x' => ['type' => 'NUMBER'],
                                    'y' => ['type' => 'NUMBER']
                                ],
                                'required' => ['x', 'y']
                            ],
                            'end' => [
                                'type' => 'OBJECT',
                                'properties' => [
                                    'x' => ['type' => 'NUMBER'],
                                    'y' => ['type' => 'NUMBER']
                                ],
                                'required' => ['x', 'y']
                            ],
                            'mid' => [
                                'type' => 'OBJECT',
                                'properties' => [
                                    'x' => ['type' => 'NUMBER'],
                                    'y' => ['type' => 'NUMBER']
                                ],
                                'required' => ['x', 'y']
                            ],
                            'color' => ['type' => 'STRING']
                        ],
                        'required' => ['id', 'start', 'end', 'mid', 'color']
                    ]
                ],
                'dividers' => [
                    'type' => 'ARRAY',
                    'items' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'id' => ['type' => 'STRING'],
                            'type' => ['type' => 'STRING', 'enum' => ['solid', 'dashed', 'zigzag', 'dotted', 'wave']],
                            'orientation' => ['type' => 'STRING', 'enum' => ['horizontal', 'vertical']],
                            'size' => ['type' => 'NUMBER'],
                            'length' => ['type' => 'STRING'],
                            'color' => ['type' => 'STRING'],
                            'position' => [
                                'type' => 'OBJECT',
                                'properties' => [
                                    'x' => ['type' => 'NUMBER'],
                                    'y' => ['type' => 'NUMBER']
                                ],
                                'required' => ['x', 'y']
                            ]
                        ],
                        'required' => ['id', 'type', 'orientation', 'size', 'length', 'color', 'position']
                    ]
                ]
            ],
            'required' => ['title', 'content', 'stickies', 'arrows', 'dividers']
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
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    errorResponse('Gemini API request failed. Please check your API key, parameters, and network connection.', 500, 'GEMINI_API_ERROR');
}

$resData = json_decode($response, true);
$candidateJson = $resData['candidates'][0]['content']['parts'][0]['text'] ?? null;

if (!$candidateJson) {
    errorResponse('Gemini did not return any content.', 500, 'GEMINI_EMPTY_RESPONSE');
}

$formattedResult = json_decode(trim($candidateJson), true);
if (!$formattedResult) {
    // Fallback if parsing failed but we got raw text
    errorResponse('Failed to parse Gemini output as structured format JSON.', 500, 'PARSE_ERROR');
}

successResponse($formattedResult, 'Note formatted successfully by Gemini AI!');
