const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Debug logging helper
const debugLog = (message, data = null) => {
  if (process.env.DREAMSCAPE_TEST === 'true') {
    console.log(`[🚀 TURBO DEPLOY] ${message}`, data || '');
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
  deployments[network][contractName] = {
    address: address,
    deployedAt: new Date().toISOString(),
    ...extraData
  };
  deployments[network].lastUpdate = new Date().toISOString();
  
  // Save back to file
  try {
    fs.writeFileSync(deploymentsFile, JSON.stringify(deployments, null, 2));
    debugLog(`Saved ${contractName} address: ${address}`);
  } catch (error) {
    console.error('❌ Failed to save deployment addresses:', error.message);
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

async function main() {
  console.log("🚀 TURBO DEPLOY - Deploying ALL contracts in sequence...");
  
  const [deployer] = await ethers.getSigners();
  const network = hre.network.name;
  
  console.log("Network:", network);
  console.log("Deployer:", deployer.address);
  
  // Get treasury address from environment
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  console.log("Treasury address:", treasuryAddress);
  
  if (!process.env.TREASURY_ADDRESS) {
    console.warn("⚠️  TREASURY_ADDRESS not set in .env, using deployer address as treasury");
  }
  
  debugLog('Starting TURBO deployment', { 
    network: network, 
    deployer: deployer.address,
    treasury: treasuryAddress
  });

  // ====== STEP 1: Deploy SimpleDreamVerifier ======
  console.log("\n🔧 Step 1: Deploying SimpleDreamVerifier...");
  
  const SimpleDreamVerifier = await ethers.getContractFactory("SimpleDreamVerifier");
  const verifier = await SimpleDreamVerifier.deploy();
  await verifier.waitForDeployment();
  
  const verifierAddress = await verifier.getAddress();
  console.log("✅ SimpleDreamVerifier deployed to:", verifierAddress);
  
  // Save verifier deployment
  saveDeploymentAddress("SimpleDreamVerifier", verifierAddress, network, {
    contractType: "verifier",
    gasUsed: (await verifier.deploymentTransaction().wait()).gasUsed.toString()
  });

  // ====== STEP 2: Deploy DreamscapeAgent ======
  console.log("\n🔧 Step 2: Deploying DreamscapeAgent...");
  
  const DreamscapeAgent = await ethers.getContractFactory("DreamscapeAgent");
  const dreamscapeAgent = await DreamscapeAgent.deploy(verifierAddress, treasuryAddress);
  await dreamscapeAgent.waitForDeployment();
  
  const dreamscapeAgentAddress = await dreamscapeAgent.getAddress();
  console.log("✅ DreamscapeAgent deployed to:", dreamscapeAgentAddress);

  // ====== STEP 3: Get contract info ======
  console.log("\n📊 Step 3: Reading contract info...");
  
  try {
    const [name, symbol, totalAgents, maxAgents, mintingFee, treasury, verifierContract] = await Promise.all([
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
    console.log(`  Verifier: ${verifierContract}`);
    
    // Save DreamscapeAgent deployment with full info
    saveDeploymentAddress("DreamscapeAgent", dreamscapeAgentAddress, network, {
      name,
      symbol,
      totalAgents: totalAgents.toString(),
      maxAgents: maxAgents.toString(),
      remainingSupply: (maxAgents - totalAgents).toString(),
      mintingFeeEther: ethers.formatEther(mintingFee),
      mintingFeeWei: mintingFee.toString(),
      treasury,
      verifier: verifierContract,
      gasUsed: (await dreamscapeAgent.deploymentTransaction().wait()).gasUsed.toString(),
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
    
    // Save address without extra info
    saveDeploymentAddress("DreamscapeAgent", dreamscapeAgentAddress, network, {
      treasury: treasuryAddress,
      mintingFeeEther: "0.1",
      mintingFeeWei: "100000000000000000",
      isOptimized: true,
      gasUsed: (await dreamscapeAgent.deploymentTransaction().wait()).gasUsed.toString()
    });
  }

  // ====== STEP 4: Create frontend contracts file ======
  console.log("\n📄 Step 4: Creating frontend contracts file...");
  
  const SimpleDreamVerifierArtifact = await hre.artifacts.readArtifact("SimpleDreamVerifier");
  const DreamscapeAgentArtifact = await hre.artifacts.readArtifact("DreamscapeAgent");
  
  await createFrontendContractsFile(network, {
    SimpleDreamVerifier: {
      address: verifierAddress,
      abi: SimpleDreamVerifierArtifact.abi
    },
    DreamscapeAgent: {
      address: dreamscapeAgentAddress,
      abi: DreamscapeAgentArtifact.abi
    }
  });

  // ====== SUMMARY ======
  console.log("\n🎉 TURBO DEPLOY COMPLETED!");
  console.log("=" * 60);
  console.log("📝 Add to .env:");
  console.log(`SIMPLE_DREAM_VERIFIER_ADDRESS=${verifierAddress}`);
  console.log(`DREAMSCAPE_AGENT_ADDRESS=${dreamscapeAgentAddress}`);
  console.log(`TREASURY_ADDRESS=${treasuryAddress}`);
  
  console.log("\n📂 Files created:");
  console.log(`  📊 deployment-addresses.json - Full deployment info`);
  console.log(`  🎨 frontend-contracts.json - ABI + addresses for frontend`);
  
  console.log("\n💡 Contract Addresses:");
  console.log(`  🔧 SimpleDreamVerifier: ${verifierAddress}`);
  console.log(`  🤖 DreamscapeAgent: ${dreamscapeAgentAddress}`);
  
  console.log("\n💰 Economic Model:");
  console.log(`  💎 Minting Cost: 0.1 OG`);
  console.log(`  🏦 Treasury: ${treasuryAddress}`);
  console.log(`  📊 Max Supply: 1000 agents (testnet)`);
  console.log(`  🎯 Value: Personality uniqueness + evolution`);
  
  debugLog('TURBO deployment completed successfully', {
    verifierAddress,
    dreamscapeAgentAddress,
    treasury: treasuryAddress,
    network
  });
}

main().catch((error) => {
  console.error("❌ TURBO DEPLOY FAILED:", error);
  process.exitCode = 1;
}); 