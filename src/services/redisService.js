/**
 * 🔥 KYARTU REDIS STORAGE SERVICE
 * Handles all Redis operations for Kyartu's savage AI personality
 */

class RedisService {
  constructor() {
    this.baseURL = '/api/redis';
    
    // TTL Constants (in seconds)
    this.TTL = {
      CHAT_HISTORY: 86400,      // 24h
      SESSION_STATE: 86400,     // 24h
      RESPECT_MOOD: 604800,     // 7d
      JOKES: 259200,            // 3d
      SEARCH_CACHE: 3600,       // 1h
      USER_PREFS: 2592000,      // 30d
      REACTIONS: 604800,        // 7d
      FLAGS: 86400,             // 1d
      LAST_SEEN: 604800         // 7d
    };
  }

  /**
   * Core Redis Operations
   */
  async get(key) {
    try {
      const response = await fetch(`${this.baseURL}?key=${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.value ? JSON.parse(data.value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null; // Graceful fallback
    }
  }

  async set(key, value, ttl = null) {
    try {
      const body = { key, value };
      if (ttl) {
        body.ttl = ttl;
      }

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  async delete(key) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.deleted;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  /**
   * 1. Chat History (Short-Term)
   * Key: chat:session:{sessionId}
   * Purpose: Keeps last convo alive for fluid, savage comebacks
   */
  async storeChatHistory(sessionId, messages) {
    const key = `chat:session:${sessionId}`;
    const data = {
      messages,
      timestamps: messages.map(m => m.timestamp || Date.now()),
      lastUpdated: Date.now()
    };
    return this.set(key, data, this.TTL.CHAT_HISTORY);
  }

  async getChatHistory(sessionId) {
    const key = `chat:session:${sessionId}`;
    const data = await this.get(key);
    return data ? data.messages : [];
  }

  /**
   * 2. User Session State
   * Key: session:{sessionId}
   * Purpose: Tracks if Kyartu's in cousin mode, flirt mode, roast mode
   */
  async storeSessionState(sessionId, state) {
    const key = `session:${sessionId}`;
    const data = {
      currentMode: state.currentMode || 'normal',
      lastPage: state.lastPage || 'welcome',
      joinedAt: state.joinedAt || Date.now(),
      ...state
    };
    return this.set(key, data, this.TTL.SESSION_STATE);
  }

  async getSessionState(sessionId) {
    const key = `session:${sessionId}`;
    const data = await this.get(key);
    return data || {
      currentMode: 'normal',
      lastPage: 'welcome',
      joinedAt: Date.now()
    };
  }

  /**
   * 3. Respect & Mood Meter (Short-Term)
   * Key: meter:respect:{userId} / meter:mood:{userId}
   * Purpose: Keeps score so Kyartu knows if you're a clown or a king
   */
  async storeRespectMeter(userId, respectScore) {
    const key = `meter:respect:${userId}`;
    const data = {
      respectScore: Math.max(0, Math.min(5, respectScore)), // 0-5 scale
      lastUpdated: Date.now(),
      history: [] // Track changes over time
    };
    return this.set(key, data, this.TTL.RESPECT_MOOD);
  }

  async getRespectMeter(userId) {
    const key = `meter:respect:${userId}`;
    const data = await this.get(key);
    return data ? data.respectScore : 3; // Default neutral respect
  }

  async storeMoodMeter(userId, mood) {
    const key = `meter:mood:${userId}`;
    const data = {
      lastMood: mood,
      moodHistory: [],
      lastUpdated: Date.now()
    };
    return this.set(key, data, this.TTL.RESPECT_MOOD);
  }

  async getMoodMeter(userId) {
    const key = `meter:mood:${userId}`;
    const data = await this.get(key);
    return data ? data.lastMood : 'neutral';
  }

  /**
   * 4. Search Result Cache
   * Key: search:{queryHash}
   * Purpose: Caches Tavily results so you don't keep hitting the engine
   */
  async cacheSearchResults(query, results) {
    const queryHash = btoa(query).replace(/[^a-zA-Z0-9]/g, ''); // Clean hash
    const key = `search:${queryHash}`;
    const data = {
      query,
      results,
      source: 'tavily',
      cachedAt: Date.now()
    };
    return this.set(key, data, this.TTL.SEARCH_CACHE);
  }

  async getCachedSearchResults(query) {
    const queryHash = btoa(query).replace(/[^a-zA-Z0-9]/g, '');
    const key = `search:${queryHash}`;
    const data = await this.get(key);
    return data ? data.results : null;
  }

  /**
   * 5. User Joke Bank (Temp Roasting Material)
   * Key: jokes:user:{userId}
   * Purpose: Recycle user's own joke back at them or another user
   */
  async addUserJoke(userId, joke) {
    const key = `jokes:user:${userId}`;
    let jokes = await this.get(key) || [];
    
    // Add new joke and keep only last 10
    jokes.unshift({
      joke,
      addedAt: Date.now(),
      usedCount: 0
    });
    jokes = jokes.slice(0, 10);
    
    return this.set(key, jokes, this.TTL.JOKES);
  }

  async getUserJokes(userId) {
    const key = `jokes:user:${userId}`;
    const jokes = await this.get(key);
    return jokes || [];
  }

  async getRandomUserJoke(userId) {
    const jokes = await this.getUserJokes(userId);
    if (jokes.length === 0) return null;
    
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    return randomJoke.joke;
  }

  /**
   * 6. Emoji Reaction Tracker
   * Key: reaction:message:{messageId}
   * Purpose: Track reactions for training and comedy memory
   */
  async addReaction(messageId, emoji, userId) {
    const key = `reaction:message:${messageId}`;
    let reactions = await this.get(key) || {};
    
    if (!reactions[emoji]) reactions[emoji] = 0;
    reactions[emoji]++;
    
    // Track who reacted
    if (!reactions._users) reactions._users = {};
    if (!reactions._users[emoji]) reactions._users[emoji] = [];
    if (!reactions._users[emoji].includes(userId)) {
      reactions._users[emoji].push(userId);
    }
    
    return this.set(key, reactions, this.TTL.REACTIONS);
  }

  async getMessageReactions(messageId) {
    const key = `reaction:message:${messageId}`;
    const reactions = await this.get(key);
    return reactions || {};
  }

  /**
   * 7. User Preferences (Temp)
   * Key: prefs:user:{userId}
   * Purpose: Keeps mute state, UI mode, behavior override
   */
  async storeUserPreferences(userId, preferences) {
    const key = `prefs:user:${userId}`;
    const data = {
      flirtMode: preferences.flirtMode || false,
      censorMode: preferences.censorMode || false,
      roastLevel: preferences.roastLevel || 'medium', // mild, medium, savage
      theme: preferences.theme || 'dark',
      notifications: preferences.notifications || true,
      ...preferences,
      lastUpdated: Date.now()
    };
    return this.set(key, data, this.TTL.USER_PREFS);
  }

  async getUserPreferences(userId) {
    const key = `prefs:user:${userId}`;
    const prefs = await this.get(key);
    return prefs || {
      flirtMode: false,
      censorMode: false,
      roastLevel: 'medium',
      theme: 'dark',
      notifications: true
    };
  }

  /**
   * 8. System Notices & Flags
   * Key: flags:user:{userId}
   * Purpose: Ban, timeout, warning logic
   */
  async setUserFlag(userId, flag, reason = '') {
    const key = `flags:user:${userId}`;
    let flags = await this.get(key) || {};
    
    flags[flag] = {
      active: true,
      reason,
      setAt: Date.now()
    };
    
    return this.set(key, flags, this.TTL.FLAGS);
  }

  async getUserFlags(userId) {
    const key = `flags:user:${userId}`;
    const flags = await this.get(key);
    return flags || {};
  }

  async isUserMuted(userId) {
    const flags = await this.getUserFlags(userId);
    return flags.muted && flags.muted.active;
  }

  /**
   * 9. Last Interaction Timestamp
   * Key: lastSeen:user:{userId}
   * Purpose: Detect inactivity, trigger comeback roast
   */
  async updateLastSeen(userId) {
    const key = `lastSeen:user:${userId}`;
    const data = {
      lastSeen: new Date().toISOString(),
      lastActivity: Date.now()
    };
    return this.set(key, data, this.TTL.LAST_SEEN);
  }

  async getLastSeen(userId) {
    const key = `lastSeen:user:${userId}`;
    const data = await this.get(key);
    return data ? new Date(data.lastSeen) : null;
  }

  async getInactiveUsers(hoursThreshold = 24) {
    // This would require a scan operation in a real Redis implementation
    // For now, return empty array as this requires server-side logic
    return [];
  }

  /**
   * Phone Call Management
   */
  async storeCallAttempt(userId, timestamp) {
    const key = `call_attempt:${userId}`;
    return this.set(key, timestamp, this.TTL.LAST_SEEN);
  }

  async getLastCallTime(userId) {
    const key = `call_attempt:${userId}`;
    return this.get(key);
  }

  /**
   * Utility Methods
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Batch Operations for Performance
   */
  async initializeUser(userId, sessionId) {
    const promises = [
      this.storeUserPreferences(userId, {}),
      this.storeSessionState(sessionId, { currentMode: 'normal' }),
      this.storeRespectMeter(userId, 3),
      this.storeMoodMeter(userId, 'neutral'),
      this.updateLastSeen(userId)
    ];
    
    await Promise.all(promises);
    return true;
  }

  /**
   * Legacy compatibility methods
   */
  async storeUserSettings(userId, settings, ttl = this.TTL.USER_PREFS) {
    return this.storeUserPreferences(userId, settings);
  }

  async getUserSettings(userId) {
    return this.getUserPreferences(userId);
  }
}

// Create and export a singleton instance
const redisService = new RedisService();
export default redisService;

// Also export the class for testing
export { RedisService };