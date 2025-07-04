const { network } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Debug logging helper
const debugLog = (message, data = null) => {
  if (process.env.DREAMSCAPE_TEST === 'true') {
    console.log(`[🔮 DEPLOY] ${message}`, data || '');
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

  console.log("🧠 Deploying DreamAgentNFT with minting fees...");
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
  
  debugLog('Starting DreamAgentNFT deployment with fees', { 
    network: network.name, 
    deployer,
    verifier: verifierDeployment.address,
    treasury: treasuryAddress
  });

  const dreamAgentNFTDeployment = await deploy("DreamAgentNFT", {
    from: deployer,
    args: [verifierDeployment.address, treasuryAddress],
    log: true,
    waitConfirmations: network.name === "galileo" ? 2 : 1,
  });

  console.log("✅ DreamAgentNFT deployed to:", dreamAgentNFTDeployment.address);

  // Initialize contract to get info
  const ethers = require("ethers");
  const provider = new ethers.JsonRpcProvider(
    network.name === "galileo" 
      ? "https://evmrpc-testnet.0g.ai" 
      : "http://localhost:8545"
  );
  
  const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
  const dreamAgentNFT = new ethers.Contract(
    dreamAgentNFTDeployment.address,
    dreamAgentNFTDeployment.abi,
    wallet
  );

  // Get contract info including fee information
  try {
    const [name, symbol, totalAgents, maxAgents, remainingSupply, mintingFee, treasury, totalFeesCollected, verifierAddress] = await Promise.all([
      dreamAgentNFT.name(),
      dreamAgentNFT.symbol(),
      dreamAgentNFT.totalAgents(),
      dreamAgentNFT.MAX_AGENTS(),
      dreamAgentNFT.getRemainingSupply(),
      dreamAgentNFT.getMintingFee(),
      dreamAgentNFT.getTreasury(),
      dreamAgentNFT.getTotalFeesCollected(),
      dreamAgentNFT.verifier()
    ]);
    
    console.log("📊 Contract Info:");
    console.log(`  Name: ${name}`);
    console.log(`  Symbol: ${symbol}`);
    console.log(`  Total Agents: ${totalAgents}/${maxAgents}`);
    console.log(`  Remaining Supply: ${remainingSupply}`);
    console.log(`  Minting Fee: ${ethers.formatEther(mintingFee)} OG`);
    console.log(`  Treasury: ${treasury}`);
    console.log(`  Total Fees Collected: ${ethers.formatEther(totalFeesCollected)} OG`);
    console.log(`  Verifier: ${verifierAddress}`);
    
    debugLog('DreamAgentNFT contract info with fees retrieved', {
      name,
      symbol,
      totalAgents: totalAgents.toString(),
      maxAgents: maxAgents.toString(),
      remainingSupply: remainingSupply.toString(),
      mintingFeeEther: ethers.formatEther(mintingFee),
      mintingFeeWei: mintingFee.toString(),
      treasury,
      totalFeesCollected: totalFeesCollected.toString()
    });
    
    // Save address with enhanced contract info to JSON file
    saveDeploymentAddress("DreamAgentNFT", dreamAgentNFTDeployment.address, network.name, {
      name,
      symbol,
      totalAgents: totalAgents.toString(),
      maxAgents: maxAgents.toString(),
      remainingSupply: remainingSupply.toString(),
      mintingFeeEther: ethers.formatEther(mintingFee),
      mintingFeeWei: mintingFee.toString(),
      treasury,
      totalFeesCollected: totalFeesCollected.toString(),
      verifier: verifierAddress,
      gasUsed: dreamAgentNFTDeployment.receipt?.gasUsed?.toString(),
      hasFeeSytem: true
    });
    
  } catch (error) {
    console.warn("⚠️  Could not retrieve contract info (may need time to sync):", error.message);
    debugLog('Failed to retrieve contract info', error.message);
    
    // Save address without extra info
    saveDeploymentAddress("DreamAgentNFT", dreamAgentNFTDeployment.address, network.name, {
      treasury: treasuryAddress,
      mintingFeeEther: "0.1",
      mintingFeeWei: "100000000000000000",
      hasFeeSytem: true,
      gasUsed: dreamAgentNFTDeployment.receipt?.gasUsed?.toString()
    });
  }
  
  // Save to environment
  console.log("📝 Add to .env:");
  console.log(`DREAM_AGENT_NFT_ADDRESS=${dreamAgentNFTDeployment.address}`);
  console.log(`TREASURY_ADDRESS=${treasuryAddress}`);
  
  debugLog('DreamAgentNFT deployment completed', {
    address: dreamAgentNFTDeployment.address,
    treasury: treasuryAddress,
    gasUsed: dreamAgentNFTDeployment.receipt?.gasUsed?.toString()
  });
  
  // Additional deployment info for personalized agents with fees
  console.log("\n🎯 Personalized Dream Agents Features:");
  console.log("  ✅ Named agents (unique names)");
  console.log("  ✅ Max supply: 1000 agents");
  console.log("  ✅ Minting fee: 0.1 OG per agent");
  console.log("  ✅ Treasury system for fee collection");
  console.log("  ✅ Faster evolution (every 3 dreams)");
  console.log("  ✅ Conversation tracking");
  console.log("  ✅ Personality milestones");
  
  console.log("\n💰 Fee System:");
  console.log(`  💎 Minting Cost: 0.1 OG (~$0.01 USD)`);
  console.log(`  🏦 Treasury: ${treasuryAddress}`);
  console.log(`  📊 Revenue Potential: ${1000 * 0.1} OG (if all minted)`);
  
  debugLog('Enhanced features with fees enabled', {
    namedAgents: true,
    maxSupply: 1000,
    mintingFee: '0.1 OG',
    treasurySystem: true,
    evolutionRate: '3 dreams',
    conversationTracking: true,
    personalityMilestones: true
  });
};

module.exports.tags = ["DreamAgentNFT", "nft"];
module.exports.dependencies = ["SimpleDreamVerifier"];
module.exports.id = "deploy-dream-agent-nft"; 