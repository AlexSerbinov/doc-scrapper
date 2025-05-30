import fs from 'fs-extra';
import path from 'path';
import { StorageAdapter, ProcessedPage, ScrapingConfig } from '../types/index.js';

export class FileStorageAdapter implements StorageAdapter {
  async save(pages: ProcessedPage[], config: ScrapingConfig): Promise<void> {
    // Ensure output directory exists
    await fs.ensureDir(config.outputDir);

    // Create a summary file
    await this.createSummaryFile(pages, config);

    // Save each page
    for (const page of pages) {
      await this.savePage(page, config);
    }

    console.log(`💾 Saved ${pages.length} pages to ${config.outputDir}`);
  }

  private async savePage(page: ProcessedPage, config: ScrapingConfig): Promise<void> {
    const filePath = this.generateFilePath(page, config);
    
    // Ensure directory exists
    await fs.ensureDir(path.dirname(filePath));
    
    // Write the file
    await fs.writeFile(filePath, page.content, 'utf-8');
    
    // Update the page object with the actual output path
    page.outputPath = filePath;
  }

  private generateFilePath(page: ProcessedPage, config: ScrapingConfig): string {
    const url = new URL(page.url);
    let relativePath = url.pathname;
    
    // Clean up the path
    if (relativePath === '/' || relativePath === '') {
      relativePath = '/index';
    }
    
    // Remove leading slash and clean up
    relativePath = relativePath.replace(/^\/+/, '');
    
    // Replace invalid file system characters
    relativePath = relativePath.replace(/[<>:"|?*]/g, '_');
    
    // Ensure path doesn't end with a dot (Windows issue)
    relativePath = relativePath.replace(/\.+$/, '');
    
    // Add appropriate file extension
    const extension = this.getFileExtension(config.outputFormat);
    if (!relativePath.endsWith(extension)) {
      relativePath += extension;
    }
    
    return path.join(config.outputDir, relativePath);
  }

  private getFileExtension(format: string): string {
    switch (format) {
      case 'markdown':
        return '.md';
      case 'json':
        return '.json';
      case 'html':
        return '.html';
      default:
        return '.txt';
    }
  }

  private async createSummaryFile(pages: ProcessedPage[], config: ScrapingConfig): Promise<void> {
    const summary = {
      scrapingDate: new Date().toISOString(),
      baseUrl: config.baseUrl,
      outputFormat: config.outputFormat,
      totalPages: pages.length,
      pages: pages.map(page => ({
        title: page.title,
        url: page.url,
        outputPath: this.generateFilePath(page, config),
        metadata: page.metadata
      }))
    };

    const summaryPath = path.join(config.outputDir, 'scraping-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');

    // Also create a simple index file for markdown format
    if (config.outputFormat === 'markdown') {
      await this.createMarkdownIndex(pages, config);
    }
  }

  private async createMarkdownIndex(pages: ProcessedPage[], config: ScrapingConfig): Promise<void> {
    let indexContent = `# Documentation Index\n\n`;
    indexContent += `**Source**: ${config.baseUrl}\n`;
    indexContent += `**Scraped**: ${new Date().toLocaleDateString()}\n`;
    indexContent += `**Total Pages**: ${pages.length}\n\n`;
    indexContent += `---\n\n`;

    // Group pages by section if breadcrumbs are available
    const sections = this.groupPagesBySection(pages);
    
    for (const [sectionName, sectionPages] of Object.entries(sections)) {
      if (sectionName !== 'Other') {
        indexContent += `## ${sectionName}\n\n`;
      }
      
      for (const page of sectionPages) {
        const relativePath = path.relative(config.outputDir, this.generateFilePath(page, config));
        indexContent += `- [${page.title}](${relativePath.replace(/\\/g, '/')})\n`;
      }
      
      indexContent += `\n`;
    }

    const indexPath = path.join(config.outputDir, 'README.md');
    await fs.writeFile(indexPath, indexContent, 'utf-8');
  }

  private groupPagesBySection(pages: ProcessedPage[]): Record<string, ProcessedPage[]> {
    const sections: Record<string, ProcessedPage[]> = {};
    
    for (const page of pages) {
      let sectionName = 'Other';
      
      // Try to determine section from breadcrumbs
      if (page.metadata.breadcrumbs && page.metadata.breadcrumbs.length > 1) {
        sectionName = page.metadata.breadcrumbs[1]; // Skip the root breadcrumb
      } else {
        // Try to determine from URL path
        const url = new URL(page.url);
        const pathParts = url.pathname.split('/').filter(part => part);
        if (pathParts.length > 1) {
          sectionName = pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1);
        }
      }
      
      if (!sections[sectionName]) {
        sections[sectionName] = [];
      }
      
      sections[sectionName].push(page);
    }
    
    // Sort sections and pages within sections
    const sortedSections: Record<string, ProcessedPage[]> = {};
    const sortedSectionNames = Object.keys(sections).sort();
    
    for (const sectionName of sortedSectionNames) {
      sortedSections[sectionName] = sections[sectionName].sort((a, b) => 
        a.title.localeCompare(b.title)
      );
    }
    
    return sortedSections;
  }
} 