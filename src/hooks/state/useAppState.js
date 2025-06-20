import { useState, useEffect } from 'react'
import { storageService } from '../../services/storageService'
import redisService from '../../services/redisService'

const useAppState = () => {
  // Core app state
  const [showLandingScreen, setShowLandingScreen] = useState(true)
  const [showPhoneCall, setShowPhoneCall] = useState(false)
  const [showArmoLobby, setShowArmoLobby] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(null)
  
  // Modal states
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // User data
  const [userName, setUserName] = useState('')
  const [userGender, setUserGender] = useState('')
  const [userId, setUserId] = useState('')
  
  // Initialize app state from storage
  useEffect(() => {
    const initializeAppState = async () => {
      try {
        // Try Redis first
        if (redisService.isConnected()) {
          const redisData = await redisService.getSessionData(userId)
          if (redisData) {
            setUserName(redisData.userName || '')
            setUserGender(redisData.userGender || '')
            setShowLandingScreen(!redisData.userName)
            return
          }
        }
        
        // Fallback to localStorage
        const storedUserName = storageService.getItem('userName')
        const storedUserGender = storageService.getItem('userGender')
        const storedUserId = storageService.getItem('userId')
        
        if (storedUserName) {
          setUserName(storedUserName)
          setUserGender(storedUserGender || '')
          setUserId(storedUserId || '')
          setShowLandingScreen(false)
        }
      } catch (error) {
        console.error('Error initializing app state:', error)
      }
    }
    
    initializeAppState()
  }, [userId])
  
  // Save state changes to storage
  const saveAppState = async (updates) => {
    try {
      if (redisService.isConnected() && userId) {
        await redisService.saveSessionData(userId, updates)
      }
      
      // Always save to localStorage as backup
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          storageService.setItem(key, value)
        }
      })
    } catch (error) {
      console.error('Error saving app state:', error)
    }
  }
  
  const updateUserData = (userData) => {
    setUserName(userData.userName || '')
    setUserGender(userData.userGender || '')
    setUserId(userData.userId || '')
    saveAppState(userData)
  }
  
  const closeMobileMenu = () => setShowMobileMenu(false)
  
  return {
    // State
    showLandingScreen,
    showPhoneCall,
    showArmoLobby,
    selectedFeature,
    showApiKeyModal,
    showSettingsModal,
    showProcessingModal,
    showMobileMenu,
    userName,
    userGender,
    userId,
    
    // Actions
    setShowLandingScreen,
    setShowPhoneCall,
    setShowArmoLobby,
    setSelectedFeature,
    setShowApiKeyModal,
    setShowSettingsModal,
    setShowProcessingModal,
    setShowMobileMenu,
    updateUserData,
    closeMobileMenu,
    saveAppState
  }
}

export default useAppState