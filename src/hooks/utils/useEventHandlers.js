import { useCallback } from 'react'
import toast from 'react-hot-toast'

const useEventHandlers = ({
  setSelectedFeature,
  setShowLanding,
  setShowApiKeyModal,
  setShowProcessingModal,
  setShowSettingsModal,
  setShowMomentsModal,
  clearChat,
  endCall,
  isInCall
}) => {
  
  const handleFeatureSelect = useCallback((feature) => {
    setSelectedFeature(feature)
    setShowLanding(false)
  }, [setSelectedFeature, setShowLanding])
  
  const handleBackToLobby = useCallback(() => {
    setSelectedFeature(null)
    setShowLanding(true)
  }, [setSelectedFeature, setShowLanding])
  
  const handleChatSelect = useCallback(() => {
    setSelectedFeature('chat')
    setShowLanding(false)
  }, [setSelectedFeature, setShowLanding])
  
  const handleModalOpen = useCallback((modalType) => {
    switch (modalType) {
      case 'apiKey':
        setShowApiKeyModal(true)
        break
      case 'processing':
        setShowProcessingModal(true)
        break
      case 'settings':
        setShowSettingsModal(true)
        break
      case 'moments':
        setShowMomentsModal(true)
        break
      default:
        console.warn('Unknown modal type:', modalType)
    }
  }, [setShowApiKeyModal, setShowProcessingModal, setShowSettingsModal, setShowMomentsModal])
  
  const handleModalClose = useCallback((modalType) => {
    switch (modalType) {
      case 'apiKey':
        setShowApiKeyModal(false)
        break
      case 'processing':
        setShowProcessingModal(false)
        break
      case 'settings':
        setShowSettingsModal(false)
        break
      case 'moments':
        setShowMomentsModal(false)
        break
      default:
        console.warn('Unknown modal type:', modalType)
    }
  }, [setShowApiKeyModal, setShowProcessingModal, setShowSettingsModal, setShowMomentsModal])
  
  const handleClearChat = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      clearChat()
      toast.success('Chat history cleared')
    }
  }, [clearChat])
  
  const handleEndCall = useCallback(() => {
    if (isInCall && window.confirm('Are you sure you want to end the call?')) {
      endCall()
      toast.success('Call ended')
    }
  }, [isInCall, endCall])
  
  const handleKeyboardShortcuts = useCallback((event) => {
    // Ctrl/Cmd + K for settings
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault()
      handleModalOpen('settings')
    }
    
    // Ctrl/Cmd + M for moments
    if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
      event.preventDefault()
      handleModalOpen('moments')
    }
    
    // Ctrl/Cmd + L for clear chat
    if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
      event.preventDefault()
      handleClearChat()
    }
    
    // Escape to close modals or go back
    if (event.key === 'Escape') {
      // Close any open modals first
      setShowApiKeyModal(false)
      setShowProcessingModal(false)
      setShowSettingsModal(false)
      setShowMomentsModal(false)
    }
  }, [handleModalOpen, handleClearChat, setShowApiKeyModal, setShowProcessingModal, setShowSettingsModal, setShowMomentsModal])
  
  const handleWindowResize = useCallback(() => {
    // Handle responsive behavior
    const isMobile = window.innerWidth < 768
    
    // Update CSS custom properties for mobile handling
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
    
    // Dispatch custom event for components that need to respond to resize
    window.dispatchEvent(new CustomEvent('app-resize', {
      detail: { isMobile, width: window.innerWidth, height: window.innerHeight }
    }))
  }, [])
  
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // App is hidden/minimized
      console.log('App hidden')
    } else {
      // App is visible again
      console.log('App visible')
    }
  }, [])
  
  const handleBeforeUnload = useCallback((event) => {
    // Warn user if they're in a call
    if (isInCall) {
      event.preventDefault()
      event.returnValue = 'You are currently in a call. Are you sure you want to leave?'
      return event.returnValue
    }
  }, [isInCall])
  
  const handleContextMenu = useCallback((event) => {
    // Disable right-click context menu in production
    if (process.env.NODE_ENV === 'production') {
      event.preventDefault()
    }
  }, [])
  
  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])
  
  const handleDrop = useCallback((event, onFileUpload) => {
    event.preventDefault()
    
    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files)
      toast.success(`${files.length} file(s) uploaded`)
    }
  }, [])
  
  return {
    // Navigation handlers
    handleFeatureSelect,
    handleBackToLobby,
    handleChatSelect,
    
    // Modal handlers
    handleModalOpen,
    handleModalClose,
    
    // Action handlers
    handleClearChat,
    handleEndCall,
    
    // System event handlers
    handleKeyboardShortcuts,
    handleWindowResize,
    handleVisibilityChange,
    handleBeforeUnload,
    handleContextMenu,
    
    // File handlers
    handleDragOver,
    handleDrop
  }
}

export default useEventHandlers