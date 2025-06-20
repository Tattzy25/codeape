import { useEffect } from 'react'
import groqService from '../../services/groqService'
import redisService from '../../services/redisService'
import { storageService } from '../../services/storageService'
import toast from 'react-hot-toast'

const useAppInitialization = ({
  userId,
  updateUserData,
  setMessages,
  updateRespectMeter,
  setKyartuMood,
  setApiKey,
  setSettings,
  setChatHistory,
  setSavedMoments,
  setShowApiKeyModal
}) => {
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load API key
        const storedApiKey = storageService.getItem('groq_api_key')
        if (storedApiKey) {
          setApiKey(storedApiKey)
          groqService.setApiKey(storedApiKey)
        } else {
          setShowApiKeyModal(true)
        }
        
        // Load user preferences
        const storedSettings = storageService.getItem('chatSettings')
        if (storedSettings) {
          try {
            const parsedSettings = JSON.parse(storedSettings)
            setSettings(parsedSettings)
            groqService.updateSettings(parsedSettings)
          } catch (error) {
            console.error('Error parsing stored settings:', error)
          }
        }
        
        // Initialize Redis connection
        try {
          await redisService.connect()
          console.log('Redis connected successfully')
        } catch (error) {
          console.warn('Redis connection failed, using localStorage:', error)
        }
        
        // Load session data
        if (userId) {
          await loadSessionData(userId)
        }
        
      } catch (error) {
        console.error('Error initializing app:', error)
        toast.error('Failed to initialize app')
      }
    }
    
    const loadSessionData = async (userId) => {
      try {
        let sessionData = null
        
        // Try Redis first
        if (redisService.isConnected()) {
          sessionData = await redisService.getSessionData(userId)
        }
        
        // Fallback to localStorage
        if (!sessionData) {
          sessionData = {
            userName: storageService.getItem('userName'),
            userGender: storageService.getItem('userGender'),
            respectMeter: parseInt(storageService.getItem('respectMeter') || '50', 10),
            kyartuMood: storageService.getItem('kyartuMood') || 'neutral',
            chatHistory: JSON.parse(storageService.getItem('chatHistory') || '[]'),
            savedMoments: JSON.parse(storageService.getItem('savedMoments') || '[]')
          }
        }
        
        // Update app state with loaded data
        if (sessionData.userName) {
          updateUserData({
            userName: sessionData.userName,
            userGender: sessionData.userGender,
            userId
          })
        }
        
        if (sessionData.respectMeter !== undefined) {
          updateRespectMeter(sessionData.respectMeter - 50) // Adjust from default
        }
        
        if (sessionData.kyartuMood) {
          setKyartuMood(sessionData.kyartuMood)
        }
        
        if (sessionData.chatHistory) {
          setMessages(sessionData.chatHistory)
          setChatHistory(sessionData.chatHistory)
        }
        
        if (sessionData.savedMoments) {
          setSavedMoments(sessionData.savedMoments)
        }
        
      } catch (error) {
        console.error('Error loading session data:', error)
      }
    }
    
    initializeApp()
  }, [userId])
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      setTimeout(() => {
        const messagesContainer = document.querySelector('.mobile-chat-height')
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight
        }
      }, 100)
    }
    
    scrollToBottom()
  }, [])
  
  const handleApiKeySubmit = async (newApiKey) => {
    try {
      // Test the API key
      const isValid = await groqService.testApiKey(newApiKey)
      
      if (isValid) {
        setApiKey(newApiKey)
        groqService.setApiKey(newApiKey)
        storageService.setItem('groq_api_key', newApiKey)
        setShowApiKeyModal(false)
        toast.success('API key saved successfully!')
        return true
      } else {
        toast.error('Invalid API key. Please check and try again.')
        return false
      }
    } catch (error) {
      console.error('Error validating API key:', error)
      toast.error('Failed to validate API key')
      return false
    }
  }
  
  const saveToStorage = async (data) => {
    try {
      if (redisService.isConnected() && userId) {
        await redisService.saveSessionData(userId, {
          chatHistory: data,
          lastUpdated: new Date().toISOString()
        })
      }
      
      // Always save to localStorage as backup
      storageService.setItem('chatHistory', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving to storage:', error)
    }
  }
  
  return {
    handleApiKeySubmit,
    saveToStorage
  }
}

export default useAppInitialization