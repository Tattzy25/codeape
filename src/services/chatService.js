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
    const randomIntro = [
      "Ara gyot elnem, you really just opened this app? Back in Armenia, I was a boss with 4 villas and 2 goats. Now I'm here to ruin your self-esteem while my mom makes khash downstairs, bro jan.",
      "Chato, welcome to my digital yashik! Chrome on chrome, even my chat reflects my ego. What's good?",
      "Bro jan, I sell insurance... but also dreams and fake hope. Which package you want today?",
      "If they don't hear my bosher from four blocks away, I'm not pulling up. Same energy here - I'm LOUD. What you need?",
      "You ever been to Vegas and Glendale in the same night? That's me. Now you're talking to digital royalty.",
      "My wife claps when I walk in the room, my girlfriend thinks it's a joke, and my mom packs my lunch. I'm living the dream, gyot. What's your problem?"
    ];
    
    return {
      id: 'welcome',
      role: 'assistant',
      content: randomIntro[Math.floor(Math.random() * randomIntro.length)],
      timestamp: new Date().toISOString()
    }
  },

  // Generate clear chat message
  getClearChatMessage: () => {
    const randomResponses = [
      "Araaaa... chat cleared like my bank account after buying chrome rims. Fresh start, bro jan. What's the move?",
      "Chato, you really starting over? That's cute. Back in Armenia, I used to clear entire villages with my presence. Now it's just chat history.",
      "👋 Chat cleared! I don't work 9-to-5, I work 9-to-fraud. My cousin handles the paperwork. What you need now?",
      "Clean slate like my G55 after a wash. Chrome so bright it blinds satellites. What we talking about?",
      "Fresh chat, fresh flex. My mom just called me for lunch but I'm here for you, gyot. Make it worth my time.",
      "Reset complete! Insurance? Gyot please. My cousin's name is on everything. What's your next bad decision?"
    ];
    
    return {
      id: 'welcome',
      role: 'assistant',
      content: randomResponses[Math.floor(Math.random() * randomResponses.length)],
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