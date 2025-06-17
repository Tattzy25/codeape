/**
 * Memory Service
 * Handles emotion detection, context analysis, and conversation insights
 */

import { neon } from '@neondatabase/serverless';

class MemoryService {
  constructor() {
    this.sql = null;
    this.isInitialized = false;
    this.emotionKeywords = {
      happy: ['happy', 'joy', 'excited', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'love', 'perfect'],
      sad: ['sad', 'depressed', 'down', 'upset', 'disappointed', 'hurt', 'crying', 'terrible', 'awful', 'miserable'],
      angry: ['angry', 'mad', 'furious', 'pissed', 'annoyed', 'frustrated', 'rage', 'hate', 'stupid', 'idiot'],
      anxious: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'panic', 'stress', 'overwhelmed', 'concerned'],
      confused: ['confused', 'lost', 'unclear', 'dont understand', "don't get", 'what', 'how', 'why', 'help'],
      neutral: ['okay', 'fine', 'normal', 'regular', 'usual', 'standard']
    };
    
    this.respectLevels = {
      high: ['please', 'thank you', 'sir', 'appreciate', 'grateful', 'respect', 'honor'],
      medium: ['thanks', 'cool', 'nice', 'good', 'alright'],
      low: ['whatever', 'dont care', "don't care", 'stupid', 'dumb', 'shut up']
    };
  }

  // Initialize database connection
  async initialize() {
    try {
      const databaseUrl = import.meta.env.VITE_NEON_DATABASE_URL;
      if (!databaseUrl) {
        console.warn('Neon database URL not found, using local storage fallback');
        return false;
      }
      
      this.sql = neon(databaseUrl);
      await this.createTables();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize memory service:', error);
      return false;
    }
  }

  // Create necessary database tables
  async createTables() {
    if (!this.sql) return;
    
    try {
      // User interactions table
      await this.sql`
        CREATE TABLE IF NOT EXISTS user_interactions (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          emotion VARCHAR(50),
          respect_level VARCHAR(20),
          personality_mode VARCHAR(50),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          session_id VARCHAR(255)
        )
      `;
      
      // Conversation insights table
      await this.sql`
        CREATE TABLE IF NOT EXISTS conversation_insights (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          total_messages INTEGER DEFAULT 0,
          dominant_emotion VARCHAR(50),
          average_respect_level VARCHAR(20),
          personality_traits JSONB,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id)
        )
      `;
      
      // Jokes and comebacks table for reusable content
      await this.sql`
        CREATE TABLE IF NOT EXISTS kyartu_content (
          id SERIAL PRIMARY KEY,
          content_type VARCHAR(50) NOT NULL, -- 'joke', 'comeback', 'flex', 'story'
          content TEXT NOT NULL,
          context_tags JSONB, -- ['sad', 'roast', 'flex'] etc
          effectiveness_score INTEGER DEFAULT 0,
          usage_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_used TIMESTAMP
        )
      `;
      
      // User behavior patterns table
      await this.sql`
        CREATE TABLE IF NOT EXISTS user_behavior_patterns (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          behavior_type VARCHAR(50) NOT NULL, -- 'joke_teller', 'complainer', 'flexer', 'questioner'
          frequency INTEGER DEFAULT 1,
          last_occurrence TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          context_data JSONB,
          UNIQUE(user_id, behavior_type)
        )
      `;
      
      // Speaking style adaptations table
      await this.sql`
        CREATE TABLE IF NOT EXISTS speaking_adaptations (
          id SERIAL PRIMARY KEY,
          adaptation_type VARCHAR(50) NOT NULL, -- 'tone', 'vocabulary', 'response_style'
          trigger_context JSONB, -- what triggers this adaptation
          adaptation_content TEXT NOT NULL,
          success_rate DECIMAL(3,2) DEFAULT 0.0,
          usage_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      console.log('Memory service tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
    }
  }

  // Analyze emotion from text
  analyzeEmotion(text) {
    const lowerText = text.toLowerCase();
    const emotionScores = {};
    
    // Calculate emotion scores
    Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
      emotionScores[emotion] = keywords.reduce((score, keyword) => {
        const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
        return score + matches;
      }, 0);
    });
    
    // Find dominant emotion
    const dominantEmotion = Object.entries(emotionScores)
      .reduce((a, b) => emotionScores[a[0]] > emotionScores[b[0]] ? a : b)[0];
    
    return emotionScores[dominantEmotion] > 0 ? dominantEmotion : 'neutral';
  }

  // Analyze respect level from text
  analyzeRespectLevel(text) {
    const lowerText = text.toLowerCase();
    let respectScore = 0;
    
    // Check for high respect indicators
    this.respectLevels.high.forEach(word => {
      if (lowerText.includes(word)) respectScore += 2;
    });
    
    // Check for medium respect indicators
    this.respectLevels.medium.forEach(word => {
      if (lowerText.includes(word)) respectScore += 1;
    });
    
    // Check for low respect indicators
    this.respectLevels.low.forEach(word => {
      if (lowerText.includes(word)) respectScore -= 2;
    });
    
    if (respectScore >= 3) return 'high';
    if (respectScore >= 1) return 'medium';
    return 'low';
  }

  // Determine personality mode based on conversation context
  determinePersonalityMode(emotion, respectLevel, messageHistory = []) {
    const recentMessages = messageHistory.slice(-5); // Last 5 messages
    
    // Analyze conversation flow
    const hasQuestions = recentMessages.some(msg => 
      msg.content.includes('?') || msg.content.toLowerCase().includes('how') || 
      msg.content.toLowerCase().includes('what') || msg.content.toLowerCase().includes('why')
    );
    
    const hasCompliments = recentMessages.some(msg => 
      msg.content.toLowerCase().includes('good') || msg.content.toLowerCase().includes('nice') ||
      msg.content.toLowerCase().includes('cool') || msg.content.toLowerCase().includes('awesome')
    );
    
    // Determine mode based on context
    if (emotion === 'sad' || emotion === 'anxious') {
      return 'supportive';
    } else if (emotion === 'angry' || respectLevel === 'low') {
      return 'savage';
    } else if (hasQuestions) {
      return 'educational';
    } else if (hasCompliments || respectLevel === 'high') {
      return 'friendly';
    } else {
      return 'default';
    }
  }



  // Store interaction locally as fallback
  storeInteractionLocally(userId, interaction) {
    const key = `memory_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(interaction);
    
    // Keep only last 100 interactions
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
    
    localStorage.setItem(key, JSON.stringify(existing));
  }

  // Get conversation insights for a user
  async getConversationInsights(userId) {
    if (this.isInitialized && this.sql) {
      try {
        const result = await this.sql`
          SELECT * FROM conversation_insights WHERE user_id = ${userId}
        `;
        return result[0] || null;
      } catch (error) {
        console.error('Error getting insights:', error);
        return this.getInsightsLocally(userId);
      }
    } else {
      return this.getInsightsLocally(userId);
    }
  }

  // Get insights from localStorage
  getInsightsLocally(userId) {
    const key = `memory_${userId}`;
    const interactions = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (interactions.length === 0) {
      return {
        total_messages: 0,
        dominant_emotion: 'neutral',
        average_respect_level: 'medium',
        personality_traits: {}
      };
    }
    
    // Calculate insights
    const emotions = interactions.map(i => i.emotion);
    const respectLevels = interactions.map(i => i.respectLevel);
    
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});
    
    const dominantEmotion = Object.entries(emotionCounts)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    const respectCounts = respectLevels.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
    
    const averageRespectLevel = Object.entries(respectCounts)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    return {
      total_messages: interactions.length,
      dominant_emotion: dominantEmotion,
      average_respect_level: averageRespectLevel,
      personality_traits: emotionCounts
    };
  }

  // Update conversation insights
  async updateConversationInsights(userId) {
    if (!this.isInitialized || !this.sql) return;
    
    try {
      // Get recent interactions
      const interactions = await this.sql`
        SELECT emotion, respect_level FROM user_interactions 
        WHERE user_id = ${userId} 
        ORDER BY timestamp DESC 
        LIMIT 50
      `;
      
      if (interactions.length === 0) return;
      
      // Calculate insights
      const emotions = interactions.map(i => i.emotion);
      const respectLevels = interactions.map(i => i.respect_level);
      
      const emotionCounts = emotions.reduce((acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {});
      
      const dominantEmotion = Object.entries(emotionCounts)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0];
      
      const respectCounts = respectLevels.reduce((acc, level) => {
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {});
      
      const averageRespectLevel = Object.entries(respectCounts)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0];
      
      // Upsert insights
      await this.sql`
        INSERT INTO conversation_insights (user_id, total_messages, dominant_emotion, average_respect_level, personality_traits)
        VALUES (${userId}, ${interactions.length}, ${dominantEmotion}, ${averageRespectLevel}, ${JSON.stringify(emotionCounts)})
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          total_messages = ${interactions.length},
          dominant_emotion = ${dominantEmotion},
          average_respect_level = ${averageRespectLevel},
          personality_traits = ${JSON.stringify(emotionCounts)},
          last_updated = CURRENT_TIMESTAMP
      `;
    } catch (error) {
      console.error('Error updating insights:', error);
    }
  }

  // Store reusable content (jokes, comebacks, etc.)
  async storeKyartuContent(contentType, content, contextTags = []) {
    if (!this.isInitialized || !this.sql) return;
    
    try {
      await this.sql`
        INSERT INTO kyartu_content (content_type, content, context_tags)
        VALUES (${contentType}, ${content}, ${JSON.stringify(contextTags)})
      `;
    } catch (error) {
      console.error('Error storing Kyartu content:', error);
    }
  }
  
  // Get relevant content based on context
  async getRelevantContent(contentType, contextTags = []) {
    if (!this.isInitialized || !this.sql) return [];
    
    try {
      const result = await this.sql`
        SELECT content, effectiveness_score, usage_count 
        FROM kyartu_content 
        WHERE content_type = ${contentType}
        AND (context_tags ?| ${contextTags} OR context_tags = '[]'::jsonb)
        ORDER BY effectiveness_score DESC, usage_count ASC
        LIMIT 5
      `;
      return result;
    } catch (error) {
      console.error('Error getting relevant content:', error);
      return [];
    }
  }
  
  // Track user behavior patterns
  async trackBehaviorPattern(userId, behaviorType, contextData = {}) {
    if (!this.isInitialized || !this.sql) return;
    
    try {
      await this.sql`
        INSERT INTO user_behavior_patterns (user_id, behavior_type, context_data)
        VALUES (${userId}, ${behaviorType}, ${JSON.stringify(contextData)})
        ON CONFLICT (user_id, behavior_type)
        DO UPDATE SET 
          frequency = user_behavior_patterns.frequency + 1,
          last_occurrence = CURRENT_TIMESTAMP,
          context_data = ${JSON.stringify(contextData)}
      `;
    } catch (error) {
      console.error('Error tracking behavior pattern:', error);
    }
  }
  
  // Get user behavior patterns
  async getUserBehaviorPatterns(userId) {
    if (!this.isInitialized || !this.sql) return [];
    
    try {
      const result = await this.sql`
        SELECT behavior_type, frequency, context_data, last_occurrence
        FROM user_behavior_patterns 
        WHERE user_id = ${userId}
        ORDER BY frequency DESC
      `;
      return result;
    } catch (error) {
      console.error('Error getting behavior patterns:', error);
      return [];
    }
  }
  
  // Analyze message for specific behaviors
  analyzeBehaviors(message) {
    const lowerMessage = message.toLowerCase();
    const behaviors = [];
    
    // Detect joke telling
    if (lowerMessage.includes('joke') || lowerMessage.includes('funny') || 
        lowerMessage.includes('haha') || lowerMessage.includes('lol')) {
      behaviors.push({ type: 'joke_teller', context: { humor_type: 'general' } });
    }
    
    // Detect complaining
    if (lowerMessage.includes('hate') || lowerMessage.includes('annoying') || 
        lowerMessage.includes('stupid') || lowerMessage.includes('worst')) {
      behaviors.push({ type: 'complainer', context: { complaint_intensity: 'high' } });
    }
    
    // Detect flexing
    if (lowerMessage.includes('my') && (lowerMessage.includes('car') || lowerMessage.includes('money') || 
        lowerMessage.includes('house') || lowerMessage.includes('job'))) {
      behaviors.push({ type: 'flexer', context: { flex_category: 'material' } });
    }
    
    // Detect questioning
    if (message.includes('?') || lowerMessage.startsWith('how') || 
        lowerMessage.startsWith('what') || lowerMessage.startsWith('why')) {
      behaviors.push({ type: 'questioner', context: { question_type: 'general' } });
    }
    
    return behaviors;
  }
  
  // Enhanced store interaction with behavior tracking
  async storeInteraction(userId, message, sessionId = null) {
    const emotion = this.analyzeEmotion(message);
    const respectLevel = this.analyzeRespectLevel(message);
    const personalityMode = this.determinePersonalityMode(emotion, respectLevel);
    const behaviors = this.analyzeBehaviors(message);
    
    // Store in database if available, otherwise use localStorage
    if (this.isInitialized && this.sql) {
      try {
        await this.sql`
          INSERT INTO user_interactions (user_id, message, emotion, respect_level, personality_mode, session_id)
          VALUES (${userId}, ${message}, ${emotion}, ${respectLevel}, ${personalityMode}, ${sessionId})
        `;
        
        // Track behavior patterns
        for (const behavior of behaviors) {
          await this.trackBehaviorPattern(userId, behavior.type, behavior.context);
        }
      } catch (error) {
        console.error('Error storing interaction:', error);
        this.storeInteractionLocally(userId, { message, emotion, respectLevel, personalityMode, timestamp: new Date().toISOString() });
      }
    } else {
      this.storeInteractionLocally(userId, { message, emotion, respectLevel, personalityMode, timestamp: new Date().toISOString() });
    }
    
    // Update conversation insights
    await this.updateConversationInsights(userId);
    
    return { emotion, respectLevel, personalityMode, behaviors };
  }

  // Analyze Armenian cultural elements in conversation
   analyzeCulturalElements(userMessage, aiResponse) {
     const elements = [];
     const lowerMessage = userMessage.toLowerCase();
     const lowerResponse = aiResponse.toLowerCase();
     
     // Detect Armenian slang usage in user message
     const armenianSlang = ['ara', 'gyot', 'chato', 'bro jan', 'lav eli', 'aper', 'axchik', 'jan', 'vor', 'inch ka', 'vonts es', 'tsavt tanem', 'txa', 'bozi txa', 'vor anes', 'esh'];
     for (const slang of armenianSlang) {
       if (lowerMessage.includes(slang)) {
         elements.push({ 
           type: 'slang_usage', 
           content: `User used: ${slang}`, 
           tags: ['armenian', 'slang', 'user_learning'] 
         });
       }
     }
     
     // Detect Armenian language usage
     if (lowerMessage.includes('ապրես') || lowerMessage.includes('բարև') || 
         lowerMessage.includes('շնորհակալություն') || lowerMessage.includes('ինչ կա') ||
         lowerMessage.includes('ոնց ես') || lowerMessage.includes('ծավտ տանեմ')) {
       elements.push({ 
         type: 'cultural_phrase', 
         content: userMessage, 
         tags: ['armenian', 'language', 'cultural'] 
       });
     }
     
     // Detect cultural references
     if (lowerMessage.includes('armenia') || lowerMessage.includes('armenian') ||
         lowerMessage.includes('yerevan') || lowerMessage.includes('ararat') ||
         lowerMessage.includes('glendale') || lowerMessage.includes('dolma') ||
         lowerMessage.includes('hookah') || lowerMessage.includes('lavash')) {
       elements.push({ 
         type: 'cultural_reference', 
         content: userMessage, 
         tags: ['armenian', 'cultural', 'reference'] 
       });
     }
     
     // Detect successful roasts/comebacks in AI response
     if (lowerResponse.includes('savage') || lowerResponse.includes('roast') ||
         lowerResponse.includes('flex') || lowerResponse.includes('txa')) {
       elements.push({ 
         type: 'successful_roast', 
         content: aiResponse, 
         tags: ['roast', 'savage', 'effective'] 
       });
     }
     
     // Detect cultural food references
     const armenianFood = ['dolma', 'lavash', 'kebab', 'pilaf', 'baklava', 'lahmajoun', 'manti'];
     for (const food of armenianFood) {
       if (lowerMessage.includes(food) || lowerResponse.includes(food)) {
         elements.push({ 
           type: 'cultural_food', 
           content: `Food reference: ${food}`, 
           tags: ['armenian', 'food', 'cultural'] 
         });
       }
     }
     
     return elements;
   }

  // Generate context for dynamic prompts
  async generateContext(userId, messageHistory = []) {
    const insights = await this.getConversationInsights(userId);
    const behaviorPatterns = await this.getUserBehaviorPatterns(userId);
    const recentEmotion = messageHistory.length > 0 ? 
      this.analyzeEmotion(messageHistory[messageHistory.length - 1].content) : 'neutral';
    const recentRespectLevel = messageHistory.length > 0 ? 
      this.analyzeRespectLevel(messageHistory[messageHistory.length - 1].content) : 'medium';
    
    // Get relevant content suggestions
    const contextTags = [recentEmotion, recentRespectLevel];
    const relevantJokes = await this.getRelevantContent('joke', contextTags);
    const relevantComebacks = await this.getRelevantContent('comeback', contextTags);
    
    return {
      userInsights: insights,
      behaviorPatterns: behaviorPatterns,
      currentEmotion: recentEmotion,
      currentRespectLevel: recentRespectLevel,
      personalityMode: this.determinePersonalityMode(recentEmotion, recentRespectLevel, messageHistory),
      conversationLength: messageHistory.length,
      suggestedContent: {
        jokes: relevantJokes,
        comebacks: relevantComebacks
      }
    };
  }
}

// Create and export singleton instance
export const memoryService = new MemoryService();
export default memoryService;