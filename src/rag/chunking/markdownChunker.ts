import { ChunkingStrategy, Document, DocumentChunk, ChunkingConfig } from '../types/ragTypes.js';
import { RAGConfigService } from '../config/ragConfig.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';
import path from 'path';

/**
 * Enhanced Semantic Markdown Chunking Strategy
 * 
 * Розділяє документи на семантичні блоки по заголовкам Markdown.
 * Кожен chunk відповідає одній секції документації з її заголовком та контентом.
 * Зберігає ієрархію заголовків та контекст для кращого пошуку.
 */
export class MarkdownChunkingStrategy implements ChunkingStrategy {
  private config: ChunkingConfig;
  private maxChunkTokens: number = 1000; // Максимальний розмір chunk в токенах

  constructor() {
    this.config = RAGConfigService.getInstance().config.chunking;
    // Використовуємо більший ліміт для семантичних блоків
    this.maxChunkTokens = Math.max(this.config.chunkSize, 1000);
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
    
    // Create semantic sections based on header hierarchy
    const semanticSections = this.createSemanticSections(mainContent);
    
    // Convert sections to chunks
    let chunkIndex = 0;
    for (const section of semanticSections) {
      // Skip very small sections (less than 50 characters)
      if (section.content.trim().length < 50) continue;
      
      const tokenCount = this.estimateTokenCount(section.content);
      
      // If section is too large, try to split it intelligently
      if (tokenCount > this.maxChunkTokens) {
        const splitChunks = this.splitLargeSemanticSection(section);
        for (const splitChunk of splitChunks) {
          chunks.push(this.createChunk(splitChunk, frontmatter, metadata, chunkIndex++));
        }
      } else {
        chunks.push(this.createChunk(section, frontmatter, metadata, chunkIndex++));
      }
    }

    return chunks;
  }

  private createSemanticSections(content: string): SemanticSection[] {
    const sections: SemanticSection[] = [];
    const lines = content.split('\n');
    
    let currentSection: SemanticSection | null = null;
    let headerStack: HeaderInfo[] = []; // Stack для відстеження ієрархії заголовків
    
    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // Знайшли новий заголовок
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();
        
        // Зберігаємо попередню секцію якщо вона існує
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Оновлюємо стек заголовків
        this.updateHeaderStack(headerStack, { level, title });
        
        // Створюємо нову секцію
        currentSection = {
          title,
          level,
          content: line + '\n',
          headerPath: this.createHeaderPath(headerStack),
          tokenCount: 0,
        };
      } else {
        // Додаємо контент до поточної секції
        if (currentSection) {
          currentSection.content += line + '\n';
        } else {
          // Контент перед першим заголовком - створюємо секцію "Intro"
          currentSection = {
            title: 'Introduction',
            level: 0,
            content: line + '\n',
            headerPath: ['Introduction'],
            tokenCount: 0,
          };
        }
      }
    }
    
    // Додаємо останню секцію
    if (currentSection) {
      sections.push(currentSection);
    }
    
    // Оновлюємо підрахунок токенів
    sections.forEach(section => {
      section.tokenCount = this.estimateTokenCount(section.content);
    });
    
    return sections.filter(section => section.content.trim().length > 0);
  }

  private updateHeaderStack(stack: HeaderInfo[], newHeader: HeaderInfo): void {
    // Видаляємо заголовки того ж рівня або нижчого
    while (stack.length > 0 && stack[stack.length - 1].level >= newHeader.level) {
      stack.pop();
    }
    
    // Додаємо новий заголовок
    stack.push(newHeader);
  }

  private createHeaderPath(headerStack: HeaderInfo[]): string[] {
    return headerStack.map(header => header.title);
  }

  private splitLargeSemanticSection(section: SemanticSection): SemanticSection[] {
    // Якщо секція дуже велика, пробуємо розділити її по підзаголовкам або параграфам
    const lines = section.content.split('\n');
    const chunks: SemanticSection[] = [];
    
    let currentChunk = '';
    let currentTokens = 0;
    const overlapLines = Math.floor(this.config.chunkOverlap / 20); // Приблизно по 20 символів на рядок
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineTokens = this.estimateTokenCount(line);
      
      if (currentTokens + lineTokens > this.maxChunkTokens && currentChunk.length > 0) {
        // Створюємо chunk і починаємо новий
        chunks.push({
          ...section,
          content: currentChunk.trim(),
          title: section.title + (chunks.length > 0 ? ` (частина ${chunks.length + 1})` : ''),
          tokenCount: currentTokens,
        });
        
        // Починаємо новий chunk з overlap
        const overlapStart = Math.max(0, i - overlapLines);
        currentChunk = lines.slice(overlapStart, i + 1).join('\n') + '\n';
        currentTokens = this.estimateTokenCount(currentChunk);
      } else {
        currentChunk += line + '\n';
        currentTokens += lineTokens;
      }
    }
    
    // Додаємо останній chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        ...section,
        content: currentChunk.trim(),
        title: section.title + (chunks.length > 0 ? ` (частина ${chunks.length + 1})` : ''),
        tokenCount: currentTokens,
      });
    }
    
    return chunks;
  }

  private createChunk(section: SemanticSection, frontmatter: any, metadata: any, chunkIndex: number): DocumentChunk {
    return {
      id: uuidv4(),
      content: section.content.trim(),
      metadata: {
        sourceUrl: metadata.url,
        title: frontmatter.title || metadata.title,
        section: section.title,
        headerPath: section.headerPath.join(' > '),
        headerLevel: section.level,
        filePath: metadata.filePath,
        chunkIndex,
        tokenCount: section.tokenCount,
        createdAt: new Date(),
        // Додаткові метадані для кращого контексту
        documentType: 'markdown',
        semanticType: 'section',
      },
    };
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

  private estimateTokenCount(text: string): number {
    // Покращена оцінка токенів: 1 токен ≈ 4 символи для англійської мови
    return Math.ceil(text.length / 4);
  }
}

// Helper interfaces
interface SemanticSection {
  title: string;
  level: number;
  content: string;
  headerPath: string[];
  tokenCount: number;
}

interface HeaderInfo {
  level: number;
  title: string;
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