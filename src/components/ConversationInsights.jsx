/**
 * Conversation Insights Component
 * Displays mood, respect level, and personality mode analytics
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Heart, 
  TrendingUp, 
  User, 
  MessageCircle, 
  BarChart3,
  Eye,
  EyeOff,
  Smile,
  Frown,
  Meh,
  Angry,
  Zap
} from 'lucide-react';
import { memoryService } from '../services/memoryService';

const ConversationInsights = ({ userId, isVisible, onToggle }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch insights when component mounts or userId changes
  useEffect(() => {
    const fetchInsights = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await memoryService.getConversationInsights(userId);
        setInsights(data);
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError('Failed to load insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [userId]);

  // Get emotion icon and color
  const getEmotionDisplay = (emotion) => {
    const emotionMap = {
      happy: { icon: Smile, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Happy' },
      sad: { icon: Frown, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Sad' },
      angry: { icon: Angry, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Angry' },
      anxious: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Anxious' },
      confused: { icon: Meh, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Confused' },
      neutral: { icon: Meh, color: 'text-gray-400', bg: 'bg-gray-400/10', label: 'Neutral' }
    };
    
    return emotionMap[emotion] || emotionMap.neutral;
  };

  // Get respect level display
  const getRespectDisplay = (level) => {
    const respectMap = {
      high: { color: 'text-green-400', bg: 'bg-green-400/10', label: 'High', percentage: 85 },
      medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Medium', percentage: 60 },
      low: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Low', percentage: 30 }
    };
    
    return respectMap[level] || respectMap.medium;
  };

  // Toggle button
  const ToggleButton = () => (
    <motion.button
      onClick={onToggle}
      className="fixed top-20 right-4 z-50 neuro-button-primary p-3 rounded-full shadow-lg"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isVisible ? 'Hide Insights' : 'Show Insights'}
    >
      {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
    </motion.button>
  );

  if (!isVisible) {
    return <ToggleButton />;
  }

  return (
    <>
      <ToggleButton />
      <AnimatePresence>
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-20 right-4 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto z-40"
        >
          <div className="neuro-card p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="neuro-button-primary p-2 rounded-lg">
                <Brain className="text-primary-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Conversation Insights
                </h3>
                <p className="text-sm text-text-secondary">
                  AI-powered analytics
                </p>
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full"
                />
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {insights && !loading && (
              <div className="space-y-6">
                {/* Message Count */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="neuro-card-elevated p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <MessageCircle className="text-primary-400" size={16} />
                    <span className="text-sm font-medium text-text-primary">
                      Total Messages
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {insights.total_messages || 0}
                  </div>
                </motion.div>

                {/* Dominant Emotion */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="neuro-card-elevated p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Heart className="text-primary-400" size={16} />
                    <span className="text-sm font-medium text-text-primary">
                      Dominant Mood
                    </span>
                  </div>
                  
                  {(() => {
                    const emotion = getEmotionDisplay(insights.dominant_emotion);
                    const EmotionIcon = emotion.icon;
                    
                    return (
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${emotion.bg}`}>
                          <EmotionIcon className={emotion.color} size={20} />
                        </div>
                        <div>
                          <div className={`font-semibold ${emotion.color}`}>
                            {emotion.label}
                          </div>
                          <div className="text-xs text-text-secondary">
                            Primary emotional state
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>

                {/* Respect Level */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="neuro-card-elevated p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="text-primary-400" size={16} />
                    <span className="text-sm font-medium text-text-primary">
                      Respect Level
                    </span>
                  </div>
                  
                  {(() => {
                    const respect = getRespectDisplay(insights.average_respect_level);
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${respect.color}`}>
                            {respect.label}
                          </span>
                          <span className="text-sm text-text-secondary">
                            {respect.percentage}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-surface-secondary rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${respect.percentage}%` }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className={`h-2 rounded-full ${respect.bg.replace('/10', '')}`}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>

                {/* Personality Traits */}
                {insights.personality_traits && Object.keys(insights.personality_traits).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="neuro-card-elevated p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <BarChart3 className="text-primary-400" size={16} />
                      <span className="text-sm font-medium text-text-primary">
                        Personality Traits
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(insights.personality_traits)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 4)
                        .map(([trait, count], index) => {
                          const emotion = getEmotionDisplay(trait);
                          const percentage = Math.round((count / insights.total_messages) * 100);
                          
                          return (
                            <motion.div
                              key={trait}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + index * 0.1 }}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${emotion.color.replace('text-', 'bg-')}`} />
                                <span className="text-sm text-text-primary capitalize">
                                  {trait}
                                </span>
                              </div>
                              <span className="text-xs text-text-secondary">
                                {percentage}%
                              </span>
                            </motion.div>
                          );
                        })}
                    </div>
                  </motion.div>
                )}

                {/* AI Personality Mode */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="neuro-card-elevated p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <User className="text-primary-400" size={16} />
                    <span className="text-sm font-medium text-text-primary">
                      AI Personality Mode
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-400/10 text-primary-400 text-sm font-medium">
                      <Zap size={14} />
                      Adaptive
                    </div>
                    <p className="text-xs text-text-secondary mt-2">
                      Adjusting based on your conversation style
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default ConversationInsights;