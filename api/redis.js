import { Redis } from '@upstash/redis';

// Initialize Redis client with enhanced configuration
let redis;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Upstash Redis (Production)
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY) || 100,
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES) || 3,
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT) || 10000,
    commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT) || 5000,
    lazyConnect: true
  });
} else if (process.env.REDIS_HOST) {
  // Local Redis (Development)
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0,
    retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY) || 100,
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES) || 3,
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT) || 10000,
    commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT) || 5000,
    lazyConnect: true,
    keepAlive: 30000
  });
} else {
  console.warn('⚠️ No Redis configuration found. Service will operate in fallback mode.');
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check if Redis is configured
    if (!redis) {
      return res.status(500).json({ 
        error: 'Redis not configured',
        message: 'Redis configuration is required. Set either Upstash (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN) or local Redis (REDIS_HOST, REDIS_PORT) environment variables.'
      });
    }
    
    // Test Redis connection
    try {
      await redis.ping();
    } catch (connectionError) {
      console.error('Redis connection failed:', connectionError);
      return res.status(503).json({
        error: 'Redis connection failed',
        message: 'Unable to connect to Redis server. Please check your configuration.'
      });
    }

    switch (req.method) {
      case 'GET':
        const { key } = req.query;
        if (!key) {
          return res.status(400).json({ error: 'Key parameter is required' });
        }
        const result = await redis.get(key);
        return res.status(200).json({ success: true, key, value: result });

      case 'POST':
        const { key: postKey, value, ttl } = req.body;
        if (!postKey || value === undefined) {
          return res.status(400).json({ error: 'Key and value are required' });
        }
        
        let setResult;
        if (ttl) {
          setResult = await redis.setex(postKey, ttl, JSON.stringify(value));
        } else {
          setResult = await redis.set(postKey, JSON.stringify(value));
        }
        
        return res.status(200).json({ 
          success: true, 
          key: postKey, 
          result: setResult,
          message: 'Value stored successfully'
        });

      case 'PUT':
        const { key: putKey, value: putValue, ttl: putTtl } = req.body;
        if (!putKey || putValue === undefined) {
          return res.status(400).json({ error: 'Key and value are required' });
        }
        
        let updateResult;
        if (putTtl) {
          updateResult = await redis.setex(putKey, putTtl, JSON.stringify(putValue));
        } else {
          updateResult = await redis.set(putKey, JSON.stringify(putValue));
        }
        
        return res.status(200).json({ 
          success: true, 
          key: putKey, 
          result: updateResult,
          message: 'Value updated successfully'
        });

      case 'DELETE':
        const { key: deleteKey } = req.body;
        if (!deleteKey) {
          return res.status(400).json({ error: 'Key is required' });
        }
        
        const deleteResult = await redis.del(deleteKey);
        return res.status(200).json({ 
          success: true, 
          key: deleteKey, 
          deleted: deleteResult > 0,
          message: deleteResult > 0 ? 'Key deleted successfully' : 'Key not found'
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Redis operation error:', error);
    return res.status(500).json({
      error: 'Redis operation failed',
      message: error.message
    });
  }
}