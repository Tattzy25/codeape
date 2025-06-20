#!/usr/bin/env node

/**
 * 🏥 ARMO REDIS HEALTH CHECK
 * Comprehensive Redis health monitoring and diagnostics
 * Tests connection, performance, and configuration
 */

const { Redis } = require('@upstash/redis');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

class RedisHealthCheck {
  constructor() {
    this.redis = null;
    this.results = {
      connection: false,
      performance: {},
      memory: {},
      configuration: {},
      errors: []
    };
  }

  async run() {
    console.log('🏥 Armo Redis Health Check');
    console.log('===========================\n');

    try {
      await this.initializeRedis();
      await this.testConnection();
      await this.testPerformance();
      await this.checkMemoryUsage();
      await this.validateConfiguration();
      await this.testKeyOperations();
      
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.results.errors.push(error.message);
    } finally {
      this.generateReport();
    }
  }

  async initializeRedis() {
    console.log('🔌 Initializing Redis connection...');
    
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.log('   Using Upstash Redis configuration');
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
        retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY) || 100,
        maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES) || 3,
        connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT) || 10000,
        commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT) || 5000
      });
    } else if (process.env.REDIS_HOST) {
      console.log('   Using local Redis configuration');
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB) || 0
      });
    } else {
      throw new Error('No Redis configuration found in environment variables');
    }
  }

  async testConnection() {
    console.log('🔍 Testing Redis connection...');
    
    try {
      const start = Date.now();
      const pong = await this.redis.ping();
      const latency = Date.now() - start;
      
      if (pong === 'PONG') {
        console.log(`   ✅ Connection successful (${latency}ms)`);
        this.results.connection = true;
        this.results.performance.connectionLatency = latency;
      } else {
        throw new Error('Unexpected ping response: ' + pong);
      }
    } catch (error) {
      console.log('   ❌ Connection failed:', error.message);
      this.results.errors.push('Connection failed: ' + error.message);
      throw error;
    }
  }

  async testPerformance() {
    console.log('⚡ Testing Redis performance...');
    
    try {
      // Test SET performance
      const setStart = Date.now();
      await this.redis.set('health_check:set_test', 'test_value', { ex: 60 });
      const setTime = Date.now() - setStart;
      
      // Test GET performance
      const getStart = Date.now();
      const value = await this.redis.get('health_check:set_test');
      const getTime = Date.now() - getStart;
      
      // Test DEL performance
      const delStart = Date.now();
      await this.redis.del('health_check:set_test');
      const delTime = Date.now() - delStart;
      
      this.results.performance = {
        ...this.results.performance,
        setLatency: setTime,
        getLatency: getTime,
        delLatency: delTime
      };
      
      console.log(`   SET: ${setTime}ms | GET: ${getTime}ms | DEL: ${delTime}ms`);
      
      // Performance warnings
      if (setTime > 1000 || getTime > 1000) {
        console.log('   ⚠️ High latency detected (>1000ms)');
        this.results.errors.push('High latency detected');
      } else {
        console.log('   ✅ Performance looks good');
      }
      
    } catch (error) {
      console.log('   ❌ Performance test failed:', error.message);
      this.results.errors.push('Performance test failed: ' + error.message);
    }
  }

  async checkMemoryUsage() {
    console.log('💾 Checking memory usage...');
    
    try {
      // Try to get memory info (may not be available in all Redis setups)
      const info = await this.redis.info('memory').catch(() => null);
      
      if (info) {
        const memoryLines = info.split('\n');
        const memoryInfo = {};
        
        memoryLines.forEach(line => {
          if (line.includes('used_memory_human:')) {
            memoryInfo.usedMemory = line.split(':')[1].trim();
          }
          if (line.includes('used_memory_peak_human:')) {
            memoryInfo.peakMemory = line.split(':')[1].trim();
          }
        });
        
        this.results.memory = memoryInfo;
        console.log(`   Used: ${memoryInfo.usedMemory || 'N/A'} | Peak: ${memoryInfo.peakMemory || 'N/A'}`);
      } else {
        console.log('   ℹ️ Memory info not available (normal for Upstash)');
      }
      
    } catch (error) {
      console.log('   ⚠️ Could not retrieve memory info:', error.message);
    }
  }

  async validateConfiguration() {
    console.log('⚙️ Validating configuration...');
    
    const config = {
      hasUpstash: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
      hasLocal: !!process.env.REDIS_HOST,
      maxRetries: process.env.REDIS_MAX_RETRIES || '3',
      retryDelay: process.env.REDIS_RETRY_DELAY || '100',
      connectTimeout: process.env.REDIS_CONNECT_TIMEOUT || '10000',
      commandTimeout: process.env.REDIS_COMMAND_TIMEOUT || '5000'
    };
    
    this.results.configuration = config;
    
    if (config.hasUpstash) {
      console.log('   ✅ Upstash configuration detected');
    } else if (config.hasLocal) {
      console.log('   ✅ Local Redis configuration detected');
    } else {
      console.log('   ❌ No valid Redis configuration found');
      this.results.errors.push('No valid Redis configuration');
    }
    
    console.log(`   Retries: ${config.maxRetries} | Timeout: ${config.connectTimeout}ms`);
  }

  async testKeyOperations() {
    console.log('🔑 Testing key operations...');
    
    try {
      const testKey = 'health_check:operations_test';
      const testData = {
        timestamp: Date.now(),
        message: 'Armo health check',
        version: '1.0.0'
      };
      
      // Test JSON operations
      await this.redis.set(testKey, JSON.stringify(testData), { ex: 60 });
      const retrieved = await this.redis.get(testKey);
      const parsed = JSON.parse(retrieved);
      
      if (parsed.message === testData.message) {
        console.log('   ✅ JSON serialization/deserialization works');
      } else {
        throw new Error('Data integrity check failed');
      }
      
      // Test TTL
      const ttl = await this.redis.ttl(testKey);
      if (ttl > 0 && ttl <= 60) {
        console.log(`   ✅ TTL working correctly (${ttl}s remaining)`);
      } else {
        console.log(`   ⚠️ TTL unexpected value: ${ttl}`);
      }
      
      // Cleanup
      await this.redis.del(testKey);
      console.log('   ✅ Key operations test completed');
      
    } catch (error) {
      console.log('   ❌ Key operations test failed:', error.message);
      this.results.errors.push('Key operations failed: ' + error.message);
    }
  }

  displayResults() {
    console.log('\n📊 Health Check Results');
    console.log('========================');
    
    console.log(`Connection: ${this.results.connection ? '✅ Healthy' : '❌ Failed'}`);
    
    if (this.results.performance.connectionLatency) {
      console.log(`Latency: ${this.results.performance.connectionLatency}ms`);
    }
    
    if (this.results.memory.usedMemory) {
      console.log(`Memory: ${this.results.memory.usedMemory}`);
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n⚠️ Issues found:');
      this.results.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    } else {
      console.log('\n🎉 All checks passed! Redis is healthy.');
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      status: this.results.connection && this.results.errors.length === 0 ? 'healthy' : 'unhealthy',
      ...this.results
    };
    
    const reportPath = path.join(process.cwd(), 'redis-health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }
}

// Run the health check if this script is executed directly
if (require.main === module) {
  const healthCheck = new RedisHealthCheck();
  healthCheck.run().catch(console.error);
}

module.exports = RedisHealthCheck;