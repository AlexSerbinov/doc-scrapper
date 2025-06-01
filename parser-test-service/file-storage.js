import fs from 'fs-extra';
import path from 'path';
import TurndownService from 'turndown';

export class FileStorage {
  constructor(outputDir = './scraped-docs') {
    this.outputDir = outputDir;
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced'
    });
  }

  async ensureOutputDir() {
    await fs.ensureDir(this.outputDir);
  }

  async saveResult(result, index, totalResults) {
    if (!result.success) {
      console.log(`❌ Skipping failed result: ${result.error}`);
      return null;
    }

    await this.ensureOutputDir();

    // Create safe filename
    const safeTitle = this.sanitizeFilename(result.title);
    const filename = `${String(index + 1).padStart(3, '0')}-${safeTitle}.md`;
    const filepath = path.join(this.outputDir, filename);

    // Convert to markdown if needed
    let content = result.content;
    if (result.extractor !== 'jina') {
      content = this.turndown.turndown(content);
    }

    // Create frontmatter
    const frontmatter = this.createFrontmatter(result);
    const fullContent = `${frontmatter}\n${content}`;

    // Save file
    await fs.writeFile(filepath, fullContent, 'utf8');
    
    console.log(`💾 Saved (${index + 1}/${totalResults}): ${filename}`);
    return filepath;
  }

  createFrontmatter(result) {
    const metadata = {
      title: result.title,
      url: result.url,
      extractor: result.extractor,
      extractionTime: `${result.extractionTime}ms`,
      wordCount: result.wordCount,
      contentLength: result.contentLength,
      extractedAt: new Date().toISOString()
    };

    if (result.author) metadata.author = result.author;
    if (result.siteName) metadata.siteName = result.siteName;
    if (result.publishedTime) metadata.publishedTime = result.publishedTime;

    const yamlLines = Object.entries(metadata)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');

    return `---\n${yamlLines}\n---`;
  }

  sanitizeFilename(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')     // Replace spaces with dashes
      .replace(/-+/g, '-')      // Remove multiple dashes
      .substring(0, 50);        // Limit length
  }

  async createSummary(results, extractorStats) {
    await this.ensureOutputDir();
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const summary = {
      timestamp: new Date().toISOString(),
      totalUrls: results.length,
      successful: successful.length,
      failed: failed.length,
      successRate: `${(successful.length / results.length * 100).toFixed(1)}%`,
      extractorStats: extractorStats,
      totalWords: successful.reduce((sum, r) => sum + (r.wordCount || 0), 0),
      totalContentLength: successful.reduce((sum, r) => sum + (r.contentLength || 0), 0),
      averageExtractionTime: successful.length > 0 
        ? Math.round(successful.reduce((sum, r) => sum + r.extractionTime, 0) / successful.length)
        : 0,
      errors: failed.map(r => ({ url: r.url, error: r.error }))
    };

    const summaryContent = `# Extraction Summary

## Statistics
- **Total URLs**: ${summary.totalUrls}
- **Successful**: ${summary.successful}
- **Failed**: ${summary.failed}
- **Success Rate**: ${summary.successRate}
- **Total Words**: ${summary.totalWords.toLocaleString()}
- **Total Content**: ${(summary.totalContentLength / 1024).toFixed(1)} KB
- **Average Time**: ${summary.averageExtractionTime}ms per URL

## Extractor Performance
${Object.entries(summary.extractorStats)
  .map(([extractor, stats]) => 
    `- **${extractor}**: ${stats.successful}/${stats.total} (${(stats.successful/stats.total*100).toFixed(1)}%) - avg ${stats.avgTime}ms`
  ).join('\n')}

## Failed URLs
${summary.errors.map(e => `- ${e.url}: ${e.error}`).join('\n')}

---
Generated at: ${summary.timestamp}
`;

    const summaryPath = path.join(this.outputDir, 'extraction-summary.md');
    await fs.writeFile(summaryPath, summaryContent, 'utf8');
    
    console.log(`📊 Summary saved to: ${summaryPath}`);
    return summary;
  }
} 