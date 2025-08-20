#!/usr/bin/env node

/**
 * @fileoverview Production start script for Aishi Docs
 * @description Reads PORT from .env file and starts Next.js server
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

// Get port from environment or use default
const port = process.env.PORT || '3302';

console.log(`Starting Aishi Docs on port ${port}...`);

// Start Next.js
const child = spawn('next', ['start', '-p', port], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});