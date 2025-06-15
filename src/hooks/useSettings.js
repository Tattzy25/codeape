import { useState, useEffect } from 'react'
import { storageService } from '../services/storageService'

const DEFAULT_SETTINGS = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  systemMessage: 'You are Kyartu Vzgo, a brutally honest AI assistant from Glendale with Armenian pride. You roast code mercilessly but provide excellent solutions. Be witty, direct, and occasionally sarcastic while maintaining helpfulness.',
  autoScroll: true,
  saveHistory: true
}

export const useSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Load settings on mount
  useEffect(() => {
    const savedSettings = storageService.getSettings()
    if (savedSettings) {
      setSettings({ ...DEFAULT_SETTINGS, ...savedSettings })
    }
  }, [])

  // Save settings whenever they change
  useEffect(() => {
    storageService.saveSettings(settings)
  }, [settings])

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  // Reset settings to default
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    storageService.saveSettings(DEFAULT_SETTINGS)
  }, [])

  return {
    settings,
    updateSettings,
    resetSettings,
    showSettingsModal,
    setShowSettingsModal
  }
}