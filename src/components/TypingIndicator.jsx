import React from 'react'
import { motion } from 'framer-motion'

const TypingIndicator = () => {
  // Animation variants for the typing dots
  const dotVariants = {
    initial: {
      y: 0,
      opacity: 0.4
    },
    animate: {
      y: [-4, 0, -4],
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 1.4,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  // Container animation
  const containerVariants = {
    initial: {
      opacity: 0,
      scale: 0.8
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex items-center gap-1 py-2"
    >
      {/* AI is thinking text */}
      <span className="text-neuro-500 text-sm mr-2">AI is thinking</span>
      
      {/* Animated dots */}
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            style={{
              animationDelay: `${index * 0.2}s`
            }}
            className="w-2 h-2 bg-neuro-400 rounded-full"
          />
        ))}
      </div>
      
      {/* Subtle pulse effect */}
      <motion.div
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="ml-2 w-1 h-1 bg-blue-400 rounded-full"
      />
    </motion.div>
  )
}

export default TypingIndicator