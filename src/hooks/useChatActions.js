import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'react-hot-toast'
import { groqService } from '../services/groqService'
import { elevenlabsService } from '../services/elevenlabsService'
import { tavilyService } from '../services/tavilyService'
import { memoryService } from '../services/memoryService'

export const useChatActions = (appState) => {
  const {
    messages, setMessages,
    inputMessage, setInputMessage,
    isLoading, setIsLoading,
    isTyping, setIsTyping,
    streamingMessage, setStreamingMessage,
    respectMeter, setRespectMeter,
    kyartuMood, setKyartuMood,
    chatHistory, setChatHistory,
    savedMoments, setSavedMoments,
    conversationInsights, setConversationInsights,

    abortControllerRef
  } = appState

  // Handle sending a message
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault()
    
    if (!inputMessage.trim() || isLoading || !groqService.isReady()) return
    
    // Create user message
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      reactions: []
    }
    
    // Update messages state
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)
    setStreamingMessage('')
    
    try {
      // Create abort controller
      abortControllerRef.current = new AbortController()
      
      // Analyze user message for insights
      analyzeUserMessage(userMessage.content)
      
      // Deep search if enabled
      let searchResults = null
      if (settings.deepSearch) {
        try {
          searchResults = await tavilyService.search(inputMessage)
        } catch (error) {
          console.error('Search error:', error)
          searchResults = null
        }
      }

      const response = await groqService.chat(
        messages.concat(userMessage),
        searchResults,
        abortControllerRef.current.signal,
        (chunk) => {
          setStreamingMessage(prev => prev + chunk)
        }
      )
      
      // Create assistant message
      const assistantMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        mood: response.mood || kyartuMood,
        reactions: []
      }
      
      // Update messages and mood
      setMessages(prev => [...prev, assistantMessage])
      if (response.mood) setKyartuMood(response.mood)
      if (response.respectChange) {
        setRespectMeter(prev => Math.max(0, Math.min(100, prev + response.respectChange)))
      }
      
      // Update chat history
      const historyItem = {
        id: uuidv4(),
        title: userMessage.content.slice(0, 30) + (userMessage.content.length > 30 ? '...' : ''),
        timestamp: new Date().toISOString(),
        messages: [userMessage, assistantMessage]
      }
      setChatHistory(prev => [historyItem, ...prev])
      
      // Update memory
      await memoryService.addMemory(userMessage, assistantMessage)
      
    } catch (error) {

      if (error.name !== 'AbortError') {
        console.error('Chat error:', error)
        toast.error('Failed to get response')
      }
    } finally {
      setIsLoading(false)
      setIsTyping(false)
      setStreamingMessage('')
      abortControllerRef.current = null
    }
  }, [inputMessage, isLoading, messages, kyartuMood, abortControllerRef])
  
  // Stop generation
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
      setIsTyping(false)
      setStreamingMessage('')
    }
  }, [])
  
  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([])
    setConversationInsights(null)
  }, [])
  
  // Handle key press (Enter to send)
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])
  
  // Handle reactions to messages
  const handleReaction = useCallback((messageId, reaction) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === reaction.emoji)
        
        if (existingReaction) {
          // Remove reaction if it exists
          return {
            ...msg,
            reactions: msg.reactions.filter(r => r.emoji !== reaction.emoji)
          }
        } else {
          // Add reaction
          return {
            ...msg,
            reactions: [...msg.reactions, reaction]
          }
        }
      }
      return msg
    }))
  }, [])
  
  // Save a moment (favorite message)
  const handleSaveMoment = useCallback((messageId) => {
    const message = messages.find(msg => msg.id === messageId)
    
    if (!message) return
    
    const isSaved = savedMoments.some(m => m.id === messageId)
    
    if (isSaved) {
      // Remove from saved moments
      setSavedMoments(prev => prev.filter(m => m.id !== messageId))
      toast.success('Moment removed from favorites')
    } else {
      // Add to saved moments
      setSavedMoments(prev => [message, ...prev])
      toast.success('Moment saved to favorites')
    }
  }, [messages, savedMoments])
  
  // Play voice for a message
  const handlePlayVoice = useCallback(async (messageId) => {
    const message = messages.find(msg => msg.id === messageId)
    
    if (!message || message.role !== 'assistant') return
    
    try {
      await elevenlabsService.speak(message.content)
    } catch (error) {
      console.error('Voice error:', error)
      toast.error('Failed to play voice')
    }
  }, [messages])
  
  // Analyze user message for insights
  const analyzeUserMessage = useCallback(async (content) => {
    try {
      const insights = await memoryService.analyzeMessage(content)
      if (insights) {
        setConversationInsights(insights)
      }
    } catch (error) {
      console.error('Analysis error:', error)
    }
  }, [])
  
  // Handle search command
  const handleSearchCommand = useCallback(async (query) => {
    try {
      setIsLoading(true)
      const results = await tavilyService.search(query)
      
      if (results && results.length > 0) {
        const searchMessage = {
          id: uuidv4(),
          role: 'system',
          content: `Search results for "${query}":\n\n${results.map(r => `- ${r.title}\n${r.url}`).join('\n\n')}`,
          timestamp: new Date().toISOString(),
          type: 'search',
          reactions: []
        }
        
        setMessages(prev => [...prev, searchMessage])
      } else {
        toast.error('No search results found')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Failed to search')
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  return {
    handleSubmit,
    stopGeneration,
    clearChat,
    handleKeyPress,
    handleReaction,
    handleSaveMoment,
    handlePlayVoice,
    handleSearchCommand,
    analyzeUserMessage
  }
}