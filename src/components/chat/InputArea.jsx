import React from 'react'
import { motion } from 'framer-motion'
import { Send, Upload, Sparkles } from 'lucide-react'
import groqService from '../../services/groqService'

const InputArea = ({
  inputMessage,
  setInputMessage,
  isLoading,
  onSubmit,
  onKeyPress,
  triggerFileUpload,
  stopGeneration,
  inputRef
}) => {
  return (
    <div className="fixed bottom-0 left-0 lg:left-80 right-0 bg-neuro-base border-t border-neuro-200 z-40">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-2 sm:p-4"
      >
        <form onSubmit={onSubmit} className="chat-input-container">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Type your message..."
              className="neuro-input-field resize-none min-h-[44px] max-h-32 pr-12"
              rows={1}
              disabled={isLoading}
              maxLength={8000}
            />
            
            {inputMessage && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Sparkles className="w-4 h-4 text-neuro-400" />
              </motion.div>
            )}
          </div>
          
          <div className="flex gap-2">
            {/* Upload Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={triggerFileUpload}
              className="neuro-button-secondary px-4 py-3"
              title="Upload Files"
            >
              <Upload className="w-4 h-4" />
            </motion.button>
            
            {isLoading ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={stopGeneration}
                className="neuro-button-secondary px-4 py-3 text-red-600"
              >
                Stop
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!inputMessage.trim() || !groqService.isReady()}
                className="neuro-button-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default InputArea