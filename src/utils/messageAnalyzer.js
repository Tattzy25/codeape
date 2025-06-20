// Message analysis utility for determining respect meter changes

// Positive keywords and phrases
const POSITIVE_PATTERNS = {
  gratitude: {
    keywords: ['thank', 'thanks', 'grateful', 'appreciate', 'awesome', 'amazing', 'wonderful', 'fantastic', 'excellent', 'brilliant'],
    phrases: ['thank you', 'thanks a lot', 'much appreciated', 'you\'re amazing', 'great job', 'well done'],
    weight: 3
  },
  politeness: {
    keywords: ['please', 'kindly', 'would you', 'could you', 'may i', 'excuse me', 'sorry', 'pardon'],
    phrases: ['if you don\'t mind', 'would you please', 'could you help', 'may i ask', 'excuse me'],
    weight: 2
  },
  encouragement: {
    keywords: ['good', 'nice', 'cool', 'interesting', 'helpful', 'useful', 'smart', 'clever', 'impressive'],
    phrases: ['good point', 'that\'s helpful', 'makes sense', 'i understand', 'that works'],
    weight: 2
  },
  enthusiasm: {
    keywords: ['love', 'like', 'enjoy', 'excited', 'happy', 'glad', 'pleased', 'delighted'],
    phrases: ['i love this', 'this is great', 'i\'m excited', 'looking forward'],
    weight: 1
  }
}

// Negative keywords and phrases
const NEGATIVE_PATTERNS = {
  rudeness: {
    keywords: ['stupid', 'dumb', 'idiot', 'moron', 'useless', 'worthless', 'pathetic', 'terrible', 'awful', 'horrible'],
    phrases: ['you\'re stupid', 'this is dumb', 'what a waste', 'completely useless', 'total garbage'],
    weight: -5
  },
  aggression: {
    keywords: ['shut up', 'fuck', 'damn', 'hell', 'crap', 'bullshit', 'ridiculous', 'absurd'],
    phrases: ['shut the hell up', 'this is bullshit', 'what the hell', 'are you kidding'],
    weight: -4
  },
  dismissiveness: {
    keywords: ['whatever', 'boring', 'lame', 'meh', 'blah', 'ugh', 'seriously'],
    phrases: ['i don\'t care', 'this is boring', 'waste of time', 'not interested'],
    weight: -2
  },
  impatience: {
    keywords: ['hurry', 'faster', 'slow', 'quick', 'now', 'immediately', 'asap'],
    phrases: ['hurry up', 'come on', 'take forever', 'so slow', 'right now'],
    weight: -1
  }
}

// Special patterns
const SPECIAL_PATTERNS = {
  questions: {
    indicators: ['?', 'how', 'what', 'when', 'where', 'why', 'who', 'which'],
    weight: 1 // Asking questions shows engagement
  },
  commands: {
    indicators: ['do this', 'give me', 'show me', 'tell me', 'explain', 'help'],
    weight: 0 // Neutral, depends on politeness
  },
  caps: {
    threshold: 0.3, // 30% of message in caps
    weight: -2 // Excessive caps considered shouting
  }
}

class MessageAnalyzer {
  constructor() {
    this.analysisHistory = []
    this.userPatterns = new Map()
  }
  
  analyzeMessage(message, userId = null) {
    if (!message || typeof message !== 'string') {
      return { respectChange: 0, analysis: 'Invalid message' }
    }
    
    const cleanMessage = message.toLowerCase().trim()
    const analysis = {
      respectChange: 0,
      factors: [],
      sentiment: 'neutral',
      confidence: 0
    }
    
    // Analyze positive patterns
    this.analyzePatterns(cleanMessage, POSITIVE_PATTERNS, analysis)
    
    // Analyze negative patterns
    this.analyzePatterns(cleanMessage, NEGATIVE_PATTERNS, analysis)
    
    // Analyze special patterns
    this.analyzeSpecialPatterns(message, cleanMessage, analysis)
    
    // Apply user-specific adjustments
    if (userId) {
      this.applyUserPatterns(userId, cleanMessage, analysis)
    }
    
    // Determine overall sentiment
    analysis.sentiment = this.determineSentiment(analysis.respectChange)
    
    // Calculate confidence based on number of factors
    analysis.confidence = Math.min(analysis.factors.length * 0.2, 1)
    
    // Store analysis for learning
    this.storeAnalysis(cleanMessage, analysis, userId)
    
    return analysis
  }
  
  analyzePatterns(message, patterns, analysis) {
    Object.entries(patterns).forEach(([category, pattern]) => {
      let categoryScore = 0
      let matches = []
      
      // Check keywords
      pattern.keywords.forEach(keyword => {
        if (message.includes(keyword)) {
          categoryScore += pattern.weight
          matches.push(keyword)
        }
      })
      
      // Check phrases (higher weight)
      if (pattern.phrases) {
        pattern.phrases.forEach(phrase => {
          if (message.includes(phrase)) {
            categoryScore += pattern.weight * 1.5
            matches.push(phrase)
          }
        })
      }
      
      if (categoryScore !== 0) {
        analysis.respectChange += categoryScore
        analysis.factors.push({
          category,
          score: categoryScore,
          matches
        })
      }
    })
  }
  
  analyzeSpecialPatterns(originalMessage, cleanMessage, analysis) {
    // Check for questions
    const questionCount = (originalMessage.match(/\?/g) || []).length
    const questionWords = SPECIAL_PATTERNS.questions.indicators.filter(word => 
      cleanMessage.includes(word)
    ).length
    
    if (questionCount > 0 || questionWords > 0) {
      const questionScore = Math.min(questionCount + questionWords, 3) * SPECIAL_PATTERNS.questions.weight
      analysis.respectChange += questionScore
      analysis.factors.push({
        category: 'questions',
        score: questionScore,
        matches: [`${questionCount} questions, ${questionWords} question words`]
      })
    }
    
    // Check for excessive caps
    const capsCount = (originalMessage.match(/[A-Z]/g) || []).length
    const totalLetters = (originalMessage.match(/[a-zA-Z]/g) || []).length
    
    if (totalLetters > 0) {
      const capsRatio = capsCount / totalLetters
      if (capsRatio > SPECIAL_PATTERNS.caps.threshold) {
        const capsScore = SPECIAL_PATTERNS.caps.weight * (capsRatio - SPECIAL_PATTERNS.caps.threshold) * 10
        analysis.respectChange += capsScore
        analysis.factors.push({
          category: 'excessive_caps',
          score: capsScore,
          matches: [`${Math.round(capsRatio * 100)}% caps`]
        })
      }
    }
    
    // Check message length (very short messages might be dismissive)
    if (cleanMessage.length < 5 && !cleanMessage.includes('?')) {
      analysis.respectChange -= 1
      analysis.factors.push({
        category: 'too_short',
        score: -1,
        matches: ['Very short message']
      })
    }
    
    // Check for repeated characters (like "nooooo" or "yesssss")
    const repeatedChars = cleanMessage.match(/(.)\1{2,}/g)
    if (repeatedChars && repeatedChars.length > 0) {
      const emotionalScore = repeatedChars.length * 0.5
      analysis.respectChange += emotionalScore
      analysis.factors.push({
        category: 'emotional_expression',
        score: emotionalScore,
        matches: repeatedChars
      })
    }
  }
  
  applyUserPatterns(userId, message, analysis) {
    if (!this.userPatterns.has(userId)) {
      return
    }
    
    const userPattern = this.userPatterns.get(userId)
    
    // Apply user-specific adjustments based on their history
    if (userPattern.averageRespect < 30) {
      // User has been consistently disrespectful, be more strict
      analysis.respectChange *= 1.2
    } else if (userPattern.averageRespect > 70) {
      // User has been consistently respectful, be more lenient
      analysis.respectChange *= 0.8
    }
    
    // Check for improvement patterns
    if (userPattern.recentTrend === 'improving' && analysis.respectChange > 0) {
      analysis.respectChange *= 1.1 // Bonus for continued improvement
    }
  }
  
  determineSentiment(respectChange) {
    if (respectChange > 2) return 'very_positive'
    if (respectChange > 0) return 'positive'
    if (respectChange < -2) return 'very_negative'
    if (respectChange < 0) return 'negative'
    return 'neutral'
  }
  
  storeAnalysis(message, analysis, userId) {
    const record = {
      message,
      analysis,
      userId,
      timestamp: Date.now()
    }
    
    this.analysisHistory.push(record)
    
    // Keep only last 100 analyses
    if (this.analysisHistory.length > 100) {
      this.analysisHistory.shift()
    }
    
    // Update user patterns
    if (userId) {
      this.updateUserPatterns(userId, analysis)
    }
  }
  
  updateUserPatterns(userId, analysis) {
    if (!this.userPatterns.has(userId)) {
      this.userPatterns.set(userId, {
        messageCount: 0,
        totalRespect: 0,
        averageRespect: 50,
        recentMessages: [],
        recentTrend: 'stable'
      })
    }
    
    const pattern = this.userPatterns.get(userId)
    pattern.messageCount++
    pattern.totalRespect += analysis.respectChange
    pattern.averageRespect = 50 + (pattern.totalRespect / pattern.messageCount)
    
    // Track recent messages for trend analysis
    pattern.recentMessages.push(analysis.respectChange)
    if (pattern.recentMessages.length > 10) {
      pattern.recentMessages.shift()
    }
    
    // Determine trend
    if (pattern.recentMessages.length >= 5) {
      const recent = pattern.recentMessages.slice(-5)
      const average = recent.reduce((a, b) => a + b, 0) / recent.length
      const older = pattern.recentMessages.slice(-10, -5)
      const olderAverage = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : 0
      
      if (average > olderAverage + 0.5) {
        pattern.recentTrend = 'improving'
      } else if (average < olderAverage - 0.5) {
        pattern.recentTrend = 'declining'
      } else {
        pattern.recentTrend = 'stable'
      }
    }
  }
  
  getAnalysisHistory(userId = null, limit = 10) {
    let history = this.analysisHistory
    
    if (userId) {
      history = history.filter(record => record.userId === userId)
    }
    
    return history.slice(-limit)
  }
  
  getUserPattern(userId) {
    return this.userPatterns.get(userId) || null
  }
  
  clearHistory() {
    this.analysisHistory = []
    this.userPatterns.clear()
  }
}

// Create singleton instance
const messageAnalyzer = new MessageAnalyzer()

export default messageAnalyzer

// Export utility functions
export const analyzeMessage = (message, userId) => messageAnalyzer.analyzeMessage(message, userId)
export const getAnalysisHistory = (userId, limit) => messageAnalyzer.getAnalysisHistory(userId, limit)
export const getUserPattern = (userId) => messageAnalyzer.getUserPattern(userId)
export const clearAnalysisHistory = () => messageAnalyzer.clearHistory()