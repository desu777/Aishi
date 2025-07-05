import { Router, Request, Response } from 'express';
import { authenticateSignatureRequest } from '../middleware/auth';
import { HTTP_STATUS } from '../config/constants';
import { logOperation } from '../utils/logger';

const router = Router();

// Store for pending signature requests
const pendingRequests = new Map<string, {
  address: string;
  operation: any;
  timestamp: number;
  resolved: boolean;
  signature?: string;
}>();

/**
 * POST /api/signature/request
 * Backend requests signature from frontend
 */
router.post('/request', (req: Request, res: Response) => {
  const { operationId, address, operation } = req.body;
  
  if (!operationId || !address || !operation) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Missing required fields'
    });
  }
  
  // Store pending request
  pendingRequests.set(operationId, {
    address,
    operation,
    timestamp: Date.now(),
    resolved: false
  });
  
  logOperation('signature_request_created', address, true, { operationId, type: operation.type });
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    operationId,
    message: 'Signature request created'
  });
});

/**
 * GET /api/signature/pending/:address
 * Get pending signature requests for user
 */
router.get('/pending/:address', (req: Request, res: Response) => {
  const { address } = req.params;
  
  const userRequests = Array.from(pendingRequests.entries())
    .filter(([_, request]) => request.address.toLowerCase() === address.toLowerCase() && !request.resolved)
    .map(([operationId, request]) => ({
      operationId,
      operation: request.operation,
      timestamp: request.timestamp
    }));
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    requests: userRequests
  });
});

/**
 * POST /api/signature/provide
 * Frontend provides signature for pending request
 */
router.post('/provide', authenticateSignatureRequest, (req: Request, res: Response) => {
  const { operationId, signature } = req.body;
  
  if (!operationId || !signature) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Missing operationId or signature'
    });
  }
  
  const request = pendingRequests.get(operationId);
  if (!request) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'Request not found'
    });
  }
  
  // Mark as resolved and store signature
  request.resolved = true;
  request.signature = signature;
  
  logOperation('signature_provided', request.address, true, { operationId });
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Signature provided successfully'
  });
});

/**
 * GET /api/signature/wait/:operationId
 * Backend waits for signature (long polling)
 */
router.get('/wait/:operationId', async (req: Request, res: Response) => {
  const { operationId } = req.params;
  const timeout = parseInt(req.query.timeout as string) || 60000; // 60s default
  
  const startTime = Date.now();
  
  // Check every 100ms for signature
  const checkInterval = setInterval(() => {
    const request = pendingRequests.get(operationId);
    
    if (!request) {
      clearInterval(checkInterval);
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Request not found'
      });
      return;
    }
    
    if (request.resolved && request.signature) {
      clearInterval(checkInterval);
      pendingRequests.delete(operationId); // Clean up
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        signature: request.signature
      });
      return;
    }
    
    if (Date.now() - startTime > timeout) {
      clearInterval(checkInterval);
      res.status(HTTP_STATUS.REQUEST_TIMEOUT).json({
        success: false,
        error: 'Signature timeout'
      });
      return;
    }
  }, 100);
});

/**
 * DELETE /api/signature/cancel/:operationId
 * Cancel pending signature request
 */
router.delete('/cancel/:operationId', (req: Request, res: Response) => {
  const { operationId } = req.params;
  
  if (pendingRequests.delete(operationId)) {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Request cancelled'
    });
  } else {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'Request not found'
    });
  }
});

// Cleanup old requests every minute
setInterval(() => {
  const now = Date.now();
  const timeout = 5 * 60 * 1000; // 5 minutes
  
  for (const [operationId, request] of pendingRequests.entries()) {
    if (now - request.timestamp > timeout) {
      pendingRequests.delete(operationId);
    }
  }
}, 60000);

export default router; 