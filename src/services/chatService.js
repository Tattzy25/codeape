// Chat service for managing AI chat operations
import { groqService } from './groqService'
import { tavilyService } from './tavilyService'

export const chatService = {
  apiKey: null,
  
  // Set API key
  setApiKey: (key) => {
    chatService.apiKey = key
    groqService.initialize(key)
  },

  // Check if service is ready
  isReady: () => {
    return groqService.isReady()
  },

  // Send message to AI
  sendMessage: async (messages, settings, onChunk) => {
    if (!groqService.isReady()) {
      throw new Error('API key not configured')
    }

    return await groqService.sendMessage(messages, settings, onChunk)
  },

  // Handle search commands
  handleSearch: async (query, isDeepSearch = false) => {
    try {
      const searchResults = isDeepSearch 
        ? await tavilyService.advancedSearch(query)
        : await tavilyService.search(query)
      
      return tavilyService.formatResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      throw new Error(`Search failed: ${error.message}`)
    }
  },

  // Test API key
  testApiKey: async (key) => {
    return await groqService.testApiKey(key)
  },

  // Generate welcome message
  getWelcomeMessage: () => {
    return {
      id: 'welcome',
      role: 'assistant',
      content: 'Araaaa… finally you showed up. Glendale\'s loudest is here. I got two phones, one stomach, zero filters. Let\'s ruin your self-esteem together, bro jan.',
      timestamp: new Date().toISOString()
    }
  },

  // Generate clear chat message
  getClearChatMessage: () => {
    return {
      id: 'welcome',
      role: 'assistant',
      content: '👋 Chat cleared! I\'m powered by lightning-fast AI models and web search capabilities.\n\n**Available Commands:**\n- Regular chat: Just type your message\n- Web search: `/search [query]`, `/web [query]`, or `/tavily [query]`\n\nHow can I help you today?',
      timestamp: new Date().toISOString()
    }
  },

  // Check if message is a search command
  isSearchCommand: (message) => {
    const searchCommands = ['/search', '/web', '/tavily']
    return searchCommands.some(cmd => message.toLowerCase().startsWith(cmd))
  },

  // Extract search query from command
  extractSearchQuery: (message) => {
    return message.replace(/^\/(search|web|tavily)\s*/i, '').trim()
  }
}