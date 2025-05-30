#!/usr/bin/env node

import { Command } from 'commander';
import { DocumentationRAGPipeline } from '../core/ragPipeline.js';
import { RAGConfigService } from '../config/ragConfig.js';
import path from 'path';

const program = new Command();

program
  .name('rag-index')
  .description('Index documents for RAG system')
  .version('1.0.0');

program
  .argument('<documents-path>', 'Path to documents directory or file')
  .option('-r, --reset', 'Reset the index before adding new documents')
  .option('-v, --verbose', 'Show verbose output')
  .option('--config', 'Show configuration and exit')
  .action(async (documentsPath: string, options) => {
    try {
      const ragConfig = RAGConfigService.getInstance();
      
      if (options.config) {
        ragConfig.printConfig();
        return;
      }

      console.log('🔧 RAG Document Indexer');
      console.log('========================');
      
      if (options.verbose) {
        ragConfig.printConfig();
        console.log('');
      }

      // Resolve absolute path
      const absolutePath = path.resolve(documentsPath);
      console.log(`📂 Documents path: ${absolutePath}`);

      // Initialize RAG pipeline
      const pipeline = new DocumentationRAGPipeline();

      // Reset index if requested
      if (options.reset) {
        console.log('🔄 Resetting existing index...');
        await pipeline.resetIndex();
      }

      // Index documents with progress
      console.log('🚀 Starting indexing process...');
      const startTime = Date.now();

      await pipeline.indexDocuments(absolutePath, (status) => {
        if (options.verbose) {
          console.log(`[${status.stage.toUpperCase()}] ${status.progress}% - ${status.message}`);
          if (status.totalDocuments > 0) {
            console.log(`   Documents: ${status.documentsProcessed}/${status.totalDocuments}`);
          }
        }
      });

      const totalTime = Date.now() - startTime;
      
      // Show final summary
      const collectionInfo = await pipeline.getCollectionInfo();
      
      console.log('\n🎉 Indexing completed successfully!');
      console.log('=====================================');
      console.log(`⏱️  Total time: ${(totalTime / 1000).toFixed(2)}s`);
      console.log(`📊 Collection: ${collectionInfo.name}`);
      console.log(`📄 Total chunks indexed: ${collectionInfo.documentCount}`);
      console.log('');
      console.log('✅ Your documents are now ready for querying!');
      console.log('💬 Try running: npm run rag:chat');

    } catch (error: any) {
      console.error('❌ Error during indexing:');
      console.error(error.message || 'Unknown error');
      
      if (options.verbose && error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
      
      process.exit(1);
    }
  });

// Add help examples
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ npm run rag:index scraped-docs/');
  console.log('  $ npm run rag:index scraped-docs/ --reset');
  console.log('  $ npm run rag:index scraped-docs/ --verbose');
  console.log('  $ npm run rag:index --config');
});

program.parse(process.argv); 