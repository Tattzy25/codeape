import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Flame, Lock, Bookmark, MessageCircle, TrendingUp, Phone, Dice1, Star, Users, Cigarette, Shield } from 'lucide-react'
import NeumorphicButton from './GoldenButton';

import VibezMenu from './VibezMenu'

const Sidebar = ({ 
  isOpen = true, 
  onClose, 
  respectMeter, 
  kyartuMood, 
  chatHistory, 
  savedMoments, 
  userName,
  onSelectChat,
  onToggleMoment,
  onStartPhoneCall,
  onStartSmokeAndRoast, // Add new prop
  onSelectFeature,
  currentPage = 'Armo Lobby',
  onReturnToLobby
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
        className="fixed top-0 left-0 h-screen w-72 sm:w-80 bg-neuro-base z-50 neuro-card overflow-y-auto custom-scrollbar mobile-safe-area"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 flex flex-col items-center border-b border-neuro-300">
          <img src="https://i.imgur.com/V0Jx5e7.png" alt="Logo" className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-3 sm:mb-4" />
          <VibezMenu 
            onSelectFeature={onSelectFeature} 
            currentPage={currentPage} 
            onReturnToLobby={onReturnToLobby}
          />
        </div>

        

            

            

            {/* Saved Moments */}
            <div className="p-4 sm:p-6 border-b border-neuro-300">
              <div className="flex items-center gap-2 mb-3">
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <h3 className="font-bold text-neuro-700 text-sm sm:text-base">Saved Moments</h3>
              </div>
              
              {savedMoments.length > 0 ? (
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto custom-scrollbar">
                  {savedMoments.map((moment, index) => (
                    <div key={index} className="neuro-button p-2 sm:p-3 text-left touch-manipulation">
                      <p className="text-xs sm:text-sm text-neuro-700 line-clamp-2">
                        "{moment.content}"
                      </p>
                      <p className="text-xs text-neuro-400 mt-1">
                        {new Date(moment.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-neuro-500 italic">
                  No saved moments yet. Bookmark Armo's best roasts!
                </p>
              )}
            </div>

            {/* Chat History */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <h3 className="font-bold text-neuro-700 text-sm sm:text-base">Chat History</h3>
              </div>
              
              {chatHistory.length > 0 ? (
                <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto custom-scrollbar">
                  {chatHistory.map((chat, index) => (
                    <button
                      key={index}
                      onClick={() => onSelectChat(chat)}
                      className="neuro-button p-2 sm:p-3 w-full text-left hover:shadow-neuro-hover transition-all touch-manipulation min-h-[44px] flex flex-col justify-center"
                    >
                      <p className="text-xs sm:text-sm text-neuro-700 font-medium">
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
                <p className="text-xs sm:text-sm text-neuro-500 italic">
                  No chat history yet. Start your first conversation!
                </p>
              )}
            </div>
       </motion.div>
     </>
   )
 }

import PropTypes from 'prop-types';

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  respectMeter: PropTypes.number.isRequired,
  kyartuMood: PropTypes.string.isRequired,
  chatHistory: PropTypes.array.isRequired,
  savedMoments: PropTypes.array.isRequired,
  userName: PropTypes.string.isRequired,
  onSelectChat: PropTypes.func.isRequired,
  onToggleMoment: PropTypes.func.isRequired,
  onStartPhoneCall: PropTypes.func.isRequired,
  onStartSmokeAndRoast: PropTypes.func.isRequired, // Add prop type
};

export default Sidebar