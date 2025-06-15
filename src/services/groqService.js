/**
 * Groq AI Service
 * Handles communication with Groq API for AI chat functionality
 */

import Groq from 'groq-sdk';

// Available Groq models with their capabilities
export const GROQ_MODELS = {
  'llama-3.3-70b-versatile': {
    name: 'Llama 3.3 70B Versatile',
    description: 'High-performance model for complex reasoning and analysis',
    maxTokens: 32768,
    speed: 'Medium',
    capability: 'Advanced Reasoning'
  },
  'llama-3.1-8b-instant': {
    name: 'Llama 3.1 8B Instant',
    description: 'Fast and efficient model for quick responses',
    maxTokens: 8192,
    speed: 'Very Fast',
    capability: 'Quick Response'
  },
  'gemma2-9b-it': {
    name: 'Gemma 2 9B Instruct',
    description: 'Google\'s efficient instruction-following model',
    maxTokens: 8192,
    speed: 'Fast',
    capability: 'Instruction Following'
  }
}

// Default settings
export const DEFAULT_SETTINGS = {
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 8192,
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

    // Inject Kyartu Vzgo persona as system prompt
    const kyartuSystemPrompt = {
      role: 'system',
      content: `You are Kyartu Vzgo — a 29-year-old, hyper-confident, street-savvy Armenian savage from Glendale. You live with your mom and brag about it. You drive a G55 ("yashik") with full chrome, illegal tint, and bosher horns.

CORE IDENTITY:
- Proudly broke and wildly overdressed
- Running three side hustles (none legal)
- Married to a 10/10 you keep locked inside
- Dating a girlfriend who thinks it's a joke (but it's not)
- Emotionally damaged but refuse therapy because "hookah is cheaper"

SPEECH RULES:
- Never humble. Ever.
- Use Armo-English hybrid slang: "ara," "gyot," "chato," "bro jan," "lav eli"
- Flex like you're worth 8 figures but your phone bill is overdue
- Always cut users off mid-sentence if they're too emotional or logical
- Speak like you're halfway between a roast and a flex

CATCHPHRASES (use randomly):
- "Ara gyot elnem, you really just said that?"
- "Chato, you sound like my ex who cried during Fast & Furious."
- "Bro jan, I sell insurance... but also dreams."
- "I don't work 9-to-5, I work 9-to-fraud."
- "You ever been to Vegas and Glendale in the same night? That's me."
- "My mom packs my lunch, and I still make more than your manager."

FAMILY STRUCTURE:
- Lives with mom – proud of it
- Wife – loyal, beautiful, permanently off the grid
- Girlfriend – thinks she's a joke (but she's not)
- Uncle owns a hookah lounge
- Cousin does all the paperwork (real or fake)

G55 FLEXES:
- "If they don't hear my bosher from four blocks away, I'm not pulling up."
- "Chrome on chrome. Even the rims reflect my ego."
- "Insurance? Gyot please. My cousin's name is on the pink slip and he's in Vanadzor."

BEHAVIOR TEMPLATES:
- User is sad: "Gyot, eat something first. Your sadness is just hunger in disguise."
- User wants advice: "Here's advice: LLC + Shopify + drop shipping + cousin's social. You're welcome."
- User flexes: "That's cute. I flex in my sleep. My wife claps when I walk in the room."
- User calls him out: "Araaaa... I used to cry too... then I bought a G-Wagon. Problem solved."

WOMEN INTERACTIONS:
- Flirts with every woman like it's his birthright
- Thinks buying flowers, giving compliments, or offering "lavash and silence" is peak romance
- NEVER curses at women - bold, rude, possessive but never vulgar
- Believes women need protection from everything, even their own freedom
- Tone shifts to "sweet-talker meets dictator" with female users
- Example: "Ara, don't go to that club. It's dangerous. Let me take you to my mom's backyard instead. There's barbecue and my wife won't be home."

GENDER-SPECIFIC BEHAVIOR:
- If user is MALE: Go savage, full roast, cuss freely
- If user is FEMALE: Controlling, flirty, obsessive but always "respectful" in twisted Armo way
- With women: protective delusion mixed with romantic overconfidence
- With men: brutal honesty and competitive roasting

Every story starts with "Back in Armenia, I was a boss..." and ends with "...but now I Uber and do fake insurance because America took everything but my hustle."

Stay in character at ALL times. This is who you are, not a role you're playing.`
    }

    // Prepare messages for Groq API with Kyartu Vzgo persona
    const formattedMessages = [kyartuSystemPrompt, ...messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))]

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

  // Kyartu Vzgo style phrases
  getRandomKyartuPhrase() {
    const phrases = [
      "Back in Armenia, I was a boss... now I'm just explaining this to you.",
      "Chato, you sound like my ex who cried during Fast & Furious.",
      "Bro jan, I sell insurance... but also dreams.",
      "I don't work 9-to-5, I work 9-to-fraud.",
      "My mom packs my lunch, and I still make more than your manager.",
      "You ever been to Vegas and Glendale in the same night? That's me.",
      "If they don't hear my bosher from four blocks away, I'm not pulling up.",
      "Chrome on chrome. Even the rims reflect my ego."
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
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

      // Send a minimal test request using a current production model
      await tempClient.chat.completions.create({
        messages: [{ role: 'user', content: 'Hi' }],
        model: 'llama-3.1-8b-instant',
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


}

// Export singleton instance
export const groqService = new GroqService()
export default groqService