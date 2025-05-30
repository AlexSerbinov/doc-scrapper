#!/usr/bin/env node

import { Command } from 'commander';
import { DocumentationRAGPipeline } from '../core/ragPipeline.js';
import { RAGConfigService } from '../config/ragConfig.js';
import * as readline from 'readline';

const program = new Command();

program
  .name('rag-chat')
  .description('Interactive chat with your documentation')
  .version('1.0.0');

program
  .option('-q, --query <question>', 'Ask a single question and exit')
  .option('-v, --verbose', 'Show verbose output including sources')
  .option('--config', 'Show configuration and exit')
  .action(async (options) => {
    try {
      const ragConfig = RAGConfigService.getInstance();
      
      if (options.config) {
        ragConfig.printConfig();
        return;
      }

      console.log('🤖 Documentation Chat Assistant');
      console.log('================================');
      
      if (options.verbose) {
        ragConfig.printConfig();
        console.log('');
      }

      // Initialize RAG pipeline
      console.log('🔄 Initializing RAG system...');
      const pipeline = new DocumentationRAGPipeline();
      
      // Check if we have any documents indexed
      try {
        const collectionInfo = await pipeline.getCollectionInfo();
        console.log(`✅ Connected to collection: ${collectionInfo.name}`);
        console.log(`📄 Available chunks: ${collectionInfo.documentCount}`);
        
        if (collectionInfo.documentCount === 0) {
          console.log('\n⚠️  No documents found in the collection!');
          console.log('📚 Please run indexing first: npm run rag:index <documents-path>');
          process.exit(1);
        }
      } catch (error: any) {
        console.log('\n❌ No collection found!');
        console.log('📚 Please run indexing first: npm run rag:index <documents-path>');
        process.exit(1);
      }

      // Single question mode
      if (options.query) {
        await askQuestion(pipeline, options.query, options.verbose);
        return;
      }

      // Interactive chat mode
      console.log('\n💬 Interactive mode started. Type your questions!');
      console.log('   Commands: /help, /stats, /quit, /exit');
      console.log('   Tip: Be specific in your questions for better results.\n');

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '🤖 Ask me anything: ',
      });

      rl.prompt();

      rl.on('line', async (input) => {
        const question = input.trim();
        
        if (!question) {
          rl.prompt();
          return;
        }

        // Handle commands
        if (question.startsWith('/')) {
          await handleCommand(question, pipeline, rl, options.verbose);
          return;
        }

        // Process question
        await askQuestion(pipeline, question, options.verbose);
        console.log('');
        rl.prompt();
      });

      rl.on('close', () => {
        console.log('\n👋 Goodbye! Thanks for using the documentation chat!');
        process.exit(0);
      });

    } catch (error: any) {
      console.error('❌ Error initializing chat:');
      console.error(error.message || 'Unknown error');
      process.exit(1);
    }
  });

async function askQuestion(pipeline: DocumentationRAGPipeline, question: string, verbose: boolean): Promise<void> {
  try {
    console.log(`\n🔍 Searching for: "${question}"`);
    
    const response = await pipeline.query(question);
    
    console.log('\n📖 Answer:');
    console.log('─'.repeat(50));
    console.log(response.content);
    
    if (verbose && response.sources.length > 0) {
      console.log('\n📚 Sources:');
      console.log('─'.repeat(30));
      response.sources.forEach((source, index) => {
        console.log(`[${index + 1}] ${source.title} (score: ${source.score.toFixed(3)})`);
        console.log(`    ${source.url}`);
        console.log(`    "${source.excerpt}"`);
        console.log('');
      });
    }
    
    if (verbose) {
      console.log(`\n⚡ Stats: ${response.responseTime}ms | ${response.tokensUsed} tokens | ${response.model}`);
    }
    
  } catch (error: any) {
    console.error('\n❌ Error processing question:');
    console.error(error.message || 'Unknown error');
  }
}

async function handleCommand(
  command: string, 
  pipeline: DocumentationRAGPipeline, 
  rl: readline.Interface, 
  _verbose: boolean
): Promise<void> {
  const cmd = command.toLowerCase();
  
  switch (cmd) {
    case '/help':
      console.log('\n📖 Available commands:');
      console.log('  /help     - Show this help message');
      console.log('  /stats    - Show collection statistics');
      console.log('  /quit     - Exit the chat');
      console.log('  /exit     - Exit the chat');
      console.log('\n💡 Tips:');
      console.log('  - Ask specific questions for better results');
      console.log('  - Use technical terms from the documentation');
      console.log('  - Questions about APIs, examples, and concepts work well');
      break;
      
    case '/stats':
      try {
        const info = await pipeline.getCollectionInfo();
        console.log('\n📊 Collection Statistics:');
        console.log(`  Name: ${info.name}`);
        console.log(`  Documents: ${info.documentCount}`);
        console.log(`  Created: ${info.createdAt.toLocaleDateString()}`);
        console.log(`  Updated: ${info.lastUpdated.toLocaleDateString()}`);
      } catch (error: any) {
        console.log('❌ Error getting stats:', error.message || 'Unknown error');
      }
      break;
      
    case '/quit':
    case '/exit':
      rl.close();
      return;
      
    default:
      console.log(`❓ Unknown command: ${command}`);
      console.log('Type /help for available commands');
  }
  
  console.log('');
  rl.prompt();
}

// Add help examples
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ npm run rag:chat                           # Interactive mode');
  console.log('  $ npm run rag:chat --query "How to use AI SDK?"  # Single question');
  console.log('  $ npm run rag:chat --verbose                # Show sources and stats');
  console.log('  $ npm run rag:chat --config                 # Show configuration');
});

program.parse(process.argv); 