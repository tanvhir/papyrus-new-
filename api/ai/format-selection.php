<?php
/**
 * AI Selection Formatter Endpoint using Google Gemini API
 * Compatible with PHP Shared Hosting & Node Dev Server emulation
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

$selectionText = $input['selectionText'] ?? '';
$selectionHTML = $input['selectionHTML'] ?? '';
$instruction = $input['instruction'] ?? '';
$centerY = floatval($input['centerY'] ?? 300);
$highlightStyle = $input['highlightStyle'] ?? 'balanced';

$highlightInstruction = '';
if ($highlightStyle === 'generous') {
    $highlightInstruction = "- Use highlights generously with `<mark data-color=\"#ffff00\" style=\"background-color: rgb(255, 255, 0); color: inherit;\">text</mark>` to highlight key terms, critical definitions, formulas, and important concepts to make the document extremely scan-friendly and visual. (Highlight colors allowed: Yellow: #ffff00, Blue: #bfdbfe, Deep green: #15803d, Pink: #f9a8d4, Orange: #fed7aa)";
} else if ($highlightStyle === 'none') {
    $highlightInstruction = "- Do NOT use any highlights (`<mark>`) at all. Keep everything un-highlighted.";
} else {
    $highlightInstruction = "- Use highlights sparingly with `<mark data-color=\"#ffff00\" style=\"background-color: rgb(255, 255, 0); color: inherit;\">text</mark>` ONLY for critical definitions, formulas, or key terms (maximum of 3 to 5 highlights per page). (Highlight colors allowed: Yellow: #ffff00, Blue: #bfdbfe, Deep green: #15803d, Pink: #f9a8d4, Orange: #fed7aa)";
}

if (empty($selectionText) && empty($selectionHTML)) {
    errorResponse('No text or HTML selected for formatting.', 400);
}

// 3. Construct precise prompt for selection-only styling
$prompt = "You are an expert academic content designer. Your task is to format a SPECIFIC portion of a note based on the user's instructions.

User's custom formatting instruction: \"$instruction\"

Selected text to format:
$selectionText

Selected HTML of selection (if any structure exists):
$selectionHTML

Current visual page line height (centerY): $centerY

Your response MUST be a single structured JSON object with the following fields:
1. \"formattedHTML\": The beautifully formatted HTML representing ONLY the replacement for the selected portion.
   - You should restructure the HTML inline.
   - Use headings (h1, h2, h3), paragraphs (p), list items (li), and inline styles like strong, em, u as needed.
   $highlightInstruction
   - If requested or suitable, use multi-column elements:
     `<div data-type=\"columns\"><div data-type=\"column\"><h3>Left Column</h3><p>...</p></div><div data-type=\"column\"><h3>Right Column</h3><p>...</p></div></div>`
   - CRITICAL VISUAL MNEMONIC / DOWNWARD ARROW RESTRUCTURING PATTERN:
     If the user wants a vertical mnemonic layout (like a letter/prefix/symbol on top, an arrow pointing down, and its meaning or full word directly below, side-by-side across multiple columns as in "E -> Ellipse, A -> Area, T -> Time"):
     You MUST generate a responsive multi-column element `<div data-type=\"columns\">`.
     Inside, each column (`<div data-type=\"column\">`) must have:
       1) A beautifully formatted top item (usually a single letter, prefix, or word, e.g., `<p style=\"text-align: center; font-size: 1.25rem; font-weight: bold; margin-bottom: 2px;\">E</p>`).
       2) An elegant, curved inline vertical SVG arrow pointing down (e.g., `<svg viewBox=\"0 0 24 32\" width=\"20\" height=\"28\" style=\"margin: 4px auto; display: block; overflow: visible;\"><path d=\"M12,2 Q14,14 12,26\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"2\" stroke-linecap=\"round\"/><path d=\"M8,21 L12,26 L16,21\" fill=\"none\" stroke=\"#3b82f6\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>`). Ensure you use correct SVG coordinates to render a clean downward curved path with an arrowhead! Use any vibrant color or note theme color.
       3) A beautifully formatted bottom item containing the meaning or full word centered (e.g., `<p style=\"text-align: center; font-size: 0.85rem; color: #4b5563;\">Ellipse</p>`).
     This creates a gorgeous, perfectly aligned vertical hierarchy exactly like high-end visual student notes!
   - Use LaTeX formulas via `<math-node data-latex=\"formula_here\"></math-node>` if there are mathematical equations or terms.
   - Embed decorative horizontal lines via: `<decorative-divider data-type=\"solid|dashed|dotted|zigzag|wave\" data-color=\"#15803d\" data-size=\"2\" data-length=\"100%\"></decorative-divider>`.
2. \"stickies\": An array of optional staggered callout sticky notes ONLY if requested by the user's prompt or highly necessary (limit to 1 or 2 max):
   - Format: { \"id\": \"string\", \"text\": \"string\", \"color\": \"#ffff99|#ffccff|#ccffff|#ffcc99\", \"position\": { \"x\": number, \"y\": number }, \"fontSize\": number }
   - Placement: Best placed on the right margin side of the page (x between 850 and 920). Set 'y' coordinate close to centerY (e.g. centerY, centerY + 220, etc.) to match where the selection is located.
3. \"arrows\": An array of connection arrows pointing from the main text body to the generated stickies:
   - Format: { \"id\": \"string\", \"start\": { \"x\": number, \"y\": number }, \"end\": { \"x\": number, \"y\": number }, \"mid\": { \"x\": number, \"y\": number }, \"color\": \"string\" }
   - Alignment: Arrow should start around x: 600, y: centerY. It should end at the sticky note's position (e.g. x: 840, y: centerY). The 'mid' coordinate must have a slight curved bend (e.g., mid.x = (start.x + end.x) / 2, mid.y = (start.y + end.y) / 2 - 30).
4. \"dividers\": An array of background dividers if relevant (usually empty `[]` unless explicitly requested).

Keep the content highly polished, academic, and extremely accurate to the user's instruction. Do not wrap the JSON output in markdown backticks.";

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
                'formattedHTML' => ['type' => 'STRING'],
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
            'required' => ['formattedHTML', 'stickies', 'arrows', 'dividers']
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

successResponse($formattedResult, 'Selection formatted successfully by Gemini AI!');
