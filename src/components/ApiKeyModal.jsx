import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Key, Eye, EyeOff, ExternalLink, Shield, Zap, CheckCircle } from 'lucide-react'

const ApiKeyModal = ({ isOpen, onClose, onSubmit, isLoading, currentApiKey }) => {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const inputRef = useRef(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setApiKey(currentApiKey || '')
      setError('')
      setShowKey(false)
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen, currentApiKey])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!apiKey.trim()) {
      setError('Please enter your API key')
      return
    }

    if (apiKey.length < 10) {
      setError('API key seems too short')
      return
    }

    try {
      setError('')
      setIsValidating(true)
      await onSubmit(apiKey.trim())
    } catch (err) {
      setError(err.message || 'Failed to validate API key')
    } finally {
      setIsValidating(false)
    }
  }

  // Handle input change
  const handleInputChange = (e) => {
    setApiKey(e.target.value)
    if (error) setError('')
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  // Modal variants for animation
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md neuro-card p-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
          onKeyDown={handleKeyPress}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neuro-800">API Key Setup</h2>
                <p className="text-sm text-neuro-500">Connect to Groq AI</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="neuro-button p-2"
            >
              <X className="w-4 h-4 text-neuro-600" />
            </motion.button>
          </div>

          {/* Info Section */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-neuro border border-neuro-300">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">Secure & Private</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Your API key is stored locally in your browser and never sent to our servers.
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                  >
                    Get your free API key
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* API Key Input */}
            <div>
              <label className="block text-sm font-medium text-neuro-700 mb-2">
                Groq API Key
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={handleInputChange}
                  placeholder="gsk_..."
                  className={`neuro-input-field pr-12 ${
                    error ? 'border-red-300 shadow-red-100' : ''
                  }`}
                  disabled={isLoading || isValidating}
                />
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neuro-500 hover:text-neuro-700"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>
              
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 mt-2 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  {error}
                </motion.p>
              )}
            </div>

            {/* Current Status */}
            {currentApiKey && (
              <div className="p-3 bg-green-50 rounded-neuro border border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">API key is configured</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Key ending in: ...{currentApiKey.slice(-8)}
                </p>
              </div>
            )}

            {/* Features List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-neuro-700">What you'll get:</h4>
              <div className="space-y-1">
                {[
                  'Lightning-fast AI responses',
                  'Multiple advanced AI models',
                  'Unlimited conversations',
                  'Real-time streaming responses'
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-neuro-600"
                  >
                    <Zap className="w-3 h-3 text-yellow-500" />
                    {feature}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="flex-1 neuro-button-secondary"
                disabled={isLoading || isValidating}
              >
                Cancel
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 neuro-button-primary flex items-center justify-center gap-2"
                disabled={!apiKey.trim() || isLoading || isValidating}
              >
                {isValidating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Validating...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    {currentApiKey ? 'Update Key' : 'Save Key'}
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-3 bg-neuro-100 rounded-neuro">
            <p className="text-xs text-neuro-600 leading-relaxed">
              <strong>Need help?</strong> Your API key should start with "gsk_" and be about 56 characters long. 
              It's completely free to get started with Groq's generous free tier.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ApiKeyModal