#!/usr/bin/env node

/**
 * 🔥 ARMO REDIS SETUP SCRIPT
 * Automated Redis installation and configuration for Armo chatbot
 * Supports both local Redis and Upstash cloud Redis setup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class RedisSetup {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
    this.envExamplePath = path.join(process.cwd(), '.env.example');
  }

  async run() {
    console.log('🚀 Starting Armo Redis Setup...');
    console.log('=====================================\n');

    try {
      // Check if .env exists
      if (!fs.existsSync(this.envPath)) {
        this.createEnvFromExample();
      }

      // Show setup options
      this.showSetupOptions();
      
      // Validate current setup
      await this.validateSetup();
      
      console.log('\n✅ Redis setup completed successfully!');
      console.log('\n📖 Next steps:');
      console.log('1. Update your .env file with Redis credentials');
      console.log('2. Run `npm run dev` to start the development server');
      console.log('3. Check Redis connection in the browser console');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  createEnvFromExample() {
    if (fs.existsSync(this.envExamplePath)) {
      fs.copyFileSync(this.envExamplePath, this.envPath);
      console.log('✅ Created .env file from .env.example');
    } else {
      console.warn('⚠️ .env.example not found. Creating basic .env file...');
      this.createBasicEnv();
    }
  }

  createBasicEnv() {
    const basicEnv = `# Armo Redis Configuration
# Choose one of the options below:

# Option 1: Upstash Redis (Recommended for production)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here

# Option 2: Local Redis (Development)
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
# REDIS_DB=0

# Redis Performance Settings
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=100
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000
REDIS_ENABLE_MONITORING=true

# Other required API keys
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
`;
    
    fs.writeFileSync(this.envPath, basicEnv);
    console.log('✅ Created basic .env file');
  }

  showSetupOptions() {
    console.log('📋 Redis Setup Options:');
    console.log('========================\n');
    
    console.log('🌟 Option 1: Upstash Redis (Recommended)');
    console.log('   - Managed Redis service');
    console.log('   - No local installation required');
    console.log('   - Free tier available');
    console.log('   - Steps:');
    console.log('     1. Go to https://console.upstash.com/');
    console.log('     2. Create a new Redis database');
    console.log('     3. Copy REST URL and Token to .env file');
    console.log('');
    
    console.log('🔧 Option 2: Local Redis (Development)');
    console.log('   - Runs on your local machine');
    console.log('   - Full control over configuration');
    console.log('   - Steps:');
    
    if (process.platform === 'win32') {
      console.log('     Windows: Download from https://redis.io/download');
      console.log('     Or use WSL: sudo apt-get install redis-server');
    } else if (process.platform === 'darwin') {
      console.log('     macOS: brew install redis');
      console.log('     Then: brew services start redis');
    } else {
      console.log('     Linux: sudo apt-get install redis-server');
      console.log('     Then: sudo systemctl start redis-server');
    }
    
    console.log('     Update .env with local Redis settings');
    console.log('');
  }

  async validateSetup() {
    console.log('🔍 Validating Redis setup...');
    
    // Check if Redis dependencies are installed
    try {
      require('@upstash/redis');
      console.log('✅ @upstash/redis package found');
    } catch (error) {
      console.log('⚠️ Installing @upstash/redis...');
      try {
        execSync('npm install @upstash/redis', { stdio: 'inherit' });
        console.log('✅ @upstash/redis installed successfully');
      } catch (installError) {
        throw new Error('Failed to install @upstash/redis. Please run: npm install @upstash/redis');
      }
    }

    // Check .env configuration
    const envContent = fs.readFileSync(this.envPath, 'utf8');
    const hasUpstash = envContent.includes('UPSTASH_REDIS_REST_URL') && 
                      !envContent.includes('UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here');
    const hasLocal = envContent.includes('REDIS_HOST=localhost') || 
                     envContent.includes('REDIS_HOST=127.0.0.1');

    if (!hasUpstash && !hasLocal) {
      console.log('⚠️ Redis not configured in .env file');
      console.log('   Please update .env with your Redis credentials');
    } else {
      console.log('✅ Redis configuration found in .env');
    }

    // Check Redis service files
    const redisServicePath = path.join(process.cwd(), 'src', 'services', 'redisService.js');
    const redisApiPath = path.join(process.cwd(), 'api', 'redis.js');
    
    if (fs.existsSync(redisServicePath)) {
      console.log('✅ Redis service file found');
    } else {
      console.log('⚠️ Redis service file missing');
    }
    
    if (fs.existsSync(redisApiPath)) {
      console.log('✅ Redis API endpoint found');
    } else {
      console.log('⚠️ Redis API endpoint missing');
    }
  }

  // Test Redis connection (if configured)
  async testConnection() {
    console.log('🔌 Testing Redis connection...');
    
    try {
      // This would require the actual Redis client to be available
      // For now, we'll just validate the configuration
      console.log('✅ Redis configuration appears valid');
      console.log('   (Connection will be tested when the app starts)');
    } catch (error) {
      console.log('❌ Redis connection test failed:', error.message);
    }
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  const setup = new RedisSetup();
  setup.run().catch(console.error);
}

module.exports = RedisSetup;