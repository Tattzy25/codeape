#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const logFile = 'build-debug.log';
const timestamp = new Date().toISOString();

function logError(message, error = null) {
  const logEntry = `[${timestamp}] ${message}${error ? `\nError: ${error.message}\nStack: ${error.stack}` : ''}\n\n`;
  fs.appendFileSync(logFile, logEntry);
  console.error(message);
  if (error) console.error(error);
}

function collectSystemInfo() {
  const info = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: process.memoryUsage(),
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      CI: process.env.CI,
      VERCEL: process.env.VERCEL
    }
  };
  
  logError(`System Info: ${JSON.stringify(info, null, 2)}`);
}

function runBuildWithErrorCapture() {
  try {
    collectSystemInfo();
    logError('Starting build process...');
    
    const result = execSync('pnpm run build', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    logError('Build completed successfully!');
    console.log(result);
    
  } catch (error) {
    logError('Build failed with error:', error);
    
    // Additional debugging info
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      logError(`Package info: ${packageJson.name}@${packageJson.version}`);
    } catch (e) {
      logError('Could not read package.json', e);
    }
    
    // Check for common issues
    if (error.message.includes('ENOSPC')) {
      logError('❌ Disk space issue detected');
    } else if (error.message.includes('ENOMEM')) {
      logError('❌ Memory issue detected');
    } else if (error.message.includes('MODULE_NOT_FOUND')) {
      logError('❌ Missing dependency detected');
    }
    
    process.exit(1);
  }
}

runBuildWithErrorCapture();