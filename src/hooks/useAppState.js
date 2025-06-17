import { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { groqService } from '../services/groqService'
import { elevenlabsService } from '../services/elevenlabsService'
import { tavilyService } from '../services/tavilyService'
import { memoryService } from '../services/memoryService'
import { storageService } from '../services/storageService'
import { fileService } from '../services/fileService'

export const useAppState = () => {
  // Core state
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [showSidebar, setShowSidebar] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [showAgeVerification, setShowAgeVerification] = useState(true)
  const [isUnderAge, setIsUnderAge] = useState(false)
  const [showLandingScreen, setShowLandingScreen] = useState(true)
  
  // User state
  const [userName, setUserName] = useState('')
  const [userGender, setUserGender] = useState('')
  const [respectMeter, setRespectMeter] = useState(50)
  const [kyartuMood, setKyartuMood] = useState('unbothered')
  
  // Chat and memory state
  const [chatHistory, setChatHistory] = useState([])
  const [savedMoments, setSavedMoments] = useState([])
  const [conversationInsights, setConversationInsights] = useState(null)
  
  // File processing state
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [processedFiles, setProcessedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingOptions, setProcessingOptions] = useState({
    autoFix: true,
    optimize: true,
    addComments: true,
    formatCode: true,
    followStandards: true
  })
  
  // Settings and features
  const [settings, setSettings] = useState({
    model: 'llama-3.1-70b-versatile',
    temperature: 0.7,
    maxTokens: 2048,
    voiceEnabled: false,
    autoScroll: true,
    theme: 'dark'
  })
  const [isDeepSearchEnabled, setIsDeepSearchEnabled] = useState(false)
  
  // Refs
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const abortControllerRef = useRef(null)
  
  // Auto-scroll functionality
  const scrollToBottom = useCallback(() => {
    if (settings.autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [settings.autoScroll])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])
  
  // Initialize app
  const initializeApp = useCallback(async () => {
    try {
      // Load saved data
      const savedMessages = storageService.getMessages()
      const savedHistory = storageService.getChatHistory()
      const savedMomentsData = storageService.getSavedMoments()
      const savedSettings = storageService.getSettings()
      const savedUserData = storageService.getUserData()
      
      if (savedMessages?.length > 0) setMessages(savedMessages)
      if (savedHistory?.length > 0) setChatHistory(savedHistory)
      if (savedMomentsData?.length > 0) setSavedMoments(savedMomentsData)
      if (savedSettings) setSettings(prev => ({ ...prev, ...savedSettings }))
      if (savedUserData) {
        setUserName(savedUserData.name || '')
        setUserGender(savedUserData.gender || '')
        setRespectMeter(savedUserData.respectMeter || 50)
      }
      
      // Initialize services
      await groqService.initialize()
      await elevenlabsService.initialize()
      await tavilyService.initialize()
      await memoryService.initialize()
      
    } catch (error) {
      console.error('Failed to initialize app:', error)
      toast.error('Failed to initialize application')
    }
  }, [])
  
  // Auto-initialize with environment API key
  useEffect(() => {
    const envApiKey = import.meta.env.VITE_GROQ_API_KEY
    if (envApiKey && !groqService.isReady()) {
      groqService.setApiKey(envApiKey)
      initializeApp()
    }
  }, [])
  
  // Save to storage
  const saveToStorage = useCallback(() => {
    try {
      storageService.saveMessages(messages)
      storageService.saveChatHistory(chatHistory)
      storageService.saveSavedMoments(savedMoments)
      storageService.saveSettings(settings)
      storageService.saveUserData({
        name: userName,
        gender: userGender,
        respectMeter
      })
    } catch (error) {
      console.error('Failed to save to storage:', error)
    }
  }, [messages, chatHistory, savedMoments, settings, userName, userGender, respectMeter])
  
  // Auto-save when data changes
  useEffect(() => {
    const timeoutId = setTimeout(saveToStorage, 1000)
    return () => clearTimeout(timeoutId)
  }, [saveToStorage])
  
  return {
    // State
    messages, setMessages,
    inputMessage, setInputMessage,
    isLoading, setIsLoading,
    isTyping, setIsTyping,
    streamingMessage, setStreamingMessage,
    showSidebar, setShowSidebar,
    showMobileMenu, setShowMobileMenu,
    showSettingsModal, setShowSettingsModal,
    showProcessingModal, setShowProcessingModal,
    showAgeVerification, setShowAgeVerification,
    isUnderAge, setIsUnderAge,
    showLandingScreen, setShowLandingScreen,
    userName, setUserName,
    userGender, setUserGender,
    respectMeter, setRespectMeter,
    kyartuMood, setKyartuMood,
    chatHistory, setChatHistory,
    savedMoments, setSavedMoments,
    conversationInsights, setConversationInsights,
    uploadedFiles, setUploadedFiles,
    processedFiles, setProcessedFiles,
    isProcessing, setIsProcessing,
    processingOptions, setProcessingOptions,
    settings, setSettings,
    isDeepSearchEnabled, setIsDeepSearchEnabled,
    
    // Refs
    messagesEndRef,
    inputRef,
    fileInputRef,
    abortControllerRef,
    
    // Functions
    scrollToBottom,
    initializeApp,
    saveToStorage
  }
}