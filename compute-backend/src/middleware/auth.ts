import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { AuthenticatedRequest, SignatureVerification, AuthenticationError } from '../types';
import { SIGNATURE_MESSAGES, OPERATION_LIMITS } from '../config/constants';
import { getUserSession, createUserSession, updateUserActivity } from '../utils/cache';
import { logError, logOperation } from '../utils/logger';

// Signature verification function
export function verifySignature(
  address: string,
  signature: string,
  message: string,
  timestamp: number
): SignatureVerification {
  try {
    // Check timestamp validity (prevent replay attacks)
    const now = Date.now();
    const timeDiff = Math.abs(now - timestamp);
    
    if (timeDiff > OPERATION_LIMITS.SIGNATURE_TIMESTAMP_TOLERANCE_MS) {
      return {
        isValid: false,
        message: 'Signature timestamp is too old or in the future'
      };
    }

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
    
    return {
      isValid,
      address: isValid ? address : undefined,
      timestamp: isValid ? timestamp : undefined,
      message: isValid ? undefined : 'Invalid signature'
    };
  } catch (error) {
    logError('Signature verification error', error as Error, { address, timestamp });
    return {
      isValid: false,
      message: 'Signature verification failed'
    };
  }
}

// Middleware for broker initialization authentication
export function authenticateInitBroker(req: Request, res: Response, next: NextFunction) {
  try {
    const { address, signature, timestamp } = req.body;
    
    if (!address || !signature || !timestamp) {
      throw new AuthenticationError('Missing required authentication fields');
    }
    
    if (!ethers.isAddress(address)) {
      throw new AuthenticationError('Invalid Ethereum address');
    }
    
    const message = SIGNATURE_MESSAGES.INIT_BROKER(address, timestamp);
    const verification = verifySignature(address, signature, message, timestamp);
    
    if (!verification.isValid) {
      throw new AuthenticationError(verification.message || 'Invalid signature');
    }
    
    // Attach user info to request
    (req as AuthenticatedRequest).userAddress = address;
    (req as AuthenticatedRequest).timestamp = timestamp;
    
    // Update or create user session
    let session = getUserSession(address);
    if (!session) {
      session = createUserSession(address);
    } else {
      updateUserActivity(address);
    }
    
    logOperation('init_broker_auth', address, true, { timestamp });
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      logError('Authentication error', error as Error);
      res.status(500).json({
        success: false,
        error: 'Internal authentication error'
      });
    }
  }
}

// Middleware for balance check authentication
export function authenticateBalanceCheck(req: Request, res: Response, next: NextFunction) {
  try {
    const address = req.params.address;
    const signature = req.headers['x-signature'] as string;
    const timestamp = parseInt(req.headers['x-timestamp'] as string);
    
    if (!address || !signature || !timestamp) {
      throw new AuthenticationError('Missing authentication headers');
    }
    
    if (!ethers.isAddress(address)) {
      throw new AuthenticationError('Invalid Ethereum address');
    }
    
    const message = SIGNATURE_MESSAGES.CHECK_BALANCE(address, timestamp);
    const verification = verifySignature(address, signature, message, timestamp);
    
    if (!verification.isValid) {
      throw new AuthenticationError(verification.message || 'Invalid signature');
    }
    
    // Attach user info to request
    (req as AuthenticatedRequest).userAddress = address;
    (req as AuthenticatedRequest).timestamp = timestamp;
    
    // Update user activity
    updateUserActivity(address);
    
    logOperation('balance_check_auth', address, true, { timestamp });
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      logError('Balance check authentication error', error as Error);
      res.status(500).json({
        success: false,
        error: 'Internal authentication error'
      });
    }
  }
}

// Middleware for fund account authentication
export function authenticateFundAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const { address, amount, signature, timestamp } = req.body;
    
    if (!address || !amount || !signature || !timestamp) {
      throw new AuthenticationError('Missing required authentication fields');
    }
    
    if (!ethers.isAddress(address)) {
      throw new AuthenticationError('Invalid Ethereum address');
    }
    
    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || 
        amountNum < OPERATION_LIMITS.MIN_FUND_AMOUNT || 
        amountNum > OPERATION_LIMITS.MAX_FUND_AMOUNT) {
      throw new AuthenticationError(
        `Amount must be between ${OPERATION_LIMITS.MIN_FUND_AMOUNT} and ${OPERATION_LIMITS.MAX_FUND_AMOUNT} OG`
      );
    }
    
    const message = SIGNATURE_MESSAGES.FUND_ACCOUNT(address, amount, timestamp);
    const verification = verifySignature(address, signature, message, timestamp);
    
    if (!verification.isValid) {
      throw new AuthenticationError(verification.message || 'Invalid signature');
    }
    
    // Attach user info to request
    (req as AuthenticatedRequest).userAddress = address;
    (req as AuthenticatedRequest).timestamp = timestamp;
    
    // Update user activity
    updateUserActivity(address);
    
    logOperation('fund_account_auth', address, true, { amount, timestamp });
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      logError('Fund account authentication error', error as Error);
      res.status(500).json({
        success: false,
        error: 'Internal authentication error'
      });
    }
  }
}

// Middleware for AI analysis authentication
export function authenticateAIAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    const { address, dreamText, signature, timestamp } = req.body;
    
    if (!address || !dreamText || !signature || !timestamp) {
      throw new AuthenticationError('Missing required authentication fields');
    }
    
    if (!ethers.isAddress(address)) {
      throw new AuthenticationError('Invalid Ethereum address');
    }
    
    // Validate dream text
    if (dreamText.length < OPERATION_LIMITS.MIN_DREAM_TEXT_LENGTH) {
      throw new AuthenticationError('Dream text is too short');
    }
    
    if (dreamText.length > OPERATION_LIMITS.MAX_DREAM_TEXT_LENGTH) {
      throw new AuthenticationError('Dream text is too long');
    }
    
    const message = SIGNATURE_MESSAGES.AI_ANALYSIS(address, timestamp);
    const verification = verifySignature(address, signature, message, timestamp);
    
    if (!verification.isValid) {
      throw new AuthenticationError(verification.message || 'Invalid signature');
    }
    
    // Attach user info to request
    (req as AuthenticatedRequest).userAddress = address;
    (req as AuthenticatedRequest).timestamp = timestamp;
    
    // Update user activity
    updateUserActivity(address);
    
    logOperation('ai_analysis_auth', address, true, { 
      dreamTextLength: dreamText.length, 
      timestamp 
    });
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      logError('AI analysis authentication error', error as Error);
      res.status(500).json({
        success: false,
        error: 'Internal authentication error'
      });
    }
  }
}

// Middleware for signature request authentication
export function authenticateSignatureRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { address, authSignature, timestamp } = req.body;
    
    if (!address || !authSignature || !timestamp) {
      throw new AuthenticationError('Missing required authentication fields');
    }
    
    if (!ethers.isAddress(address)) {
      throw new AuthenticationError('Invalid Ethereum address');
    }
    
    const message = `Provide signature for ${address} at ${timestamp}`;
    const verification = verifySignature(address, authSignature, message, timestamp);
    
    if (!verification.isValid) {
      throw new AuthenticationError(verification.message || 'Invalid signature');
    }
    
    // Attach user info to request
    (req as AuthenticatedRequest).userAddress = address;
    (req as AuthenticatedRequest).timestamp = timestamp;
    
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      logError('Signature request authentication error', error as Error);
      res.status(500).json({
        success: false,
        error: 'Internal authentication error'
      });
    }
  }
} 