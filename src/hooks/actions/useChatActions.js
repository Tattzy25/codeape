import { useState, useRef } from 'react'
import groqService from '../../services/groqService'
import { messageAnalyzer } from '../../utils/messageAnalyzer'
import toast from 'react-hot-toast'

const useChatActions = ({ 
  messages, 
  setMessages, 
  updateRespectMeter, 
  setKyartuMood,
  saveToStorage 
}) => {
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)
  
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }
  
  const analyzeUserMessage = (message) => {
    return messageAnalyzer.analyze(message)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading || !groqService.isReady()) return
    
    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    }
    
    // Analyze user message for respect changes
    const analysis = analyzeUserMessage(inputMessage)
    if (analysis.respectChange !== 0) {
      updateRespectMeter(analysis.respectChange)
    }
    
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)
    
    // Create abort controller for this request
    abortControllerRef.current = new AbortController()
    
    try {
      const response = await groqService.sendMessage(
        newMessages,
        {
          onStream: (chunk) => {
            setStreamingMessage(prev => prev + chunk)
          },
          signal: abortControllerRef.current.signal
        }
      )
      
      if (response) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response,
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
        
        const finalMessages = [...newMessages, aiMessage]
        setMessages(finalMessages)
        saveToStorage(finalMessages)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sending message:', error)
        toast.error('Failed to send message. Please try again.')
      }
    } finally {
      setIsLoading(false)
      setIsTyping(false)
      setStreamingMessage('')
      abortControllerRef.current = null
      scrollToBottom()
    }
  }
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }
  
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
      setIsTyping(false)
      setStreamingMessage('')
      toast.success('Generation stopped')
    }
  }
  
  const handleReaction = (messageId, reaction) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, reaction }
          : msg
      )
    )
  }
  
  const clearChat = () => {
    setMessages([])
    saveToStorage([])
    toast.success('Chat cleared')
  }
  
  return {
    // State
    inputMessage,
    isLoading,
    isTyping,
    streamingMessage,
    inputRef,
    messagesEndRef,
    
    // Actions
    setInputMessage,
    handleSubmit,
    handleKeyPress,
    stopGeneration,
    handleReaction,
    clearChat,
    scrollToBottom
  }
}

export default useChatActions