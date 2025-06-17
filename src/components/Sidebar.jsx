import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Flame, Lock, Bookmark, MessageCircle, TrendingUp } from 'lucide-react'

const Sidebar = ({ 
  isOpen = true, 
  onClose, 
  respectMeter, 
  kyartuMood, 
  chatHistory, 
  savedMoments, 
  userName,
  onSelectChat,
  onToggleMoment 
}) => {
  const getMoodIcon = (mood) => {
    const moodIcons = {
      chill: '😎',
      heated: '🤬',
      flirty: '🤤',
      annoyed: '😒',
      hungry: '🍖',
      petty: '💀',
      unbothered: '😌'
    }
    return moodIcons[mood] || '😌'
  }

  const getRespectLevel = (meter) => {
    if (meter >= 80) return { level: 'Street Legend', color: 'text-yellow-500', bg: 'bg-yellow-100' }
    if (meter >= 60) return { level: 'Certified Armo', color: 'text-purple-500', bg: 'bg-purple-100' }
    if (meter >= 40) return { level: 'Mildly Savage', color: 'text-blue-500', bg: 'bg-blue-100' }
    return { level: 'Soft', color: 'text-gray-500', bg: 'bg-gray-100' }
  }

  const respectLevel = getRespectLevel(respectMeter)

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        />
      )}
      
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        exit={{ x: -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed lg:static left-0 top-0 h-full w-80 bg-neuro-base z-50 neuro-card overflow-y-auto custom-scrollbar"
      >
        {/* Header */}
        <div className="p-6 border-b border-neuro-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gradient">Kyartu's Den</h2>
            <button
              onClick={onClose}
              className="neuro-button p-2 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
              
              {/* Kyartu's Current Mood */}
              <div className="neuro-card p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getMoodIcon(kyartuMood)}</span>
                  <div>
                    <p className="font-medium text-neuro-700">Current Mood</p>
                    <p className="text-sm text-neuro-500 capitalize">{kyartuMood}</p>
                  </div>
                </div>
                <p className="text-xs text-neuro-400 italic">
                  "⚠️ Kyartu is currently: {kyartuMood} + Unimpressed"
                </p>
              </div>
            </div>

            {/* Respect Meter */}
            <div className="p-6 border-b border-neuro-300">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-neuro-700">Respect Meter</h3>
              </div>
              
              <div className="space-y-3">
                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full h-3 bg-neuro-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${respectMeter}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 text-xs font-bold text-neuro-600">
                    {respectMeter}%
                  </div>
                </div>
                
                {/* Respect Level Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${respectLevel.bg} ${respectLevel.color}`}>
                  <TrendingUp className="w-4 h-4" />
                  {respectLevel.level}
                </div>
                
                <p className="text-xs text-neuro-500">
                  Gain respect by taking roasts like a champ and matching his energy
                </p>
              </div>
            </div>

            {/* Persona Switcher (Coming Soon) */}
            <div className="p-6 border-b border-neuro-300">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-pink-500" />
                <h3 className="font-bold text-neuro-700">Personas</h3>
              </div>
              
              <div className="space-y-2">
                <div className="neuro-button p-3 w-full text-left opacity-50 cursor-not-allowed">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cousin Vacho</span>
                    <Lock className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-neuro-400">Dark & Cold</p>
                </div>
                
                <div className="neuro-button p-3 w-full text-left opacity-50 cursor-not-allowed">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uncle Levon</span>
                    <Lock className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-neuro-400">Old-school, Paranoid</p>
                </div>
                
                <div className="neuro-button p-3 w-full text-left opacity-50 cursor-not-allowed">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sona</span>
                    <Lock className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-neuro-400">Crazy Ex Energy</p>
                </div>
              </div>
              
              <p className="text-xs text-neuro-400 mt-2 italic">
                🔒 Unlock personas by building respect
              </p>
            </div>

            {/* Saved Moments */}
            <div className="p-6 border-b border-neuro-300">
              <div className="flex items-center gap-2 mb-3">
                <Bookmark className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-neuro-700">Saved Moments</h3>
              </div>
              
              {savedMoments.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {savedMoments.map((moment, index) => (
                    <div key={index} className="neuro-button p-3 text-left">
                      <p className="text-sm text-neuro-700 line-clamp-2">
                        "{moment.content}"
                      </p>
                      <p className="text-xs text-neuro-400 mt-1">
                        {new Date(moment.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neuro-500 italic">
                  No saved moments yet. Bookmark Kyartu's best roasts!
                </p>
              )}
            </div>

            {/* Chat History */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <h3 className="font-bold text-neuro-700">Chat History</h3>
              </div>
              
              {chatHistory.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {chatHistory.map((chat, index) => (
                    <button
                      key={index}
                      onClick={() => onSelectChat(chat)}
                      className="neuro-button p-3 w-full text-left hover:shadow-neuro-hover transition-all"
                    >
                      <p className="text-sm text-neuro-700 font-medium">
                        {chat.title || `Chat ${index + 1}`}
                      </p>
                      <p className="text-xs text-neuro-400">
                        {new Date(chat.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-neuro-500 mt-1 line-clamp-1">
                        {chat.lastMessage}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neuro-500 italic">
                  No chat history yet. Start your first conversation!
                </p>
              )}
            </div>
       </motion.div>
     </>
   )
 }

export default Sidebar