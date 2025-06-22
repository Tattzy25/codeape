import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, User, Copy, Check, Search, Trash2, Send } from 'lucide-react'
import { useState } from 'react'

const ChatArea = ({
  messages,
  isTyping,
  messagesEndRef,
  scrollToBottom,
  clearChat,
  handleDeepSearch,
  message,
  setMessage,
  handleSubmit,
  isStreaming
}) => {
  const [copiedIndex, setCopiedIndex] = useState(null)

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const formatMessage = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-neuro-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br>')
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden shadow-lg">
              <img src="https://i.imgur.com/2CfGZgK.png" alt="Armo" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-semibold text-neuro-700 mb-2">Welcome to Armo!</h3>
            <p className="text-neuro-500 max-w-md mx-auto">
              Glendale's loudest. Armenia's proudest. Your ego's worst enemy. Ready to roast your code and crush your confidence? Let's get started!
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-lg flex-shrink-0">
                    <img src="https://i.imgur.com/2CfGZgK.png" alt="Armo" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                  <div className={`neuro-card p-4 relative group ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-neuro-500 to-neuro-600 text-white' 
                      : 'bg-white'
                  }`}>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />
                    
                    {/* Copy button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20"
                      onClick={() => copyToClipboard(msg.content, index)}
                      title="Copy message"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </motion.button>
                  </div>
                  
                  <div className={`text-xs text-neuro-400 mt-1 ${
                    msg.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shadow-lg flex-shrink-0">
                <img src="https://i.imgur.com/2CfGZgK.png" alt="Armo" className="w-full h-full object-cover" />
              </div>
              <div className="neuro-card p-4 bg-white">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-neuro-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-neuro-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-neuro-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-neuro-200">
        {/* Quick Actions */}
        <div className="flex gap-2 mb-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDeepSearch}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Search className="w-4 h-4" />
            Deep Search
          </motion.button>
        </div>
        
        {/* Message Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Ask me anything... I dare you."
              className="w-full p-2 sm:p-3 pr-12 border border-neuro-300 rounded-lg focus:ring-2 focus:ring-neuro-500 focus:border-transparent resize-none min-h-[50px] max-h-32"
              rows={1}
              disabled={isStreaming}
            />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!message.trim() || isStreaming}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                message.trim() && !isStreaming
                  ? 'bg-neuro-500 text-white hover:bg-neuro-600'
                  : 'bg-neuro-200 text-neuro-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </form>
        
        <div className="text-xs text-neuro-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}

export default ChatArea