import { NextRequest, NextResponse } from 'next/server';
import { downloadByRootHashAPI } from '../../../../lib/0g/downloader';
import AishiAgentABI from '../../../../abi/AishiAgentABI.json';
import { createPublicClient, http } from 'viem';
import { galileoTestnet } from '../../../../config/chains';

// 0G Storage configuration
const STORAGE_CONFIG = {
  storageRpc: process.env.NEXT_PUBLIC_TURBO_STORAGE_RPC || 'https://indexer-storage-testnet-turbo.0g.ai',
  l1Rpc: process.env.NEXT_PUBLIC_L1_RPC || 'https://evmrpc-testnet.0g.ai'
};

// Contract configuration
const contractConfig = {
  address: AishiAgentABI.address as `0x${string}`,
  abi: AishiAgentABI.abi,
} as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tokenId = searchParams.get('tokenId');

    if (!tokenId || isNaN(Number(tokenId))) {
      return NextResponse.json({ 
        success: false, 
        error: 'Valid tokenId parameter is required' 
      }, { status: 400 });
    }

    const tokenIdBigInt = BigInt(tokenId);

    // Create public client to read from contract
    const publicClient = createPublicClient({
      chain: galileoTestnet,
      transport: http(STORAGE_CONFIG.l1Rpc)
    });

    // Get agent memory to fetch currentDreamDailyHash
    const agentMemory = await publicClient.readContract({
      address: contractConfig.address,
      abi: contractConfig.abi,
      functionName: 'getAgentMemory',
      args: [tokenIdBigInt]
    }) as any;

    if (!agentMemory) {
      return NextResponse.json({ 
        success: false, 
        error: 'Agent memory not found' 
      }, { status: 404 });
    }

    const currentDreamDailyHash = agentMemory[1]; // currentDreamDailyHash is at index 1

    // Check if hash exists and is not empty
    if (!currentDreamDailyHash || 
        currentDreamDailyHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return NextResponse.json({ 
        success: false, 
        error: 'No dreams file found for this agent yet' 
      }, { status: 404 });
    }

    console.log(`[API] Downloading dreams file for tokenId ${tokenId} with hash ${currentDreamDailyHash}`);

    // Download file from 0G Storage
    const [fileData, downloadError] = await downloadByRootHashAPI(
      currentDreamDailyHash, 
      STORAGE_CONFIG.storageRpc
    );

    if (downloadError) {
      console.error(`[API] Download error:`, downloadError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to download dreams file: ${downloadError.message}` 
      }, { status: 500 });
    }

    if (!fileData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Downloaded file is empty' 
      }, { status: 500 });
    }

    // Parse JSON content
    let content;
    try {
      const jsonString = new TextDecoder().decode(fileData);
      content = JSON.parse(jsonString);
    } catch (parseError) {
      console.error(`[API] JSON parse error:`, parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to parse dreams file content' 
      }, { status: 500 });
    }

    console.log(`[API] Successfully downloaded dreams file: ${fileData.byteLength} bytes`);

    return NextResponse.json({
      success: true,
      content,
      size: fileData.byteLength,
      rootHash: currentDreamDailyHash,
      tokenId: tokenId
    });

  } catch (error) {
    console.error('[API] Dreams download error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 