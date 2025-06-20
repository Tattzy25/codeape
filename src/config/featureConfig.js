import { FEATURES } from './appConstants'

// Feature definitions with metadata
export const FEATURE_CONFIG = {
  [FEATURES.CHAT]: {
    id: FEATURES.CHAT,
    name: 'Chat with Kyartu',
    description: 'Have a conversation with your AI assistant',
    icon: '💬',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    textColor: 'text-blue-600',
    category: 'communication',
    premium: false,
    enabled: true,
    shortcut: 'C',
    features: [
      'Real-time conversation',
      'Respect meter tracking',
      'Mood-based responses',
      'Message history'
    ]
  },
  
  [FEATURES.FILE_PROCESSOR]: {
    id: FEATURES.FILE_PROCESSOR,
    name: 'File Processor',
    description: 'Upload and process various file types',
    icon: '📁',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    textColor: 'text-green-600',
    category: 'productivity',
    premium: false,
    enabled: true,
    shortcut: 'F',
    features: [
      'Multiple file upload',
      'Text extraction',
      'Format conversion',
      'Batch processing'
    ]
  },
  
  [FEATURES.CODE_ANALYZER]: {
    id: FEATURES.CODE_ANALYZER,
    name: 'Code Analyzer',
    description: 'Analyze and review code files',
    icon: '🔍',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    textColor: 'text-purple-600',
    category: 'development',
    premium: false,
    enabled: true,
    shortcut: 'A',
    features: [
      'Code quality analysis',
      'Bug detection',
      'Performance suggestions',
      'Documentation generation'
    ]
  },
  
  [FEATURES.TEXT_SUMMARIZER]: {
    id: FEATURES.TEXT_SUMMARIZER,
    name: 'Text Summarizer',
    description: 'Summarize long texts and documents',
    icon: '📝',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    textColor: 'text-orange-600',
    category: 'productivity',
    premium: false,
    enabled: true,
    shortcut: 'S',
    features: [
      'Intelligent summarization',
      'Key point extraction',
      'Multiple summary lengths',
      'Bullet point format'
    ]
  },
  
  [FEATURES.LANGUAGE_TRANSLATOR]: {
    id: FEATURES.LANGUAGE_TRANSLATOR,
    name: 'Language Translator',
    description: 'Translate text between languages',
    icon: '🌐',
    color: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600',
    textColor: 'text-indigo-600',
    category: 'communication',
    premium: true,
    enabled: true,
    shortcut: 'T',
    features: [
      'Multi-language support',
      'Context-aware translation',
      'Batch translation',
      'Language detection'
    ]
  },
  
  [FEATURES.CREATIVE_WRITER]: {
    id: FEATURES.CREATIVE_WRITER,
    name: 'Creative Writer',
    description: 'Generate creative content and stories',
    icon: '✍️',
    color: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-600',
    textColor: 'text-pink-600',
    category: 'creative',
    premium: true,
    enabled: true,
    shortcut: 'W',
    features: [
      'Story generation',
      'Poetry creation',
      'Character development',
      'Plot suggestions'
    ]
  },
  
  [FEATURES.RESEARCH_ASSISTANT]: {
    id: FEATURES.RESEARCH_ASSISTANT,
    name: 'Research Assistant',
    description: 'Help with research and information gathering',
    icon: '🔬',
    color: 'bg-teal-500',
    hoverColor: 'hover:bg-teal-600',
    textColor: 'text-teal-600',
    category: 'research',
    premium: true,
    enabled: false, // Coming soon
    shortcut: 'R',
    features: [
      'Information synthesis',
      'Source verification',
      'Citation generation',
      'Fact checking'
    ]
  }
}

// Feature categories
export const FEATURE_CATEGORIES = {
  communication: {
    name: 'Communication',
    icon: '💬',
    description: 'Chat and language tools'
  },
  productivity: {
    name: 'Productivity',
    icon: '⚡',
    description: 'Tools to boost your productivity'
  },
  development: {
    name: 'Development',
    icon: '💻',
    description: 'Code analysis and development tools'
  },
  creative: {
    name: 'Creative',
    icon: '🎨',
    description: 'Creative writing and content generation'
  },
  research: {
    name: 'Research',
    icon: '📚',
    description: 'Research and information tools'
  }
}

// Get features by category
export const getFeaturesByCategory = (category) => {
  return Object.values(FEATURE_CONFIG).filter(feature => feature.category === category)
}

// Get enabled features
export const getEnabledFeatures = () => {
  return Object.values(FEATURE_CONFIG).filter(feature => feature.enabled)
}

// Get premium features
export const getPremiumFeatures = () => {
  return Object.values(FEATURE_CONFIG).filter(feature => feature.premium)
}

// Get free features
export const getFreeFeatures = () => {
  return Object.values(FEATURE_CONFIG).filter(feature => !feature.premium)
}

// Get feature by ID
export const getFeatureById = (id) => {
  return FEATURE_CONFIG[id] || null
}

// Check if feature is available
export const isFeatureAvailable = (id, isPremium = false) => {
  const feature = getFeatureById(id)
  if (!feature) return false
  if (!feature.enabled) return false
  if (feature.premium && !isPremium) return false
  return true
}

// Feature shortcuts mapping
export const FEATURE_SHORTCUTS = Object.values(FEATURE_CONFIG).reduce((acc, feature) => {
  if (feature.shortcut) {
    acc[feature.shortcut.toLowerCase()] = feature.id
  }
  return acc
}, {})

// Default feature order for display
export const FEATURE_ORDER = [
  FEATURES.CHAT,
  FEATURES.FILE_PROCESSOR,
  FEATURES.CODE_ANALYZER,
  FEATURES.TEXT_SUMMARIZER,
  FEATURES.LANGUAGE_TRANSLATOR,
  FEATURES.CREATIVE_WRITER,
  FEATURES.RESEARCH_ASSISTANT
]

// Feature prompts and instructions
export const FEATURE_PROMPTS = {
  [FEATURES.FILE_PROCESSOR]: {
    systemPrompt: 'You are a file processing assistant. Help users analyze, convert, and process their uploaded files.',
    welcomeMessage: 'Upload your files and I\'ll help you process them!',
    placeholder: 'Describe what you want to do with your files...'
  },
  
  [FEATURES.CODE_ANALYZER]: {
    systemPrompt: 'You are a code analysis expert. Review code for quality, bugs, performance, and best practices.',
    welcomeMessage: 'Upload your code files for analysis and review!',
    placeholder: 'Ask me to analyze your code or explain specific parts...'
  },
  
  [FEATURES.TEXT_SUMMARIZER]: {
    systemPrompt: 'You are a text summarization specialist. Create concise, accurate summaries of long texts.',
    welcomeMessage: 'Upload documents or paste text for summarization!',
    placeholder: 'Paste your text here or upload a document to summarize...'
  },
  
  [FEATURES.LANGUAGE_TRANSLATOR]: {
    systemPrompt: 'You are a professional translator. Provide accurate, context-aware translations between languages.',
    welcomeMessage: 'I can help you translate text between different languages!',
    placeholder: 'Enter text to translate or specify source and target languages...'
  },
  
  [FEATURES.CREATIVE_WRITER]: {
    systemPrompt: 'You are a creative writing assistant. Help users generate stories, poems, and creative content.',
    welcomeMessage: 'Let\'s create something amazing together!',
    placeholder: 'Describe what you want to write about...'
  },
  
  [FEATURES.RESEARCH_ASSISTANT]: {
    systemPrompt: 'You are a research assistant. Help users gather, analyze, and synthesize information.',
    welcomeMessage: 'I\'ll help you with your research needs!',
    placeholder: 'What would you like to research?'
  }
}