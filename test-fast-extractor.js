import { FastContentExtractor } from './dist/strategies/FastContentExtractor.js';
import { JinaContentExtractor } from './dist/strategies/JinaContentExtractor.js';
import { HttpClient } from './dist/utils/httpClient.js';

async function speedComparison() {
  console.log('🏁 Speed Comparison: FastContentExtractor vs JinaContentExtractor\n');

  const httpClient = new HttpClient({
    timeout: 30000,
    userAgent: 'DocumentationScraper/1.0.0 Speed Test',
    maxRetries: 2,
    retryDelay: 1000
  });
  
  const fastExtractor = new FastContentExtractor(httpClient);
  const jinaExtractor = new JinaContentExtractor(httpClient);

  // Test URLs (різні типи документації)
  const testUrls = [
    'https://ai.sdk.dev/docs/getting-started',
    'https://docs.nestjs.com/first-steps',
    'https://docs.astro.build/en/getting-started/',
    'https://react.dev/learn/start-a-new-react-project',
    'https://docs.python.org/3/tutorial/introduction.html'
  ];

  console.log('🔍 Testing individual URL extraction speed...\n');

  for (const url of testUrls) {
    console.log(`Testing: ${url}`);

    // Test FastContentExtractor
    const fastStart = Date.now();
    try {
      const fastResult = await fastExtractor.extract(url);
      const fastTime = Date.now() - fastStart;
      console.log(`  ⚡ FastExtractor: ${fastTime}ms (${fastResult.wordCount} words, ${fastResult.metadata.extractionMethod})`);
    } catch (error) {
      const fastTime = Date.now() - fastStart;
      console.log(`  ❌ FastExtractor: ${fastTime}ms (Error: ${error.message})`);
    }

    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test JinaContentExtractor
    const jinaStart = Date.now();
    try {
      const jinaResult = await jinaExtractor.extract(url);
      const jinaTime = Date.now() - jinaStart;
      console.log(`  🎯 JinaExtractor: ${jinaTime}ms (${jinaResult.content.length} chars)`);
    } catch (error) {
      const jinaTime = Date.now() - jinaStart;
      console.log(`  ❌ JinaExtractor: ${jinaTime}ms (Error: ${error.message})`);
    }

    console.log('');
    
    // Wait 4 seconds between URLs (rate limiting for Jina)
    await new Promise(resolve => setTimeout(resolve, 4000));
  }

  console.log('✅ Individual URL testing completed\n');
}

async function batchSpeedTest() {
  console.log('🔥 Batch Speed Test - FastContentExtractor Only\n');

  const httpClient = new HttpClient({
    timeout: 30000,
    userAgent: 'DocumentationScraper/1.0.0 Batch Test',
    maxRetries: 2,
    retryDelay: 1000
  });

  const fastExtractor = new FastContentExtractor(httpClient);

  // Larger set для batch testing
  const batchUrls = [
    'https://ai.sdk.dev/docs/getting-started',
    'https://ai.sdk.dev/docs/introduction',
    'https://docs.nestjs.com/first-steps',
    'https://docs.nestjs.com/controllers',
    'https://docs.astro.build/en/getting-started/',
    'https://docs.astro.build/en/installation/',
    'https://react.dev/learn/start-a-new-react-project',
    'https://react.dev/learn/thinking-in-react',
    'https://docs.python.org/3/tutorial/introduction.html',
    'https://docs.python.org/3/tutorial/controlflow.html'
  ];

  console.log(`Testing batch extraction of ${batchUrls.length} URLs...`);

  const batchStart = Date.now();
  const results = [];

  for (const url of batchUrls) {
    try {
      const result = await fastExtractor.extract(url);
      results.push(result);
      console.log(`✅ ${results.length}/${batchUrls.length}: ${result.title.substring(0, 40)}... (${result.wordCount} words)`);
    } catch (error) {
      console.log(`❌ ${results.length + 1}/${batchUrls.length}: Failed - ${error.message}`);
    }
    
    // Small delay між requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const batchTime = Date.now() - batchStart;

  console.log(`\n✅ Batch extraction completed in ${batchTime}ms`);
  console.log(`📊 Success rate: ${results.length}/${batchUrls.length} (${(results.length/batchUrls.length*100).toFixed(1)}%)`);
  console.log(`⚡ Average time per URL: ${(batchTime/batchUrls.length).toFixed(0)}ms`);
  
  // Розрахунок прогнозованого часу для великих batch
  const timeFor500 = (batchTime / batchUrls.length) * 500;
  console.log(`🎯 Projected time for 500 URLs: ${(timeFor500/1000/60).toFixed(1)} minutes`);

  // Виводимо деталі результатів
  console.log('\n📋 Extraction Results:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.title.substring(0, 40)}... (${result.wordCount} words, ${result.metadata.extractionMethod})`);
  });
}

// Запускаємо тести
async function runAllTests() {
  try {
    await speedComparison();
    await batchSpeedTest();
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runAllTests();