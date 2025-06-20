import { DEFAULTS, THEMES, LANGUAGES, API_CONSTANTS } from './appConstants'

// Default application settings
export const DEFAULT_SETTINGS = {
  // User preferences
  theme: DEFAULTS.THEME,
  language: DEFAULTS.LANGUAGE,
  
  // Chat settings
  chat: {
    model: API_CONSTANTS.DEFAULT_MODEL,
    temperature: API_CONSTANTS.TEMPERATURE,
    maxTokens: API_CONSTANTS.MAX_TOKENS,
    systemPrompt: DEFAULTS.CHAT_SETTINGS.systemPrompt,
    streamResponse: true,
    showTypingIndicator: true,
    autoSave: true,
    saveInterval: 30000, // 30 seconds
    maxHistoryLength: 100
  },
  
  // UI settings
  ui: {
    sidebarCollapsed: false,
    showWelcomeMessage: true,
    showShortcuts: true,
    animationsEnabled: true,
    soundEnabled: true,
    notificationsEnabled: true,
    compactMode: false,
    fontSize: 'medium', // small, medium, large
    messageSpacing: 'normal' // compact, normal, relaxed
  },
  
  // File processing settings
  fileProcessing: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    autoProcess: false,
    showPreview: true,
    compressionEnabled: true,
    backupEnabled: true
  },
  
  // Privacy settings
  privacy: {
    saveHistory: true,
    shareAnalytics: false,
    allowCookies: true,
    dataRetention: 30, // days
    encryptStorage: true
  },
  
  // Accessibility settings
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
    textToSpeech: false
  },
  
  // Developer settings
  developer: {
    debugMode: false,
    showApiCalls: false,
    logLevel: 'info', // error, warn, info, debug
    enableDevTools: false,
    mockApi: false
  },
  
  // Experimental features
  experimental: {
    voiceInput: false,
    gestureControls: false,
    aiSuggestions: false,
    smartCompletion: false,
    contextAwareness: true
  }
}

// Available models for chat
export const AVAILABLE_MODELS = [
  {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B',
    description: 'Most capable model for complex tasks',
    maxTokens: 4096,
    recommended: true
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B',
    description: 'Fast responses for quick tasks',
    maxTokens: 4096,
    recommended: false
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    description: 'Good balance of speed and capability',
    maxTokens: 32768,
    recommended: false
  },
  {
    id: 'gemma-7b-it',
    name: 'Gemma 7B',
    description: 'Efficient model for general tasks',
    maxTokens: 8192,
    recommended: false
  }
]

// Theme configurations
export const THEME_CONFIG = {
  [THEMES.LIGHT]: {
    name: 'Light',
    description: 'Clean and bright interface',
    icon: '☀️',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      border: '#e2e8f0'
    }
  },
  [THEMES.DARK]: {
    name: 'Dark',
    description: 'Easy on the eyes in low light',
    icon: '🌙',
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      border: '#334155'
    }
  },
  [THEMES.AUTO]: {
    name: 'Auto',
    description: 'Follows system preference',
    icon: '🔄',
    colors: null // Uses system preference
  }
}

// Language configurations
export const LANGUAGE_CONFIG = {
  [LANGUAGES.EN]: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false
  },
  [LANGUAGES.ES]: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false
  },
  [LANGUAGES.FR]: {
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false
  },
  [LANGUAGES.DE]: {
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false
  },
  [LANGUAGES.IT]: {
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    rtl: false
  },
  [LANGUAGES.PT]: {
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    rtl: false
  },
  [LANGUAGES.RU]: {
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    rtl: false
  },
  [LANGUAGES.JA]: {
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false
  },
  [LANGUAGES.KO]: {
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    rtl: false
  },
  [LANGUAGES.ZH]: {
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false
  }
}

// Font size configurations
export const FONT_SIZE_CONFIG = {
  small: {
    name: 'Small',
    baseSize: '14px',
    scale: 0.875
  },
  medium: {
    name: 'Medium',
    baseSize: '16px',
    scale: 1
  },
  large: {
    name: 'Large',
    baseSize: '18px',
    scale: 1.125
  }
}

// Message spacing configurations
export const MESSAGE_SPACING_CONFIG = {
  compact: {
    name: 'Compact',
    spacing: '0.5rem',
    padding: '0.75rem'
  },
  normal: {
    name: 'Normal',
    spacing: '1rem',
    padding: '1rem'
  },
  relaxed: {
    name: 'Relaxed',
    spacing: '1.5rem',
    padding: '1.25rem'
  }
}

// Notification settings
export const NOTIFICATION_CONFIG = {
  types: {
    success: {
      duration: 3000,
      sound: true,
      icon: '✅'
    },
    error: {
      duration: 5000,
      sound: true,
      icon: '❌'
    },
    warning: {
      duration: 4000,
      sound: false,
      icon: '⚠️'
    },
    info: {
      duration: 3000,
      sound: false,
      icon: 'ℹ️'
    }
  },
  positions: [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right'
  ],
  defaultPosition: 'top-right'
}

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  'ctrl+k': 'Open settings',
  'ctrl+m': 'Open moments',
  'ctrl+l': 'Clear chat',
  'ctrl+n': 'New chat',
  'ctrl+s': 'Save current chat',
  'ctrl+o': 'Open file',
  'ctrl+shift+d': 'Toggle dark mode',
  'ctrl+shift+s': 'Toggle sidebar',
  'ctrl+enter': 'Send message',
  'escape': 'Close modal/Cancel',
  'ctrl+/': 'Show shortcuts'
}

// Export utility functions
export const getDefaultSettings = () => ({ ...DEFAULT_SETTINGS })

export const mergeSettings = (userSettings) => {
  return {
    ...DEFAULT_SETTINGS,
    ...userSettings,
    chat: {
      ...DEFAULT_SETTINGS.chat,
      ...userSettings?.chat
    },
    ui: {
      ...DEFAULT_SETTINGS.ui,
      ...userSettings?.ui
    },
    fileProcessing: {
      ...DEFAULT_SETTINGS.fileProcessing,
      ...userSettings?.fileProcessing
    },
    privacy: {
      ...DEFAULT_SETTINGS.privacy,
      ...userSettings?.privacy
    },
    accessibility: {
      ...DEFAULT_SETTINGS.accessibility,
      ...userSettings?.accessibility
    },
    developer: {
      ...DEFAULT_SETTINGS.developer,
      ...userSettings?.developer
    },
    experimental: {
      ...DEFAULT_SETTINGS.experimental,
      ...userSettings?.experimental
    }
  }
}

export const validateSettings = (settings) => {
  // Add validation logic here
  return true
}