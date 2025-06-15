import { useState, useCallback, useEffect } from 'react'

export const useMobileMenu = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Close mobile menu when clicking outside or pressing escape
  const closeMobileMenu = useCallback(() => {
    setShowMobileMenu(false)
  }, [])

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu()
      }
    }

    if (showMobileMenu) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [showMobileMenu, closeMobileMenu])

  // Close menu on window resize (when switching to desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        closeMobileMenu()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [closeMobileMenu])

  return {
    showMobileMenu,
    setShowMobileMenu,
    closeMobileMenu
  }
}