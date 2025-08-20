# 0G-Compute Environment Configuration
# =====================================
# 
# This file provides example environment variables for the 0G-Compute backend.
# Copy this to your secure external location or create a local .env file.
#
# IMPORTANT: Never commit actual .env files to the repository!
# Use external secure locations for production/development.

# ===================
# CROSS-PLATFORM SETUP
# ===================
#
# This application supports both WSL and Windows PowerShell environments.
# The envLoader automatically detects your environment and converts paths.
#
# SETUP INSTRUCTIONS:
# 
# For WSL (Windows Subsystem for Linux):
#   npm run setup:wsl
#   npm run dev:wsl
#
# For Windows PowerShell:
#   npm run setup:windows
#   npm run dev:windows
#
# For automatic environment detection:
#   npm run setup
#   npm run dev

# ===================
# EXTERNAL ENV FILE PATHS
# ===================
#
# Set ENV_FILE_PATH to load environment from external secure location:
#
# WSL Example:
# ENV_FILE_PATH=/mnt/c/Users/kubas/Desktop/env/dreamscape/.env
#
# Windows Example:
# ENV_FILE_PATH=C:\Users\kubas\Desktop\env\dreamscape\.env
#
# The envLoader will automatically convert between WSL and Windows path formats.

# ===================
# REQUIRED VARIABLES
# ===================

# Master wallet private key (64 characters, without 0x prefix)
# SECURITY: Store this in external .env file, never commit to repository
MASTER_WALLET_KEY=your_64_character_private_key_here

# Blockchain RPC URL (default: 0G Galileo Testnet)
RPC_URL=https://evmrpc-testnet.0g.ai

# Chain ID (default: 16601 for Galileo Testnet)
CHAIN_ID=16601

# Server port (default: 3001)
PORT=3001

# ===================
# MASTER WALLET AUTO-MANAGEMENT
# ===================

# Initial deposit when creating new account (in OG tokens)
# Default: 0.15 OG for new accounts
MASTER_WALLET_INITIAL_DEPOSIT=0.15

# Auto-refill threshold (in OG tokens)
# When balance falls below this, auto-refill triggers
# Default: 0.05 OG
AUTO_REFILL_THRESHOLD=0.05

# Auto-refill amount (in OG tokens)
# Amount to deposit when balance is below threshold
# Default: 0.1 OG
AUTO_REFILL_AMOUNT=0.1

# Max concurrent queries for Query Manager
# Default: 10
MAX_CONCURRENT_QUERIES=10

# ===================
# OPTIONAL VARIABLES
# ===================

# Enable test environment logging (shows detailed path conversion info)
TEST_ENV=true

# Default model for 0G Network queries (fallback when modelId not provided)
# Available options: "llama-3.3-70b-instruct", "deepseek-r1-70b"
MODEL_PICKED=llama-3.3-70b-instruct

# OpenAI API key (for AI fallback)
# OPENAI_API_KEY=your_openai_api_key_here

# ===================
# GOOGLE VERTEX AI / GEMINI
# ===================

# Path to Google Cloud service account JSON file
# This file is created in Google Cloud Console when you create a service account key
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json

# Google Cloud Project ID (from your Google Cloud Console)
VERTEX_AI_PROJECT=your-project-id

# Google Cloud Location/Region (e.g., europe-west1, us-central1)
VERTEX_AI_LOCATION=europe-west1

# Gemini model to use (default: gemini-2.5-flash)
GEMINI_MODEL=gemini-2.5-flash

# Generation parameters
GEMINI_TEMPERATURE=0.8
# Optional: Maximum output tokens (if not set, no limit is applied)
# GEMINI_MAX_TOKENS=500
GEMINI_RESPONSE_MIME_TYPE=application/json

# ===================
# PATH EXAMPLES BY ENVIRONMENT
# ===================

# If you're running in WSL:
# - External .env path: /mnt/c/Users/kubas/Desktop/env/dreamscape/.env
# - Local .env path: /mnt/c/Users/kubas/Desktop/0G-dreamscape-master/0g-compute/.env

# If you're running in Windows PowerShell:
# - External .env path: C:\Users\kubas\Desktop\env\dreamscape\.env
# - Local .env path: C:\Users\kubas\Desktop\0G-dreamscape-master\0g-compute\.env

# The envLoader will try all path variants automatically!

# ===================
# TROUBLESHOOTING
# ===================

# If you encounter "better-sqlite3 invalid ELF header" error:
#   npm run rebuild
#
# If environment loading fails:
#   1. Check that ENV_FILE_PATH points to correct location
#   2. Set TEST_ENV=true to see detailed path conversion logs
#   3. Use platform-specific scripts: npm run dev:wsl or npm run dev:windows
#
# For cross-platform compatibility issues:
#   npm run setup