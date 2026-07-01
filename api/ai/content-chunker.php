<?php

class ContentChunker {
    const MAX_TOKENS_PER_REQUEST = 8000;
    const OVERLAP_TOKENS = 500;
    
    public static function chunkContent($content, $html) {
        // Estimate tokens (roughly 4 chars per token for English text)
        $estimatedTokens = strlen($content) / 4;
        
        // If content is small enough, return as single chunk
        if ($estimatedTokens <= self::MAX_TOKENS_PER_REQUEST) {
            return [
                [
                    'text' => $content,
                    'html' => $html,
                    'index' => 0,
                    'total' => 1
                ]
            ];
        }
        
        // Split by block-level elements (paragraphs, headings, lists)
        $blocks = preg_split(
            '/(<p[^>]*>.*?<\/p>|<h[1-6][^>]*>.*?<\/h[1-6]>|<ul[^>]*>.*?<\/ul>|<ol[^>]*>.*?<\/ol>|<blockquote[^>]*>.*?<\/blockquote>|<div[^>]*>.*?<\/div>)/s',
            $html,
            -1,
            PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY
        );
        
        $chunks = [];
        $currentChunkText = '';
        $currentChunkHtml = '';
        $currentTokens = 0;
        $chunkIndex = 0;
        
        foreach ($blocks as $block) {
            // Strip tags to get text content for token estimation
            $blockText = strip_tags($block);
            $blockTokens = strlen($blockText) / 4;
            
            // If adding this block would exceed limit, save current chunk
            if ($currentTokens + $blockTokens > self::MAX_TOKENS_PER_REQUEST && !empty($currentChunkHtml)) {
                $chunks[] = [
                    'text' => $currentChunkText,
                    'html' => $currentChunkHtml,
                    'index' => $chunkIndex,
                    'total' => 0 // Will be updated at the end
                ];
                $chunkIndex++;
                $currentChunkText = $blockText;
                $currentChunkHtml = $block;
                $currentTokens = $blockTokens;
            } else {
                $currentChunkText .= $blockText;
                $currentChunkHtml .= $block;
                $currentTokens += $blockTokens;
            }
        }
        
        // Don't forget the last chunk
        if (!empty($currentChunkHtml)) {
            $chunks[] = [
                'text' => $currentChunkText,
                'html' => $currentChunkHtml,
                'index' => $chunkIndex,
                'total' => 0
            ];
        }
        
        // Update total count for each chunk
        $totalChunks = count($chunks);
        foreach ($chunks as &$chunk) {
            $chunk['total'] = $totalChunks;
        }
        
        return $chunks;
    }
    
    public static function mergeFormattedChunks($chunks) {
        // Simply concatenate all chunks
        $merged = '';
        foreach ($chunks as $chunk) {
            $merged .= $chunk;
        }
        return $merged;
    }
    
    public static function getProgressContext($chunkIndex, $totalChunks) {
        $context = "\nPROGRESS: Processing chunk " . ($chunkIndex + 1) . " of {$totalChunks}. ";
        
        if ($chunkIndex > 0) {
            $context .= "Maintain consistency with previous chunks. ";
        }
        
        if ($chunkIndex < $totalChunks - 1) {
            $context .= "This is not the final chunk - ensure content flows naturally to the next section. ";
        } else {
            $context .= "This is the final chunk - provide a complete ending. ";
        }
        
        return $context;
    }
}
