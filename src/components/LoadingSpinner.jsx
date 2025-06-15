import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', text = '', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {/* Spinner */}
      <div className="relative">
        {/* Outer Ring */}
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-2 border-gray-200`}
          style={{
            background: 'linear-gradient(45deg, #e0e5ec, #f5f7fa)'
          }}
        />
        
        {/* Inner Spinning Ring */}
        <motion.div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent`}
          style={{
            borderTopColor: '#667eea',
            borderRightColor: '#764ba2'
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        {/* Center Dot */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <div 
            className={`${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2 h-2' : 'w-3 h-3'} rounded-full`}
            style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)'
            }}
          />
        </motion.div>
      </div>

      {/* Loading Text */}
      {text && (
        <motion.p
          className={`${textSizeClasses[size]} text-gray-600 font-medium`}
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Preset loading components for common use cases
export const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="xl" text="Loading Groq AI Chatbot..." />
      <p className="text-gray-500 text-sm mt-4">Initializing AI models</p>
    </div>
  </div>
);

export const ButtonLoader = ({ text = 'Loading...' }) => (
  <LoadingSpinner size="sm" text={text} className="py-1" />
);

export const MessageLoader = () => (
  <div className="flex items-center gap-2 text-gray-500">
    <LoadingSpinner size="sm" />
    <span className="text-sm">AI is thinking...</span>
  </div>
);

export const ApiLoader = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <LoadingSpinner size="lg" text="Connecting to Groq API..." />
    <p className="text-gray-500 text-xs mt-2">This may take a few seconds</p>
  </div>
);

// Skeleton loader for chat messages
export const MessageSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

// Loading overlay for modals
export const ModalLoader = ({ text = 'Processing...' }) => (
  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 rounded-2xl">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export default LoadingSpinner;