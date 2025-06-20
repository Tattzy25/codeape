import React from 'react'
import { AnimatePresence } from 'framer-motion'
import ChatMessage from '../ChatMessage'
import StreamingMessage from './StreamingMessage'

const ChatContainer = ({ 
  messages, 
  isTyping, 
  streamingMessage, 
  onReaction, 
  onSaveMoment, 
  onPlayVoice, 
  savedMoments,
  messagesEndRef 
}) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-4 space-y-3 sm:space-y-4 mobile-chat-height">
      <AnimatePresence>
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message}
            onReaction={onReaction}
            onSaveMoment={onSaveMoment}
            onPlayVoice={onPlayVoice}
            isSaved={savedMoments.some(m => m.id === message.id)}
          />
        ))}
      </AnimatePresence>
      
      {/* Typing Indicator */}
      <StreamingMessage 
        isTyping={isTyping} 
        streamingMessage={streamingMessage} 
      />
      
      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatContainer