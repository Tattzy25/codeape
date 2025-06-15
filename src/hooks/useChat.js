import { useState, useRef, useEffect, useCallback } from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { chatService } from '../services/chatService'
import { storageService } from '../services/storageService'

export const useChat = () => {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Load chat history on mount
  useEffect(() => {
    const savedMessages = storageService.getChatHistory()
    if (savedMessages.length > 0) {
      setMessages(savedMessages)
    }
  }, [])

  // Save messages to localStorage whenever messages change
  const saveToLocalStorage = useCallback(() => {
    storageService.saveChatHistory(messages)
  }, [messages])

  useEffect(() => {
    saveToLocalStorage()
  }, [saveToLocalStorage])

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Handle message submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!message.trim() || isStreaming) return

    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsTyping(true)
    setIsStreaming(true)

    // Create abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      // Handle search commands
      if (message.trim().startsWith('/search ')) {
        const query = message.trim().substring(8)
        const searchResults = await chatService.performSearch(query)
        
        const assistantMessage = {
          role: 'assistant',
          content: `Search results for "${query}":\n\n${searchResults}`,
          timestamp: new Date().toISOString()
        }
        
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
        setIsStreaming(false)
        return
      }

      // Regular chat message
      const response = await chatService.sendMessage(
        [...messages, userMessage],
        abortControllerRef.current.signal
      )

      let assistantContent = ''
      const assistantMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)

      // Handle streaming response
      for await (const chunk of response) {
        if (abortControllerRef.current?.signal.aborted) {
          break
        }
        
        assistantContent += chunk
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = {
            ...assistantMessage,
            content: assistantContent
          }
          return newMessages
        })
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted')
        return
      }
      
      console.error('Error sending message:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key and try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [message, messages, isStreaming])

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([])
    storageService.clearChatHistory()
  }, [])

  // Handle deep search
  const handleDeepSearch = useCallback(async () => {
    if (messages.length === 0) return
    
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user')
    if (!lastUserMessage) return

    setMessage(`/search ${lastUserMessage.content}`)
  }, [messages])

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsStreaming(false)
      setIsTyping(false)
    }
  }, [])

  return {
    messages,
    message,
    setMessage,
    isTyping,
    isStreaming,
    messagesEndRef,
    handleSubmit,
    clearChat,
    handleDeepSearch,
    stopStreaming,
    scrollToBottom
  }
}