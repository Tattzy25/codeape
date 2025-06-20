// Service manager for coordinating all application services

import groqService from '../services/groqService'
import redisService from '../services/redisService'
import { storageService } from '../services/storageService'
import messageAnalyzer from './messageAnalyzer'
import fileProcessor from './fileProcessor'
import { STORAGE_KEYS, API_CONSTANTS } from '../config/appConstants'
import toast from 'react-hot-toast'

class ServiceManager {
  constructor() {
    this.services = new Map()
    this.isInitialized = false
    this.initializationPromise = null
    this.healthCheckInterval = null
    this.lastHealthCheck = null
  }
  
  // Initialize all services
  async initialize() {
    if (this.isInitialized) {
      return true
    }
    
    if (this.initializationPromise) {
      return this.initializationPromise
    }
    
    this.initializationPromise = this._performInitialization()
    return this.initializationPromise
  }
  
  async _performInitialization() {
    try {
      console.log('Initializing services...')
      
      // Register services
      this.registerService('storage', storageService)
      this.registerService('groq', groqService)
      this.registerService('redis', redisService)
      this.registerService('messageAnalyzer', messageAnalyzer)
      this.registerService('fileProcessor', fileProcessor)
      
      // Initialize storage service (always available)
      await this.initializeStorageService()
      
      // Initialize Groq service
      await this.initializeGroqService()
      
      // Initialize Redis service (optional)
      await this.initializeRedisService()
      
      // Start health monitoring
      this.startHealthMonitoring()
      
      this.isInitialized = true
      console.log('All services initialized successfully')
      
      return true
    } catch (error) {
      console.error('Service initialization failed:', error)
      throw error
    }
  }
  
  // Register a service
  registerService(name, service) {
    this.services.set(name, {
      instance: service,
      status: 'registered',
      lastCheck: null,
      errors: []
    })
  }
  
  // Get a service instance
  getService(name) {
    const service = this.services.get(name)
    return service ? service.instance : null
  }
  
  // Get service status
  getServiceStatus(name) {
    const service = this.services.get(name)
    return service ? service.status : 'not_found'
  }
  
  // Initialize storage service
  async initializeStorageService() {
    try {
      const storageService = this.getService('storage')
      
      // Test storage availability
      const testKey = '__storage_test__'
      storageService.setItem(testKey, 'test')
      const testValue = storageService.getItem(testKey)
      storageService.removeItem(testKey)
      
      if (testValue !== 'test') {
        throw new Error('Storage test failed')
      }
      
      this.updateServiceStatus('storage', 'active')
      console.log('Storage service initialized')
    } catch (error) {
      this.updateServiceStatus('storage', 'error', error.message)
      throw new Error(`Storage service initialization failed: ${error.message}`)
    }
  }
  
  // Initialize Groq service
  async initializeGroqService() {
    try {
      const groqService = this.getService('groq')
      const storageService = this.getService('storage')
      
      // Load API key from storage
      const apiKey = storageService.getItem(STORAGE_KEYS.API_KEY)
      
      if (apiKey) {
        groqService.setApiKey(apiKey)
        
        // Test API key
        const isValid = await groqService.testApiKey(apiKey)
        if (isValid) {
          this.updateServiceStatus('groq', 'active')
          console.log('Groq service initialized with valid API key')
        } else {
          this.updateServiceStatus('groq', 'error', 'Invalid API key')
          console.warn('Groq service: Invalid API key')
        }
      } else {
        this.updateServiceStatus('groq', 'inactive', 'No API key provided')
        console.log('Groq service: No API key found')
      }
    } catch (error) {
      this.updateServiceStatus('groq', 'error', error.message)
      console.error('Groq service initialization failed:', error)
    }
  }
  
  // Initialize Redis service
  async initializeRedisService() {
    try {
      const redisService = this.getService('redis')
      
      // Attempt to connect to Redis
      await redisService.connect()
      
      if (redisService.isConnected()) {
        this.updateServiceStatus('redis', 'active')
        console.log('Redis service initialized')
      } else {
        this.updateServiceStatus('redis', 'inactive', 'Connection failed')
        console.log('Redis service: Connection failed, using localStorage fallback')
      }
    } catch (error) {
      this.updateServiceStatus('redis', 'error', error.message)
      console.log('Redis service: Connection failed, using localStorage fallback')
    }
  }
  
  // Update service status
  updateServiceStatus(name, status, error = null) {
    const service = this.services.get(name)
    if (service) {
      service.status = status
      service.lastCheck = new Date().toISOString()
      
      if (error) {
        service.errors.push({
          message: error,
          timestamp: new Date().toISOString()
        })
        
        // Keep only last 5 errors
        if (service.errors.length > 5) {
          service.errors.shift()
        }
      }
    }
  }
  
  // Start health monitoring
  startHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
    
    // Check health every 5 minutes
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck()
    }, 5 * 60 * 1000)
    
    // Initial health check
    this.performHealthCheck()
  }
  
  // Perform health check on all services
  async performHealthCheck() {
    this.lastHealthCheck = new Date().toISOString()
    
    try {
      // Check Groq service
      await this.checkGroqHealth()
      
      // Check Redis service
      await this.checkRedisHealth()
      
      // Check storage service
      await this.checkStorageHealth()
      
    } catch (error) {
      console.error('Health check failed:', error)
    }
  }
  
  // Check Groq service health
  async checkGroqHealth() {
    try {
      const groqService = this.getService('groq')
      
      if (groqService.hasApiKey()) {
        // Simple health check - just verify the service is responsive
        const isHealthy = await groqService.testConnection()
        
        if (isHealthy) {
          this.updateServiceStatus('groq', 'active')
        } else {
          this.updateServiceStatus('groq', 'error', 'Health check failed')
        }
      }
    } catch (error) {
      this.updateServiceStatus('groq', 'error', error.message)
    }
  }
  
  // Check Redis service health
  async checkRedisHealth() {
    try {
      const redisService = this.getService('redis')
      
      if (redisService.isConnected()) {
        // Test Redis connection
        const testResult = await redisService.ping()
        
        if (testResult) {
          this.updateServiceStatus('redis', 'active')
        } else {
          this.updateServiceStatus('redis', 'error', 'Ping failed')
        }
      }
    } catch (error) {
      this.updateServiceStatus('redis', 'error', error.message)
    }
  }
  
  // Check storage service health
  async checkStorageHealth() {
    try {
      const storageService = this.getService('storage')
      
      // Test storage operations
      const testKey = '__health_check__'
      const testValue = Date.now().toString()
      
      storageService.setItem(testKey, testValue)
      const retrievedValue = storageService.getItem(testKey)
      storageService.removeItem(testKey)
      
      if (retrievedValue === testValue) {
        this.updateServiceStatus('storage', 'active')
      } else {
        this.updateServiceStatus('storage', 'error', 'Storage test failed')
      }
    } catch (error) {
      this.updateServiceStatus('storage', 'error', error.message)
    }
  }
  
  // Get overall system health
  getSystemHealth() {
    const services = Array.from(this.services.entries()).map(([name, service]) => ({
      name,
      status: service.status,
      lastCheck: service.lastCheck,
      errors: service.errors
    }))
    
    const activeServices = services.filter(s => s.status === 'active').length
    const totalServices = services.length
    const healthPercentage = (activeServices / totalServices) * 100
    
    let overallStatus = 'healthy'
    if (healthPercentage < 50) {
      overallStatus = 'critical'
    } else if (healthPercentage < 80) {
      overallStatus = 'degraded'
    }
    
    return {
      status: overallStatus,
      healthPercentage,
      services,
      lastCheck: this.lastHealthCheck,
      isInitialized: this.isInitialized
    }
  }
  
  // Restart a specific service
  async restartService(serviceName) {
    try {
      switch (serviceName) {
        case 'groq':
          await this.initializeGroqService()
          break
        case 'redis':
          await this.initializeRedisService()
          break
        case 'storage':
          await this.initializeStorageService()
          break
        default:
          throw new Error(`Unknown service: ${serviceName}`)
      }
      
      toast.success(`${serviceName} service restarted successfully`)
      return true
    } catch (error) {
      toast.error(`Failed to restart ${serviceName} service: ${error.message}`)
      return false
    }
  }
  
  // Shutdown all services
  async shutdown() {
    try {
      console.log('Shutting down services...')
      
      // Stop health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval)
        this.healthCheckInterval = null
      }
      
      // Disconnect Redis
      const redisService = this.getService('redis')
      if (redisService && redisService.isConnected()) {
        await redisService.disconnect()
      }
      
      // Clear services
      this.services.clear()
      this.isInitialized = false
      this.initializationPromise = null
      
      console.log('All services shut down')
    } catch (error) {
      console.error('Error during shutdown:', error)
    }
  }
  
  // Get service configuration
  getServiceConfig() {
    return {
      groq: {
        baseUrl: API_CONSTANTS.GROQ_BASE_URL,
        defaultModel: API_CONSTANTS.DEFAULT_MODEL,
        maxTokens: API_CONSTANTS.MAX_TOKENS,
        temperature: API_CONSTANTS.TEMPERATURE
      },
      redis: {
        enabled: this.getServiceStatus('redis') === 'active',
        fallbackToStorage: true
      },
      storage: {
        type: 'localStorage',
        persistent: true
      },
      fileProcessor: {
        maxFileSize: fileProcessor.supportedTypes.size,
        supportedTypes: Array.from(fileProcessor.supportedTypes)
      }
    }
  }
}

// Create singleton instance
const serviceManager = new ServiceManager()

export default serviceManager

// Export utility functions
export const initializeServices = () => serviceManager.initialize()
export const getService = (name) => serviceManager.getService(name)
export const getServiceStatus = (name) => serviceManager.getServiceStatus(name)
export const getSystemHealth = () => serviceManager.getSystemHealth()
export const restartService = (name) => serviceManager.restartService(name)
export const shutdownServices = () => serviceManager.shutdown()