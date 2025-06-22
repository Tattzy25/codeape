import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import './App.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Zap, MessageCircle, Menu } from 'lucide-react'
import toast from 'react-hot-toast'
import JSZip from 'jszip'

// Components
import ChatMessage from './components/ChatMessage'
import Modals from './components/Modals'
import TypingIndicator from './components/TypingIndicator'
import LandingScreen from './components/LandingScreen'
import Header from './components/Header'
import useSearch from './hooks/useSearch'
import Sidebar from './components/Sidebar'
import PhoneCallScreen from './components/PhoneCallScreen'

// Layout Components
import AppLayout from './components/layout/AppLayout'
import MainDisplay from './components/layout/MainDisplay'
import InputBar from './components/layout/InputBar'

// Features
import * as features from './features'

// Services
import groqService, { DEFAULT_SETTINGS } from './services/groqService'
import redisService from './services/redisService'
import { storageService } from './services/storageService'
import tavilyService from './services/tavilyService'
import elevenlabsService from './services/elevenlabsService'

// Constants
const STORAGE_KEYS = {
  API_KEY: 'groq_api_key',
  SETTINGS: 'groq_settings',
  CHAT_HISTORY: 'groq_chat_history'
}

const WELCOME_MESSAGES = {
  default: 'Araaa… finally. You look stressed. Sit down. Let\'s ruin your self-esteem together.',
  unbothered: 'Araaa… finally. You look stressed. Sit down. Let\'s ruin your self-esteem together.',
  flirty: 'Well, well, well... look what the cat dragged in. I\'m Kyartu, and you\'re about to be entertained.',
  savage: 'Oh great, another human who thinks they\'re special. Let me guess, you need my help?',
  emotional: 'Hey there... you look like you need someone to talk to. I\'m here, I guess.',
  annoyed: 'Ugh, what do you want? Make it quick, I have better things to do.'
}

const RESPECT_KEYWORDS = {
  positive: ['please', 'thank you', 'thanks', 'appreciate', 'respect', 'love', 'amazing', 'great', 'awesome'],
  negative: ['stupid', 'dumb', 'hate', 'shut up', 'boring', 'useless', 'trash', 'garbage']
}

function App() {
  // Generate unique IDs for Redis
  const [sessionId] = useState(() => redisService.generateSessionId());
  const [userId] = useState(() => redisService.generateUserId());
  
  // State management
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GROQ_API_KEY || '')
  const [isTyping, setIsTyping] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [processingOptions, setProcessingOptions] = useState({
    autoFix: true,
    optimize: true,
    addComments: false,
    formatCode: true,
    followStandards: true
  })
  const [processedFiles, setProcessedFiles] = useState([])
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isDeepSearchEnabled, setIsDeepSearchEnabled] = useState(false)
  
  // Kyartu Vzgo specific state
  const [showLandingScreen, setShowLandingScreen] = useState(true)
  const [userName, setUserName] = useState('')
  const [userGender, setUserGender] = useState('neutral')
  const [kyartuMood, setKyartuMood] = useState('unbothered')
  const [respectMeter, setRespectMeter] = useState(50)
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showArmoLobby, setShowArmoLobby] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false)

  const featureComponents = {
    'Call Kyartu Ara': features.CallKyartuAra,
    'Make Me Famous Ara': features.MakeMeFamousAra,
    'You\'re Hired Ara': features.YoureHiredAra,
    'Smoke & Roast Ara': features.SmokeAndRoastAra,
    'Therapy Session': features.TherapySession,
    'Give Me Alibi Ara': features.GiveMeAlibiAra,
    'Find Me Forever Man/Wife': features.FindMeForeverManWife,
    'Coming Soon 1': features.ComingSoon1,
    'Coming Soon 2': features.ComingSoon2,
    'Coming Soon 3': features.ComingSoon3,
  };

  const [savedMoments, setSavedMoments] = useState([])
  const [chatHistory, setChatHistory] = useState([])
  
  // Phone call state
  const [showPhoneCall, setShowPhoneCall] = useState(false)
  const [lastCallTime, setLastCallTime] = useState(null)
  const [callCooldownActive, setCallCooldownActive] = useState(false)
  
  // Mobile menu state
  // showMobileMenu state is already declared above
  
  // Sidebar collapsed state is already declared above
  
  // Mobile menu handler
  const closeMobileMenu = useCallback(() => {
    setShowMobileMenu(false)
  }, [])

  // Handle returning to Armo Lobby
  const handleReturnToLobby = () => {
    setSelectedFeature(null)
    setShowArmoLobby(true)
  }

  const handleSelectFeature = (feature) => {
    setSelectedFeature(feature)
    setShowArmoLobby(false)
  }


  // Refs
  const inputRef = useRef(null)
  const abortControllerRef = useRef(null)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Initialize app
  useEffect(() => {
    initializeApp()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, streamingMessage])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

  // Initialize application state
  const initializeApp = useCallback(async () => {
    try {
      // Initialize user in Redis
      await redisService.initializeUser(userId, sessionId)
      
      // Load API key - prioritize environment variable
      const envApiKey = import.meta.env.VITE_GROQ_API_KEY
      const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY) // Keep API keys in localStorage for security
      
      if (envApiKey) {
        setApiKey(envApiKey)
        groqService.initialize(envApiKey)
        setShowApiKeyModal(false)
      } else if (savedApiKey) {
        setApiKey(savedApiKey)
        groqService.initialize(savedApiKey)
        setShowApiKeyModal(false)
      } else {
        // setShowApiKeyModal(true) // Disabled automatic API key modal
      }

      // Load user preferences from Redis
      const userPrefs = await redisService.getUserPreferences(userId)
      setSettings({ ...DEFAULT_SETTINGS, ...userPrefs })

      // Load session state from Redis
      const sessionState = await redisService.getSessionState(sessionId)
      setKyartuMood(sessionState.currentMode || 'unbothered')
      
      // Load respect meter from Redis
      const respectScore = await redisService.getRespectMeter(userId)
      setRespectMeter(respectScore * 20) // Convert 0-5 scale to 0-100
      
      // Load chat history from Redis
      const savedHistory = await redisService.getChatHistory(sessionId)
      if (savedHistory && savedHistory.length > 0) {
        setMessages(savedHistory)
      } else {
        // Add welcome message based on detected gender/mood
        const welcomeMessage = {
          id: redisService.generateMessageId(),
          role: 'assistant',
          content: WELCOME_MESSAGES.unbothered,
          timestamp: new Date().toISOString(),
          mood: 'unbothered',
          reactions: []
        }
        setMessages([welcomeMessage])
        await redisService.storeChatHistory(sessionId, [welcomeMessage])
      }
      
      // Update last seen timestamp
      await redisService.updateLastSeen(userId)
      
    } catch (error) {
      console.error('Failed to initialize app:', error)
      toast.error('Failed to load saved data')
      
      // Fallback to localStorage if Redis fails
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) })
      }
    }
  }, [userId, sessionId])

  // Analyze user message for Kyartu features
  const analyzeUserMessage = useCallback((content) => {
    const lowerContent = content.toLowerCase();
    let respectChange = 0;
    let containsJoke = false;
    let suggestedMood = null;
    
    // Respect meter analysis
    RESPECT_KEYWORDS.positive.forEach(word => {
      if (lowerContent.includes(word)) respectChange += 0.2;
    });
    
    RESPECT_KEYWORDS.negative.forEach(word => {
      if (lowerContent.includes(word)) respectChange -= 0.3;
    });
    
    // Joke detection
    const jokeIndicators = ['haha', 'lol', 'funny', 'joke', '😂', '🤣', 'lmao', 'rofl'];
    containsJoke = jokeIndicators.some(indicator => lowerContent.includes(indicator));
    
    // Mood suggestions based on content
    if (lowerContent.includes('flirt') || lowerContent.includes('cute') || lowerContent.includes('beautiful')) {
      suggestedMood = 'flirty';
    } else if (lowerContent.includes('roast') || lowerContent.includes('savage') || lowerContent.includes('burn')) {
      suggestedMood = 'savage';
    } else if (lowerContent.includes('sad') || lowerContent.includes('depressed') || lowerContent.includes('crying')) {
      suggestedMood = 'emotional';
    } else if (lowerContent.includes('angry') || lowerContent.includes('mad') || lowerContent.includes('furious')) {
      suggestedMood = 'annoyed';
    }
    
    return {
      respectChange: Math.round(respectChange * 10) / 10, // Round to 1 decimal
      containsJoke,
      suggestedMood
    };
  }, []);

  // Save data to localStorage
  const saveToStorage = useCallback((key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, [])

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Handle API key submission
  const handleApiKeySubmit = useCallback(async (newApiKey) => {
    try {
      setIsLoading(true)
      
      // Test the API key
      const testResult = await groqService.testApiKey(newApiKey)
      
      if (testResult.valid) {
        setApiKey(newApiKey)
        localStorage.setItem(STORAGE_KEYS.API_KEY, newApiKey)
        groqService.initialize(newApiKey)
        setShowApiKeyModal(false)
        toast.success('API key validated successfully!')
      } else {
        throw new Error(testResult.error)
      }
    } catch (error) {
      toast.error(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-initialize with environment API key and determine if modal should show
  useEffect(() => {
    const envApiKey = import.meta.env.VITE_GROQ_API_KEY
    if (envApiKey) {
      setApiKey(envApiKey)
      setShowApiKeyModal(false)
    } else if (!apiKey) {
      // setShowApiKeyModal(true) // Disabled automatic API key modal
    }
  }, [apiKey])

  // Handle settings update
  const handleSettingsUpdate = useCallback(async (newSettings) => {
    try {
      setSettings(newSettings)
      await redisService.storeUserPreferences(userId, newSettings)
      setShowSettingsModal(false)
      toast.success('Settings updated!')
    } catch (error) {
      console.error('Failed to save settings to Redis:', error)
      // Fallback to localStorage
      saveToStorage(STORAGE_KEYS.SETTINGS, newSettings)
      toast.success('Settings updated (saved locally)!')
    }
  }, [userId, saveToStorage])

  // Handle search commands
  const handleSearchCommand = useCallback(async (userMessage, newMessages) => {
    const searchQuery = userMessage.content.replace(/^\/(search|web|tavily)\s*/i, '').trim();
    
    if (!searchQuery) {
      throw new Error('Please provide a search query. Example: /search renewable energy benefits');
    }

    setStreamingMessage(isDeepSearchEnabled ? '🔍 Deep searching the web...' : '🔍 Searching the web...');
    const searchResults = isDeepSearchEnabled 
      ? await tavilyService.advancedSearch(searchQuery)
      : await tavilyService.search(searchQuery);
  
    const formattedResults = tavilyService.formatResults(searchResults);
      
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: formattedResults.formatted,
      timestamp: new Date().toISOString(),
      isSearchResult: true,
      searchQuery: searchQuery,
      resultCount: formattedResults.resultCount
    };

    const finalMessages = [...newMessages, aiMessage];
    setMessages(finalMessages);
    
    try {
      await redisService.storeChatHistory(sessionId, finalMessages);
      await redisService.cacheSearchResults(searchQuery, searchResults);
      await redisService.updateLastSeen(userId);
    } catch (error) {
      console.error('Failed to save to Redis:', error);
      saveToStorage(STORAGE_KEYS.CHAT_HISTORY, finalMessages);
    }
  }, [isDeepSearchEnabled, sessionId, userId, saveToStorage, setStreamingMessage, setMessages]);

  // Memoized conversation history preparation
  const prepareConversationHistory = useMemo(() => {
    return (messages) => messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }, []);

  // Handle regular chat messages
  const handleChatMessage = useCallback(async (userMessage, newMessages) => {
    const conversationHistory = prepareConversationHistory(newMessages);

    const onChunk = (chunk) => {
      setStreamingMessage(prev => prev + chunk);
    };

    const response = await groqService.sendMessage(
      conversationHistory,
      settings,
      onChunk
    );

    const messageAnalysis = analyzeUserMessage(userMessage.content);
    
    const aiMessage = {
      id: redisService.generateMessageId(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toISOString(),
      usage: response.usage,
      model: response.model,
      mood: kyartuMood,
      reactions: []
    };

    const finalMessages = [...newMessages, aiMessage];
    setMessages(finalMessages);
    
    await saveMessageAndUpdateState(finalMessages, messageAnalysis, userMessage);
  }, [settings, kyartuMood, analyzeUserMessage, setStreamingMessage, setMessages, prepareConversationHistory]);

  // Save message and update Kyartu state
  const saveMessageAndUpdateState = useCallback(async (finalMessages, messageAnalysis, userMessage) => {
    try {
      await redisService.storeChatHistory(sessionId, finalMessages);
      
      if (messageAnalysis.respectChange !== 0) {
        const currentRespect = await redisService.getRespectMeter(userId);
        const newRespect = Math.max(0, Math.min(5, currentRespect + messageAnalysis.respectChange));
        await redisService.storeRespectMeter(userId, newRespect);
        setRespectMeter(newRespect * 20);
      }
      
      if (messageAnalysis.containsJoke) {
        await redisService.addUserJoke(userId, userMessage.content);
      }
      
      if (messageAnalysis.suggestedMood && messageAnalysis.suggestedMood !== kyartuMood) {
        await redisService.storeMoodMeter(userId, messageAnalysis.suggestedMood);
        setKyartuMood(messageAnalysis.suggestedMood);
      }
      
      await redisService.storeSessionState(sessionId, {
        currentMode: kyartuMood,
        lastPage: 'chat',
        lastInteraction: Date.now()
      });
      
      await redisService.updateLastSeen(userId);
      
    } catch (error) {
      console.error('Failed to save to Redis:', error);
      saveToStorage(STORAGE_KEYS.CHAT_HISTORY, finalMessages);
    }
  }, [sessionId, userId, kyartuMood, saveToStorage]);

  // Handle message submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;
    
    if (!groqService.isReady()) {
      // setShowApiKeyModal(true); // Disabled automatic API key modal
      toast.error('Please configure your API key in settings first.');
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);
    setStreamingMessage('');

    try {
      abortControllerRef.current = new AbortController();

      const searchCommands = ['/search', '/web', '/tavily'];
      const isSearchCommand = searchCommands.some(cmd => userMessage.content.toLowerCase().startsWith(cmd));
      
      if (isSearchCommand) {
        await handleSearchCommand(userMessage, newMessages);
        return;
      }

      await handleChatMessage(userMessage, newMessages);

    } catch (error) {
      console.error('Chat error:', error)
      
      if (error.name !== 'AbortError') {
        toast.error(error.message)
        
        // Add error message to chat
        const errorMessage = {
          id: redisService.generateMessageId(),
          role: 'assistant',
          content: `❌ Sorry, I encountered an error: ${error.message}`,
          timestamp: new Date().toISOString(),
          isError: true,
          mood: 'annoyed'
        }
        
        const errorMessages = [...newMessages, errorMessage]
        setMessages(errorMessages)
        
        // Save error to Redis
        try {
          await redisService.storeChatHistory(sessionId, errorMessages);
          await redisService.updateLastSeen(userId);
        } catch (redisError) {
          console.error('Failed to save error to Redis:', redisError);
          saveToStorage(STORAGE_KEYS.CHAT_HISTORY, errorMessages);
        }
      }
    } finally {
      setIsLoading(false)
      setIsTyping(false)
      setStreamingMessage('')
      abortControllerRef.current = null
      inputRef.current?.focus()
    }
  }, [inputMessage, messages, settings, isLoading, saveToStorage, isDeepSearchEnabled, userId, sessionId, kyartuMood, handleSearchCommand, handleChatMessage])

  // Handle emoji reactions
  const handleReaction = useCallback(async (messageId, emoji) => {
    try {
      await redisService.addReaction(messageId, emoji, userId);
      
      // Update local state to show reaction immediately
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.id === messageId) {
            const reactions = msg.reactions || [];
            const existingReaction = reactions.find(r => r.emoji === emoji);
            
            if (existingReaction) {
              existingReaction.count++;
              if (!existingReaction.users.includes(userId)) {
                existingReaction.users.push(userId);
              }
            } else {
              reactions.push({ emoji, count: 1, users: [userId] });
            }
            
            return { ...msg, reactions };
          }
          return msg;
        })
      );
      
      // Update respect based on reaction type
      let respectChange = 0;
      if (['😂', '🤣', '💀', '🔥'].includes(emoji)) respectChange = 0.1;
      else if (['😭', '💔', '😡'].includes(emoji)) respectChange = -0.1;
      
      if (respectChange !== 0) {
        const currentRespect = await redisService.getRespectMeter(userId);
        const newRespect = Math.max(0, Math.min(5, currentRespect + respectChange));
        await redisService.storeRespectMeter(userId, newRespect);
        setRespectMeter(newRespect * 20);
      }
      
    } catch (error) {
      console.error('Failed to add reaction:', error);
      toast.error('Failed to add reaction');
    }
  }, [userId]);

  // Handle saving moments
  const handleSaveMoment = useCallback(async (message) => {
    try {
      const moment = {
        id: message.id,
        content: message.content,
        timestamp: message.timestamp,
        mood: message.mood || kyartuMood,
        savedAt: Date.now()
      };
      
      setSavedMoments(prev => [...prev, moment]);
      toast.success('Moment saved!');
      
      // Could also save to Redis if needed
      // await redisService.set(`saved_moment:${userId}:${message.id}`, moment, redisService.TTL.USER_PREFS);
      
    } catch (error) {
      console.error('Failed to save moment:', error);
      toast.error('Failed to save moment');
    }
  }, [userId, kyartuMood]);

  // Handle voice playback with ElevenLabs
  const handlePlayVoice = useCallback(async (message) => {
    try {
      const textContent = typeof message === 'string' ? message : message.content;
      if (!textContent) {
        toast.error('No text content to play');
        return;
      }

      toast.loading('Generating speech...', { id: 'tts-loading' });
      await elevenlabsService.textToSpeech(textContent);
      toast.success('Speech playback completed', { id: 'tts-loading' });
    } catch (error) {
      console.error('Voice playback error:', error);
      toast.error(`Voice playback failed: ${error.message}`, { id: 'tts-loading' });
    }
  }, []);

  // Handle input key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [handleSubmit])

  // Stop current generation
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
      setIsTyping(false)
      setStreamingMessage('')
      toast.success('Generation stopped')
    }
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback(async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    const maxSize = 10 * 1024 * 1024 // 10MB limit
    const processedFiles = []

    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`)
        continue
      }

      try {
        if (file.name.endsWith('.zip')) {
          // Handle zip files
          const zip = new JSZip()
          const zipContent = await zip.loadAsync(file)
          
          for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
            if (!zipEntry.dir && filename.match(/\.(txt|md|js|jsx|ts|tsx|py|java|cpp|c|h|css|html|json|xml|yaml|yml)$/i)) {
              const content = await zipEntry.async('text')
              processedFiles.push({
                name: filename,
                content: content,
                type: 'text',
                size: content.length
              })
            }
          }
          toast.success(`Extracted ${Object.keys(zipContent.files).length} files from ${file.name}`)
        } else if (file.type.startsWith('text/') || file.name.match(/\.(txt|md|js|jsx|ts|tsx|py|java|cpp|c|h|css|html|json|xml|yaml|yml)$/i)) {
          // Handle text files
          const content = await file.text()
          processedFiles.push({
            name: file.name,
            content: content,
            type: 'text',
            size: file.size
          })
        } else {
          toast.error(`File type not supported: ${file.name}`)
        }
      } catch (error) {
        console.error('Error processing file:', error)
        toast.error(`Error processing ${file.name}: ${error.message}`)
      }
    }

    if (processedFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...processedFiles])
      
      // Create a message with file contents
      const fileContents = processedFiles.map(file => 
        `**File: ${file.name}**\n\`\`\`\n${file.content}\n\`\`\``
      ).join('\n\n')
      
      const fileMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: `I've uploaded ${processedFiles.length} file(s). Please analyze them:\n\n${fileContents}`,
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, fileMessage])
      toast.success(`Uploaded ${processedFiles.length} file(s) successfully`)
    }

    // Reset file input
    event.target.value = ''
  }, [])

  // Trigger file upload
  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Kyartu-specific handlers

  const handleToggleSidebar = useCallback(() => {
    setShowSidebar(!showSidebar)
  }, [showSidebar])

  const handleStartChat = useCallback((name, gender) => {
    setUserName(name)
    setUserGender(gender)
    setShowLandingScreen(false)
    
    // Update welcome message based on gender
    const welcomeMessages = {
      female: "Shat lav eli, who let this beauty in? I'm Kyartu Vzgo — I flirt, I flex, and I got flowers in the car. You hungry? Emotionally or actually?",
      male: "Ara gyot elnem, you need help from Kyartu? Say less. I don't fix lives. I just roast 'em till you feel better.",
      other: "Welcome to Glendale therapy, where your problems get laughed at — professionally. I'm Kyartu. I got life advice and leftover khash. Pick one."
    }
    
    const welcomeMessage = {
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessages[gender] || welcomeMessages.other,
      timestamp: new Date().toISOString(),
      mood: 'unbothered',
      reactions: []
    }
    
    setMessages([welcomeMessage])
  }, [])

  // Phone call handlers
  const handleStartPhoneCall = useCallback(async () => {
    // Check cooldown period (1 hour = 3600000 ms)
    const now = Date.now()
    const cooldownPeriod = 60 * 60 * 1000 // 1 hour in milliseconds
    
    if (lastCallTime && (now - lastCallTime) < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - (now - lastCallTime)) / (60 * 1000)) // minutes
      toast.error(`Kyartu is busy making money! Try again in ${remainingTime} minutes, ara.`)
      return
    }
    
    // Store call attempt in Redis for persistence
    try {
      await redisService.storeCallAttempt(userId, now)
    } catch (error) {
      console.error('Failed to store call attempt:', error)
      // Fallback to localStorage
      localStorage.setItem('lastCallTime', now.toString())
    }
    
    setLastCallTime(now)
    setShowPhoneCall(true)
    setShowLandingScreen(false)
  }, [lastCallTime, userId])

  const handleEndPhoneCall = useCallback(() => {
    setShowPhoneCall(false)
    setShowLandingScreen(true)
  }, [])

  // Check for existing call cooldown on app load
  useEffect(() => {
    const checkCallCooldown = async () => {
      try {
        const lastCall = await redisService.getLastCallTime(userId)
        if (lastCall) {
          const now = Date.now()
          const cooldownPeriod = 60 * 60 * 1000 // 1 hour
          
          if ((now - lastCall) < cooldownPeriod) {
            setLastCallTime(lastCall)
            setCallCooldownActive(true)
          }
        }
      } catch (error) {
        console.error('Failed to check call cooldown:', error)
        // Fallback to localStorage
        const localLastCall = localStorage.getItem('lastCallTime')
        if (localLastCall) {
          const lastCall = parseInt(localLastCall)
          const now = Date.now()
          const cooldownPeriod = 60 * 60 * 1000
          
          if ((now - lastCall) < cooldownPeriod) {
            setLastCallTime(lastCall)
            setCallCooldownActive(true)
          }
        }
      }
    }
    
    checkCallCooldown()
  }, [userId])

  return (
    <AppLayout>
      {/* Show Landing Screen or Main App */}
      {showPhoneCall ? (
        <PhoneCallScreen onEndCall={handleEndPhoneCall} />
      ) : showLandingScreen ? (
        <LandingScreen onStartChat={handleStartChat} onStartPhoneCall={handleStartPhoneCall} />
      ) : (
        <>
          {/* Header Component */}
          <Header
            uploadedFiles={uploadedFiles}
            isProcessing={isProcessing}
            triggerFileUpload={triggerFileUpload}
            fixAndDownload={fixAndDownload}
            setShowProcessingModal={setShowProcessingModal}
            setShowSettingsModal={setShowSettingsModal}
            showMobileMenu={showMobileMenu}
            setShowMobileMenu={setShowMobileMenu}
            closeMobileMenu={closeMobileMenu}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            kyartuMood={kyartuMood}
            onToggleSidebar={handleToggleSidebar}
            showConversationInsights={false}
            setShowConversationInsights={() => {}}
          />

          {/* Main App Layout */}
          <div className="flex flex-1 gap-4 p-4 pt-0">
            {/* Logo in top left corner */}
            <div className="absolute top-4 left-4 z-30">
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
                <img src="https://i.imgur.com/lMiuQUh.png" alt="Kyartu Vzgo Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <Sidebar
              isOpen={true}
              respectMeter={respectMeter}
              kyartuMood={kyartuMood}
              chatHistory={chatHistory}
              savedMoments={savedMoments}
              userName={userName}
              onClose={() => {}}
              onStartPhoneCall={handleStartPhoneCall}
              onSelectFeature={handleSelectFeature}
              currentPage={showArmoLobby ? 'Armo Lobby' : selectedFeature || 'Chat'}
              onReturnToLobby={handleReturnToLobby}
              onToggleCollapse={(collapsed) => setSidebarCollapsed(collapsed)}
            />
          </aside>

          {/* Main Content Area with MainDisplay component */}
          <MainDisplay 
            showArmoLobby={showArmoLobby}
            selectedFeature={selectedFeature}
            featureComponents={featureComponents}
            onSelectFeature={handleSelectFeature}
            onReturnToLobby={handleReturnToLobby}
            messages={messages}
            isTyping={isTyping}
            streamingMessage={streamingMessage}
            onReaction={handleReaction}
            onSaveMoment={handleSaveMoment}
            onPlayVoice={handlePlayVoice}
            savedMoments={savedMoments}
            messagesEndRef={messagesEndRef}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Fixed InputBar Component */}
          <InputBar
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onKeyPress={handleKeyPress}
            triggerFileUpload={triggerFileUpload}
            stopGeneration={stopGeneration}
            inputRef={inputRef}
            sidebarCollapsed={sidebarCollapsed}
          />
        </>
      )}

      {/* Modals */}
      <Modals
        showApiKeyModal={showApiKeyModal}
        setShowApiKeyModal={setShowApiKeyModal}
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        showProcessingModal={showProcessingModal}
        setShowProcessingModal={setShowProcessingModal}
        apiKey={apiKey}
        setApiKey={setApiKey}
        handleApiKeySubmit={handleApiKeySubmit}
        settings={settings}
        updateSettings={handleSettingsUpdate}
        processingOptions={processingOptions}
        setProcessingOptions={setProcessingOptions}
      />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.xml,.md,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
    </AppLayout>
  )
}

export default App