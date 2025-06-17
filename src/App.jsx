import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import './App.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Settings, Zap, MessageCircle, Sparkles, Upload, FileText, Download, RefreshCw, CheckCircle, Menu, Copy, X } from 'lucide-react'
import toast from 'react-hot-toast'
import JSZip from 'jszip'

// Components
import ChatMessage from './components/ChatMessage'
import Modals from './components/Modals'
import SettingsModal from './components/SettingsModal'
import TypingIndicator from './components/TypingIndicator'
import LandingScreen from './components/LandingScreen'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

// Services
import groqService, { DEFAULT_SETTINGS } from './services/groqService'
import redisService from './services/redisService'
import { storageService } from './services/storageService'
import tavilyService from './services/tavilyService'
import elevenlabsService from './services/elevenlabsService'

// Initialize services


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
  const [showSidebar, setShowSidebar] = useState(false)
  const [savedMoments, setSavedMoments] = useState([])
  const [chatHistory, setChatHistory] = useState([])

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
        setShowApiKeyModal(true)
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
      setShowApiKeyModal(true)
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
      setShowApiKeyModal(true);
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
  }, [inputMessage, messages, settings, isLoading, saveToStorage, isDeepSearchEnabled, userId, sessionId, kyartuMood])

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

  // Handle user flags (muting, warnings, etc.)
  const handleUserFlag = useCallback(async (flag, reason = '') => {
    try {
      await redisService.setUserFlag(userId, flag, reason);
      toast.success(`User ${flag} successfully`);
    } catch (error) {
      console.error('Failed to set user flag:', error);
      toast.error('Failed to update user status');
    }
  }, [userId]);

  // Get random user joke for roasting
  const getRandomUserJoke = useCallback(async () => {
    try {
      const joke = await redisService.getRandomUserJoke(userId);
      return joke;
    } catch (error) {
      console.error('Failed to get user joke:', error);
      return null;
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

  // Clear chat with Redis integration
  const clearChat = useCallback(async () => {
    try {
      setMessages([]);
      await redisService.delete(`chat:session:${sessionId}`);
      toast.success('Chat cleared!');
    } catch (error) {
      console.error('Failed to clear chat from Redis:', error);
      setMessages([]);
      localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
      toast.success('Chat cleared (locally)!');
    }
  }, [sessionId]);

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

  // Process files with AI improvements
  const processFilesWithAI = useCallback(async (filesToProcess, options = processingOptions) => {
    if (!filesToProcess || filesToProcess.length === 0) {
      toast.error('No files to process');
      return [];
    }

    setIsProcessing(true)
    const results = []

    try {
      for (const file of filesToProcess) {
        try {
        // Create processing prompt based on options
        let prompt = `Please improve this ${file.name} file:\n\n`
        
        if (options.autoFix) prompt += '- Fix any syntax errors or bugs\n'
        if (options.optimize) prompt += '- Optimize the code for better performance\n'
        if (options.addComments) prompt += '- Add helpful comments and documentation\n'
        if (options.formatCode) prompt += '- Improve code formatting and structure\n'
        if (options.followStandards) prompt += '- Follow best practices and coding standards\n'
        
        prompt += `\n\nOriginal content:\n\`\`\`\n${file.content}\n\`\`\`\n\nPlease provide ONLY the improved code without explanations.`

        // Send to AI for processing
        const conversationHistory = [
          { role: 'user', content: prompt }
        ]

        let improvedContent = ''
        const onChunk = (chunk) => {
          improvedContent += chunk
        }

        await groqService.sendMessage(
          conversationHistory,
          settings,
          onChunk
        )

        // Extract code from AI response
        const codeMatch = improvedContent.match(/```[\s\S]*?\n([\s\S]*?)\n```/)
        const finalContent = codeMatch ? codeMatch[1] : improvedContent.trim()

        // Calculate changes
        const originalLines = file.content.split('\n').length
        const newLines = finalContent.split('\n').length
        const changes = {
          linesAdded: Math.max(0, newLines - originalLines),
          linesRemoved: Math.max(0, originalLines - newLines),
          totalChanges: Math.abs(newLines - originalLines)
        }

        results.push({
          ...file,
          improvedContent: finalContent,
          changes,
          processed: true,
          downloadUrl: null
        })

      } catch (error) {
        console.error('Error processing file:', error)
        toast.error(`Failed to process ${file.name}: ${error.message}`)
        results.push({
          ...file,
          error: error.message,
          processed: false
        })
      }
    }

    setProcessedFiles(results)
    const successCount = results.filter(f => f.processed).length;
    if (successCount > 0) {
      toast.success(`Processed ${successCount} files successfully!`);
    }
    return results;
  } catch (error) {
    console.error('Error in processFilesWithAI:', error);
    toast.error(`Processing failed: ${error.message}`);
    return [];
  } finally {
    setIsProcessing(false);
  }
  }, [processingOptions, settings])

  // Generate download for improved file
  const generateDownload = useCallback((file) => {
    if (!file.improvedContent) return

    const blob = new Blob([file.improvedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name.replace(/\.(\w+)$/, '_improved.$1')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success(`Downloaded improved ${file.name}`)
  }, [])

  // Fix and download files
  const fixAndDownload = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      toast.error('No files uploaded to process')
      return
    }

    const results = await processFilesWithAI(uploadedFiles)
    
    // Auto-download all successfully processed files
    results.filter(f => f.processed).forEach(file => {
      setTimeout(() => generateDownload(file), 500) // Stagger downloads
    })
  }, [uploadedFiles, processFilesWithAI, generateDownload])

  // Close mobile menu when clicking outside
  const closeMobileMenu = useCallback(() => {
    setShowMobileMenu(false)
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

  return (
    <div className="min-h-screen bg-neuro-base flex flex-col mobile-safe-area">
      {/* Show Landing Screen or Main App */}
      {showLandingScreen ? (
        <LandingScreen onStartChat={handleStartChat} />
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
            kyartuMood={kyartuMood}
            onToggleSidebar={handleToggleSidebar}
          />

          {/* Main App Layout */}
          <div className="flex flex-1 gap-4 p-4 pt-0">
            {/* Logo in top left corner */}
            <div className="absolute top-4 left-4 z-30">
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
                <img src="/logo.png" alt="Kyartu Vzgo Logo" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Permanent Sidebar for Desktop, Toggle for Mobile */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <Sidebar
                isOpen={true}
                respectMeter={respectMeter}
                kyartuMood={kyartuMood}
                chatHistory={chatHistory}
                savedMoments={savedMoments}
                userName={userName}
                onClose={() => {}}
              />
            </div>
            
            {/* Mobile Sidebar */}
            <AnimatePresence>
              {showSidebar && (
                <div className="lg:hidden">
                  <Sidebar
                    isOpen={showSidebar}
                    respectMeter={respectMeter}
                    kyartuMood={kyartuMood}
                    chatHistory={chatHistory}
                    savedMoments={savedMoments}
                    userName={userName}
                    onClose={() => setShowSidebar(false)}
                  />
                </div>
              )}
            </AnimatePresence>

            {/* Chat Messages */}
            <main className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-4 space-y-3 sm:space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <ChatMessage 
                      key={message.id} 
                      message={message}
                      onReaction={handleReaction}
                      onSaveMoment={handleSaveMoment}
                      onPlayVoice={handlePlayVoice}
                      isSaved={savedMoments.some(m => m.id === message.id)}
                    />
                  ))}
                </AnimatePresence>
                
                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex justify-start"
                  >
                    <div className="chat-message-ai">
                      {streamingMessage ? (
                        <div className="whitespace-pre-wrap">{streamingMessage}</div>
                      ) : (
                        <TypingIndicator />
                      )}
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-2 sm:p-4"
              >
                <form onSubmit={handleSubmit} className="chat-input-container">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="neuro-input-field resize-none min-h-[44px] max-h-32 pr-12"
                      rows={1}
                      disabled={isLoading}
                      maxLength={8000}
                    />
                    
                    {inputMessage && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <Sparkles className="w-4 h-4 text-neuro-400" />
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Upload Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={triggerFileUpload}
                      className="neuro-button-secondary px-4 py-3"
                      title="Upload Files"
                    >
                      <Upload className="w-4 h-4" />
                    </motion.button>
                    
                    {/* Mobile Sidebar Toggle */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleToggleSidebar}
                      className="neuro-button-secondary px-4 py-3 lg:hidden"
                      title="Toggle Sidebar"
                    >
                      <Menu className="w-4 h-4" />
                    </motion.button>
                    
                    {isLoading ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={stopGeneration}
                        className="neuro-button-secondary px-4 py-3 text-red-600"
                      >
                        Stop
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!inputMessage.trim() || !groqService.isReady()}
                        className="neuro-button-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </form>
                
                {/* Quick Actions */}
                <div className="flex justify-center mt-3 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearChat}
                    className="text-xs text-neuro-500 hover:text-neuro-700 px-3 py-1 rounded-full neuro-button"
                  >
                    Clear Chat
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDeepSearchEnabled(!isDeepSearchEnabled)}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${
                      isDeepSearchEnabled 
                        ? 'text-white gradient-primary shadow-lg' 
                        : 'text-neuro-500 hover:text-neuro-700 neuro-button'
                    }`}
                  >
                    🔍 Deep Search
                  </motion.button>
                  
                  <div className="text-xs text-neuro-400 px-3 py-1">
                    {messages.length > 1 ? `${messages.length - 1} messages` : 'Start chatting'}
                  </div>
                </div>
              </motion.div>
            </main>
          </div>
        </>
      )}

      {/* Modals */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSubmit={handleApiKeySubmit}
        isLoading={isLoading}
        currentApiKey={apiKey}
      />
      
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSubmit={handleSettingsUpdate}
        currentSettings={settings}
      />
      
      {/* Processing Options Modal */}
      <AnimatePresence>
        {showProcessingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowProcessingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="neuro-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gradient mb-4">Processing Options</h2>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={processingOptions.autoFix}
                    onChange={(e) => setProcessingOptions(prev => ({ ...prev, autoFix: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-neuro-700">Auto-fix syntax errors and bugs</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={processingOptions.optimize}
                    onChange={(e) => setProcessingOptions(prev => ({ ...prev, optimize: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-neuro-700">Optimize for performance</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={processingOptions.addComments}
                    onChange={(e) => setProcessingOptions(prev => ({ ...prev, addComments: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-neuro-700">Add helpful comments</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={processingOptions.formatCode}
                    onChange={(e) => setProcessingOptions(prev => ({ ...prev, formatCode: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-neuro-700">Improve formatting</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={processingOptions.followStandards}
                    onChange={(e) => setProcessingOptions(prev => ({ ...prev, followStandards: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-neuro-700">Follow coding standards</span>
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-neuro-600 mb-2">Uploaded Files ({uploadedFiles.length})</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <FileText className="w-3 h-3 text-neuro-500" />
                        <span className="text-neuro-700 truncate">{file.name}</span>
                        <span className="text-neuro-500 text-xs">({(file.size / 1024).toFixed(1)}KB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {processedFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-neuro-600 mb-2">📊 Processing Results</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {processedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {file.processed ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <FileText className="w-3 h-3 text-red-500" />
                          )}
                          <span className="text-neuro-700 truncate">{file.name}</span>
                        </div>
                        {file.processed && file.changes && (
                          <div className="text-xs text-neuro-500">
                            {file.changes.totalChanges > 0 ? `${file.changes.totalChanges} changes` : 'No changes'}
                          </div>
                        )}
                        {file.processed && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => generateDownload(file)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Download improved file"
                          >
                            <Download className="w-3 h-3" />
                          </motion.button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProcessingModal(false)}
                  className="neuro-button-secondary flex-1 py-2"
                >
                  Close
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    fixAndDownload()
                    setShowProcessingModal(false)
                  }}
                  disabled={uploadedFiles.length === 0 || isProcessing}
                  className="neuro-button-primary flex-1 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Fix & Download All'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.xml,.md,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}

export default App