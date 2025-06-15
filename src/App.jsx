import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Settings, Zap, MessageCircle, Sparkles, Upload, FileText, Download, RefreshCw, CheckCircle, Menu, Copy, X } from 'lucide-react'
import toast from 'react-hot-toast'
import JSZip from 'jszip'

// Components
import ChatMessage from './components/ChatMessage'
import ApiKeyModal from './components/ApiKeyModal'
import SettingsModal from './components/SettingsModal'
import TypingIndicator from './components/TypingIndicator'

// Services
import groqService, { DEFAULT_SETTINGS } from './services/groqService'
import tavilyService from './services/tavilyService'
import redisService from './services/redisService'

// Local storage keys
const STORAGE_KEYS = {
  API_KEY: 'groq_api_key',
  SETTINGS: 'groq_settings',
  CHAT_HISTORY: 'groq_chat_history'
}

function App() {
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

  // Refs
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const abortControllerRef = useRef(null)
  const fileInputRef = useRef(null)

  // Initialize app
  useEffect(() => {
    initializeApp()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, streamingMessage])

  // Initialize application state
  const initializeApp = useCallback(() => {
    try {
      // Load API key - prioritize environment variable
      const envApiKey = import.meta.env.VITE_GROQ_API_KEY
      const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY)
      
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

      // Load settings
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) })
      }

      // Load chat history
      const savedHistory = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY)
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory))
      } else {
        // Add welcome message
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: 'Araaaa… finally you showed up. Glendale\'s loudest is here. I got two phones, one stomach, zero filters. Let\'s ruin your self-esteem together, bro jan.',
          timestamp: new Date().toISOString()
        }])
      }
    } catch (error) {
      console.error('Failed to initialize app:', error)
      toast.error('Failed to load saved data')
    }
  }, [])

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
  const handleSettingsUpdate = useCallback((newSettings) => {
    setSettings(newSettings)
    saveToStorage(STORAGE_KEYS.SETTINGS, newSettings)
    setShowSettingsModal(false)
    toast.success('Settings updated!')
  }, [saveToStorage])

  // Handle message submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || isLoading) return
    
    if (!groqService.isReady()) {
      setShowApiKeyModal(true)
      return
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)
    setStreamingMessage('')

    try {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()

      // Check if this is a search command
      const searchCommands = ['/search', '/web', '/tavily'];
      const isSearchCommand = searchCommands.some(cmd => userMessage.content.toLowerCase().startsWith(cmd));
      
      if (isSearchCommand) {
        // Extract search query (remove command prefix)
        const searchQuery = userMessage.content.replace(/^\/(search|web|tavily)\s*/i, '').trim();
        
        if (!searchQuery) {
          throw new Error('Please provide a search query. Example: /search renewable energy benefits');
        }

        // Perform Tavily search
         setStreamingMessage(isDeepSearchEnabled ? '🔍 Deep searching the web...' : '🔍 Searching the web...');
         const searchResults = isDeepSearchEnabled 
           ? await tavilyService.advancedSearch(searchQuery)
           : await tavilyService.search(searchQuery);
        
        // Format search results
        const formattedResults = tavilyService.formatResults(searchResults);
        
        // Create AI response with search results
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
        saveToStorage(STORAGE_KEYS.CHAT_HISTORY, finalMessages);
        return;
      }

      // Prepare conversation history
      const conversationHistory = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Handle streaming response
      const onChunk = (chunk) => {
        setStreamingMessage(prev => prev + chunk)
      }

      const response = await groqService.sendMessage(
        conversationHistory,
        settings,
        onChunk
      )

      // Create AI response message
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        usage: response.usage,
        model: response.model
      }

      const finalMessages = [...newMessages, aiMessage]
      setMessages(finalMessages)
      saveToStorage(STORAGE_KEYS.CHAT_HISTORY, finalMessages)

    } catch (error) {
      console.error('Chat error:', error)
      
      if (error.name !== 'AbortError') {
        toast.error(error.message)
        
        // Add error message to chat
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `❌ Sorry, I encountered an error: ${error.message}`,
          timestamp: new Date().toISOString(),
          isError: true
        }
        
        const errorMessages = [...newMessages, errorMessage]
        setMessages(errorMessages)
        saveToStorage(STORAGE_KEYS.CHAT_HISTORY, errorMessages)
      }
    } finally {
      setIsLoading(false)
      setIsTyping(false)
      setStreamingMessage('')
      abortControllerRef.current = null
      inputRef.current?.focus()
    }
  }, [inputMessage, messages, settings, isLoading, saveToStorage, isDeepSearchEnabled])

  // Handle input key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [handleSubmit])

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: '👋 Chat cleared! I\'m powered by lightning-fast AI models and web search capabilities.\n\n**Available Commands:**\n- Regular chat: Just type your message\n- Web search: `/search [query]`, `/web [query]`, or `/tavily [query]`\n\nHow can I help you today?',
      timestamp: new Date().toISOString()
    }])
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY)
    toast.success('Chat history cleared')
  }, [])

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
    setIsProcessing(true)
    const results = []

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
    setIsProcessing(false)
    toast.success(`Processed ${results.filter(f => f.processed).length} files successfully!`)
    return results
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

  return (
    <div className="min-h-screen bg-neuro-base flex flex-col mobile-safe-area">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="neuro-card m-4 mb-0 p-4 flex items-center justify-between relative z-20"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img src="/logo.svg" alt="Kyartu Vzgo Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">Kyartu Vzgo</h1>
            <p className="text-sm text-neuro-500">Glendale's loudest. Armenia's proudest. Your ego's worst enemy</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Desktop buttons - hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={triggerFileUpload}
              className="neuro-button p-3"
              title="Upload Files (ZIP, Text, Code)"
            >
              <Upload className="w-4 h-4 text-neuro-600" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fixAndDownload}
              disabled={uploadedFiles.length === 0 || isProcessing}
              className={`neuro-button p-3 ${uploadedFiles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={`Fix & Download ${uploadedFiles.length} file(s)`}
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 text-neuro-600 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-neuro-600" />
              )}
            </motion.button>
            
            <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setShowProcessingModal(true)}
               className="neuro-button p-3"
               title="Processing Options"
             >
               <RefreshCw className="w-4 h-4 text-neuro-600" />
             </motion.button>
             
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setShowSettingsModal(true)}
               className="neuro-button p-3"
               title="Settings"
             >
               <Settings className="w-4 h-4 text-neuro-600" />
             </motion.button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="neuro-button p-3"
              title="Menu"
            >
              {showMobileMenu ? (
                <X className="w-4 h-4 text-neuro-600" />
              ) : (
                <Menu className="w-4 h-4 text-neuro-600" />
              )}
            </motion.button>
            
            {/* Mobile dropdown menu */}
            <AnimatePresence>
              {showMobileMenu && (
                <>
                  {/* Backdrop */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={closeMobileMenu}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 neuro-card p-2 z-50 shadow-lg border border-neuro-300"
                  >
                    <div className="space-y-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        triggerFileUpload()
                        setShowMobileMenu(false)
                      }}
                      className="w-full flex items-center gap-3 p-2 text-left hover:bg-neuro-100 rounded-lg transition-colors"
                    >
                      <Upload className="w-4 h-4 text-neuro-600" />
                      <span className="text-neuro-700 text-sm">Upload Files</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        fixAndDownload()
                        setShowMobileMenu(false)
                      }}
                      disabled={uploadedFiles.length === 0 || isProcessing}
                      className={`w-full flex items-center gap-3 p-2 text-left hover:bg-neuro-100 rounded-lg transition-colors ${
                         uploadedFiles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                       }`}
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 text-neuro-600 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 text-neuro-600" />
                      )}
                      <span className="text-neuro-700 text-sm">
                        Fix & Download {uploadedFiles.length > 0 ? `(${uploadedFiles.length})` : ''}
                      </span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowProcessingModal(true)
                        setShowMobileMenu(false)
                      }}
                      className="w-full flex items-center gap-3 p-2 text-left hover:bg-neuro-100 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-neuro-600" />
                      <span className="text-neuro-700 text-sm">Processing Options</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowSettingsModal(true)
                        setShowMobileMenu(false)
                      }}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-neuro-100 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-neuro-600" />
                      <span className="text-neuro-700 text-sm">Settings</span>
                    </motion.button>
                  </div>
                </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".zip,.txt,.md,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.json,.xml,.yaml,.yml"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </motion.header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-4 space-y-3 sm:space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
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
    </div>
  )
}

export default App