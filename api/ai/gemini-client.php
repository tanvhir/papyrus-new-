<?php

class GeminiClient {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000;
    const TIMEOUT_SECONDS = 60;
    const DEFAULT_MODEL = 'gemini-2.5-flash';
    
    public static function call($prompt, $apiKey, $model = null) {
        $retries = 0;
        $lastError = null;
        
        while ($retries < self::MAX_RETRIES) {
            try {
                $response = self::makeRequest($prompt, $apiKey, $model);
                
                if ($response['success']) {
                    return $response;
                }
                
                // Non-retryable errors
                if (self::isNonRetryableError($response)) {
                    error_log("Non-retryable error: " . $response['message']);
                    return $response;
                }
                
                // Retryable error
                $lastError = $response['message'];
                $retries++;
                
                if ($retries < self::MAX_RETRIES) {
                    $delay = self::RETRY_DELAY_MS * pow(2, $retries - 1); // Exponential backoff
                    usleep($delay * 1000);
                    error_log("Retry {$retries} after {$delay}ms delay: " . $lastError);
                }
                
            } catch (Exception $e) {
                $lastError = $e->getMessage();
                $retries++;
                
                if ($retries < self::MAX_RETRIES) {
                    $delay = self::RETRY_DELAY_MS * pow(2, $retries - 1);
                    usleep($delay * 1000);
                    error_log("Exception retry {$retries}: " . $lastError);
                }
            }
        }
        
        // All retries failed
        return [
            'success' => false,
            'message' => "Failed after " . self::MAX_RETRIES . " retries. Last error: " . $lastError,
            'retries_exhausted' => true
        ];
    }
    
    private static function makeRequest($prompt, $apiKey, $model) {
        $model = $model ?: self::DEFAULT_MODEL;
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . $model . ':generateContent?key=' . $apiKey;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'contents' => [['parts' => [['text' => $prompt]]]],
            'generationConfig' => [
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 8192,
                'responseMimeType' => 'application/json'
            ]
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, self::TIMEOUT_SECONDS);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            return [
                'success' => false,
                'message' => 'cURL error: ' . $error,
                'httpCode' => 0
            ];
        }
        
        if ($httpCode >= 500) {
            return [
                'success' => false,
                'message' => "Server error: HTTP {$httpCode}",
                'httpCode' => $httpCode
            ];
        }
        
        if ($httpCode === 429) {
            return [
                'success' => false,
                'message' => 'Rate limit exceeded',
                'httpCode' => $httpCode
            ];
        }
        
        if ($httpCode !== 200) {
            return [
                'success' => false,
                'message' => "HTTP {$httpCode}: " . $response,
                'httpCode' => $httpCode
            ];
        }
        
        $data = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return [
                'success' => false,
                'message' => 'JSON decode error: ' . json_last_error_msg(),
                'httpCode' => $httpCode
            ];
        }
        
        // Handle both text response and structured JSON response
        $text = null;
        if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            // Text response (traditional format)
            $text = $data['candidates'][0]['content']['parts'][0]['text'];
        } elseif (isset($data['candidates'][0]['content']['parts'][0])) {
            // Structured JSON response (when responseMimeType is application/json)
            $structuredData = $data['candidates'][0]['content']['parts'][0];
            if (is_array($structuredData)) {
                // The structured data is already the parsed JSON
                return [
                    'success' => true,
                    'data' => $data,
                    'structured' => $structuredData,
                    'text' => json_encode($structuredData),
                    'httpCode' => $httpCode
                ];
            }
        }
        
        if (!$text) {
            return [
                'success' => false,
                'message' => 'Invalid response format from API',
                'httpCode' => $httpCode,
                'raw_response' => $response
            ];
        }
        
        return [
            'success' => true,
            'data' => $data,
            'text' => $text,
            'httpCode' => $httpCode
        ];
    }
    
    private static function isNonRetryableError($response) {
        $nonRetryableCodes = [400, 401, 403, 404, 422];
        $message = strtolower($response['message'] ?? '');
        
        // Check HTTP code
        if (isset($response['httpCode']) && in_array($response['httpCode'], $nonRetryableCodes)) {
            return true;
        }
        
        // Check for specific error messages
        $nonRetryablePatterns = [
            'invalid api key',
            'authentication failed',
            'unauthorized',
            'forbidden',
            'not found',
            'invalid request',
            'quota exceeded'
        ];
        
        foreach ($nonRetryablePatterns as $pattern) {
            if (strpos($message, $pattern) !== false) {
                return true;
            }
        }
        
        return false;
    }
}
