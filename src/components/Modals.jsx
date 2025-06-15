import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Key, Settings, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

const Modals = ({
  showApiKeyModal,
  setShowApiKeyModal,
  showSettingsModal,
  setShowSettingsModal,
  showProcessingModal,
  setShowProcessingModal,
  apiKey,
  setApiKey,
  handleApiKeySubmit,
  settings,
  updateSettings,
  processingOptions,
  setProcessingOptions
}) => {
  const [showApiKey, setShowApiKey] = useState(false)

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  return (
    <>
      {/* API Key Modal */}
      <AnimatePresence>
        {showApiKeyModal && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowApiKeyModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="neuro-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-neuro-600" />
                  <h2 className="text-lg font-semibold text-neuro-700">API Key Required</h2>
                </div>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="p-1 hover:bg-neuro-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-neuro-500" />
                </button>
              </div>
              
              <p className="text-neuro-600 mb-4 text-sm">
                Please enter your OpenAI API key to start chatting. Your key is stored locally and never sent to our servers.
              </p>
              
              <form onSubmit={handleApiKeySubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full p-3 pr-12 border border-neuro-300 rounded-lg focus:ring-2 focus:ring-neuro-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neuro-400 hover:text-neuro-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowApiKeyModal(false)}
                    className="flex-1 px-4 py-2 border border-neuro-300 text-neuro-600 rounded-lg hover:bg-neuro-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-neuro-500 text-white rounded-lg hover:bg-neuro-600 transition-colors"
                  >
                    Save Key
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="neuro-card p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-neuro-600" />
                  <h2 className="text-lg font-semibold text-neuro-700">Settings</h2>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 hover:bg-neuro-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-neuro-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">
                    Model
                  </label>
                  <select
                    value={settings.model}
                    onChange={(e) => updateSettings({ model: e.target.value })}
                    className="w-full p-2 border border-neuro-300 rounded-lg focus:ring-2 focus:ring-neuro-500 focus:border-transparent"
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>
                
                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">
                    Temperature: {settings.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-neuro-500 mt-1">
                    <span>Focused</span>
                    <span>Creative</span>
                  </div>
                </div>
                
                {/* Max Tokens */}
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4000"
                    value={settings.maxTokens}
                    onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
                    className="w-full p-2 border border-neuro-300 rounded-lg focus:ring-2 focus:ring-neuro-500 focus:border-transparent"
                  />
                </div>
                
                {/* System Message */}
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">
                    System Message
                  </label>
                  <textarea
                    value={settings.systemMessage}
                    onChange={(e) => updateSettings({ systemMessage: e.target.value })}
                    className="w-full p-2 border border-neuro-300 rounded-lg focus:ring-2 focus:ring-neuro-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="You are a helpful assistant..."
                  />
                </div>
                
                {/* Auto-scroll */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neuro-700">
                    Auto-scroll to bottom
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.autoScroll}
                    onChange={(e) => updateSettings({ autoScroll: e.target.checked })}
                    className="w-4 h-4 text-neuro-600 border-neuro-300 rounded focus:ring-neuro-500"
                  />
                </div>
                
                {/* Save Chat History */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neuro-700">
                    Save chat history
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.saveHistory}
                    onChange={(e) => updateSettings({ saveHistory: e.target.checked })}
                    className="w-4 h-4 text-neuro-600 border-neuro-300 rounded focus:ring-neuro-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 bg-neuro-500 text-white rounded-lg hover:bg-neuro-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Options Modal */}
      <AnimatePresence>
        {showProcessingModal && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowProcessingModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="neuro-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-neuro-600" />
                  <h2 className="text-lg font-semibold text-neuro-700">Processing Options</h2>
                </div>
                <button
                  onClick={() => setShowProcessingModal(false)}
                  className="p-1 hover:bg-neuro-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-neuro-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Processing Type */}
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">
                    Processing Type
                  </label>
                  <select
                    value={processingOptions.type}
                    onChange={(e) => setProcessingOptions({ ...processingOptions, type: e.target.value })}
                    className="w-full p-2 border border-neuro-300 rounded-lg focus:ring-2 focus:ring-neuro-500 focus:border-transparent"
                  >
                    <option value="fix">Fix Issues</option>
                    <option value="optimize">Optimize Code</option>
                    <option value="refactor">Refactor</option>
                    <option value="document">Add Documentation</option>
                    <option value="test">Generate Tests</option>
                  </select>
                </div>
                
                {/* Include Comments */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neuro-700">
                    Include detailed comments
                  </label>
                  <input
                    type="checkbox"
                    checked={processingOptions.includeComments}
                    onChange={(e) => setProcessingOptions({ ...processingOptions, includeComments: e.target.checked })}
                    className="w-4 h-4 text-neuro-600 border-neuro-300 rounded focus:ring-neuro-500"
                  />
                </div>
                
                {/* Preserve Formatting */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neuro-700">
                    Preserve original formatting
                  </label>
                  <input
                    type="checkbox"
                    checked={processingOptions.preserveFormatting}
                    onChange={(e) => setProcessingOptions({ ...processingOptions, preserveFormatting: e.target.checked })}
                    className="w-4 h-4 text-neuro-600 border-neuro-300 rounded focus:ring-neuro-500"
                  />
                </div>
                
                {/* Custom Instructions */}
                <div>
                  <label className="block text-sm font-medium text-neuro-700 mb-2">
                    Custom Instructions
                  </label>
                  <textarea
                    value={processingOptions.customInstructions}
                    onChange={(e) => setProcessingOptions({ ...processingOptions, customInstructions: e.target.value })}
                    className="w-full p-2 border border-neuro-300 rounded-lg focus:ring-2 focus:ring-neuro-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Any specific requirements or preferences..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowProcessingModal(false)}
                  className="px-4 py-2 bg-neuro-500 text-white rounded-lg hover:bg-neuro-600 transition-colors"
                >
                  Save Options
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Modals