import { ChunkingStrategy } from '../types/ragTypes.js';
import { RAGConfigService } from '../config/ragConfig.js';
import { MarkdownChunkingStrategy } from './markdownChunker.js';
import { UniversalChunkingStrategy } from './universalChunker.js';

/**
 * Factory for creating chunking strategies based on configuration
 */
export class ChunkingStrategyFactory {
  static createStrategy(): ChunkingStrategy {
    const config = RAGConfigService.getInstance().config.chunking;
    
    switch (config.strategy) {
      case 'universal':
        console.log('🔧 Using Universal chunking strategy (recommended for mixed content)');
        return new UniversalChunkingStrategy();
      
      case 'markdown':
        console.log('🔧 Using Markdown chunking strategy (legacy)');
        return new MarkdownChunkingStrategy();
      
      case 'sentence':
        console.log('⚠️ Sentence chunking not recommended for code documentation');
        return new MarkdownChunkingStrategy(); // Fallback
      
      case 'recursive':
        console.log('⚠️ Recursive chunking not implemented, using Universal');
        return new UniversalChunkingStrategy(); // Fallback
      
      default:
        console.log('🔧 Using Universal chunking strategy (default)');
        return new UniversalChunkingStrategy();
    }
  }

  /**
   * Auto-detect best strategy based on content analysis
   */
  static detectBestStrategy(documentPaths: string[]): ChunkingStrategy {
    // Analyze file types and content patterns
    const hasCode = documentPaths.some(path => 
      path.includes('code') || 
      path.includes('api') || 
      path.includes('reference')
    );
    
    const hasMultipleFormats = this.detectMultipleFormats(documentPaths);
    
    if (hasCode || hasMultipleFormats) {
      console.log('🎯 Auto-detected: Universal strategy (code/mixed content detected)');
      return new UniversalChunkingStrategy();
    } else {
      console.log('🎯 Auto-detected: Markdown strategy (simple text content)');
      return new MarkdownChunkingStrategy();
    }
  }

  private static detectMultipleFormats(paths: string[]): boolean {
    const extensions = new Set(
      paths.map(path => path.split('.').pop()?.toLowerCase())
    );
    
    // If multiple documentation formats detected
    return extensions.size > 1 || 
           paths.some(p => p.includes('rst') || p.includes('asciidoc'));
  }
} 