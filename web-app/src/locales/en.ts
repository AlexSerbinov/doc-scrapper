export const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    copy: 'Copy',
    copied: 'Copied!',
    download: 'Download',
    refresh: 'Refresh',
    ready: 'Ready',
    files: 'Files',
    size: 'Size',
    tokens: 'Tokens',
    sources: 'Sources',
    readyToWork: 'Ready to work'
  },

  // Header
  header: {
    logo: 'Doc Scrapper AI',
    features: 'Features',
    pricing: 'Pricing',
    login: 'Login'
  },

  // Hero Section
  hero: {
    title: 'Unlock the Power of Your',
    titleHighlight: 'Documentation with AI',
    subtitle: 'Instantly transform your online documentation into an interactive AI assistant. Get answers, not just search results.',
    urlPlaceholder: 'Enter your documentation URL...',
    startFreeButton: 'Start Free',
    startingButton: 'Starting...',
    urlValidationError: 'Please enter a valid URL (e.g., https://docs.example.com)',
    processingError: 'Error starting processing',
    compatibilityNote: 'Works with all popular documentation platforms:'
  },

  // Features Section
  features: {
    title: 'Doc Scrapper AI Features',
    subtitle: 'Transform documentation into an intelligent assistant',
    instantReadiness: {
      title: 'Instant Readiness',
      description: 'Your documentation becomes an AI knowledge base in minutes. Automatic indexing and optimization.'
    },
    accurateAnswers: {
      title: 'Accurate Answers with Sources',
      description: 'AI provides relevant information with direct links to original documentation sections.'
    },
    userFriendly: {
      title: 'User-Friendly',
      description: 'Intuitive chat instead of complex search and navigation. Natural language for getting answers.'
    },
    productivity: {
      title: 'Productivity Boost',
      description: 'Teams and clients find what they need faster, reducing support and training time.'
    },
    universalCompatibility: {
      title: 'Universal Compatibility',
      description: 'Works with any online documentation - GitBook, Notion, Confluence, custom sites and more.'
    },
    smartLearning: {
      title: 'Smart Learning',
      description: 'AI continuously learns from interactions and improves answer quality for your specific documentation.'
    }
  },

  // How It Works Section
  howItWorks: {
    title: 'How It Works',
    steps: {
      insertUrl: {
        title: 'Insert URL',
        description: 'Provide a link to your public documentation. We support GitBook, Notion, Confluence and other platforms.'
      },
      aiProcessing: {
        title: 'AI Processing',
        description: 'Our system automatically collects and indexes content, creating an optimized knowledge base for AI.'
      },
      knowledgeIndexing: {
        title: 'Knowledge Indexing',
        description: 'Content is transformed into a vector database that allows AI to quickly find relevant information.'
      },
      chatWithAI: {
        title: 'Chat with AI',
        description: 'Get personal access to an AI assistant and start asking questions in natural language!'
      }
    }
  },

  // Processing Modal
  processing: {
    steps: {
      analyze: {
        title: 'Site Structure Analysis',
        description: 'Exploring the architecture and navigation of your documentation'
      },
      scrape: {
        title: 'Page Content Collection',
        description: 'Downloading and processing all documentation pages'
      },
      process: {
        title: 'AI Processing and Indexing',
        description: 'Creating a vector knowledge base for optimal search'
      }
    },
    pages: 'pages',
    indexedBlocks: 'Indexed {count} blocks',
    createdBlocks: 'Created {count} semantic blocks',
    statusError: 'Error getting processing status',
    errorProcessing: 'An error occurred during processing',
    readyFor: 'Your AI assistant is ready for',
    preparingFor: 'Preparing Your Documentation For',
    collection: 'Collection:',
    settings: {
      title: 'Display Settings',
      detailed: 'Detailed Statistics',
      timing: 'Timing Information',
      rate: 'Processing Rate',
      currentPage: 'Current Page',
      animation: 'Progress Animation',
      compact: 'Compact View'
    },
    progress: {
      overall: 'Overall Progress',
      pages: 'Pages',
      embeddings: 'Embeddings',
      blocks: 'Blocks',
      pagesSec: 'pages/sec',
      docsSec: 'docs/sec',
      elapsed: 'Elapsed Time',
      remaining: 'Remaining',
      currentUrl: 'Currently Processing:',
      documents: 'Documents'
    },
    completed: {
      success: 'Done! Your AI assistant has been successfully created',
      goToChat: 'Go to AI Chat',
      getConsolidated: 'Get Documentation in One File',
      perfectFor: 'Perfect for use with ChatGPT, Gemini or Claude'
    },
    info: {
      duration: 'This may take from a few seconds to several minutes, depending on the size of the documentation.',
      dontClose: 'Please do not close the page.',
      sessionId: 'Session ID:'
    },
    error: {
      processing: 'Processing Error',
      unknown: 'An unknown error occurred',
      close: 'Close'
    },
    status: {
      error: '❌ Processing Error',
      ready: '✅ Ready!',
      inProgress: '🪄 Magic in Progress',
      started: '🪄 Magic Started!'
    }
  },

  // Chat Interface
  chat: {
    assistant: 'Documentation Assistant',
    activeCollection: 'Active collection: {collection}',
    readyToHelp: 'Ready to help with your documentation',
    placeholder: 'Ask something about your documentation...',
    sendMessage: 'Send message',
    copyMessage: 'Copy message',
    aiTyping: 'AI is typing',
    welcomeMessage: 'Hello! I\'m your AI documentation assistant. Ask any questions about your documentation - I\'ll find the most relevant information and provide detailed answers with source links.',
    errorMessage: 'Sorry, an error occurred while processing your request. Please try again.',
    exampleQueries: {
      title: '💡 Try these examples or ask your own question:',
      examples: [
        'Show an example of using generateText with OpenAI',
        'How to set up streaming in AI SDK?',
        'What providers does AI SDK support?',
        'Tell me about embeddings and their usage',
        'Show an example of a chatbot with tools'
      ]
    },
    sourcesCount: 'Sources ({count}):'
  },

  // Documentation Workspace
  workspace: {
    tabs: {
      chat: {
        label: 'AI Chat',
        description: 'Ask questions about your documentation'
      },
      docs: {
        label: 'Consolidated Documents',
        description: 'View and export unified documentation'
      }
    },
    selectCollection: {
      title: 'Select Documentation Collection',
      subtitle: 'First select a documentation collection to work with'
    },
    tips: {
      chat: 'Tip: Ask specific questions for better results',
      docs: 'Tip: Use consolidated documents with ChatGPT, Claude or Gemini'
    }
  },

  // Collection Selector
  collections: {
    title: 'Documentation Collections',
    loading: 'Loading collections...',
    notLoaded: 'Documentation collections not yet loaded',
    active: 'Active: {collection} ({count} docs)',
    notSelected: 'Not selected',
    refreshList: 'Refresh list'
  },

  // Consolidated Docs Viewer
  consolidatedDocs: {
    title: 'Consolidated Documentation',
    subtitle: 'Generate a single file with all your documentation for use with large language models (Google Gemini, ChatGPT-4, Claude and others).',
    perfectFor: 'Perfect for:',
    llmList: {
      gemini: 'Google Gemini Flash/Pro (2M+ tokens)',
      chatgpt: 'ChatGPT-4 Turbo (128K+ tokens)',
      claude: 'Claude 3.5 Sonnet (200K+ tokens)',
      other: 'Other LLMs with large context'
    },
    generateButton: 'Generate Consolidated Documentation',
    generating: 'Generating consolidated documentation...',
    viewModes: {
      rendered: 'Rendered',
      raw: 'Raw'
    }
  },

  // Consolidation Button
  consolidation: {
    button: 'Consolidation',
    buttonFull: 'Consolidated Documentation'
  },

  // Trial functionality
  trial: {
    version: 'Trial Version',
    session: 'for Session: {sessionId}',
    daysLeft: 'Days left: {days}',
    requestsLeft: 'Requests: {used} / {total}',
    unlockAccess: 'Unlock Full Access'
  },

  // Pricing
  pricing: {
    mostPopular: 'Most Popular',
    free: 'Free'
  },



  // Footer
  footer: {
    description: 'Unlock the power of your documentation with AI. Instantly transform online documentation into an interactive assistant.',
    builtWith: 'Built with ❤️ for developers and teams',
    quickLinks: {
      title: 'Quick Links',
      features: 'Features',
      howItWorks: 'How It Works',
      pricing: 'Pricing',
      demo: 'Demo'
    },
    support: {
      title: 'Support',
      docs: 'Documentation',
      helpCenter: 'Support Center',
      contact: 'Contact Us'
    },
    legal: {
      title: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      cookies: 'Cookies'
    },
    copyright: '© {year} Doc Scrapper AI. All rights reserved.'
  },

  // Metadata
  metadata: {
    title: 'Doc Scrapper AI - Unlock the Power of Your Documentation',
    description: 'Instantly transform your online documentation into an interactive AI assistant. Get answers, not just search results.',
    keywords: 'AI documentation, documentation scraping, AI assistant, machine learning',
    ogTitle: 'Doc Scrapper - AI Documentation Assistant',
    ogDescription: 'Find answers in documentation instantly with AI'
  },

  // Documentation Form
  form: {
    urlLabel: 'Documentation URL',
    urlPlaceholder: 'https://docs.example.com',
    urlDescription: 'Enter the main documentation page URL. We will automatically find all related pages.',
    createButton: 'Create AI Assistant',
    creatingButton: 'Starting AI assistant...',
    processTime: 'Process takes 1-3 minutes depending on documentation size',
    errors: {
      enterUrl: 'Please enter documentation URL',
      invalidUrl: 'Please enter a valid URL',
      requestError: 'Request error. Check your internet connection.',
      serverError: 'Error: {error}'
    }
  }
} as const;
