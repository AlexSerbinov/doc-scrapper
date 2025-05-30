import { ChunkingStrategy, Document, DocumentChunk, ChunkingConfig } from '../types/ragTypes.js';
import { RAGConfigService } from '../config/ragConfig.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';
import path from 'path';

export class MarkdownChunkingStrategy implements ChunkingStrategy {
  private config: ChunkingConfig;

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
    const chunks: DocumentChunk[] = [];
    const { content, metadata } = document;
    
    // Parse frontmatter and content
    const { frontmatter, mainContent } = this.parseFrontmatter(content);
    
    // Split by headers to create logical sections
    const sections = this.splitByHeaders(mainContent);
    
    // Further split large sections into smaller chunks
    let chunkIndex = 0;
    for (const section of sections) {
      const sectionChunks = this.splitLargeSection(section);
      
      for (const chunkContent of sectionChunks) {
        if (chunkContent.trim().length < 50) continue; // Skip very small chunks
        
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

  private parseFrontmatter(content: string): { frontmatter: any; mainContent: string } {
    const frontmatterRegex = /^---\n(.*?)\n---\n(.*)/s;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      return { frontmatter: {}, mainContent: content };
    }

    try {
      const frontmatterText = match[1];
      const frontmatter: any = {};
      
      // Simple YAML parsing for key-value pairs
      frontmatterText.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim().replace(/['"]/g, '');
          frontmatter[key] = value;
        }
      });

      return { frontmatter, mainContent: match[2] };
    } catch (error) {
      console.warn('Failed to parse frontmatter:', error);
      return { frontmatter: {}, mainContent: content };
    }
  }

  private splitByHeaders(content: string): string[] {
    // Split by markdown headers (# ## ### etc)
    const headerRegex = /^(#{1,6})\s+(.+)$/gm;
    const sections: string[] = [];
    let lastIndex = 0;
    let match;

    const matches: Array<{ index: number; level: number; title: string }> = [];
    
    while ((match = headerRegex.exec(content)) !== null) {
      matches.push({
        index: match.index,
        level: match[1].length,
        title: match[2],
      });
    }

    // If no headers found, treat entire content as one section
    if (matches.length === 0) {
      return [content];
    }

    // Create sections based on headers
    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];
      
      const sectionStart = lastIndex;
      const sectionEnd = nextMatch ? nextMatch.index : content.length;
      
      const section = content.substring(sectionStart, sectionEnd).trim();
      if (section.length > 0) {
        sections.push(section);
      }
      
      lastIndex = currentMatch.index;
    }

    // Add final section if exists
    const finalSection = content.substring(lastIndex).trim();
    if (finalSection.length > 0 && !sections.includes(finalSection)) {
      sections.push(finalSection);
    }

    return sections.filter(section => section.length > 0);
  }

  private splitLargeSection(section: string): string[] {
    const { chunkSize, chunkOverlap } = this.config;
    
    // If section is small enough, return as is
    if (this.estimateTokenCount(section) <= chunkSize) {
      return [section];
    }

    const chunks: string[] = [];
    const sentences = this.splitIntoSentences(section);
    
    let currentChunk = '';
    let currentTokens = 0;

    for (const sentence of sentences) {
      const sentenceTokens = this.estimateTokenCount(sentence);
      
      // If adding this sentence would exceed chunk size, save current chunk
      if (currentTokens + sentenceTokens > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        
        // Start new chunk with overlap
        const overlapText = this.getLastSentences(currentChunk, chunkOverlap);
        currentChunk = overlapText + ' ' + sentence;
        currentTokens = this.estimateTokenCount(currentChunk);
      } else {
        currentChunk += ' ' + sentence;
        currentTokens += sentenceTokens;
      }
    }

    // Add remaining chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting - can be improved
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => s + '.');
  }

  private getLastSentences(text: string, maxTokens: number): string {
    const sentences = this.splitIntoSentences(text);
    let result = '';
    let tokens = 0;

    for (let i = sentences.length - 1; i >= 0; i--) {
      const sentenceTokens = this.estimateTokenCount(sentences[i]);
      if (tokens + sentenceTokens > maxTokens) break;
      
      result = sentences[i] + ' ' + result;
      tokens += sentenceTokens;
    }

    return result.trim();
  }

  private extractSectionTitle(content: string): string {
    // Extract the first header from content
    const headerMatch = content.match(/^(#{1,6})\s+(.+)$/m);
    return headerMatch ? headerMatch[2] : '';
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }
}

export class DocumentLoader {
  static async loadFromDirectory(documentsPath: string): Promise<Document[]> {
    const documents: Document[] = [];
    
    if (!await fs.pathExists(documentsPath)) {
      throw new Error(`Documents path does not exist: ${documentsPath}`);
    }

    const stats = await fs.stat(documentsPath);
    
    if (stats.isFile() && documentsPath.endsWith('.md')) {
      // Single file
      const doc = await this.loadSingleDocument(documentsPath);
      documents.push(doc);
    } else if (stats.isDirectory()) {
      // Directory - recursively load all .md files
      const files = await this.findMarkdownFiles(documentsPath);
      
      for (const filePath of files) {
        try {
          const doc = await this.loadSingleDocument(filePath);
          documents.push(doc);
        } catch (error: any) {
          console.warn(`Failed to load document ${filePath}:`, error.message || 'Unknown error');
        }
      }
    }

    return documents;
  }

  private static async loadSingleDocument(filePath: string): Promise<Document> {
    const content = await fs.readFile(filePath, 'utf-8');
    const absolutePath = path.resolve(filePath);
    
    // Try to extract URL from frontmatter or use file path
    const frontmatterMatch = content.match(/^---\n(.*?)\n---/s);
    let url = filePath;
    
    if (frontmatterMatch) {
      const urlMatch = frontmatterMatch[1].match(/url:\s*['"]?([^'"]+)['"]?/);
      if (urlMatch) {
        url = urlMatch[1];
      }
    }

    return {
      content,
      metadata: {
        title: this.extractTitle(content, filePath),
        url,
        filePath: absolutePath,
      },
    };
  }

  private static async findMarkdownFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await this.findMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private static extractTitle(content: string, filePath: string): string {
    // Try to extract title from frontmatter
    const frontmatterMatch = content.match(/^---\n(.*?)\n---/s);
    if (frontmatterMatch) {
      const titleMatch = frontmatterMatch[1].match(/title:\s*['"]?([^'"]+)['"]?/);
      if (titleMatch) {
        return titleMatch[1];
      }
    }

    // Try to extract from first header
    const headerMatch = content.match(/^#\s+(.+)$/m);
    if (headerMatch) {
      return headerMatch[1];
    }

    // Use filename as fallback
    return path.basename(filePath, '.md');
  }
} 