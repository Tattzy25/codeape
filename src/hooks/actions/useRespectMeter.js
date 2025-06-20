import { useCallback } from 'react'
import toast from 'react-hot-toast'

const useRespectMeter = ({ respectMeter, updateRespectMeter, setKyartuMood, MOOD_LEVELS }) => {
  
  const handleRespectChange = useCallback((change, reason = '') => {
    const oldValue = respectMeter
    updateRespectMeter(change)
    const newValue = Math.max(0, Math.min(100, oldValue + change))
    
    // Show toast for significant changes
    if (Math.abs(change) >= 5) {
      const direction = change > 0 ? 'increased' : 'decreased'
      const message = reason 
        ? `Respect ${direction} by ${Math.abs(change)} - ${reason}`
        : `Respect ${direction} by ${Math.abs(change)}`
      
      if (change > 0) {
        toast.success(message)
      } else {
        toast.error(message)
      }
    }
    
    // Check for mood transitions
    checkMoodTransition(oldValue, newValue)
  }, [respectMeter, updateRespectMeter, setKyartuMood])
  
  const checkMoodTransition = (oldValue, newValue) => {
    const oldMood = getMoodFromValue(oldValue)
    const newMood = getMoodFromValue(newValue)
    
    if (oldMood !== newMood) {
      setKyartuMood(newMood)
      
      // Show mood change notification
      const moodMessages = {
        [MOOD_LEVELS.HAPPY]: 'Kyartu is feeling happy! 😊',
        [MOOD_LEVELS.NEUTRAL]: 'Kyartu is feeling neutral 😐',
        [MOOD_LEVELS.ANNOYED]: 'Kyartu is getting annoyed 😤',
        [MOOD_LEVELS.ANGRY]: 'Kyartu is angry! 😡'
      }
      
      toast(moodMessages[newMood], {
        icon: getMoodIcon(newMood),
        duration: 3000
      })
    }
  }
  
  const getMoodFromValue = (value) => {
    if (value >= 80) return MOOD_LEVELS.HAPPY
    if (value >= 40) return MOOD_LEVELS.NEUTRAL
    if (value >= 20) return MOOD_LEVELS.ANNOYED
    return MOOD_LEVELS.ANGRY
  }
  
  const getMoodIcon = (mood) => {
    switch (mood) {
      case MOOD_LEVELS.HAPPY: return '😊'
      case MOOD_LEVELS.NEUTRAL: return '😐'
      case MOOD_LEVELS.ANNOYED: return '😤'
      case MOOD_LEVELS.ANGRY: return '😡'
      default: return '😐'
    }
  }
  
  const getMoodColor = (mood) => {
    switch (mood) {
      case MOOD_LEVELS.HAPPY: return 'text-green-500'
      case MOOD_LEVELS.NEUTRAL: return 'text-blue-500'
      case MOOD_LEVELS.ANNOYED: return 'text-yellow-500'
      case MOOD_LEVELS.ANGRY: return 'text-red-500'
      default: return 'text-gray-500'
    }
  }
  
  const getRespectLevel = () => {
    if (respectMeter >= 80) return 'Excellent'
    if (respectMeter >= 60) return 'Good'
    if (respectMeter >= 40) return 'Fair'
    if (respectMeter >= 20) return 'Poor'
    return 'Critical'
  }
  
  const getRespectColor = () => {
    if (respectMeter >= 80) return 'text-green-500'
    if (respectMeter >= 60) return 'text-blue-500'
    if (respectMeter >= 40) return 'text-yellow-500'
    if (respectMeter >= 20) return 'text-orange-500'
    return 'text-red-500'
  }
  
  const getAdvice = () => {
    if (respectMeter >= 80) {
      return 'Keep up the great conversation!'
    } else if (respectMeter >= 60) {
      return 'You\'re doing well, stay respectful'
    } else if (respectMeter >= 40) {
      return 'Try to be more considerate in your messages'
    } else if (respectMeter >= 20) {
      return 'Please be more respectful to improve the conversation'
    } else {
      return 'Your respect level is critical. Please be more polite.'
    }
  }
  
  return {
    // Actions
    handleRespectChange,
    
    // Utilities
    getMoodFromValue,
    getMoodIcon,
    getMoodColor,
    getRespectLevel,
    getRespectColor,
    getAdvice
  }
}

export default useRespectMeter