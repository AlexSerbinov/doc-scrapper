import { promises as fs } from 'fs';
import * as path from 'path';

// Interfaces
interface FileData {
    filePath: string;
    content: string;
}

interface AnalysisData {
    path: string;
    content: string;
}

interface AnalyzerConfig {
    excludeList: string[];
    deleteComments: boolean;
    outputDirectory: string;
    includeBinaryFiles: boolean;
}

// Main analyzer class for documentation consolidation
class DocConsolidator {
    private config: AnalyzerConfig;

    constructor(config?: Partial<AnalyzerConfig>) {
        this.config = {
            // Exclude patterns for scraped docs
            excludeList: [
                '.DS_Store', 
                'node_modules', 
                '.git', 
                '.gitignore', 
                '.ico', 
                '.png', 
                '.jpg', 
                '.jpeg', 
                '.gif', 
                '.svg', 
                '.webp', 
                '.mp4', 
                '.mp3', 
                '.wav',
                '.pdf',
                '.zip',
                '.tar',
                '.gz',
                'package-lock.json',
                'yarn.lock',
                '.next',
                'dist',
                'build',
                '.cache'
            ],
            deleteComments: false,
            outputDirectory: './consolidation-output',
            includeBinaryFiles: false,
            ...config
        };
    }

    /**
     * Generates folder structure as a string representation
     */
    async generateFolderStructure(dir: string, prefix: string = ''): Promise<string> {
        let structure = '';
        
        try {
            const files = await fs.readdir(dir, { withFileTypes: true });
            
            for (const file of files) {
                if (this.shouldExcludeFile(file.name)) {
                    continue;
                }
                
                const filePath = path.join(dir, file.name);
                structure += `${prefix}${file.isDirectory() ? '📁' : '📄'} ${file.name}\n`;
                
                if (file.isDirectory()) {
                    structure += await this.generateFolderStructure(filePath, prefix + '  ');
                }
            }
        } catch (error) {
            console.warn(`Cannot read directory ${dir}:`, error);
        }
        
        return structure;
    }

    /**
     * Recursively reads directory and returns file data
     */
    async readDirectoryRecursively(dir: string, fileList: FileData[] = []): Promise<FileData[]> {
        try {
            const files = await fs.readdir(dir, { withFileTypes: true });
            
            for (const file of files) {
                if (this.shouldExcludeFile(file.name)) {
                    continue;
                }
                
                const filePath = path.join(dir, file.name);
                
                if (file.isDirectory()) {
                    fileList = await this.readDirectoryRecursively(filePath, fileList);
                } else {
                    try {
                        let content = await fs.readFile(filePath, 'utf8');
                        
                        if (this.config.deleteComments) {
                            content = this.removeComments(content);
                        }
                        
                        fileList.push({ filePath, content });
                    } catch (error) {
                        // Handle binary files or files with encoding issues
                        console.warn(`Cannot read file ${filePath}, skipping...`);
                    }
                }
            }
        } catch (error) {
            console.warn(`Cannot access directory ${dir}:`, error);
        }
        
        return fileList;
    }

    /**
     * Prepares content for analysis by converting to relative paths
     */
    async prepareContentForAnalysis(basePath: string): Promise<AnalysisData[]> {
        const files = await this.readDirectoryRecursively(basePath);
        
        return files.map(file => ({
            path: path.relative(basePath, file.filePath),
            content: file.content,
        }));
    }

    /**
     * Generates consolidated markdown for LLM analysis
     */
    async generateConsolidatedMarkdown(basePath: string, projectName?: string): Promise<string> {
        const projectStructure = await this.generateFolderStructure(basePath);
        const projectFiles = await this.prepareContentForAnalysis(basePath);
        
        const totalFiles = projectFiles.length;
        const totalSize = projectFiles.reduce((size, file) => size + file.content.length, 0);
        const estimatedTokens = Math.round(totalSize / 4); // Rough estimate: 1 token ≈ 4 characters
        
        let markdownContent = `# 📚 Consolidated Documentation${projectName ? ` - ${projectName}` : ''}\n\n`;
        
        markdownContent += `## 📊 Overview\n\n`;
        markdownContent += `- **Total Files**: ${totalFiles}\n`;
        markdownContent += `- **Total Size**: ${this.formatBytes(totalSize)}\n`;
        markdownContent += `- **Estimated Tokens**: ~${estimatedTokens.toLocaleString()}\n`;
        markdownContent += `- **Generated**: ${new Date().toLocaleString()}\n\n`;
        
        markdownContent += `## 🔧 Usage Instructions\n\n`;
        markdownContent += `This consolidated documentation file contains the complete content of your scraped documentation.\n\n`;
        markdownContent += `**Recommended for:**\n`;
        markdownContent += `- 🤖 **Google Gemini Flash/Pro** (2M+ token context)\n`;
        markdownContent += `- 🤖 **ChatGPT-4 Turbo** (128K+ token context)\n`;
        markdownContent += `- 🤖 **Claude 3.5 Sonnet** (200K+ token context)\n`;
        markdownContent += `- 🤖 **Other large context LLMs**\n\n`;
        markdownContent += `**Instructions:**\n`;
        markdownContent += `1. Copy this entire document\n`;
        markdownContent += `2. Paste into your preferred LLM\n`;
        markdownContent += `3. Ask questions about the documentation\n`;
        markdownContent += `4. Get instant, context-aware answers!\n\n`;
        
        markdownContent += `---\n\n`;
        markdownContent += `## 📁 Directory Structure\n\n`;
        markdownContent += `\`\`\`text\n${projectStructure}\n\`\`\`\n\n`;
        markdownContent += `## 📄 File Contents\n\n`;
        
        projectFiles.forEach((file, index) => {
            const extension = path.extname(file.path).substring(1);
            const lang = this.getLanguageFromExtension(extension);

            markdownContent += `### ${index + 1}. \`${file.path}\`\n\n`;
            
            if (file.content.trim().length === 0) {
                markdownContent += `*This file is empty.*\n\n`;
            } else {
                markdownContent += `\`\`\`${lang}\n`;
                markdownContent += `${file.content.trim()}\n`;
                markdownContent += `\`\`\`\n\n`;
            }
        });
        
        markdownContent += `---\n\n`;
        markdownContent += `*Generated by Doc Scrapper AI - Your Documentation Consolidation Tool*\n`;
        
        return markdownContent;
    }

    /**
     * Saves consolidated markdown to file (optional)
     */
    async saveConsolidatedFile(content: string, projectName?: string): Promise<string> {
        const dateTime = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const fileName = `consolidated-docs-${projectName || 'project'}-${dateTime}.md`;

        try {
            await fs.mkdir(this.config.outputDirectory, { recursive: true });
            const filePath = path.join(this.config.outputDirectory, fileName);
            await fs.writeFile(filePath, content);
            
            console.log(`Consolidated documentation saved: ${fileName}`);
            return filePath;
        } catch (error) {
            console.error('Error saving consolidated file:', error);
            throw error;
        }
    }

    /**
     * Main consolidation method
     */
    async consolidate(basePath: string, projectName?: string): Promise<{ 
        markdown: string; 
        fileName?: string; 
        stats: { totalFiles: number; totalSize: number; estimatedTokens: number } 
    }> {
        console.log('Starting documentation consolidation...');
        
        const markdown = await this.generateConsolidatedMarkdown(basePath, projectName);
        
        // Calculate stats
        const projectFiles = await this.prepareContentForAnalysis(basePath);
        const totalFiles = projectFiles.length;
        const totalSize = projectFiles.reduce((size, file) => size + file.content.length, 0);
        const estimatedTokens = Math.round(totalSize / 4);
        
        console.log(`Consolidation completed! Files: ${totalFiles}, Estimated tokens: ${estimatedTokens}`);
        
        return { 
            markdown, 
            stats: { totalFiles, totalSize, estimatedTokens }
        };
    }

    // Private helper methods
    private shouldExcludeFile(fileName: string): boolean {
        return this.config.excludeList.some(exclude => fileName.includes(exclude));
    }

    private removeComments(content: string): string {
        // Remove single-line comments
        content = content.replace(/\/\/.*$/gm, '');
        // Remove multi-line comments
        content = content.replace(/\/\*[\s\S]*?\*\//gm, '');
        // Remove HTML comments
        content = content.replace(/<!--[\s\S]*?-->/gm, '');
        return content;
    }

    private getLanguageFromExtension(extension: string): string {
        const languageMap: { [key: string]: string } = {
            'ts': 'typescript',
            'tsx': 'tsx',
            'js': 'javascript',
            'jsx': 'jsx',
            'py': 'python',
            'md': 'markdown',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'xml': 'xml',
            'yml': 'yaml',
            'yaml': 'yaml',
            'sh': 'bash',
            'txt': 'text',
            'go': 'go',
            'rs': 'rust',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'php': 'php',
            'rb': 'ruby',
        };
        
        return languageMap[extension] || 'text';
    }

    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Usage example and main execution
async function main(): Promise<void> {
    try {
        const consolidator = new DocConsolidator({
            deleteComments: false
        });
        
        const basePath = './codes_for_takes/';
        const result = await consolidator.consolidate(basePath);
        
        console.log(`Consolidation complete. Generated file: ${result.fileName}`);
        
    } catch (error) {
        console.error('Error during consolidation:', error);
        process.exit(1);
    }
}

// Export for use as module
export { DocConsolidator, AnalyzerConfig, FileData, AnalysisData };

// Run if this file is executed directly (ES module style)
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
