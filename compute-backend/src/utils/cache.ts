import { UserSession, BrokerSession } from '../types';
import { CACHE_CONFIG } from '../config/constants';
import logger from './logger';

// In-memory caches
const userSessions = new Map<string, UserSession>();
const brokerSessions = new Map<string, BrokerSession>();

// Cache cleanup intervals
let userSessionCleanupInterval: ReturnType<typeof setInterval>;
let brokerSessionCleanupInterval: ReturnType<typeof setInterval>;

// Initialize cache cleanup
export function initializeCache() {
  // Cleanup expired user sessions
  userSessionCleanupInterval = setInterval(() => {
    cleanupUserSessions();
  }, CACHE_CONFIG.CLEANUP_INTERVAL_MS);

  // Cleanup expired broker sessions
  brokerSessionCleanupInterval = setInterval(() => {
    cleanupBrokerSessions();
  }, CACHE_CONFIG.CLEANUP_INTERVAL_MS);

  logger.info('Cache system initialized with cleanup intervals');
}

// Cleanup functions
export function cleanupCache() {
  if (userSessionCleanupInterval) {
    clearInterval(userSessionCleanupInterval);
  }
  if (brokerSessionCleanupInterval) {
    clearInterval(brokerSessionCleanupInterval);
  }
  
  userSessions.clear();
  brokerSessions.clear();
  
  logger.info('Cache system cleaned up');
}

// ============================================================================
// USER SESSION MANAGEMENT
// ============================================================================

export function getUserSession(address: string): UserSession | undefined {
  return userSessions.get(address.toLowerCase());
}

export function setUserSession(address: string, session: UserSession): void {
  userSessions.set(address.toLowerCase(), {
    ...session,
    lastActivity: new Date()
  });
}

export function updateUserActivity(address: string): void {
  const session = getUserSession(address);
  if (session) {
    session.lastActivity = new Date();
    session.requestCount += 1;
    setUserSession(address, session);
  }
}

export function incrementUserAIQueries(address: string): void {
  const session = getUserSession(address);
  if (session) {
    session.aiQueriesUsed += 1;
    setUserSession(address, session);
  }
}

export function incrementUserFundOperations(address: string): void {
  const session = getUserSession(address);
  if (session) {
    session.fundOperationsUsed += 1;
    setUserSession(address, session);
  }
}

export function createUserSession(address: string): UserSession {
  const session: UserSession = {
    address: address.toLowerCase(),
    brokerInitialized: false,
    lastActivity: new Date(),
    requestCount: 1,
    aiQueriesUsed: 0,
    fundOperationsUsed: 0
  };
  
  setUserSession(address, session);
  return session;
}

function cleanupUserSessions(): void {
  const now = new Date();
  let cleanedCount = 0;
  
  for (const [address, session] of userSessions.entries()) {
    const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
    
    if (timeSinceLastActivity > CACHE_CONFIG.SESSION_TTL_MS) {
      userSessions.delete(address);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    logger.info(`Cleaned up ${cleanedCount} expired user sessions`);
  }
}

// ============================================================================
// BROKER SESSION MANAGEMENT
// ============================================================================

export function getBrokerSession(address: string): BrokerSession | undefined {
  return brokerSessions.get(address.toLowerCase());
}

export function setBrokerSession(address: string, session: BrokerSession): void {
  brokerSessions.set(address.toLowerCase(), {
    ...session,
    lastUsed: new Date()
  });
}

export function updateBrokerActivity(address: string): void {
  const session = getBrokerSession(address);
  if (session) {
    session.lastUsed = new Date();
    setBrokerSession(address, session);
  }
}

export function removeBrokerSession(address: string): void {
  brokerSessions.delete(address.toLowerCase());
}

function cleanupBrokerSessions(): void {
  const now = new Date();
  let cleanedCount = 0;
  
  for (const [address, session] of brokerSessions.entries()) {
    const timeSinceLastUsed = now.getTime() - session.lastUsed.getTime();
    
    if (timeSinceLastUsed > CACHE_CONFIG.BROKER_TTL_MS) {
      brokerSessions.delete(address);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    logger.info(`Cleaned up ${cleanedCount} expired broker sessions`);
  }
}

// ============================================================================
// CACHE STATISTICS
// ============================================================================

export function getCacheStats() {
  return {
    userSessions: userSessions.size,
    brokerSessions: brokerSessions.size,
    timestamp: new Date()
  };
} 