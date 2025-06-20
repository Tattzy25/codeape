import React from 'react'
import { motion } from 'framer-motion'
import TypingIndicator from '../TypingIndicator'

const StreamingMessage = ({ isTyping, streamingMessage }) => {
  if (!isTyping) return null
  
  return (
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
  )
}

export default StreamingMessage