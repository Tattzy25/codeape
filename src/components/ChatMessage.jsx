import React, { memo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { User, Bot, Clock, Zap, AlertCircle, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import toast from 'react-hot-toast'

// Custom code block component with neumorphism styling
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''

  if (inline) {
    return (
      <code 
        className="bg-neuro-200 text-neuro-800 px-2 py-1 rounded-lg text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    )
  }

  return (
    <div className="my-4 neuro-card overflow-hidden">
      {language && (
        <div className="bg-neuro-300 px-4 py-2 text-sm font-medium text-neuro-700 border-b border-neuro-400">
          {language}
        </div>
      )}
      <SyntaxHighlighter
        style={tomorrow}
        language={language}
        PreTag="div"
        className="!bg-neuro-100 !m-0"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  )
}

// Custom components for markdown rendering
const markdownComponents = {
  code: CodeBlock,
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-neuro-800 mb-4 mt-6">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-neuro-800 mb-3 mt-5">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-bold text-neuro-800 mb-2 mt-4">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-neuro-700">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-neuro-400 pl-4 my-4 italic text-neuro-600">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-primary-from hover:text-primary-to underline transition-colors"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full neuro-card">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2 bg-neuro-200 text-left font-semibold text-neuro-800">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 border-t border-neuro-300 text-neuro-700">
      {children}
    </td>
  )
}

// Format timestamp
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

// Format usage statistics
const formatUsage = (usage) => {
  if (!usage) return null
  
  const { prompt_tokens, completion_tokens, total_tokens } = usage
  return {
    input: prompt_tokens?.toLocaleString() || 0,
    output: completion_tokens?.toLocaleString() || 0,
    total: total_tokens?.toLocaleString() || 0
  }
}

const ChatMessage = memo(({ message }) => {
  const isUser = message.role === 'user'
  const isError = message.isError
  const usage = formatUsage(message.usage)
  const timestamp = formatTime(message.timestamp)
  const [isCopied, setIsCopied] = useState(false)
  
  // Copy message content to clipboard
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(message.content)
      .then(() => {
        setIsCopied(true)
        toast.success('Copied to clipboard!')
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => {
        console.error('Failed to copy: ', err)
        toast.error('Failed to copy to clipboard')
      })
  }, [message.content])

  const messageVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar */}
      {!isUser && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-shrink-0"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isError 
              ? 'bg-gradient-to-r from-red-400 to-red-600' 
              : 'gradient-secondary'
          }`}>
            {isError ? (
              <AlertCircle className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
        </motion.div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col w-full ${
        isUser ? 'items-end' : 'items-start'
      }`}>
        {/* Message Bubble */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`relative group ${
            isUser 
              ? 'chat-message-user' 
              : isError
                ? 'bg-red-50 border border-red-200 text-red-800 rounded-2xl rounded-bl-md px-4 py-3'
                : 'chat-message-ai'
          }`}
        >
          {/* Copy button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={copyToClipboard}
            className="absolute top-2 right-2 p-1 rounded-full bg-neuro-200/80 hover:bg-neuro-300/80 text-neuro-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title="Copy to clipboard"
          >
            {isCopied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </motion.button>
          {/* Message Text */}
          <div className={`prose prose-sm max-w-none ${
            isUser 
              ? 'prose-invert' 
              : isError
                ? 'prose-red'
                : 'prose-neuro'
          }`}>
            {isUser ? (
              <p className="m-0 whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>

          {/* Hover Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neuro-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {timestamp}
          </div>
        </motion.div>

        {/* Message Metadata */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`flex items-center gap-2 mt-1 text-xs text-neuro-500 ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{timestamp}</span>
          </div>

          {/* Usage Info for AI messages */}

          {usage && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1" title={`Input: ${usage.input} | Output: ${usage.output}`}>
                <span>{usage.total} tokens</span>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
})

ChatMessage.displayName = 'ChatMessage'

export default ChatMessage