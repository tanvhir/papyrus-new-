<?php
/**
 * AI Note Formatter Endpoint using Google Gemini API
 * Compatible with PHP Shared Hosting & Node Dev Server emulation
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/tool-registry.php';
require_once __DIR__ . '/prompt-builder.php';
require_once __DIR__ . '/gemini-client.php';
require_once __DIR__ . '/content-chunker.php';

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
$disableAIImages = ($input['disableAIImages'] ?? false) === true;
$disableAIColumns = ($input['disableAIColumns'] ?? false) === true;
$allowNoteEnhancement = ($input['allowNoteEnhancement'] ?? false) === true;
$enableCleaning = ($input['enableCleaning'] ?? false) === true;

// Clean content HTML
$cleanContent = strip_tags($content, '<h1><h2><h3><h4><h5><h6><p><br><strong><em><u><ul><ol><li><span><mark><div><math-node><decorative-divider>');

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
$noteContent = [
    'title' => $title,
    'content' => $cleanContent
];

// Check if content needs chunking (large notes)
$chunks = ContentChunker::chunkContent($cleanContent, $cleanContent);
$isChunked = count($chunks) > 1;

if ($isChunked) {
    // Process chunks progressively
    $formattedChunks = [];
    $totalChunks = count($chunks);
    
    for ($i = 0; $i < $totalChunks; $i++) {
        $chunk = $chunks[$i];
        
        // Build content for this chunk
        $chunkContent = [
            'title' => $title . ($totalChunks > 1 ? " (Part " . ($i + 1) . ")" : ""),
            'content' => $chunk['html']
        ];
        
        // Use PromptBuilder
        $promptBuilder = new PromptBuilder($settings, 'full-note', $chunkContent, $highlightStyle);
        $prompt = $promptBuilder->build();
        
        // Add progress context
        $prompt .= ContentChunker::getProgressContext($i, $totalChunks);
        
        // Add JSON schema instructions
        $prompt .= "\n\nYour response MUST follow this JSON schema:\n";
        $prompt .= "{\n";
        $prompt .= "  \"title\": \"string (required)\",\n";
        $prompt .= "  \"content\": \"string (required)\",\n";
        $prompt .= "  \"stickies\": \"array of sticky note objects (optional)\",\n";
        $prompt .= "  \"arrows\": \"array of arrow objects (optional)\",\n";
        $prompt .= "  \"dividers\": \"array of divider objects (optional)\"\n";
        $prompt .= "}\n\n";
        $prompt .= "Sticky note format: { \"id\": \"string\", \"text\": \"string\", \"color\": \"#ffff99|#ffccff|#ccffff|#ffcc99\", \"position\": { \"x\": number, \"y\": number }, \"fontSize\": number }\n";
        $prompt .= "Arrow format: { \"id\": \"string\", \"start\": { \"x\": number, \"y\": number }, \"end\": { \"x\": number, \"y\": number }, \"mid\": { \"x\": number, \"y\": number }, \"color\": \"string\" }\n";
        $prompt .= "Divider format: { \"id\": \"string\", \"type\": \"solid|dashed|dotted|zigzag|wave\", \"orientation\": \"horizontal|vertical\", \"size\": number, \"length\": string, \"color\": string, \"position\": { \"x\": number, \"y\": number } }\n";
        $prompt .= "\nPlacement: Stickies on right margin (x: 850-920), stagger y by 250px starting from 150. Arrows from text (x: 600) to sticky.\n";
        $prompt .= "Wrap your JSON response in <output> tags like this: <output>{\"title\": \"...\", \"content\": \"...\", ...}</output>.\n";
        
        // Call Gemini API
        $result = GeminiClient::call($prompt, $apiKey, $modelName);
        
        if (!$result['success']) {
            error_log("Chunk {$i} formatting failed: " . $result['message']);
            // Try fallback
            $fallbackPrompt = $promptBuilder->buildSimplifiedPrompt('basic');
            $fallbackResult = GeminiClient::call($fallbackPrompt, $apiKey, $modelName);
            
            if ($fallbackResult['success']) {
                $result = $fallbackResult;
            } else {
                errorResponse('AI formatting failed for chunk ' . ($i + 1) . ': ' . $result['message'], 500, 'GEMINI_API_ERROR');
            }
        }
        
        // Parse response with smart JSON extraction
        $candidateJson = $result['text'] ?? null;
        if (!$candidateJson) {
            errorResponse('Gemini did not return content for chunk ' . ($i + 1), 500, 'GEMINI_EMPTY_RESPONSE');
        }
        
        // Smart JSON extraction function with delimiter-based separation
        function extractJsonChunked($text) {
            $text = trim($text);
            
            // Strategy 0: Delimiter-based extraction (PRIMARY)
            if (strpos($text, '===JSON_OUTPUT===') !== false) {
                $parts = explode('===JSON_OUTPUT===', $text, 2);
                if (count($parts) === 2) {
                    $jsonCandidate = trim($parts[1]);
                    $parsed = json_decode($jsonCandidate, true);
                    if ($parsed !== null) {
                        return $jsonCandidate;
                    }
                }
            }
            
            // Strategy 1: Try XML delimiters
            if (preg_match('/<output>(.*?)<\/output>/s', $text, $matches)) {
                $jsonCandidate = trim($matches[1]);
                $parsed = json_decode($jsonCandidate, true);
                if ($parsed !== null) {
                    return $jsonCandidate;
                }
            }
            
            // Strategy 2: Try markdown code blocks
            if (preg_match('/```(?:json)?\s*(.*?)\s*```/s', $text, $matches)) {
                $jsonCandidate = trim($matches[1]);
                $parsed = json_decode($jsonCandidate, true);
                if ($parsed !== null) {
                    return $jsonCandidate;
                }
            }
            
            // Strategy 3: Extract from field assignments (Gemma-4 reasoning format)
            $lines = explode("\n", $text);
            $jsonFields = [];
            $inJsonSection = false;
            
            foreach ($lines as $line) {
                $line = trim($line);
                
                if (preg_match('/(?:\*?\s+)?["\']?([a-zA-Z_]+)["\']?\s*:\s*(.+)/', $line, $matches)) {
                    $field = $matches[1];
                    $value = $matches[2];
                    $value = trim($value, ' "\'*');
                    
                    if (in_array($field, ['formattedHTML', 'stickies', 'arrows', 'dividers', 'title', 'content'])) {
                        $jsonFields[$field] = $value;
                        $inJsonSection = true;
                    }
                }
            }
            
            if (!empty($jsonFields) && $inJsonSection) {
                $jsonString = json_encode($jsonFields, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                $parsed = json_decode($jsonString, true);
                if ($parsed !== null) {
                    return $jsonString;
                }
            }
            
            // Strategy 4: Find JSON between first { and last }
            $firstBrace = strpos($text, '{');
            $lastBrace = strrpos($text, '}');
            
            if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
                $jsonCandidate = substr($text, $firstBrace, $lastBrace - $firstBrace + 1);
                $parsed = json_decode($jsonCandidate, true);
                if ($parsed !== null) {
                    return $jsonCandidate;
                }
            }
            
            // Strategy 5: Try to find any valid JSON object in the text
            preg_match_all('/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/s', $text, $matches);
            foreach ($matches[0] as $candidate) {
                $parsed = json_decode($candidate, true);
                if ($parsed !== null) {
                    return $candidate;
                }
            }
            
            // Strategy 6: Extract HTML from planned structure and construct fallback JSON
            $htmlContent = extractHtmlFromReasoning($text);
            if ($htmlContent) {
                $fallbackJson = json_encode(['content' => $htmlContent], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                $parsed = json_decode($fallbackJson, true);
                if ($parsed !== null) {
                    return $fallbackJson;
                }
            }
            
            // Strategy 7: Return original if nothing worked
            return $text;
        }
        
        // Helper function to extract HTML from reasoning content
        function extractHtmlFromReasoning($text) {
            $lines = explode("\n", $text);
            $htmlLines = [];
            $inHtmlSection = false;
            
            foreach ($lines as $line) {
                $line = trim($line);
                
                if (preg_match('/<[a-z][a-z0-9]*[^>]*>/', $line)) {
                    $inHtmlSection = true;
                    $htmlLines[] = $line;
                } elseif ($inHtmlSection && !empty($line)) {
                    $htmlLines[] = $line;
                }
            }
            
            if (!empty($htmlLines)) {
                return implode("\n", $htmlLines);
            }
            
            return null;
        }
        
        $candidateJson = extractJsonChunked($candidateJson);
        
        $formattedResult = json_decode($candidateJson, true);
        if (!$formattedResult) {
            error_log("Failed to parse JSON for chunk {$i}. Raw response: " . substr($candidateJson, 0, 1000));
            $debugInfo = [
                'rawResponse' => $result['text'],
                'extractedJson' => $candidateJson,
                'model' => $modelName,
                'timestamp' => date('Y-m-d H:i:s'),
                'jsonError' => json_last_error_msg(),
                'chunkIndex' => $i + 1,
                'totalChunks' => $totalChunks
            ];
            errorResponse('Failed to parse Gemini output for chunk ' . ($i + 1), 500, 'PARSE_ERROR', $debugInfo);
        }
        
        $formattedChunks[] = $formattedResult['content'] ?? '';
        
        // Small delay between chunks
        if ($i < $totalChunks - 1) {
            usleep(500000); // 0.5 second
        }
    }
    
    // Merge chunks
    $finalContent = ContentChunker::mergeFormattedChunks($formattedChunks);
    
    // Return merged result
    $finalResult = [
        'title' => $title,
        'content' => $finalContent,
        'stickies' => [],
        'arrows' => [],
        'dividers' => [],
        'isChunked' => true,
        'totalChunks' => $totalChunks
    ];
    
    successResponse($finalResult, 'Note formatted successfully by Gemini AI (processed in ' . $totalChunks . ' chunks)!');
    
} else {
    // Single chunk processing
    $promptBuilder = new PromptBuilder($settings, 'full-note', $noteContent, $highlightStyle);
    $prompt = $promptBuilder->build();
    
    // Add JSON schema instructions
    $prompt .= "\n\nYour response MUST follow this JSON schema:\n";
    $prompt .= "{\n";
    $prompt .= "  \"title\": \"string (required)\",\n";
    $prompt .= "  \"content\": \"string (required)\",\n";
    $prompt .= "  \"stickies\": \"array of sticky note objects (optional)\",\n";
    $prompt .= "  \"arrows\": \"array of arrow objects (optional)\",\n";
    $prompt .= "  \"dividers\": \"array of divider objects (optional)\"\n";
    $prompt .= "}\n\n";
    $prompt .= "Sticky note format: { \"id\": \"string\", \"text\": \"string\", \"color\": \"#ffff99|#ffccff|#ccffff|#ffcc99\", \"position\": { \"x\": number, \"y\": number }, \"fontSize\": number }\n";
    $prompt .= "Arrow format: { \"id\": \"string\", \"start\": { \"x\": number, \"y\": number }, \"end\": { \"x\": number, \"y\": number }, \"mid\": { \"x\": number, \"y\": number }, \"color\": \"string\" }\n";
    $prompt .= "Divider format: { \"id\": \"string\", \"type\": \"solid|dashed|dotted|zigzag|wave\", \"orientation\": \"horizontal|vertical\", \"size\": number, \"length\": string, \"color\": string, \"position\": { \"x\": number, \"y\": number } }\n";
    $prompt .= "\nPlacement: Stickies on right margin (x: 850-920), stagger y by 250px starting from 150. Arrows from text (x: 600) to sticky.\n";
    $prompt .= "Wrap your JSON response in <output> tags like this: <output>{\"title\": \"...\", \"content\": \"...\", ...}</output>.\n";
    
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
    function extractJsonSingle($text) {
        $text = trim($text);
        
        // Strategy 0: Delimiter-based extraction (PRIMARY)
        if (strpos($text, '===JSON_OUTPUT===') !== false) {
            $parts = explode('===JSON_OUTPUT===', $text, 2);
            if (count($parts) === 2) {
                $jsonCandidate = trim($parts[1]);
                $parsed = json_decode($jsonCandidate, true);
                if ($parsed !== null) {
                    return $jsonCandidate;
                }
            }
        }
        
        // Strategy 1: Try XML delimiters
        if (preg_match('/<output>(.*?)<\/output>/s', $text, $matches)) {
            $jsonCandidate = trim($matches[1]);
            $parsed = json_decode($jsonCandidate, true);
            if ($parsed !== null) {
                return $jsonCandidate;
            }
        }
        
        // Strategy 2: Try markdown code blocks
        if (preg_match('/```(?:json)?\s*(.*?)\s*```/s', $text, $matches)) {
            $jsonCandidate = trim($matches[1]);
            $parsed = json_decode($jsonCandidate, true);
            if ($parsed !== null) {
                return $jsonCandidate;
            }
        }
        
        // Strategy 3: Extract from field assignments (Gemma-4 reasoning format)
        $lines = explode("\n", $text);
        $jsonFields = [];
        $inJsonSection = false;
        
        foreach ($lines as $line) {
            $line = trim($line);
            
            if (preg_match('/(?:\*?\s+)?["\']?([a-zA-Z_]+)["\']?\s*:\s*(.+)/', $line, $matches)) {
                $field = $matches[1];
                $value = $matches[2];
                $value = trim($value, ' "\'*');
                
                if (in_array($field, ['formattedHTML', 'stickies', 'arrows', 'dividers', 'title', 'content'])) {
                    $jsonFields[$field] = $value;
                    $inJsonSection = true;
                }
            }
        }
        
        if (!empty($jsonFields) && $inJsonSection) {
            $jsonString = json_encode($jsonFields, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $parsed = json_decode($jsonString, true);
            if ($parsed !== null) {
                return $jsonString;
            }
        }
        
        // Strategy 4: Find JSON between first { and last }
        $firstBrace = strpos($text, '{');
        $lastBrace = strrpos($text, '}');
        
        if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
            $jsonCandidate = substr($text, $firstBrace, $lastBrace - $firstBrace + 1);
            $parsed = json_decode($jsonCandidate, true);
            if ($parsed !== null) {
                return $jsonCandidate;
            }
        }
        
        // Strategy 5: Try to find any valid JSON object in the text
        preg_match_all('/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/s', $text, $matches);
        foreach ($matches[0] as $candidate) {
            $parsed = json_decode($candidate, true);
            if ($parsed !== null) {
                return $candidate;
            }
        }
        
        // Strategy 6: Extract HTML from planned structure and construct fallback JSON
        $htmlContent = extractHtmlFromReasoning($text);
        if ($htmlContent) {
            $fallbackJson = json_encode(['content' => $htmlContent], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $parsed = json_decode($fallbackJson, true);
            if ($parsed !== null) {
                return $fallbackJson;
            }
        }
        
        // Strategy 7: Return original if nothing worked
        return $text;
    }
    
    // Helper function to extract HTML from reasoning content
    function extractHtmlFromReasoning($text) {
        $lines = explode("\n", $text);
        $htmlLines = [];
        $inHtmlSection = false;
        
        foreach ($lines as $line) {
            $line = trim($line);
            
            if (preg_match('/<[a-z][a-z0-9]*[^>]*>/', $line)) {
                $inHtmlSection = true;
                $htmlLines[] = $line;
            } elseif ($inHtmlSection && !empty($line)) {
                $htmlLines[] = $line;
            }
        }
        
        if (!empty($htmlLines)) {
            return implode("\n", $htmlLines);
        }
        
        return null;
    }
    
    $candidateJson = extractJsonSingle($candidateJson);
    
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
    
    successResponse($formattedResult, 'Note formatted successfully by Gemini AI!');
}
