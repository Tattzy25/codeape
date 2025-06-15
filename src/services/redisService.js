/**
 * Redis Service
 * Handles data persistence and caching using Redis
 */

class RedisService {
  constructor() {
    this.baseURL = '/api/redis';
  }

  /**
   * Get a value from Redis
   * @param {string} key - The key to retrieve
   * @returns {Promise<any>} The stored value
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
      throw new Error(`Failed to get value: ${error.message}`);
    }
  }

  /**
   * Set a value in Redis
   * @param {string} key - The key to store
   * @param {any} value - The value to store
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<boolean>} Success status
   */
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
      throw new Error(`Failed to set value: ${error.message}`);
    }
  }

  /**
   * Update a value in Redis
   * @param {string} key - The key to update
   * @param {any} value - The new value
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<boolean>} Success status
   */
  async update(key, value, ttl = null) {
    try {
      const body = { key, value };
      if (ttl) {
        body.ttl = ttl;
      }

      const response = await fetch(this.baseURL, {
        method: 'PUT',
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
      console.error('Redis update error:', error);
      throw new Error(`Failed to update value: ${error.message}`);
    }
  }

  /**
   * Delete a value from Redis
   * @param {string} key - The key to delete
   * @returns {Promise<boolean>} Success status
   */
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
      throw new Error(`Failed to delete value: ${error.message}`);
    }
  }

  /**
   * Store chat history in Redis
   * @param {string} sessionId - Unique session identifier
   * @param {Array} messages - Chat messages array
   * @param {number} ttl - Time to live in seconds (default: 24 hours)
   * @returns {Promise<boolean>} Success status
   */
  async storeChatHistory(sessionId, messages, ttl = 86400) {
    const key = `chat_history:${sessionId}`;
    return this.set(key, messages, ttl);
  }

  /**
   * Retrieve chat history from Redis
   * @param {string} sessionId - Unique session identifier
   * @returns {Promise<Array>} Chat messages array
   */
  async getChatHistory(sessionId) {
    const key = `chat_history:${sessionId}`;
    const history = await this.get(key);
    return history || [];
  }

  /**
   * Store user settings in Redis
   * @param {string} userId - Unique user identifier
   * @param {Object} settings - User settings object
   * @param {number} ttl - Time to live in seconds (default: 30 days)
   * @returns {Promise<boolean>} Success status
   */
  async storeUserSettings(userId, settings, ttl = 2592000) {
    const key = `user_settings:${userId}`;
    return this.set(key, settings, ttl);
  }

  /**
   * Retrieve user settings from Redis
   * @param {string} userId - Unique user identifier
   * @returns {Promise<Object>} User settings object
   */
  async getUserSettings(userId) {
    const key = `user_settings:${userId}`;
    const settings = await this.get(key);
    return settings || {};
  }

  /**
   * Cache search results in Redis
   * @param {string} query - Search query
   * @param {Object} results - Search results
   * @param {number} ttl - Time to live in seconds (default: 1 hour)
   * @returns {Promise<boolean>} Success status
   */
  async cacheSearchResults(query, results, ttl = 3600) {
    const key = `search_cache:${btoa(query)}`; // Base64 encode query for safe key
    return this.set(key, results, ttl);
  }

  /**
   * Get cached search results from Redis
   * @param {string} query - Search query
   * @returns {Promise<Object|null>} Cached search results or null
   */
  async getCachedSearchResults(query) {
    const key = `search_cache:${btoa(query)}`; // Base64 encode query for safe key
    return this.get(key);
  }

  /**
   * Generate a unique session ID
   * @returns {string} Unique session identifier
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique user ID
   * @returns {string} Unique user identifier
   */
  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create and export a singleton instance
const redisService = new RedisService();
export default redisService;

// Also export the class for testing
export { RedisService };