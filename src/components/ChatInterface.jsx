import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Upload, Menu, Sparkles } from 'lucide-react'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'
import { groqService } from '../services/groqService'

const ChatInterface = ({
  messages,
  inputMessage,
  setInputMessage,
  isLoading,
  isTyping,
  streamingMessage,
  messagesEndRef,
  inputRef,
  handleSubmit,
  handleKeyPress,
  stopGeneration,
  handleReaction,
  handleSaveMoment,
  handlePlayVoice,
  savedMoments,
  triggerFileUpload,
  handleToggleSidebar
}) => {
  return (
    <div className="flex flex-col h-full ml-80">


      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-4 space-y-3 sm:space-y-4 pt-24 pb-32">
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message}
              onReaction={handleReaction}
              onSaveMoment={handleSaveMoment}
              onPlayVoice={handlePlayVoice}
              isSaved={savedMoments.some(m => m.id === message.id)}
            />
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-start"
          >
            <div className="chat-message-ai">
              {streamingMessage ? (
                <div className="whitespace-pre-wrap">{streamingMessage}</div>
              ) : (
                <TypingIndicator />
              )}
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-neuro-base border-t border-neuro-200 p-2 sm:p-4 fixed bottom-0 left-80 right-0">
        <form onSubmit={handleSubmit} className="chat-input-container">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="neuro-input-field resize-none min-h-[44px] max-h-32 pr-12 w-full"
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
            {isLoading ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={stopGeneration}
                className="neuro-button-secondary px-4 py-3 text-red-600 min-h-[44px]"
              >
                Stop
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!inputMessage.trim() || !groqService.isReady()}
                className="neuro-button-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </form>
        

      </div>
    </div>
  )
}

export default ChatInterface