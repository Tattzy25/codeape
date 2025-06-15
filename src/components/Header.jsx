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
  handleFileUpload
}) => {
  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="neuro-card m-4 mb-0 p-4 flex items-center justify-between relative z-20"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden">
             <img src="/logo.png" alt="Kyartu Vzgo Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient">Kyartu Vzgo</h1>
          <p className="text-sm text-neuro-500">Glendale's loudest. Armenia's proudest. Your ego's worst enemy</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Desktop buttons - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={triggerFileUpload}
            className="neuro-button p-3"
            title="Upload Files (ZIP, Text, Code)"
          >
            <Upload className="w-4 h-4 text-neuro-600" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fixAndDownload}
            disabled={uploadedFiles.length === 0 || isProcessing}
            className={`neuro-button p-3 ${uploadedFiles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={`Fix & Download ${uploadedFiles.length} file(s)`}
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 text-neuro-600 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-neuro-600" />
            )}
          </motion.button>
          
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
                      triggerFileUpload()
                      setShowMobileMenu(false)
                    }}
                    className="w-full flex items-center gap-3 p-2 text-left hover:bg-neuro-100 rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4 text-neuro-600" />
                    <span className="text-neuro-700 text-sm">Upload Files</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      fixAndDownload()
                      setShowMobileMenu(false)
                    }}
                    disabled={uploadedFiles.length === 0 || isProcessing}
                    className={`w-full flex items-center gap-3 p-2 text-left hover:bg-neuro-100 rounded-lg transition-colors ${
                       uploadedFiles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                     }`}
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 text-neuro-600 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 text-neuro-600" />
                    )}
                    <span className="text-neuro-700 text-sm">
                      Fix & Download {uploadedFiles.length > 0 ? `(${uploadedFiles.length})` : ''}
                    </span>
                  </motion.button>
                  
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
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-neuro-100 rounded-lg transition-colors"
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