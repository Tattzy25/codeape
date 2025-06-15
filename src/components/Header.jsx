import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Download, RefreshCw, Settings, Menu, X } from 'lucide-react'

const Header = ({
  uploadedFiles,
  isProcessing,
  triggerFileUpload,
  fixAndDownload,
  setShowProcessingModal,
  setShowSettingsModal,
  showMobileMenu,
  setShowMobileMenu,
  closeMobileMenu,
  fileInputRef,
  handleFileUpload,
  kyartuMood = 'unbothered',
  onToggleSidebar
}) => {
  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="neuro-card m-4 mb-0 p-4 flex items-center justify-between relative z-20"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gradient">Kyartu Vzgo</h1>
          <p className="text-sm text-neuro-500">Glendale's loudest. Armenia's proudest. Your ego's worst enemy.</p>
        </div>
        
        {/* Mood Status Chip */}
        <div className="hidden md:flex items-center gap-2 neuro-card px-3 py-1">
          <span className="text-lg">{kyartuMood === 'unbothered' ? '😌' : '💢'}</span>
          <div className="text-xs">
            <p className="text-neuro-600 font-medium">Mood:</p>
            <p className="text-neuro-500 capitalize">{kyartuMood}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Desktop buttons - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setShowProcessingModal(true)}
             className="neuro-button p-3"
             title="Processing Options"
           >
             <RefreshCw className="w-4 h-4 text-neuro-600" />
           </motion.button>
           
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setShowSettingsModal(true)}
             className="neuro-button p-3"
             title="Settings"
           >
             <Settings className="w-4 h-4 text-neuro-600" />
           </motion.button>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="neuro-button p-3"
            title="Menu"
          >
            {showMobileMenu ? (
              <X className="w-4 h-4 text-neuro-600" />
            ) : (
              <Menu className="w-4 h-4 text-neuro-600" />
            )}
          </motion.button>
          
          {/* Mobile dropdown menu */}
          <AnimatePresence>
            {showMobileMenu && (
              <>
                {/* Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 z-40"
                  onClick={closeMobileMenu}
                />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 neuro-card p-2 z-50 shadow-lg border border-neuro-300"
                >
                  <div className="space-y-1">
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowProcessingModal(true)
                      setShowMobileMenu(false)
                    }}
                    className="w-full flex items-center gap-3 p-2 text-left hover:bg-neuro-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-neuro-600" />
                    <span className="text-neuro-700 text-sm">Processing Options</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowSettingsModal(true)
                      setShowMobileMenu(false)
                    }}
                    className="w-full flex items-center gap-3 p-2 text-left hover:bg-neuro-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-neuro-600" />
                    <span className="text-neuro-700 text-sm">Settings</span>
                  </motion.button>
                </div>
              </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".zip,.txt,.md,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.json,.xml,.yaml,.yml"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </motion.header>
  )
}

export default Header