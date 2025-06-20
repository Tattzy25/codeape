# 🔥 Armo Redis Complete Guide

Comprehensive guide for Redis setup, configuration, and management in the Armo chatbot project.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation Options](#installation-options)
- [Configuration](#configuration)
- [Scripts & Commands](#scripts--commands)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## 🚀 Quick Start

### 1. Automated Setup
```bash
npm run setup:redis
```

This script will:
- Create `.env` file from template
- Show setup options (Upstash vs Local)
- Validate configuration
- Install required dependencies

### 2. Choose Your Redis Option

**Option A: Upstash Redis (Recommended)**
- ✅ Managed service, no local installation
- ✅ Free tier available
- ✅ Automatic scaling and backups
- ✅ Global edge locations

**Option B: Local Redis**
- ✅ Full control over configuration
- ✅ No external dependencies
- ✅ Better for development/testing

## 🛠 Installation Options

### Option A: Upstash Redis Setup

1. **Create Upstash Account**
   - Go to [console.upstash.com](https://console.upstash.com/)
   - Sign up for free account

2. **Create Redis Database**
   - Click "Create Database"
   - Choose region closest to your users
   - Select "Free" tier for development

3. **Get Credentials**
   - Copy REST URL and Token
   - Add to your `.env` file:

```env
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### Option B: Local Redis Setup

#### Windows
```bash
# Option 1: Download from Redis.io
# Visit: https://redis.io/download

# Option 2: Using WSL
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start
```

#### macOS
```bash
# Using Homebrew
brew install redis
brew services start redis

# Verify installation
redis-cli ping
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### Local Redis Configuration
```env
# Local Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## ⚙️ Configuration

### Environment Variables

```env
# === REDIS CONFIGURATION ===

# Option 1: Upstash Redis (Production)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Option 2: Local Redis (Development)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_if_any
REDIS_DB=0

# === PERFORMANCE SETTINGS ===
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=100
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000

# === MEMORY MANAGEMENT ===
REDIS_MAX_MEMORY=256mb
REDIS_EVICTION_POLICY=allkeys-lru

# === MONITORING ===
REDIS_ENABLE_MONITORING=true
REDIS_LOG_SLOW_QUERIES=true
REDIS_SLOW_QUERY_THRESHOLD=1000
```

### Redis Configuration Best Practices

#### Memory Optimization
```redis
# /etc/redis/redis.conf (for local Redis)
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

#### Security Settings
```redis
# Bind to specific interfaces
bind 127.0.0.1

# Require password
requirepass your_secure_password

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
```

## 🔧 Scripts & Commands

### Available NPM Scripts

```bash
# Setup and initialization
npm run setup:redis          # Interactive Redis setup

# Health monitoring
npm run redis:health          # Comprehensive health check
npm run redis:status          # Quick status check
npm run redis:monitor         # Real-time monitoring

# Maintenance
npm run redis:cleanup         # Clean expired keys
```

### Manual Redis Commands

```bash
# Test connection
redis-cli ping

# Monitor real-time commands
redis-cli monitor

# Check memory usage
redis-cli info memory

# List all keys (use carefully in production)
redis-cli keys "armo:*"

# Get specific key
redis-cli get "armo:chat:user123"

# Check key TTL
redis-cli ttl "armo:session:abc123"
```

## 📊 Monitoring & Health Checks

### Health Check Script

Run comprehensive health check:
```bash
npm run redis:health
```

This checks:
- ✅ Connection status and latency
- ✅ Performance metrics (SET/GET/DEL)
- ✅ Memory usage
- ✅ Configuration validation
- ✅ Key operations integrity
- ✅ TTL functionality

### Real-time Monitoring

```bash
# Monitor Redis status every 5 seconds
npm run redis:monitor
```

### Performance Metrics

The system tracks:
- **Connection latency**: Time to establish connection
- **Operation latency**: SET/GET/DEL response times
- **Error rates**: Failed operations percentage
- **Memory usage**: Current and peak memory consumption
- **Hit rates**: Cache hit/miss ratios

## ⚡ Performance Optimization

### Memory Usage Estimation

| Data Type | Estimated Size | TTL | Notes |
|-----------|---------------|-----|-------|
| Chat History | ~2KB per conversation | 7 days | JSON serialized |
| User Sessions | ~500B per session | 24 hours | User state data |
| Respect/Mood | ~200B per user | 30 days | Numerical values |
| Search Cache | ~1KB per query | 1 hour | Search results |
| Joke Bank | ~300B per joke | 24 hours | Text content |
| User Preferences | ~1KB per user | 30 days | JSON configuration |

### Optimization Tips

1. **Use appropriate TTLs**
   ```javascript
   // Short-lived data
   await redis.set('temp:data', value, { ex: 300 }); // 5 minutes
   
   // Long-lived data
   await redis.set('user:prefs', value, { ex: 2592000 }); // 30 days
   ```

2. **Batch operations when possible**
   ```javascript
   // Instead of multiple SET commands
   await redisService.batchSet([
     ['key1', 'value1'],
     ['key2', 'value2'],
     ['key3', 'value3']
   ]);
   ```

3. **Use efficient data structures**
   ```javascript
   // For counters, use INCR instead of GET/SET
   await redis.incr('armo:stats:messages');
   
   // For lists, use Redis lists instead of JSON arrays
   await redis.lpush('armo:recent:messages', message);
   ```

## 🔍 Troubleshooting

### Common Issues

#### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution:**
- Check if Redis server is running: `redis-cli ping`
- Start Redis: `redis-server` or `brew services start redis`
- Verify port and host in `.env`

#### Authentication Failed
```
Error: NOAUTH Authentication required
```
**Solution:**
- Add password to `.env`: `REDIS_PASSWORD=your_password`
- Or disable auth in redis.conf: `# requirepass`

#### Memory Issues
```
Error: OOM command not allowed when used memory > 'maxmemory'
```
**Solution:**
- Increase maxmemory: `CONFIG SET maxmemory 512mb`
- Set eviction policy: `CONFIG SET maxmemory-policy allkeys-lru`
- Run cleanup: `npm run redis:cleanup`

#### High Latency
```
Warning: Redis latency > 1000ms
```
**Solution:**
- Check network connectivity
- Monitor Redis with: `redis-cli --latency`
- Consider using Redis cluster or read replicas
- Optimize queries and reduce payload size

### Debug Mode

Enable detailed logging:
```env
REDIS_DEBUG=true
REDIS_LOG_LEVEL=debug
```

### Health Check Troubleshooting

```bash
# Run health check with verbose output
DEBUG=redis:* npm run redis:health

# Check specific Redis info
redis-cli info server
redis-cli info memory
redis-cli info stats
```

## 🏆 Best Practices

### Key Naming Convention
```
armo:{feature}:{identifier}:{subkey}

Examples:
armo:chat:user123:history
armo:session:abc123:state
armo:respect:user456:meter
armo:cache:search:query_hash
```

### TTL Strategy
- **Session data**: 24 hours
- **Chat history**: 7 days
- **Cache data**: 1 hour
- **User preferences**: 30 days
- **Temporary data**: 5-15 minutes

### Error Handling
```javascript
try {
  const result = await redis.get(key);
  return result ? JSON.parse(result) : null;
} catch (error) {
  console.error('Redis operation failed:', error);
  // Fallback to default behavior
  return null;
}
```

### Connection Management
- Use connection pooling for high-traffic applications
- Implement retry logic with exponential backoff
- Monitor connection health regularly
- Use lazy connections to reduce startup time

### Security
- Always use authentication in production
- Bind Redis to specific interfaces only
- Use TLS for connections over public networks
- Regularly update Redis to latest stable version
- Monitor for unusual access patterns

### Monitoring
- Set up alerts for high memory usage
- Monitor connection counts and latency
- Track error rates and failed operations
- Use Redis Sentinel for high availability

## 📚 Additional Resources

- [Redis Official Documentation](https://redis.io/documentation)
- [Upstash Documentation](https://docs.upstash.com/)
- [Redis Best Practices](https://redis.io/topics/memory-optimization)
- [Redis Security](https://redis.io/topics/security)

---

**Need help?** Check the troubleshooting section or run `npm run redis:health` for diagnostics.