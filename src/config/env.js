const requiredEnvVars = [
  'VITE_GROQ_API_KEY',
  'VITE_TAVILY_API_KEY',
  'QSTASH_URL',
  'QSTASH_TOKEN'
]

export const validateEnv = () => {
  const missing = requiredEnvVars.filter(key => {
    // For VITE_ prefixed vars, check import.meta.env in browser
    if (key.startsWith('VITE_')) {
      return !import.meta.env[key]
    }
    // For server-side vars, check process.env
    return !process.env[key]
  })
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Helper to get environment variables with fallbacks
export const getEnvVar = (key, fallback = '') => {
  if (key.startsWith('VITE_')) {
    return import.meta.env[key] || fallback
  }
  return process.env[key] || fallback
}

// Environment configuration object
export const env = {
  // Client-side variables (accessible in browser)
  GROQ_API_KEY: getEnvVar('VITE_GROQ_API_KEY'),
  TAVILY_API_KEY: getEnvVar('VITE_TAVILY_API_KEY'),
  
  // Server-side variables (Node.js only)
  QSTASH_URL: getEnvVar('QSTASH_URL'),
  QSTASH_TOKEN: getEnvVar('QSTASH_TOKEN'),
  
  // Redis configuration
  UPSTASH_REDIS_REST_URL: getEnvVar('UPSTASH_REDIS_REST_URL'),
  UPSTASH_REDIS_REST_TOKEN: getEnvVar('UPSTASH_REDIS_REST_TOKEN'),
  
  // App configuration
  APP_NAME: getEnvVar('NEXT_PUBLIC_APP_NAME', 'Armo AI Chatbot'),
  DEFAULT_MODEL: getEnvVar('NEXT_PUBLIC_DEFAULT_MODEL', 'meta-llama/llama-4-scout-17b-16e-instruct'),
  DEFAULT_TEMPERATURE: parseFloat(getEnvVar('NEXT_PUBLIC_DEFAULT_TEMPERATURE', '0.7')),
  DEFAULT_MAX_TOKENS: parseInt(getEnvVar('NEXT_PUBLIC_DEFAULT_MAX_TOKENS', '5000')),
  
  // Feature flags
  ENABLE_VOICE_INPUT: getEnvVar('NEXT_PUBLIC_ENABLE_VOICE_INPUT', 'false') === 'true',
  ENABLE_FILE_UPLOAD: getEnvVar('NEXT_PUBLIC_ENABLE_FILE_UPLOAD', 'false') === 'true',
  ENABLE_EXPORT: getEnvVar('NEXT_PUBLIC_ENABLE_EXPORT', 'true') === 'true',
  ENABLE_THEMES: getEnvVar('NEXT_PUBLIC_ENABLE_THEMES', 'true') === 'true'
}