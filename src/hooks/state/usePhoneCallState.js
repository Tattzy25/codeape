import { useState, useEffect } from 'react'
import { storageService } from '../../services/storageService'

const CALL_COOLDOWN_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

const usePhoneCallState = (userId) => {
  const [isInCall, setIsInCall] = useState(false)
  const [callCooldown, setCallCooldown] = useState(null)
  const [canMakeCall, setCanMakeCall] = useState(true)
  
  // Check for existing cooldown on mount
  useEffect(() => {
    const checkCallCooldown = () => {
      if (!userId) return
      
      const cooldownKey = `callCooldown_${userId}`
      const lastCallTime = storageService.getItem(cooldownKey)
      
      if (lastCallTime) {
        const timeSinceLastCall = Date.now() - parseInt(lastCallTime, 10)
        const remainingCooldown = CALL_COOLDOWN_DURATION - timeSinceLastCall
        
        if (remainingCooldown > 0) {
          setCallCooldown(remainingCooldown)
          setCanMakeCall(false)
          
          // Set timeout to enable calls again
          setTimeout(() => {
            setCallCooldown(null)
            setCanMakeCall(true)
            storageService.removeItem(cooldownKey)
          }, remainingCooldown)
        }
      }
    }
    
    checkCallCooldown()
  }, [userId])
  
  const startCall = () => {
    if (!canMakeCall) return false
    
    setIsInCall(true)
    return true
  }
  
  const endCall = () => {
    if (!userId) return
    
    setIsInCall(false)
    
    // Set cooldown
    const cooldownKey = `callCooldown_${userId}`
    const currentTime = Date.now()
    storageService.setItem(cooldownKey, currentTime.toString())
    
    setCallCooldown(CALL_COOLDOWN_DURATION)
    setCanMakeCall(false)
    
    // Set timeout to enable calls again
    setTimeout(() => {
      setCallCooldown(null)
      setCanMakeCall(true)
      storageService.removeItem(cooldownKey)
    }, CALL_COOLDOWN_DURATION)
  }
  
  const getRemainingCooldownTime = () => {
    if (!callCooldown) return 0
    return Math.ceil(callCooldown / 1000) // Return in seconds
  }
  
  const formatCooldownTime = () => {
    const seconds = getRemainingCooldownTime()
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  return {
    // State
    isInCall,
    callCooldown,
    canMakeCall,
    
    // Actions
    startCall,
    endCall,
    
    // Utilities
    getRemainingCooldownTime,
    formatCooldownTime,
    
    // Constants
    CALL_COOLDOWN_DURATION
  }
}

export default usePhoneCallState