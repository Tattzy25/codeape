// Application-wide constants

// Mood levels for Kyartu
export const MOOD_LEVELS = {
  HAPPY: 'happy',
  NEUTRAL: 'neutral',
  ANNOYED: 'annoyed',
  ANGRY: 'angry'
}

// Respect meter thresholds
export const RESPECT_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  FAIR: 40,
  POOR: 20,
  CRITICAL: 0
}

// File processing constants
export const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 10,
  SUPPORTED_TYPES: [
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
    'application/javascript',
    'text/html',
    'text/css',
    'text/xml',
    'application/xml',
    'text/yaml',
    'application/x-yaml'
  ],
  SUPPORTED_EXTENSIONS: [
    '.txt', '.md', '.csv', '.json', '.js', '.jsx', '.ts', '.tsx',
    '.html', '.css', '.xml', '.yml', '.yaml', '.py', '.java',
    '.cpp', '.c', '.h', '.php', '.rb', '.go', '.rs', '.swift'
  ]
}

// Chat constants
export const CHAT_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 4000,
  TYPING_DELAY: 1000,
  STREAM_DELAY: 50,
  MAX_HISTORY: 100,
  AUTO_SAVE_INTERVAL: 30000 // 30 seconds
}

// Phone call constants
export const CALL_CONSTANTS = {
  COOLDOWN_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_CALL_DURATION: 30 * 60 * 1000, // 30 minutes
  RING_DURATION: 10000 // 10 seconds
}

// API constants
export const API_CONSTANTS = {
  GROQ_BASE_URL: 'https://api.groq.com/openai/v1',
  DEFAULT_MODEL: 'llama-3.1-70b-versatile',
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7,
  REQUEST_TIMEOUT: 30000 // 30 seconds
}

// Storage keys
export const STORAGE_KEYS = {
  API_KEY: 'groq_api_key',
  USER_NAME: 'userName',
  USER_GENDER: 'userGender',
  USER_ID: 'userId',
  RESPECT_METER: 'respectMeter',
  KYARTU_MOOD: 'kyartuMood',
  CHAT_HISTORY: 'chatHistory',
  CHAT_SETTINGS: 'chatSettings',
  SAVED_MOMENTS: 'savedMoments',
  CALL_COOLDOWN: 'callCooldown',
  LAST_ACTIVE: 'lastActive',
  THEME: 'theme',
  LANGUAGE: 'language'
}

// UI constants
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
  INPUT_HEIGHT: 120,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000
}

// Feature types
export const FEATURES = {
  CHAT: 'chat',
  FILE_PROCESSOR: 'file-processor',
  CODE_ANALYZER: 'code-analyzer',
  TEXT_SUMMARIZER: 'text-summarizer',
  LANGUAGE_TRANSLATOR: 'language-translator',
  CREATIVE_WRITER: 'creative-writer',
  RESEARCH_ASSISTANT: 'research-assistant'
}

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}

// Language constants
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  RU: 'ru',
  JA: 'ja',
  KO: 'ko',
  ZH: 'zh'
}

// Error messages
export const ERROR_MESSAGES = {
  API_KEY_REQUIRED: 'API key is required to use this feature',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit',
  UNSUPPORTED_FILE_TYPE: 'File type is not supported',
  TOO_MANY_FILES: 'Too many files selected',
  NETWORK_ERROR: 'Network error occurred',
  PROCESSING_ERROR: 'Error processing your request',
  INVALID_INPUT: 'Invalid input provided',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded, please try again later'
}

// Success messages
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'File uploaded successfully',
  FILES_PROCESSED: 'Files processed successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  API_KEY_SAVED: 'API key saved successfully',
  CHAT_CLEARED: 'Chat history cleared',
  MOMENT_SAVED: 'Moment saved successfully'
}

// Default values
export const DEFAULTS = {
  RESPECT_METER: 50,
  KYARTU_MOOD: MOOD_LEVELS.NEUTRAL,
  THEME: THEMES.AUTO,
  LANGUAGE: LANGUAGES.EN,
  CHAT_SETTINGS: {
    model: API_CONSTANTS.DEFAULT_MODEL,
    temperature: API_CONSTANTS.TEMPERATURE,
    maxTokens: API_CONSTANTS.MAX_TOKENS,
    systemPrompt: 'You are Kyartu, a helpful AI assistant.'
  }
}

// Validation patterns
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  API_KEY: /^gsk_[a-zA-Z0-9]{48}$/,
  URL: /^https?:\/\/.+/
}

// Animation variants for Framer Motion
export const ANIMATIONS = {
  FADE_IN: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  SLIDE_UP: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  },
  SLIDE_IN_RIGHT: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.3 }
  },
  SCALE: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3 }
  }
}