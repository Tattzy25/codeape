import express from 'express';
import cors from 'cors';
import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Redis API endpoint
app.all('/api/redis', async (req, res) => {
  try {
    // Check if Redis is configured
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return res.status(500).json({ 
        error: 'Redis not configured',
        message: 'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are required'
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
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Redis API Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});