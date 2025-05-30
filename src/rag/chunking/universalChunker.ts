import { ChunkingStrategy, Document, DocumentChunk, ChunkingConfig } from '../types/ragTypes.js';
import { RAGConfigService } from '../config/ragConfig.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Universal chunking strategy that works with any documentation format
 * Handles code blocks, preserves context, and provides adaptive chunking
 */
export class UniversalChunkingStrategy implements ChunkingStrategy {
  private config: ChunkingConfig;

  // Universal patterns for code blocks across different formats
  private readonly CODE_BLOCK_PATTERNS = [
    // Markdown: ```code``` or ```language
    { start: /^```[\w]*\s*$/gm, end: /^```\s*$/gm, format: 'markdown' },
    
    // reStructuredText: .. code-block:: language
    { start: /^\.\. code-block::\s*\w*\s*$/gm, end: /^(?=\S)/gm, format: 'rst' },
    
    // AsciiDoc: [source,language] ---- code ----
    { start: /^\[source[,\w]*\]\s*\n[-]{4,}\s*$/gm, end: /^[-]{4,}\s*$/gm, format: 'asciidoc' },
    
    // HTML: <pre><code> or <code>
    { start: /<pre[^>]*><code[^>]*>/gi, end: /<\/code><\/pre>/gi, format: 'html' },
    { start: /<code[^>]*>/gi, end: /<\/code>/gi, format: 'html-inline' },
    
    // Wiki markup: {{{code}}} or <source lang="x">
    { start: /^\{\{\{[\w]*\s*$/gm, end: /^\}\}\}\s*$/gm, format: 'wiki' },
    { start: /<source[^>]*>/gi, end: /<\/source>/gi, format: 'wiki-source' },
    
    // Sphinx/Docutils: :: code (indented)
    { start: /^.*::\s*$/gm, end: /^(?=\S)/gm, format: 'sphinx' },
    
    // GitBook: {% code %} blocks
    { start: /^{%\s*code[^%]*%}\s*$/gm, end: /^{%\s*endcode\s*%}\s*$/gm, format: 'gitbook' }
  ];

  // Patterns for section headers across formats
  private readonly HEADER_PATTERNS = [
    // Markdown: # ## ### #### ##### ######
    /^(#{1,6})\s+(.+)$/gm,
    
    // reStructuredText: underlines
    /^(.+)\n[=\-~`!@#$%^&*()_+\[\]{}\\|;:'",./<>?]{3,}\s*$/gm,
    
    // AsciiDoc: = == === ====
    /^(={1,6})\s+(.+)$/gm,
    
    // Wiki: == Header ==
    /^(={2,6})\s*(.+?)\s*\1\s*$/gm,
    
    // HTML: <h1> to <h6>
    /<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi
  ];

  constructor() {
    this.config = RAGConfigService.getInstance().config.chunking;
  }

  async chunkDocuments(documents: Document[]): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = [];

    for (const doc of documents) {
      const docChunks = await this.chunkDocument(doc);
      chunks.push(...docChunks);
    }

    return chunks;
  }

  private async chunkDocument(document: Document): Promise<DocumentChunk[]> {
    const { content, metadata } = document;
    
    // Step 1: Extract frontmatter/metadata
    const { frontmatter, mainContent } = this.extractMetadata(content);
    
    // Step 2: Identify and preserve code blocks
    const { textWithPlaceholders, codeBlocks } = this.extractCodeBlocks(mainContent);
    
    // Step 3: Split by logical sections (headers)
    const sections = this.splitBySections(textWithPlaceholders);
    
    // Step 4: Create chunks with smart sizing
    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;

    for (const section of sections) {
      const sectionChunks = this.createAdaptiveChunks(section, codeBlocks);
      
      for (const chunkContent of sectionChunks) {
        if (chunkContent.trim().length < 100) continue; // Skip tiny chunks
        
        const chunk: DocumentChunk = {
          id: uuidv4(),
          content: chunkContent.trim(),
          metadata: {
            sourceUrl: metadata.url,
            title: frontmatter.title || metadata.title,
            section: this.extractSectionTitle(chunkContent),
            filePath: metadata.filePath,
            chunkIndex: chunkIndex++,
            tokenCount: this.estimateTokenCount(chunkContent),
            createdAt: new Date(),
          },
        };
        
        chunks.push(chunk);
      }
    }

    return chunks;
  }

  /**
   * Extract metadata/frontmatter from various formats
   */
  private extractMetadata(content: string): { frontmatter: any; mainContent: string } {
    // YAML frontmatter (---..---)
    let yamlMatch = content.match(/^---\n(.*?)\n---\n(.*)/s);
    if (yamlMatch) {
      const frontmatter = this.parseSimpleYaml(yamlMatch[1]);
      return { frontmatter, mainContent: yamlMatch[2] };
    }

    // TOML frontmatter (+++...+++)
    let tomlMatch = content.match(/^\+\+\+\n(.*?)\n\+\+\+\n(.*)/s);
    if (tomlMatch) {
      const frontmatter = this.parseSimpleToml(tomlMatch[1]);
      return { frontmatter, mainContent: tomlMatch[2] };
    }

    // JSON frontmatter ({...})
    let jsonMatch = content.match(/^{\s*\n(.*?)\n}\s*\n(.*)/s);
    if (jsonMatch) {
      try {
        const frontmatter = JSON.parse(`{${jsonMatch[1]}}`);
        return { frontmatter, mainContent: jsonMatch[2] };
      } catch {
        // Fall through to no frontmatter
      }
    }

    return { frontmatter: {}, mainContent: content };
  }

  /**
   * Extract and preserve code blocks with placeholders
   */
  private extractCodeBlocks(content: string): { textWithPlaceholders: string; codeBlocks: Map<string, string> } {
    const codeBlocks = new Map<string, string>();
    let textWithPlaceholders = content;
    let blockIndex = 0;

    for (const pattern of this.CODE_BLOCK_PATTERNS) {
      const matches = this.findCodeBlocks(textWithPlaceholders, pattern);
      
      for (const match of matches) {
        const placeholder = `__CODE_BLOCK_${blockIndex}__`;
        codeBlocks.set(placeholder, match.content);
        textWithPlaceholders = textWithPlaceholders.replace(match.content, placeholder);
        blockIndex++;
      }
    }

    return { textWithPlaceholders, codeBlocks };
  }

  /**
   * Find code blocks using pattern matching
   */
  private findCodeBlocks(text: string, pattern: { start: RegExp; end: RegExp; format: string }): Array<{ content: string; format: string }> {
    const blocks: Array<{ content: string; format: string }> = [];
    const lines = text.split('\n');
    let inCodeBlock = false;
    let blockStart = -1;
    let blockEnd = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!inCodeBlock && pattern.start.test(line)) {
        inCodeBlock = true;
        blockStart = i;
        pattern.start.lastIndex = 0; // Reset regex
      } else if (inCodeBlock && pattern.end.test(line)) {
        blockEnd = i;
        inCodeBlock = false;
        
        const blockContent = lines.slice(blockStart, blockEnd + 1).join('\n');
        blocks.push({ content: blockContent, format: pattern.format });
        
        pattern.end.lastIndex = 0; // Reset regex
      }
    }

    return blocks;
  }

  /**
   * Split content by logical sections (headers)
   */
  private splitBySections(content: string): string[] {
    const sections: string[] = [];
    const lines = content.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      const isHeader = this.HEADER_PATTERNS.some(pattern => {
        pattern.lastIndex = 0; // Reset regex
        return pattern.test(line);
      });
      
      if (isHeader && currentSection.trim().length > 0) {
        sections.push(currentSection.trim());
        currentSection = line + '\n';
      } else {
        currentSection += line + '\n';
      }
    }
    
    // Add final section
    if (currentSection.trim().length > 0) {
      sections.push(currentSection.trim());
    }
    
    return sections.filter(s => s.length > 0);
  }

  /**
   * Create adaptive chunks with smart sizing
   */
  private createAdaptiveChunks(section: string, codeBlocks: Map<string, string>): string[] {
    const chunks: string[] = [];
    const { chunkSize, chunkOverlap } = this.config;
    
    // Enhanced chunk size for code-heavy content
    const hasCode = Array.from(codeBlocks.keys()).some(placeholder => section.includes(placeholder));
    const targetSize = hasCode ? chunkSize * 2.5 : chunkSize; // Increase for code
    
    // Restore code blocks
    let processedSection = section;
    for (const [placeholder, codeContent] of codeBlocks.entries()) {
      processedSection = processedSection.replace(placeholder, codeContent);
    }
    
    // If section fits in one chunk, return as is
    if (this.estimateTokenCount(processedSection) <= targetSize) {
      return [processedSection];
    }

    // Split by paragraphs (double newlines) to preserve context
    const paragraphs = processedSection.split(/\n\s*\n/);
    let currentChunk = '';
    let currentTokens = 0;

    for (const paragraph of paragraphs) {
      const paragraphTokens = this.estimateTokenCount(paragraph);
      
      // Special handling for large code blocks
      if (paragraphTokens > targetSize) {
        // Save current chunk if exists
        if (currentChunk.trim().length > 0) {
          chunks.push(currentChunk.trim());
        }
        
        // Large code block gets its own chunk(s)
        chunks.push(...this.splitLargeCodeBlock(paragraph, targetSize, chunkOverlap));
        currentChunk = '';
        currentTokens = 0;
        continue;
      }
      
      // Check if adding paragraph exceeds limit
      if (currentTokens + paragraphTokens > targetSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        
        // Start new chunk with overlap
        const overlapText = this.getOverlapText(currentChunk, chunkOverlap);
        currentChunk = overlapText + '\n\n' + paragraph;
        currentTokens = this.estimateTokenCount(currentChunk);
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        currentTokens += paragraphTokens;
      }
    }

    // Add final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Split large code blocks while preserving structure
   */
  private splitLargeCodeBlock(codeBlock: string, maxTokens: number, overlap: number): string[] {
    const lines = codeBlock.split('\n');
    const chunks: string[] = [];
    let currentChunk = '';
    let currentTokens = 0;

    for (const line of lines) {
      const lineTokens = this.estimateTokenCount(line);
      
      if (currentTokens + lineTokens > maxTokens && currentChunk.length > 0) {
        chunks.push(currentChunk);
        
        // Keep overlap for code context
        const overlapLines = this.getLastLines(currentChunk, overlap);
        currentChunk = overlapLines + '\n' + line;
        currentTokens = this.estimateTokenCount(currentChunk);
      } else {
        currentChunk += (currentChunk ? '\n' : '') + line;
        currentTokens += lineTokens;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * Get overlap text from end of chunk
   */
  private getOverlapText(text: string, maxTokens: number): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let result = '';
    let tokens = 0;

    for (let i = sentences.length - 1; i >= 0; i--) {
      const sentenceTokens = this.estimateTokenCount(sentences[i]);
      if (tokens + sentenceTokens > maxTokens) break;
      
      result = sentences[i] + '.' + (result ? ' ' + result : '');
      tokens += sentenceTokens;
    }

    return result.trim();
  }

  /**
   * Get last N lines for code overlap
   */
  private getLastLines(text: string, maxTokens: number): string {
    const lines = text.split('\n');
    let result = '';
    let tokens = 0;

    for (let i = lines.length - 1; i >= 0; i--) {
      const lineTokens = this.estimateTokenCount(lines[i]);
      if (tokens + lineTokens > maxTokens) break;
      
      result = lines[i] + (result ? '\n' + result : '');
      tokens += lineTokens;
    }

    return result;
  }

  /**
   * Extract section title from content
   */
  private extractSectionTitle(content: string): string {
    for (const pattern of this.HEADER_PATTERNS) {
      pattern.lastIndex = 0;
      const match = pattern.exec(content);
      if (match) {
        // Extract title based on pattern type
        if (match[2]) return match[2].trim(); // Markdown, AsciiDoc, Wiki
        if (match[1]) return match[1].trim(); // reStructuredText, HTML
      }
    }
    return '';
  }

  /**
   * Enhanced token estimation
   */
  private estimateTokenCount(text: string): number {
    // More accurate estimation considering code vs natural language
    const codeLines = (text.match(/```[\s\S]*?```/g) || []).join('').length;
    const naturalText = text.length - codeLines;
    
    // Code is typically more token-dense
    return Math.ceil(naturalText / 4 + codeLines / 3);
  }

  /**
   * Simple YAML parser for basic key-value pairs
   */
  private parseSimpleYaml(yaml: string): any {
    const result: any = {};
    yaml.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim().replace(/['"]/g, '');
        result[key] = value;
      }
    });
    return result;
  }

  /**
   * Simple TOML parser for basic key-value pairs
   */
  private parseSimpleToml(toml: string): any {
    const result: any = {};
    toml.split('\n').forEach(line => {
      const equalsIndex = line.indexOf('=');
      if (equalsIndex > 0) {
        const key = line.substring(0, equalsIndex).trim();
        const value = line.substring(equalsIndex + 1).trim().replace(/['"]/g, '');
        result[key] = value;
      }
    });
    return result;
  }
} 