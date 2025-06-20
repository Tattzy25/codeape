import { useState, useEffect, useCallback } from 'react'
import redisService from '../../services/redisService'
import { storageService } from '../../services/storageService'

const useRedisIntegration = (userId) => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [lastSyncTime, setLastSyncTime] = useState(null)
  
  useEffect(() => {
    const initializeRedis = async () => {
      try {
        setConnectionStatus('connecting')
        await redisService.connect()
        setIsConnected(true)
        setConnectionStatus('connected')
        console.log('Redis integration initialized')
      } catch (error) {
        console.warn('Redis connection failed:', error)
        setIsConnected(false)
        setConnectionStatus('failed')
      }
    }
    
    initializeRedis()
    
    // Cleanup on unmount
    return () => {
      redisService.disconnect()
    }
  }, [])
  
  const saveData = useCallback(async (key, data) => {
    try {
      if (isConnected && userId) {
        await redisService.saveSessionData(userId, { [key]: data })
        setLastSyncTime(new Date().toISOString())
      }
      
      // Always save to localStorage as backup
      storageService.setItem(key, typeof data === 'string' ? data : JSON.stringify(data))
      
      return true
    } catch (error) {
      console.error('Error saving data:', error)
      return false
    }
  }, [isConnected, userId])
  
  const loadData = useCallback(async (key, defaultValue = null) => {
    try {
      if (isConnected && userId) {
        const redisData = await redisService.getSessionData(userId)
        if (redisData && redisData[key] !== undefined) {
          return redisData[key]
        }
      }
      
      // Fallback to localStorage
      const localData = storageService.getItem(key)
      if (localData) {
        try {
          return JSON.parse(localData)
        } catch {
          return localData
        }
      }
      
      return defaultValue
    } catch (error) {
      console.error('Error loading data:', error)
      return defaultValue
    }
  }, [isConnected, userId])
  
  const syncData = useCallback(async (dataMap) => {
    try {
      if (isConnected && userId) {
        await redisService.saveSessionData(userId, {
          ...dataMap,
          lastSyncTime: new Date().toISOString()
        })
        setLastSyncTime(new Date().toISOString())
      }
      
      // Save to localStorage as backup
      Object.entries(dataMap).forEach(([key, value]) => {
        storageService.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
      })
      
      return true
    } catch (error) {
      console.error('Error syncing data:', error)
      return false
    }
  }, [isConnected, userId])
  
  const clearData = useCallback(async (key) => {
    try {
      if (isConnected && userId) {
        await redisService.deleteSessionData(userId, key)
      }
      
      storageService.removeItem(key)
      return true
    } catch (error) {
      console.error('Error clearing data:', error)
      return false
    }
  }, [isConnected, userId])
  
  const getConnectionInfo = () => {
    return {
      isConnected,
      status: connectionStatus,
      lastSyncTime,
      fallbackMode: !isConnected
    }
  }
  
  return {
    // State
    isConnected,
    connectionStatus,
    lastSyncTime,
    
    // Actions
    saveData,
    loadData,
    syncData,
    clearData,
    
    // Utilities
    getConnectionInfo
  }
}

export default useRedisIntegration