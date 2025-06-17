import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, CheckCircle, Download } from 'lucide-react'

const ProcessingModal = ({
  isOpen,
  onClose,
  uploadedFiles,
  processedFiles,
  isProcessing,
  processingOptions,
  setProcessingOptions,
  fixAndDownload,
  generateDownload
}) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="neuro-card p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-gradient mb-4">Processing Options</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={processingOptions.autoFix}
                onChange={(e) => setProcessingOptions(prev => ({ ...prev, autoFix: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-neuro-700">Auto-fix syntax errors and bugs</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={processingOptions.optimize}
                onChange={(e) => setProcessingOptions(prev => ({ ...prev, optimize: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-neuro-700">Optimize for performance</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={processingOptions.addComments}
                onChange={(e) => setProcessingOptions(prev => ({ ...prev, addComments: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-neuro-700">Add helpful comments</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={processingOptions.formatCode}
                onChange={(e) => setProcessingOptions(prev => ({ ...prev, formatCode: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-neuro-700">Improve formatting</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={processingOptions.followStandards}
                onChange={(e) => setProcessingOptions(prev => ({ ...prev, followStandards: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-neuro-700">Follow coding standards</span>
            </label>
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-neuro-600 mb-2">Uploaded Files ({uploadedFiles.length})</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FileText className="w-3 h-3 text-neuro-500" />
                    <span className="text-neuro-700 truncate">{file.name}</span>
                    <span className="text-neuro-500 text-xs">({(file.size / 1024).toFixed(1)}KB)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {processedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-neuro-600 mb-2">📊 Processing Results</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {processedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {file.processed ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <FileText className="w-3 h-3 text-red-500" />
                      )}
                      <span className="text-neuro-700 truncate">{file.name}</span>
                    </div>
                    {file.processed && file.changes && (
                      <div className="text-xs text-neuro-500">
                        {file.changes.totalChanges > 0 ? `${file.changes.totalChanges} changes` : 'No changes'}
                      </div>
                    )}
                    {file.processed && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => generateDownload(file)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download improved file"
                      >
                        <Download className="w-3 h-3" />
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="neuro-button-secondary flex-1 py-2"
            >
              Close
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                fixAndDownload()
                onClose()
              }}
              disabled={uploadedFiles.length === 0 || isProcessing}
              className="neuro-button-primary flex-1 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Fix & Download All'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProcessingModal