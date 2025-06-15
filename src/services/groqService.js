import Groq from 'groq-sdk'

// Available Groq models with their capabilities
export const GROQ_MODELS = {
  'meta-llama/llama-4-scout-17b-16e-instruct': {
    name: 'Llama 4 Scout 17B',
    description: 'Advanced scouting and exploration capabilities',
    maxTokens: 5000,
    speed: 'Fast',
    capability: 'Scout & Analysis'
  },
  'meta-llama/llama-4-maverick-17b-128e-instruct': {
    name: 'Llama 4 Maverick 17B',
    description: 'Innovative and creative problem solving',
    maxTokens: 5000,
    speed: 'Fast',
    capability: 'Creative Reasoning'
  }
}

// Default settings
export const DEFAULT_SETTINGS = {
  model: 'meta-llama/llama-4-scout-17b-16e-instruct',
  temperature: 0.7,
  maxTokens: 5000,
  topP: 1,
  stream: true
}

class GroqService {
  constructor() {
    this.client = null
    this.apiKey = null
    this.isInitialized = false
  }

  // Initialize the Groq client
  initialize(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Valid API key is required')
    }

    try {
      this.apiKey = apiKey
      this.client = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      })
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Failed to initialize Groq client:', error)
      throw new Error('Failed to initialize AI service')
    }
  }

  // Check if service is ready
  isReady() {
    return this.isInitialized && this.client && this.apiKey
  }

  // Validate settings
  validateSettings(settings) {
    const errors = []

    if (!GROQ_MODELS[settings.model]) {
      errors.push('Invalid model selected')
    }

    if (settings.temperature < 0 || settings.temperature > 2) {
      errors.push('Temperature must be between 0 and 2')
    }

    if (settings.maxTokens < 1 || settings.maxTokens > GROQ_MODELS[settings.model]?.maxTokens) {
      errors.push(`Max tokens must be between 1 and ${GROQ_MODELS[settings.model]?.maxTokens}`)
    }

    if (settings.topP < 0 || settings.topP > 1) {
      errors.push('Top P must be between 0 and 1')
    }

    return errors
  }

  // Send message with streaming support
  async sendMessage(messages, settings = DEFAULT_SETTINGS, onChunk = null) {
    if (!this.isReady()) {
      throw new Error('Groq service not initialized. Please provide your API key.')
    }

    // Validate settings
    const validationErrors = this.validateSettings(settings)
    if (validationErrors.length > 0) {
      throw new Error(`Invalid settings: ${validationErrors.join(', ')}`)
    }

    // Prepare messages for Groq API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    try {
      const requestParams = {
        messages: formattedMessages,
        model: settings.model,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP,
        stream: settings.stream
      }

      if (settings.stream && onChunk) {
        return await this.handleStreamingResponse(requestParams, onChunk)
      } else {
        return await this.handleNonStreamingResponse(requestParams)
      }
    } catch (error) {
      console.error('Groq API error:', error)
      throw this.handleApiError(error)
    }
  }

  // Handle streaming response
  async handleStreamingResponse(requestParams, onChunk) {
    const stream = await this.client.chat.completions.create(requestParams)
    let fullResponse = ''
    let usage = null

    try {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta
        
        if (delta?.content) {
          fullResponse += delta.content
          onChunk(delta.content)
        }

        // Capture usage information from the last chunk
        if (chunk.usage) {
          usage = chunk.usage
        }
      }

      return {
        content: fullResponse,
        usage: usage,
        model: requestParams.model,
        finishReason: 'stop'
      }
    } catch (error) {
      console.error('Streaming error:', error)
      throw new Error('Failed to process streaming response')
    }
  }

  // Handle non-streaming response
  async handleNonStreamingResponse(requestParams) {
    const response = await this.client.chat.completions.create({
      ...requestParams,
      stream: false
    })

    const choice = response.choices[0]
    if (!choice) {
      throw new Error('No response received from AI')
    }

    return {
      content: choice.message.content,
      usage: response.usage,
      model: response.model,
      finishReason: choice.finish_reason
    }
  }

  // Handle API errors with user-friendly messages
  handleApiError(error) {
    if (error.status === 401) {
      return new Error('Invalid API key. Please check your Groq API key and try again.')
    }
    
    if (error.status === 429) {
      return new Error('Rate limit exceeded. Please wait a moment and try again.')
    }
    
    if (error.status === 400) {
      return new Error('Invalid request. Please check your message and settings.')
    }
    
    if (error.status >= 500) {
      return new Error('Groq service is temporarily unavailable. Please try again later.')
    }
    
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return new Error('Network error. Please check your internet connection and try again.')
    }

    return new Error(error.message || 'An unexpected error occurred while communicating with the AI.')
  }

  // Test API key validity
  async testApiKey(apiKey) {
    try {
      const tempClient = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      })

      // Send a minimal test request
      await tempClient.chat.completions.create({
        messages: [{ role: 'user', content: 'Hi' }],
        model: 'llama3-8b-8192',
        max_tokens: 1,
        temperature: 0
      })

      return { valid: true, error: null }
    } catch (error) {
      return { 
        valid: false, 
        error: this.handleApiError(error).message 
      }
    }
  }

  // Get model information
  getModelInfo(modelId) {
    return GROQ_MODELS[modelId] || null
  }

  // Get all available models
  getAvailableModels() {
    return Object.entries(GROQ_MODELS).map(([id, info]) => ({
      id,
      ...info
    }))
  }

  // Calculate estimated cost (placeholder - Groq pricing may vary)
  estimateCost(inputTokens, outputTokens, model) {
    // This is a placeholder - actual pricing should be fetched from Groq
    const pricing = {
      'llama3-8b-8192': { input: 0.05, output: 0.08 },
      'llama3-70b-8192': { input: 0.59, output: 0.79 },
      'mixtral-8x7b-32768': { input: 0.24, output: 0.24 },
      'gemma-7b-it': { input: 0.07, output: 0.07 }
    }

    const modelPricing = pricing[model] || pricing['llama3-8b-8192']
    const inputCost = (inputTokens / 1000000) * modelPricing.input
    const outputCost = (outputTokens / 1000000) * modelPricing.output
    
    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
      currency: 'USD'
    }
  }
}

// Export singleton instance
export const groqService = new GroqService()
export default groqService