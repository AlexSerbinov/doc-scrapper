import TurndownService from 'turndown';
import { Formatter, ExtractedContent } from '../types/index.js';

export class MarkdownFormatter implements Formatter {
  private turndownService: TurndownService;

  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx', // Use # for headings
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      fence: '```',
      emDelimiter: '*',
      strongDelimiter: '**',
    });

    this.setupCustomRules();
  }

  format(content: ExtractedContent): string {
    const { title, content: htmlContent, metadata } = content;

    let markdown = '';

    // Add title
    markdown += `# ${title}\n\n`;

    // Add metadata as frontmatter
    if (this.hasMetadata(metadata)) {
      markdown += '---\n';
      if (metadata.url) markdown += `url: ${metadata.url}\n`;
      if (metadata.description) markdown += `description: ${metadata.description}\n`;
      if (metadata.author) markdown += `author: ${metadata.author}\n`;
      if (metadata.lastModified) markdown += `lastModified: ${metadata.lastModified}\n`;
      if (metadata.tags && metadata.tags.length > 0) {
        markdown += `tags: [${metadata.tags.join(', ')}]\n`;
      }
      if (metadata.breadcrumbs && metadata.breadcrumbs.length > 0) {
        markdown += `breadcrumbs: [${metadata.breadcrumbs.join(' > ')}]\n`;
      }
      markdown += '---\n\n';
    }

    // Convert HTML content to Markdown
    const markdownContent = this.turndownService.turndown(htmlContent);
    markdown += markdownContent;

    // Clean up the markdown
    markdown = this.cleanMarkdown(markdown);

    return markdown;
  }

  private setupCustomRules(): void {
    // Custom rule for code blocks with language detection
    this.turndownService.addRule('highlightedCodeBlock', {
      filter: 'pre',
      replacement: function (content, node) {
        const codeNode = node.querySelector('code');
        if (codeNode) {
          const className = codeNode.getAttribute('class') || '';
          const language = className.match(/language-(\w+)/)?.[1] || '';
          return '\n\n```' + language + '\n' + codeNode.textContent + '\n```\n\n';
        }
        return '\n\n```\n' + content + '\n```\n\n';
      }
    });

    // Custom rule for preserving tables
    this.turndownService.addRule('table', {
      filter: 'table',
      replacement: function (content) {
        return '\n\n' + content + '\n\n';
      }
    });

    // Custom rule for handling nested lists properly
    this.turndownService.addRule('nestedList', {
      filter: ['ul', 'ol'],
      replacement: function (content, node) {
        const isNested = node.parentNode && ['LI', 'UL', 'OL'].includes(node.parentNode.nodeName);
        const prefix = isNested ? '\n' : '\n\n';
        const suffix = isNested ? '' : '\n\n';
        return prefix + content + suffix;
      }
    });
  }

  private hasMetadata(metadata: any): boolean {
    return metadata.description || 
           metadata.author || 
           metadata.lastModified || 
           (metadata.tags && metadata.tags.length > 0) ||
           (metadata.breadcrumbs && metadata.breadcrumbs.length > 0);
  }

  private cleanMarkdown(markdown: string): string {
    // Remove excessive blank lines
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    
    // Clean up list formatting
    markdown = markdown.replace(/^(\s*)-\s*$/gm, ''); // Remove empty list items
    
    // Fix spacing around headers
    markdown = markdown.replace(/^(#+\s+.+)$/gm, '\n$1\n');
    
    // Clean up table formatting
    markdown = markdown.replace(/\|\s*\|/g, '|');
    
    // Remove trailing whitespace
    markdown = markdown.replace(/[ \t]+$/gm, '');
    
    // Ensure file ends with single newline
    markdown = markdown.trim() + '\n';
    
    return markdown;
  }
} 