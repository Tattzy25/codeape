// Storage service for managing localStorage operations

const STORAGE_KEYS = {
  API_KEY: 'groq_api_key',
  SETTINGS: 'app_settings',
  CHAT_HISTORY: 'chat_history'
}

export const storageService = {
  // API Key management
  getApiKey: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.API_KEY)
    } catch (error) {
      console.error('Failed to get API key from storage:', error)
      return null
    }
  },

  setApiKey: (apiKey) => {
    try {
      localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey)
    } catch (error) {
      console.error('Failed to save API key to storage:', error)
    }
  },

  removeApiKey: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.API_KEY)
    } catch (error) {
      console.error('Failed to remove API key from storage:', error)
    }
  },

  // Settings management
  getSettings: () => {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      return settings ? JSON.parse(settings) : null
    } catch (error) {
      console.error('Failed to get settings from storage:', error)
      return null
    }
  },

  setSettings: (settings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings to storage:', error)
    }
  },

  // Chat history management
  getChatHistory: () => {
    try {
      const history = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY)
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error('Failed to get chat history from storage:', error)
      return []
    }
  },

  setChatHistory: (messages) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages))
    } catch (error) {
      console.error('Failed to save chat history to storage:', error)
    }
  },

  clearChatHistory: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY)
    } catch (error) {
      console.error('Failed to clear chat history from storage:', error)
    }
  },

  // Clear all data
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('Failed to clear all storage:', error)
    }
  }
}

export { STORAGE_KEYS }