import React from 'react'

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-neuro-base mobile-safe-area">
      {children}
    </div>
  )
}

export default AppLayout