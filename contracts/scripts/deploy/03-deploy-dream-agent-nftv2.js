const { network } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Debug logging helper
const debugLog = (message, data = null) => {
  if (process.env.DREAMSCAPE_TEST === 'true') {
    console.log(`[🔮 DEPLOY V2] ${message}`, data || '');
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

  console.log("🧠 Deploying DreamAgentNFTv2 with Enhanced Personality System...");
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
  
  debugLog('Starting DreamAgentNFTv2 deployment with personality system', { 
    network: network.name, 
    deployer,
    verifier: verifierDeployment.address,
    treasury: treasuryAddress
  });

  const dreamAgentNFTv2Deployment = await deploy("DreamAgentNFTv2", {
    from: deployer,
    args: [verifierDeployment.address, treasuryAddress],
    log: true,
    waitConfirmations: network.name === "galileo" ? 2 : 1,
  });

  console.log("✅ DreamAgentNFTv2 deployed to:", dreamAgentNFTv2Deployment.address);

  // Initialize contract to get enhanced info
  const ethers = require("ethers");
  const provider = new ethers.JsonRpcProvider(
    network.name === "galileo" 
      ? "https://evmrpc-testnet.0g.ai" 
      : "http://localhost:8545"
  );
  
  const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
  const dreamAgentNFTv2 = new ethers.Contract(
    dreamAgentNFTv2Deployment.address,
    dreamAgentNFTv2Deployment.abi,
    wallet
  );

  // Get contract info including personality features
  try {
    const [name, symbol, totalAgents, maxAgents, mintingFee, treasury, verifierAddress] = await Promise.all([
      dreamAgentNFTv2.name(),
      dreamAgentNFTv2.symbol(),
      dreamAgentNFTv2.totalAgents(),
      dreamAgentNFTv2.MAX_AGENTS(),
      dreamAgentNFTv2.MINTING_FEE(),
      dreamAgentNFTv2.treasury(),
      dreamAgentNFTv2.verifier()
    ]);
    
    console.log("📊 Enhanced Contract Info:");
    console.log(`  Name: ${name}`);
    console.log(`  Symbol: ${symbol}`);
    console.log(`  Total Agents: ${totalAgents}/${maxAgents}`);
    console.log(`  Minting Fee: ${ethers.formatEther(mintingFee)} OG`);
    console.log(`  Treasury: ${treasury}`);
    console.log(`  Verifier: ${verifierAddress}`);
    
    debugLog('DreamAgentNFTv2 contract info with personality system retrieved', {
      name,
      symbol,
      totalAgents: totalAgents.toString(),
      maxAgents: maxAgents.toString(),
      mintingFeeEther: ethers.formatEther(mintingFee),
      mintingFeeWei: mintingFee.toString(),
      treasury,
      verifier: verifierAddress
    });
    
    // Save address with enhanced contract info to JSON file
    saveDeploymentAddress("DreamAgentNFTv2", dreamAgentNFTv2Deployment.address, network.name, {
      name,
      symbol,
      totalAgents: totalAgents.toString(),
      maxAgents: maxAgents.toString(),
      remainingSupply: (maxAgents - totalAgents).toString(),
      mintingFeeEther: ethers.formatEther(mintingFee),
      mintingFeeWei: mintingFee.toString(),
      treasury,
      verifier: verifierAddress,
      gasUsed: dreamAgentNFTv2Deployment.receipt?.gasUsed?.toString(),
      abi: dreamAgentNFTv2Deployment.abi, // Add full ABI for frontend
      hasPersonalitySystem: true,
      features: {
        dailyDreamEvolution: true,
        personalityTraits: true,
        contextAwareConversations: true,
        personalityMilestones: true,
        responseStyleEvolution: true,
        personalityRarity: true,
        agentCompatibility: true,
        traitEvolutionHistory: true
      }
    });
    
  } catch (error) {
    console.warn("⚠️  Could not retrieve contract info (may need time to sync):", error.message);
    debugLog('Failed to retrieve contract info', error.message);
    
    // Save address without extra info
    saveDeploymentAddress("DreamAgentNFTv2", dreamAgentNFTv2Deployment.address, network.name, {
      treasury: treasuryAddress,
      mintingFeeEther: "0.1",
      mintingFeeWei: "100000000000000000",
      abi: dreamAgentNFTv2Deployment.abi, // Add ABI even if info retrieval failed
      hasPersonalitySystem: true,
      gasUsed: dreamAgentNFTv2Deployment.receipt?.gasUsed?.toString()
    });
  }
  
  // Save to environment
  console.log("📝 Add to .env:");
  console.log(`DREAM_AGENT_NFT_V2_ADDRESS=${dreamAgentNFTv2Deployment.address}`);
  console.log(`TREASURY_ADDRESS=${treasuryAddress}`);
  console.log(`SIMPLE_DREAM_VERIFIER_ADDRESS=${verifierDeployment.address}`);
  
  console.log("\n📂 Contract files created:");
  console.log(`  📊 deployment-addresses.json - Full deployment info`);
  console.log(`  🎨 frontend-contracts.json - ABI + addresses for frontend`);
  
  debugLog('DreamAgentNFTv2 deployment completed', {
    address: dreamAgentNFTv2Deployment.address,
    treasury: treasuryAddress,
    gasUsed: dreamAgentNFTv2Deployment.receipt?.gasUsed?.toString()
  });
  
  // Enhanced deployment info for personality system
  console.log("\n🎭 Enhanced Personality System Features:");
  console.log("  ✅ Daily dream processing with 24h cooldown");
  console.log("  ✅ 6 personality traits (creativity, analytical, empathy, intuition, resilience, curiosity)");
  console.log("  ✅ Context-aware conversations (5 types)");
  console.log("  ✅ Personality milestones and achievements");
  console.log("  ✅ Response style evolution based on traits");
  console.log("  ✅ Personality rarity scoring");
  console.log("  ✅ Agent compatibility calculation");
  console.log("  ✅ Trait evolution history tracking");
  console.log("  ✅ Dream and conversation hash storage");
  
  console.log("\n💰 Enhanced Economic Model:");
  console.log(`  💎 Minting Cost: 0.1 OG (~$0.01 USD)`);
  console.log(`  🏦 Treasury: ${treasuryAddress}`);
  console.log(`  📊 Max Supply: 1000 agents (testnet)`);
  console.log(`  💰 Revenue Potential: ${1000 * 0.1} OG (if all minted)`);
  console.log(`  🎯 Value Drivers: Personality uniqueness + evolution history`);
  
  console.log("\n🔄 Evolution Mechanics:");
  console.log("  🌙 Dream Processing: Once per day, personality evolves");
  console.log("  💬 Conversations: No evolution, but builds context");
  console.log("  🎯 Intelligence: +1 every 3 dreams, +1 every 10 conversations");
  console.log("  🏆 Milestones: Empathy Master, Creative Genius, Logic Lord, etc.");
  console.log("  🎨 Response Styles: Empathetic, Creative, Analytical, Intuitive, etc.");
  
  debugLog('Enhanced personality features with evolution enabled', {
    personalityTraits: 6,
    conversationTypes: 5,
    milestoneTypes: 6,
    responseStyles: 8,
    evolutionMechanics: 'daily_dreams',
    contextBuilding: true,
    historyTracking: true
  });
  
  // Create frontend-specific contracts file
  await createFrontendContractsFile(network.name, {
    DreamAgentNFTv2: {
      address: dreamAgentNFTv2Deployment.address,
      abi: dreamAgentNFTv2Deployment.abi
    },
    SimpleDreamVerifier: {
      address: verifierDeployment.address,
      abi: verifierDeployment.abi
    }
  });
};

module.exports.tags = ["DreamAgentNFTv2", "nftv2", "personality"];
module.exports.dependencies = ["SimpleDreamVerifier"];
module.exports.id = "deploy-dream-agent-nftv2"; 