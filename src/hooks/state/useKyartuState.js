import { useState, useEffect } from 'react'
import { storageService } from '../../services/storageService'
import redisService from '../../services/redisService'

const MOOD_LEVELS = {
  HAPPY: 'happy',
  NEUTRAL: 'neutral',
  ANNOYED: 'annoyed',
  ANGRY: 'angry'
}

const useKyartuState = (userId) => {
  const [respectMeter, setRespectMeter] = useState(50)
  const [kyartuMood, setKyartuMood] = useState(MOOD_LEVELS.NEUTRAL)
  
  // Initialize Kyartu state from storage
  useEffect(() => {
    const initializeKyartuState = async () => {
      try {
        // Try Redis first
        if (redisService.isConnected() && userId) {
          const redisData = await redisService.getSessionData(userId)
          if (redisData) {
            setRespectMeter(redisData.respectMeter || 50)
            setKyartuMood(redisData.kyartuMood || MOOD_LEVELS.NEUTRAL)
            return
          }
        }
        
        // Fallback to localStorage
        const storedRespect = storageService.getItem('respectMeter')
        const storedMood = storageService.getItem('kyartuMood')
        
        if (storedRespect !== null) {
          setRespectMeter(parseInt(storedRespect, 10))
        }
        if (storedMood) {
          setKyartuMood(storedMood)
        }
      } catch (error) {
        console.error('Error initializing Kyartu state:', error)
      }
    }
    
    initializeKyartuState()
  }, [userId])
  
  // Update mood based on respect meter
  useEffect(() => {
    let newMood = MOOD_LEVELS.NEUTRAL
    
    if (respectMeter >= 80) {
      newMood = MOOD_LEVELS.HAPPY
    } else if (respectMeter >= 40) {
      newMood = MOOD_LEVELS.NEUTRAL
    } else if (respectMeter >= 20) {
      newMood = MOOD_LEVELS.ANNOYED
    } else {
      newMood = MOOD_LEVELS.ANGRY
    }
    
    if (newMood !== kyartuMood) {
      setKyartuMood(newMood)
      saveKyartuState({ kyartuMood: newMood })
    }
  }, [respectMeter, kyartuMood])
  
  // Save Kyartu state to storage
  const saveKyartuState = async (updates) => {
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
      console.error('Error saving Kyartu state:', error)
    }
  }
  
  const updateRespectMeter = (change) => {
    const newValue = Math.max(0, Math.min(100, respectMeter + change))
    setRespectMeter(newValue)
    saveKyartuState({ respectMeter: newValue })
  }
  
  const resetRespectMeter = () => {
    setRespectMeter(50)
    saveKyartuState({ respectMeter: 50 })
  }
  
  return {
    // State
    respectMeter,
    kyartuMood,
    
    // Actions
    updateRespectMeter,
    resetRespectMeter,
    setKyartuMood,
    
    // Constants
    MOOD_LEVELS
  }
}

export default useKyartuState