<?php

class JsonParser {
    private $log = [];
    
    /**
     * Production-grade multi-stage JSON parser
     */
    public function parse($response, $mode = 'selection') {
        $this->log = [];
        $this->log('original_response', substr($response, 0, 2000));
        
        // Stage 1: Extract JSON using multiple strategies
        $extracted = $this->extractJson($response);
        $this->log('extracted_json', substr($extracted, 0, 2000));
        
        // Stage 2: Attempt direct parse
        $parsed = json_decode($extracted, true);
        if ($parsed !== null) {
            $this->log('parse_success', 'Direct parse succeeded');
            return $this->validateAndNormalize($parsed, $mode);
        }
        
        $this->log('parse_error', json_last_error_msg());
        
        // Stage 3: Repair and retry
        $repaired = $this->repairJson($extracted);
        $this->log('repaired_json', substr($repaired, 0, 2000));
        
        $parsed = json_decode($repaired, true);
        if ($parsed !== null) {
            $this->log('repair_success', 'Repair succeeded');
            return $this->validateAndNormalize($parsed, $mode);
        }
        
        $this->log('repair_error', json_last_error_msg());
        
        // Stage 4: Return failure with logs
        return [
            'success' => false,
            'error' => 'Failed to parse JSON after extraction and repair',
            'logs' => $this->log,
            'extracted' => $extracted,
            'repaired' => $repaired
        ];
    }
    
    /**
     * Attempt automatic repair using AI
     */
    public function attemptAutoRepair($response, $apiKey, $model) {
        $this->log('auto_repair_attempt', 'Starting AI-based repair');
        
        $repairPrompt = "Convert this text into valid JSON. Do not change the HTML content, only fix the JSON structure:\n\n" . $response;
        
        $result = GeminiClient::call($repairPrompt, $apiKey, $model);
        
        if ($result['success']) {
            $repaired = $this->extractJson($result['text']);
            $this->log('auto_repaired', substr($repaired, 0, 2000));
            
            $parsed = json_decode($repaired, true);
            if ($parsed !== null) {
                $this->log('auto_repair_success', 'AI repair succeeded');
                return $parsed;
            }
        }
        
        $this->log('auto_repair_failed', $result['message'] ?? 'Unknown error');
        return null;
    }
    
    /**
     * Multi-strategy JSON extraction
     */
    private function extractJson($text) {
        $text = trim($text);
        
        // Strategy 1: XML delimiters
        if (preg_match('/<output>(.*?)<\/output>/s', $text, $matches)) {
            return trim($matches[1]);
        }
        
        // Strategy 2: Markdown code blocks
        if (preg_match('/```(?:json)?\s*(.*?)\s*```/s', $text, $matches)) {
            return trim($matches[1]);
        }
        
        // Strategy 3: First { to last }
        $firstBrace = strpos($text, '{');
        $lastBrace = strrpos($text, '}');
        
        if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
            $candidate = substr($text, $firstBrace, $lastBrace - $firstBrace + 1);
            $parsed = json_decode($candidate, true);
            if ($parsed !== null) {
                return $candidate;
            }
        }
        
        // Strategy 4: Find any valid JSON object
        preg_match_all('/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/s', $text, $matches);
        foreach ($matches[0] as $candidate) {
            $parsed = json_decode($candidate, true);
            if ($parsed !== null) {
                return $candidate;
            }
        }
        
        // Strategy 5: Return original
        return $text;
    }
    
    /**
     * Repair common JSON issues
     */
    private function repairJson($json) {
        $json = trim($json);
        
        // Remove markdown code fences
        $json = preg_replace('/^```(?:json)?\s*/', '', $json);
        $json = preg_replace('/\s*```$/', '', $json);
        
        // Strip text before first {
        $firstBrace = strpos($json, '{');
        if ($firstBrace !== false && $firstBrace > 0) {
            $json = substr($json, $firstBrace);
        }
        
        // Strip text after last }
        $lastBrace = strrpos($json, '}');
        if ($lastBrace !== false) {
            $json = substr($json, 0, $lastBrace + 1);
        }
        
        // Fix trailing commas
        $json = preg_replace('/,\s*([}\]])/', '$1', $json);
        
        // Fix unquoted keys (basic)
        $json = preg_replace('/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/', '$1"$2":', $json);
        
        // Fix single quotes to double quotes
        $json = str_replace("'", '"', $json);
        
        return trim($json);
    }
    
    /**
     * Validate schema and add defaults
     */
    private function validateAndNormalize($parsed, $mode) {
        if ($mode === 'selection') {
            if (!isset($parsed['formattedHTML'])) {
                $parsed['formattedHTML'] = '';
            }
            if (!isset($parsed['stickies'])) {
                $parsed['stickies'] = [];
            }
            if (!isset($parsed['arrows'])) {
                $parsed['arrows'] = [];
            }
            if (!isset($parsed['dividers'])) {
                $parsed['dividers'] = [];
            }
        } else {
            if (!isset($parsed['title'])) {
                $parsed['title'] = '';
            }
            if (!isset($parsed['content'])) {
                $parsed['content'] = '';
            }
            if (!isset($parsed['stickies'])) {
                $parsed['stickies'] = [];
            }
            if (!isset($parsed['arrows'])) {
                $parsed['arrows'] = [];
            }
            if (!isset($parsed['dividers'])) {
                $parsed['dividers'] = [];
            }
        }
        
        return $parsed;
    }
    
    /**
     * Get logs
     */
    public function getLogs() {
        return $this->log;
    }
    
    /**
     * Log helper
     */
    private function log($key, $value) {
        $this->log[$key] = $value;
        error_log("JSON Parser [{$key}]: " . (is_string($value) ? substr($value, 0, 500) : json_encode($value)));
    }
}
