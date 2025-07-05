import { ethers } from 'ethers';
import axios from 'axios';

/**
 * Remote Signer - deleguje operacje podpisywania do frontend przez API
 * Używa long polling do czekania na podpisy
 */
export class RemoteSigner {
  private userAddress: string;
  public provider: ethers.JsonRpcProvider;
  private apiUrl: string = process.env.SIGNATURE_API_URL || 'http://localhost:3001/api/signature';
  
  constructor(userAddress: string, provider: ethers.JsonRpcProvider) {
    this.userAddress = userAddress;
    this.provider = provider;
  }

  async getAddress(): Promise<string> {
    return this.userAddress;
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    const messageString = typeof message === 'string' 
      ? message 
      : ethers.toUtf8String(message);
    
    const operationId = this.generateOperationId('signMessage', messageString);
    
    // Create signature request
    await this.createSignatureRequest(operationId, {
      type: 'signMessage',
      message: messageString
    });
    
    // Wait for signature
    return await this.waitForSignature(operationId);
  }

  async signTransaction(tx: ethers.TransactionRequest): Promise<string> {
    const operationId = this.generateOperationId('signTransaction', JSON.stringify(tx));
    
    // Create signature request
    await this.createSignatureRequest(operationId, {
      type: 'signTransaction',
      transaction: tx
    });
    
    // Wait for signature
    return await this.waitForSignature(operationId);
  }

  async signTypedData(
    domain: ethers.TypedDataDomain,
    types: Record<string, any>,
    value: Record<string, any>
  ): Promise<string> {
    const payload = { domain, types, value };
    const operationId = this.generateOperationId('signTypedData', JSON.stringify(payload));
    
    // Create signature request
    await this.createSignatureRequest(operationId, {
      type: 'signTypedData',
      ...payload
    });
    
    // Wait for signature
    return await this.waitForSignature(operationId);
  }

  // Create signer-like interface for 0G SDK
  async sendTransaction(tx: ethers.TransactionRequest): Promise<ethers.TransactionResponse> {
    // For broker operations, we need to prepare and broadcast transaction
    const network = await this.provider.getNetwork();
    const populatedTx = {
      ...tx,
      from: this.userAddress,
      chainId: Number(network.chainId) // Convert bigint to number
    };
    
    // Get signature
    const signedTx = await this.signTransaction(populatedTx);
    
    // Broadcast
    return await this.provider.broadcastTransaction(signedTx);
  }

  // Required for compatibility
  connect(provider: ethers.Provider): RemoteSigner {
    return new RemoteSigner(this.userAddress, provider as ethers.JsonRpcProvider);
  }

  _legacySignMessage(message: string | Uint8Array): Promise<string> {
    return this.signMessage(message);
  }

  /**
   * Create signature request on backend
   */
  private async createSignatureRequest(operationId: string, operation: any): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/request`, {
        operationId,
        address: this.userAddress,
        operation
      });
    } catch (error) {
      throw new Error(`Failed to create signature request: ${error}`);
    }
  }

  /**
   * Wait for signature using long polling
   */
  private async waitForSignature(operationId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.apiUrl}/wait/${operationId}`, {
        timeout: 65000 // 65 seconds (5s buffer over backend timeout)
      });
      
      if (response.data.success && response.data.signature) {
        return response.data.signature;
      }
      
      throw new Error('Failed to get signature');
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Signature timeout - user did not sign in time');
      }
      throw new Error(`Failed to get signature: ${error.message}`);
    }
  }

  private generateOperationId(type: string, data: string): string {
    const timestamp = Date.now();
    const hash = ethers.keccak256(ethers.toUtf8Bytes(data));
    return `${type}_${timestamp}_${hash.slice(0, 10)}`;
  }
}

/**
 * Create a signer that works with 0G SDK
 */
export function createRemoteSigner(userAddress: string, provider: ethers.JsonRpcProvider): any {
  const remoteSigner = new RemoteSigner(userAddress, provider);
  
  // Create a proxy that implements the required interface
  return new Proxy(remoteSigner, {
    get(target, prop) {
      // Return methods from RemoteSigner
      if (prop in target) {
        return (target as any)[prop];
      }
      
      // For any missing methods, return a stub
      if (typeof prop === 'string') {
        return async (...args: any[]) => {
          console.warn(`RemoteSigner: Method ${prop} not implemented`);
          throw new Error(`Method ${prop} not implemented in RemoteSigner`);
        };
      }
      
      return undefined;
    }
  });
} 