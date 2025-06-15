import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings, Zap, Thermometer, Hash, Target, Info, RotateCcw } from 'lucide-react'
import { GROQ_MODELS, DEFAULT_SETTINGS } from '../services/groqService'

const SettingsModal = ({ isOpen, onClose, onSubmit, currentSettings }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [hasChanges, setHasChanges] = useState(false)

  // Update local settings when modal opens or currentSettings change
  useEffect(() => {
    if (isOpen && currentSettings) {
      setSettings({ ...currentSettings })
      setHasChanges(false)
    }
  }, [isOpen, currentSettings])

  // Check for changes
  useEffect(() => {
    if (currentSettings) {
      const changed = Object.keys(settings).some(
        key => settings[key] !== currentSettings[key]
      )
      setHasChanges(changed)
    }
  }, [settings, currentSettings])

  // Handle setting change
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(settings)
  }

  // Reset to defaults
  const handleReset = () => {
    setSettings({ ...DEFAULT_SETTINGS })
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  // Get current model info
  const currentModel = GROQ_MODELS[settings.model]
  const maxTokensLimit = currentModel?.maxTokens || 8192

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
          className="relative w-full max-w-lg neuro-card p-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
          onKeyDown={handleKeyPress}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neuro-800">AI Settings</h2>
                <p className="text-sm text-neuro-500">Customize your AI experience</p>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-neuro-700 mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  AI Model
                </div>
              </label>
              <div className="grid gap-3">
                {Object.entries(GROQ_MODELS).map(([modelId, modelInfo]) => (
                  <motion.label
                    key={modelId}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer ${
                      settings.model === modelId
                        ? 'neuro-card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200'
                        : 'neuro-button'
                    } p-4 transition-all duration-200`}
                  >
                    <input
                      type="radio"
                      name="model"
                      value={modelId}
                      checked={settings.model === modelId}
                      onChange={(e) => handleSettingChange('model', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-neuro-800">{modelInfo.name}</div>
                        <div className="text-sm text-neuro-600 mt-1">{modelInfo.description}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-neuro-500">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {modelInfo.speed}
                          </span>
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {modelInfo.maxTokens.toLocaleString()} tokens
                          </span>
                        </div>
                      </div>
                      {settings.model === modelId && (
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-neuro-700 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    Temperature
                  </div>
                  <span className="text-neuro-500 font-normal">{settings.temperature}</span>
                </div>
              </label>
              <div className="neuro-card p-4">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-neuro-300 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-neuro-500 mt-2">
                  <span>Focused (0.0)</span>
                  <span>Balanced (1.0)</span>
                  <span>Creative (2.0)</span>
                </div>
                <div className="flex items-start gap-2 mt-3 p-2 bg-neuro-100 rounded-lg">
                  <Info className="w-4 h-4 text-neuro-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-neuro-600">
                    Higher values make responses more creative but less predictable.
                  </p>
                </div>
              </div>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-sm font-medium text-neuro-700 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Max Tokens
                  </div>
                  <span className="text-neuro-500 font-normal">{settings.maxTokens.toLocaleString()}</span>
                </div>
              </label>
              <div className="neuro-card p-4">
                <input
                  type="range"
                  min="256"
                  max={maxTokensLimit}
                  step="256"
                  value={settings.maxTokens}
                  onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                  className="w-full h-2 bg-neuro-300 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-neuro-500 mt-2">
                  <span>Short (256)</span>
                  <span>Medium ({Math.floor(maxTokensLimit / 2).toLocaleString()})</span>
                  <span>Long ({maxTokensLimit.toLocaleString()})</span>
                </div>
                <div className="flex items-start gap-2 mt-3 p-2 bg-neuro-100 rounded-lg">
                  <Info className="w-4 h-4 text-neuro-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-neuro-600">
                    Maximum length of AI responses. Higher values allow longer responses but use more tokens.
                  </p>
                </div>
              </div>
            </div>

            {/* Top P */}
            <div>
              <label className="block text-sm font-medium text-neuro-700 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Top P (Nucleus Sampling)
                  </div>
                  <span className="text-neuro-500 font-normal">{settings.topP}</span>
                </div>
              </label>
              <div className="neuro-card p-4">
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.topP}
                  onChange={(e) => handleSettingChange('topP', parseFloat(e.target.value))}
                  className="w-full h-2 bg-neuro-300 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-neuro-500 mt-2">
                  <span>Precise (0.1)</span>
                  <span>Balanced (0.5)</span>
                  <span>Diverse (1.0)</span>
                </div>
                <div className="flex items-start gap-2 mt-3 p-2 bg-neuro-100 rounded-lg">
                  <Info className="w-4 h-4 text-neuro-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-neuro-600">
                    Controls diversity of word selection. Lower values make responses more focused.
                  </p>
                </div>
              </div>
            </div>

            {/* Streaming Toggle */}
            <div>
              <label className="flex items-center justify-between cursor-pointer neuro-card p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-neuro-600" />
                  <div>
                    <div className="font-medium text-neuro-800">Real-time Streaming</div>
                    <div className="text-sm text-neuro-600">See responses as they're generated</div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.stream}
                    onChange={(e) => handleSettingChange('stream', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${
                    settings.stream ? 'bg-blue-500' : 'bg-neuro-300'
                  }`}>
                    <motion.div
                      animate={{ x: settings.stream ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-6 h-6 bg-white rounded-full shadow-md"
                    />
                  </div>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleReset}
                className="neuro-button-secondary flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="flex-1 neuro-button-secondary"
              >
                Cancel
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={`flex-1 neuro-button-primary ${
                  !hasChanges ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!hasChanges}
              >
                Save Settings
              </motion.button>
            </div>
          </form>

          {/* Model Info */}
          {currentModel && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-neuro border border-neuro-300">
              <h3 className="font-semibold text-neuro-800 mb-2">Current Model: {currentModel.name}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neuro-600">Capability:</span>
                  <div className="font-medium text-neuro-800">{currentModel.capability}</div>
                </div>
                <div>
                  <span className="text-neuro-600">Speed:</span>
                  <div className="font-medium text-neuro-800">{currentModel.speed}</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default SettingsModal