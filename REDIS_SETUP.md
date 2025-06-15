# 🔥 KYARTU REDIS STORAGE SETUP

## Overview
Kyartu now uses Redis for advanced data persistence and caching, enabling features like:
- Chat history with TTL management
- User session state tracking
- Respect & mood meter persistence
- Search result caching
- User joke bank for roasting
- Emoji reaction tracking
- User preferences & flags
- Last interaction timestamps

## Environment Setup

### 1. Create `.env` file
Copy `.env.example` to `.env` and configure:

```bash
# Redis Configuration (Upstash recommended)
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here

# Other API keys
VITE_GROQ_API_KEY=your_groq_key_here
VITE_TAVILY_API_KEY=your_tavily_key_here
```

### 2. Get Upstash Redis (Recommended)
1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the REST URL and Token
4. Add them to your `.env` file

### 3. Alternative: Local Redis
If using local Redis, update `pages/api/redis.js` to use local connection:

```javascript
// For local Redis
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  // password: 'your_password' // if needed
});
```

## Redis Storage Map

### 1. Chat History (Short-Term)
- **Key**: `chat:session:{sessionId}`
- **TTL**: 24h
- **Purpose**: Keeps last convo alive for fluid, savage comebacks
- **Data**: `{ messages: [], timestamps, sender, type }`

### 2. User Session State
- **Key**: `session:{sessionId}`
- **TTL**: 24h
- **Purpose**: Tracks if Kyartu's in cousin mode, flirt mode, roast mode
- **Data**: `{ currentMode: 'flirt', lastPage: 'welcome', joinedAt }`

### 3. Respect & Mood Meter
- **Key**: `meter:respect:{userId}` / `meter:mood:{userId}`
- **TTL**: 7d
- **Purpose**: Keeps score so Kyartu knows if you're a clown or a king
- **Data**: `{ respectScore: 3.5, lastMood: 'emotional' }`

### 4. Search Result Cache
- **Key**: `search:{queryHash}`
- **TTL**: 1h
- **Purpose**: Caches Tavily results so you don't keep hitting the engine
- **Data**: `{ query: "what's a yashik", results: [...], source: 'tavily' }`

### 5. User Joke Bank
- **Key**: `jokes:user:{userId}`
- **TTL**: 3d
- **Purpose**: Recycle user's own joke back at them or another user
- **Data**: `["your mom drives Uber Eats on a horse"]`

### 6. Emoji Reaction Tracker
- **Key**: `reaction:message:{messageId}`
- **TTL**: 7d
- **Purpose**: Track reactions for training and comedy memory
- **Data**: `{ 😂: 4, 😭: 2, 💀: 1 }`

### 7. User Preferences
- **Key**: `prefs:user:{userId}`
- **TTL**: 30d
- **Purpose**: Keeps mute state, UI mode, behavior override
- **Data**: `{ flirtMode: false, censorMode: true }`

### 8. System Notices & Flags
- **Key**: `flags:user:{userId}`
- **TTL**: 24h
- **Purpose**: Ban, timeout, warning logic
- **Data**: `{ muted: true, reason: "disrespect to the culture" }`

### 9. Last Interaction Timestamp
- **Key**: `lastSeen:user:{userId}`
- **TTL**: 7d
- **Purpose**: Detect inactivity, trigger comeback roast
- **Data**: `{ lastSeen: '2025-06-15T02:44:00Z' }`

## Default TTL Settings

```javascript
const TTL = {
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
```

## Features Enabled

### ✅ Implemented
- Chat history persistence with TTL
- User session state tracking
- Respect meter (0-5 scale, displayed as 0-100%)
- Mood meter with dynamic updates
- Search result caching
- User joke collection and retrieval
- Emoji reaction tracking
- User preferences storage
- User flags and moderation
- Last seen timestamp tracking
- Graceful fallback to localStorage

### 🔄 Auto-Features
- **Respect Meter**: Updates based on user language and reactions
- **Mood Detection**: Analyzes user messages for mood suggestions
- **Joke Collection**: Automatically saves funny user messages
- **Session Tracking**: Monitors user activity and modes
- **Search Caching**: Prevents duplicate API calls

## Usage Examples

### Check User Respect
```javascript
const respect = await redisService.getRespectMeter(userId);
console.log(`User respect: ${respect}/5`);
```

### Add User Joke
```javascript
await redisService.addUserJoke(userId, "Why did the chicken cross the road?");
```

### Get Cached Search
```javascript
const cached = await redisService.getCachedSearchResults("AI trends 2024");
if (cached) {
  console.log('Using cached results');
}
```

### Track Reactions
```javascript
await redisService.addReaction(messageId, '😂', userId);
```

## Troubleshooting

### Redis Connection Issues
1. Check your `.env` file has correct Redis credentials
2. Verify Upstash database is active
3. Check network connectivity
4. App will fallback to localStorage if Redis fails

### Data Not Persisting
1. Check browser console for Redis errors
2. Verify TTL settings aren't too short
3. Ensure Redis has sufficient memory

### Performance Issues
1. Monitor Redis memory usage
2. Consider adjusting TTL values
3. Check for excessive API calls

## Monitoring

### Key Metrics to Watch
- Redis memory usage
- Cache hit rates for search results
- User session duration
- Respect meter distribution
- Most popular emoji reactions

### Upstash Dashboard
Monitor your Redis usage at [Upstash Console](https://console.upstash.com/)

---

**Note**: Redis integration provides enhanced persistence and performance, but the app gracefully falls back to localStorage if Redis is unavailable.