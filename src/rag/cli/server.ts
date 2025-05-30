#!/usr/bin/env node

import { Command } from 'commander';
import { startServer } from '../server/ragServer.js';

const program = new Command();

program
  .name('rag-server')
  .description('Start RAG HTTP server for web app integration')
  .version('1.0.0')
  .option('-p, --port <port>', 'Server port', '8001')
  .action(async (options) => {
    console.log('🚀 Starting RAG Server...');
    console.log(`📡 Port: ${options.port}`);
    
    // Set port from CLI option
    process.env.RAG_SERVER_PORT = options.port;
    
    try {
      await startServer();
    } catch (error: any) {
      console.error('❌ Failed to start RAG server:', error.message);
      process.exit(1);
    }
  });

// Help examples
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ npm run rag:server              # Start on default port 8001');
  console.log('  $ npm run rag:server --port 9000  # Start on custom port');
  console.log('');
  console.log('API Endpoints:');
  console.log('  GET  /health - Health check and collection info');
  console.log('  POST /query  - Submit chat queries');
  console.log('  GET  /stats  - Get collection statistics');
});

program.parse(process.argv); 