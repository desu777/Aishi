const { network } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Debug logging helper
const debugLog = (message, data = null) => {
  if (process.env.DREAMSCAPE_TEST === 'true') {
    console.log(`[🚀 DEPLOY AGENT] ${message}`, data || '');
  }
};

// Create frontend-specific contracts file with ABI and addresses
const createFrontendContractsFile = async (networkName, contracts) => {
  const frontendFile = path.join(__dirname, "../..", "frontend-contracts.json");
  
  let frontendData = {};
  
  // Read existing frontend contracts
  if (fs.existsSync(frontendFile)) {
    try {
      const content = fs.readFileSync(frontendFile, 'utf8');
      frontendData = JSON.parse(content);
      debugLog('Loaded existing frontend contracts', { networks: Object.keys(frontendData) });
    } catch (error) {
      debugLog('Failed to read existing frontend contracts, creating new file', error.message);
    }
  }
  
  // Ensure network structure exists
  if (!frontendData[networkName]) {
    frontendData[networkName] = {};
  }
  
  // Update contracts for this network
  frontendData[networkName] = {
    ...frontendData[networkName],
    ...contracts,
    lastUpdate: new Date().toISOString(),
    chainId: networkName === "galileo" ? 16601 : 31337,
    rpcUrl: networkName === "galileo" ? "https://evmrpc-testnet.0g.ai" : "http://localhost:8545"
  };
  
  // Save frontend contracts file
  try {
    fs.writeFileSync(frontendFile, JSON.stringify(frontendData, null, 2));
    console.log(`📄 Frontend contracts saved to: ${frontendFile}`);
    debugLog('Frontend contracts file updated', { 
      network: networkName, 
      contracts: Object.keys(contracts) 
    });
  } catch (error) {
    console.error('❌ Failed to save frontend contracts:', error.message);
  }
};

// Save deployment addresses to JSON file
const saveDeploymentAddress = (contractName, address, network, extraData = {}) => {
  const deploymentsFile = path.join(__dirname, "../..", "deployment-addresses.json");
  
  let deployments = {};
  
  // Read existing deployments
  if (fs.existsSync(deploymentsFile)) {
    try {
      const content = fs.readFileSync(deploymentsFile, 'utf8');
      deployments = JSON.parse(content);
      debugLog('Loaded existing deployment addresses', { count: Object.keys(deployments).length });
    } catch (error) {
      debugLog('Failed to read existing deployments, creating new file', error.message);
    }
  }
  
  // Ensure network structure exists
  if (!deployments[network]) {
    deployments[network] = {};
  }
  
  // Update with new address and extra data
  const oldAddress = deployments[network][contractName];
  deployments[network][contractName] = {
    address: address,
    deployedAt: new Date().toISOString(),
    ...extraData
  };
  deployments[network].lastUpdate = new Date().toISOString();
  
  // Save back to file
  try {
    fs.writeFileSync(deploymentsFile, JSON.stringify(deployments, null, 2));
    
    if (oldAddress && oldAddress !== address) {
      debugLog(`Updated ${contractName} address: ${oldAddress} → ${address}`);
    } else {
      debugLog(`Saved new ${contractName} address: ${address}`);
    }
  } catch (error) {
    console.error('❌ Failed to save deployment addresses:', error.message);
  }
};

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("🚀 Deploying DreamscapeAgent - Optimized iNFT Contract...");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer);

  // Get the verifier contract address
  const verifierDeployment = await get("SimpleDreamVerifier");
  console.log("Using verifier at:", verifierDeployment.address);
  
  // Get treasury address from environment
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer;
  console.log("Treasury address:", treasuryAddress);
  
  if (!process.env.TREASURY_ADDRESS) {
    console.warn("⚠️  TREASURY_ADDRESS not set in .env, using deployer address as treasury");
  }
  
  debugLog('Starting DreamscapeAgent deployment', { 
    network: network.name, 
    deployer,
    verifier: verifierDeployment.address,
    treasury: treasuryAddress
  });

  const dreamscapeAgentDeployment = await deploy("DreamscapeAgent", {
    from: deployer,
    args: [verifierDeployment.address, treasuryAddress],
    log: true,
    waitConfirmations: network.name === "galileo" ? 2 : 1,
  });

  console.log("✅ DreamscapeAgent deployed to:", dreamscapeAgentDeployment.address);

  // Initialize contract to get info
  const ethers = require("ethers");
  const provider = new ethers.JsonRpcProvider(
    network.name === "galileo" 
      ? "https://evmrpc-testnet.0g.ai" 
      : "http://localhost:8545"
  );
  
  const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
  const dreamscapeAgent = new ethers.Contract(
    dreamscapeAgentDeployment.address,
    dreamscapeAgentDeployment.abi,
    wallet
  );

  // Get contract info
  try {
    const [name, symbol, totalAgents, maxAgents, mintingFee, treasury, verifierAddress] = await Promise.all([
      dreamscapeAgent.name(),
      dreamscapeAgent.symbol(),
      dreamscapeAgent.totalAgents(),
      dreamscapeAgent.MAX_AGENTS(),
      dreamscapeAgent.MINTING_FEE(),
      dreamscapeAgent.treasury(),
      dreamscapeAgent.verifier()
    ]);
    
    console.log("📊 Contract Info:");
    console.log(`  Name: ${name}`);
    console.log(`  Symbol: ${symbol}`);
    console.log(`  Total Agents: ${totalAgents}/${maxAgents}`);
    console.log(`  Minting Fee: ${ethers.formatEther(mintingFee)} OG`);
    console.log(`  Treasury: ${treasury}`);
    console.log(`  Verifier: ${verifierAddress}`);
    
    debugLog('DreamscapeAgent contract info retrieved', {
      name,
      symbol,
      totalAgents: totalAgents.toString(),
      maxAgents: maxAgents.toString(),
      mintingFeeEther: ethers.formatEther(mintingFee),
      mintingFeeWei: mintingFee.toString(),
      treasury,
      verifier: verifierAddress
    });
    
    // Save address with contract info to JSON file
    saveDeploymentAddress("DreamscapeAgent", dreamscapeAgentDeployment.address, network.name, {
      name,
      symbol,
      totalAgents: totalAgents.toString(),
      maxAgents: maxAgents.toString(),
      remainingSupply: (maxAgents - totalAgents).toString(),
      mintingFeeEther: ethers.formatEther(mintingFee),
      mintingFeeWei: mintingFee.toString(),
      treasury,
      verifier: verifierAddress,
      gasUsed: dreamscapeAgentDeployment.receipt?.gasUsed?.toString(),
      abi: dreamscapeAgentDeployment.abi, // Add full ABI for frontend
      isOptimized: true,
      features: {
        oneAgentPerWallet: true,
        dailyDreamEvolution: true,
        personalityTraits: true,
        contextAwareConversations: true,
        personalityMilestones: true,
        efficientReads: true,
        contractSizeOptimized: true
      }
    });
    
  } catch (error) {
    console.warn("⚠️  Could not retrieve contract info (may need time to sync):", error.message);
    debugLog('Failed to retrieve contract info', error.message);
    
    // Save address without extra info
    saveDeploymentAddress("DreamscapeAgent", dreamscapeAgentDeployment.address, network.name, {
      treasury: treasuryAddress,
      mintingFeeEther: "0.1",
      mintingFeeWei: "100000000000000000",
      abi: dreamscapeAgentDeployment.abi, // Add ABI even if info retrieval failed
      isOptimized: true,
      gasUsed: dreamscapeAgentDeployment.receipt?.gasUsed?.toString()
    });
  }
  
  // Save to environment
  console.log("📝 Add to .env:");
  console.log(`DREAMSCAPE_AGENT_ADDRESS=${dreamscapeAgentDeployment.address}`);
  console.log(`TREASURY_ADDRESS=${treasuryAddress}`);
  console.log(`SIMPLE_DREAM_VERIFIER_ADDRESS=${verifierDeployment.address}`);
  
  console.log("\n📂 Contract files created:");
  console.log(`  📊 deployment-addresses.json - Full deployment info`);
  console.log(`  🎨 frontend-contracts.json - ABI + addresses for frontend`);
  
  console.log("\n💡 Optimized Features:");
  console.log("  ✅ 1 Agent per Wallet (O(1) reads)");
  console.log("  ✅ Daily dream processing with personality evolution");
  console.log("  ✅ 6 personality traits system");
  console.log("  ✅ Context-aware conversations");
  console.log("  ✅ Personality milestones");
  console.log("  ✅ Efficient getUserAgent() & getOwnerAgent()");
  console.log("  ✅ Contract size optimized for mainnet");
  
  console.log("\n🎯 Core Functions:");
  console.log("  🔮 mintAgent() - Create dream agent (1 per wallet)");
  console.log("  🌙 processDailyDream() - Evolve personality");
  console.log("  💬 recordConversation() - Build context");
  console.log("  📊 getUserAgent() - Get complete agent info");
  console.log("  🎭 getPersonalityTraits() - Get current traits");
  
  console.log("\n💰 Economic Model:");
  console.log(`  💎 Minting Cost: 0.1 OG`);
  console.log(`  🏦 Treasury: ${treasuryAddress}`);
  console.log(`  📊 Max Supply: 1000 agents (testnet)`);
  console.log(`  🎯 Value: Personality uniqueness + evolution`);
  
  debugLog('DreamscapeAgent deployment completed', {
    address: dreamscapeAgentDeployment.address,
    treasury: treasuryAddress,
    gasUsed: dreamscapeAgentDeployment.receipt?.gasUsed?.toString()
  });
  
  // Create frontend-specific contracts file
  await createFrontendContractsFile(network.name, {
    DreamscapeAgent: {
      address: dreamscapeAgentDeployment.address,
      abi: dreamscapeAgentDeployment.abi
    },
    SimpleDreamVerifier: {
      address: verifierDeployment.address,
      abi: verifierDeployment.abi
    }
  });
};

module.exports.tags = ["DreamscapeAgent", "agent", "inft"];
module.exports.dependencies = ["SimpleDreamVerifier"];
module.exports.id = "deploy-dreamscape-agent"; 