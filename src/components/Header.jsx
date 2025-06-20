import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Download, RefreshCw, Settings, Menu, X, Brain, User } from 'lucide-react'

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
  onToggleSidebar,
  showConversationInsights,
  setShowConversationInsights
}) => {
  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 lg:left-80 right-0 neuro-card px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between z-20 mobile-safe-area"
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gradient truncate text-center lg:text-left">
            where ai clowns harder than your ex's knockoff gucci's
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Desktop buttons - hidden on mobile */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={triggerFileUpload}
             className="neuro-button p-2 xl:p-3 touch-manipulation"
             title="Upload Files"
           >
             <Upload className="w-4 h-4 text-neuro-600" />
           </motion.button>
           
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setShowProcessingModal(true)}
             className="neuro-button p-2 xl:p-3 touch-manipulation"
             title="Processing Options"
           >
             <RefreshCw className="w-4 h-4 text-neuro-600" />
           </motion.button>
           
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setShowConversationInsights(!showConversationInsights)}
             className={`neuro-button p-2 xl:p-3 touch-manipulation ${showConversationInsights ? 'bg-primary-500/20 border-primary-500/30' : ''}`}
             title={showConversationInsights ? 'Hide Insights' : 'Show Insights'}
           >
             <Brain className="w-4 h-4 text-neuro-600" />
           </motion.button>
           
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setShowSettingsModal(true)}
             className="neuro-button p-2 xl:p-3 touch-manipulation"
             title="Settings"
           >
             <Settings className="w-4 h-4 text-neuro-600" />
           </motion.button>
           
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => {}}
             className="neuro-button p-2 xl:p-3 touch-manipulation"
             title="Account"
           >
             <User className="w-4 h-4 text-neuro-600" />
           </motion.button>
           
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => {}}
             className="neuro-button p-2 xl:p-3 touch-manipulation"
             title="Menu"
           >
             <Menu className="w-4 h-4 text-neuro-600" />
           </motion.button>
        </div>
        
        {/* Mobile menu button */}
        <div className="lg:hidden relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="neuro-button p-3 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Menu"
          >
            {showMobileMenu ? (
              <X className="w-5 h-5 text-neuro-600" />
            ) : (
              <Menu className="w-5 h-5 text-neuro-600" />
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
                  className="absolute right-0 top-full mt-2 w-56 sm:w-64 neuro-card p-3 z-50 shadow-lg border border-neuro-300"
                >
                  <div className="space-y-2">
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onToggleSidebar()
                      setShowMobileMenu(false)
                    }}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-neuro-100 rounded-lg transition-colors touch-manipulation min-h-[44px]"
                  >
                    <Menu className="w-5 h-5 text-neuro-600" />
                    <span className="text-neuro-700 text-base font-medium">Toggle Sidebar</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowMobileMenu(false)
                    }}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-neuro-100 rounded-lg transition-colors touch-manipulation min-h-[44px]"
                  >
                    <User className="w-5 h-5 text-neuro-600" />
                    <span className="text-neuro-700 text-base font-medium">Profile</span>
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