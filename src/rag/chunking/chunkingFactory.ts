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
      case 'markdown':
        console.log('🎯 Using Enhanced Semantic Markdown chunking (header-based sections)');
        return new MarkdownChunkingStrategy();
      
      case 'universal':
        console.log('🔧 Using Universal chunking strategy (legacy token-based)');
        return new UniversalChunkingStrategy();
      
      case 'sentence':
        console.log('⚠️ Sentence chunking not recommended, using Enhanced Semantic');
        return new MarkdownChunkingStrategy(); // Fallback to better strategy
      
      case 'recursive':
        console.log('⚠️ Recursive chunking not implemented, using Enhanced Semantic');
        return new MarkdownChunkingStrategy(); // Fallback to better strategy
      
      default:
        console.log('🎯 Using Enhanced Semantic Markdown chunking (default - header-based)');
        return new MarkdownChunkingStrategy(); // NEW DEFAULT ⭐
    }
  }

  /**
   * Auto-detect best strategy based on content analysis
   */
  static detectBestStrategy(documentPaths: string[]): ChunkingStrategy {
    // For documentation, semantic chunking by headers is almost always better
    const hasMarkdownDocs = documentPaths.some(path => path.endsWith('.md'));
    
    if (hasMarkdownDocs) {
      console.log('🎯 Auto-detected: Enhanced Semantic strategy (Markdown documentation detected)');
      return new MarkdownChunkingStrategy();
    }
    
    // Only use Universal for truly mixed content (not just code docs)
    const hasCode = documentPaths.some(path => 
      path.includes('code') || 
      path.includes('api') || 
      path.includes('reference')
    );
    
    const hasMultipleFormats = this.detectMultipleFormats(documentPaths);
    
    if (hasCode && hasMultipleFormats) {
      console.log('🔧 Auto-detected: Universal strategy (complex mixed content)');
      return new UniversalChunkingStrategy();
    } else {
      console.log('🎯 Auto-detected: Enhanced Semantic strategy (default for documentation)');
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