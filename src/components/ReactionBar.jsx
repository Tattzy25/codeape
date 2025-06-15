import React from 'react'
import { motion } from 'framer-motion'

const ReactionBar = ({ messageId, reactions = [], onReact, className = '' }) => {
  const reactionOptions = [
    { emoji: '🥲', label: 'I felt that', key: 'felt' },
    { emoji: '💀', label: 'Dead', key: 'dead' },
    { emoji: '🧿', label: 'Ayo chill', key: 'chill' },
    { emoji: '🤌', label: "That's facts", key: 'facts' },
    { emoji: '🥩', label: 'Too raw', key: 'raw' },
    { emoji: '🫠', label: "He's cooking again", key: 'cooking' },
    { emoji: '💘', label: 'Marry me', key: 'marry' }
  ]

  const handleReaction = (reactionKey) => {
    onReact(messageId, reactionKey)
  }

  const getReactionCount = (key) => {
    return reactions.filter(r => r.type === key).length
  }

  const hasUserReacted = (key) => {
    return reactions.some(r => r.type === key && r.isUser)
  }

  return (
    <div className={`flex flex-wrap gap-1 mt-2 ${className}`}>
      {reactionOptions.map((reaction, index) => {
        const count = getReactionCount(reaction.key)
        const userReacted = hasUserReacted(reaction.key)
        
        return (
          <motion.button
            key={reaction.key}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleReaction(reaction.key)}
            className={`
              inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
              transition-all duration-200 hover:shadow-neuro-soft
              ${
                userReacted 
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-neuro-pressed' 
                  : 'bg-neuro-100 text-neuro-600 hover:bg-neuro-200'
              }
            `}
            title={reaction.label}
          >
            <span className="text-sm">{reaction.emoji}</span>
            {count > 0 && (
              <span className="font-medium min-w-[1rem] text-center">
                {count}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

export default ReactionBar