export interface ContentChunk {
  text: string;
  html: string;
  index: number;
  total: number;
}

export class ContentChunker {
  private static readonly MAX_TOKENS_PER_REQUEST = 4000;
  private static readonly OVERLAP_TOKENS = 500;

  /**
   * Split HTML content into chunks based on block-level elements
   */
  public static chunkContent(html: string): ContentChunk[] {
    // Estimate tokens (roughly 4 chars per token for English text)
    const estimatedTokens = html.length / 4;
    
    // If content is small enough, return as single chunk
    if (estimatedTokens <= this.MAX_TOKENS_PER_REQUEST) {
      return [
        {
          text: html,
          html: html,
          index: 0,
          total: 1
        }
      ];
    }
    
    // Split by block-level elements (paragraphs, headings, lists)
    const blockPattern = /(<p[^>]*>.*?<\/p>|<h[1-6][^>]*>.*?<\/h[1-6]>|<ul[^>]*>.*?<\/ul>|<ol[^>]*>.*?<\/ol>|<blockquote[^>]*>.*?<\/blockquote>|<div[^>]*>.*?<\/div>)/gs;
    const blocks = html.split(blockPattern).filter(block => block.trim().length > 0);
    
    const chunks: ContentChunk[] = [];
    let currentChunkText = '';
    let currentChunkHtml = '';
    let currentTokens = 0;
    let chunkIndex = 0;
    
    for (const block of blocks) {
      // Strip tags to get text content for token estimation
      const blockText = this.stripTags(block);
      const blockTokens = blockText.length / 4;
      
      // If adding this block would exceed limit, save current chunk
      if (currentTokens + blockTokens > this.MAX_TOKENS_PER_REQUEST && currentChunkHtml.length > 0) {
        chunks.push({
          text: currentChunkText,
          html: currentChunkHtml,
          index: chunkIndex,
          total: 0 // Will be updated at the end
        });
        chunkIndex++;
        currentChunkText = blockText;
        currentChunkHtml = block;
        currentTokens = blockTokens;
      } else {
        currentChunkText += blockText;
        currentChunkHtml += block;
        currentTokens += blockTokens;
      }
    }
    
    // Don't forget the last chunk
    if (currentChunkHtml.length > 0) {
      chunks.push({
        text: currentChunkText,
        html: currentChunkHtml,
        index: chunkIndex,
        total: 0
      });
    }
    
    // Update total count for each chunk
    const totalChunks = chunks.length;
    chunks.forEach(chunk => {
      chunk.total = totalChunks;
    });
    
    return chunks;
  }
  
  /**
   * Merge formatted chunks back together
   */
  public static mergeFormattedChunks(chunks: string[]): string {
    return chunks.join('');
  }
  
  /**
   * Get progress context for AI prompt
   */
  public static getProgressContext(chunkIndex: number, totalChunks: number): string {
    let context = `\nPROGRESS: Processing chunk ${chunkIndex + 1} of ${totalChunks}. `;
    
    if (chunkIndex > 0) {
      context += 'Maintain consistency with previous chunks. ';
    }
    
    if (chunkIndex < totalChunks - 1) {
      context += 'This is not the final chunk - ensure content flows naturally to the next section. ';
    } else {
      context += 'This is the final chunk - provide a complete ending. ';
    }
    
    return context;
  }
  
  /**
   * Strip HTML tags to get plain text
   */
  private static stripTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
}
