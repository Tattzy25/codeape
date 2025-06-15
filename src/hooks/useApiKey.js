import { useState, useEffect, useCallback } from 'react'
import { storageService } from '../services/storageService'
import { chatService } from '../services/chatService'

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)

  // Load API key on mount
  useEffect(() => {
    const savedApiKey = storageService.getApiKey()
    if (savedApiKey) {
      setApiKey(savedApiKey)
      chatService.setApiKey(savedApiKey)
    } else {
      setShowApiKeyModal(true)
    }
  }, [])

  // Handle API key submission
  const handleApiKeySubmit = useCallback((e) => {
    e.preventDefault()
    if (!apiKey.trim()) return

    // Validate API key format (basic check)
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      alert('Please enter a valid OpenAI API key (starts with sk-)')
      return
    }

    // Save API key
    storageService.saveApiKey(apiKey)
    chatService.setApiKey(apiKey)
    setShowApiKeyModal(false)
  }, [apiKey])

  // Update API key
  const updateApiKey = useCallback((newApiKey) => {
    setApiKey(newApiKey)
    if (newApiKey) {
      storageService.saveApiKey(newApiKey)
      chatService.setApiKey(newApiKey)
    }
  }, [])

  // Clear API key
  const clearApiKey = useCallback(() => {
    setApiKey('')
    storageService.clearApiKey()
    chatService.setApiKey('')
    setShowApiKeyModal(true)
  }, [])

  // Check if API key is valid
  const isApiKeyValid = useCallback(() => {
    return apiKey && apiKey.startsWith('sk-') && apiKey.length >= 20
  }, [apiKey])

  return {
    apiKey,
    setApiKey,
    showApiKeyModal,
    setShowApiKeyModal,
    handleApiKeySubmit,
    updateApiKey,
    clearApiKey,
    isApiKeyValid
  }
}