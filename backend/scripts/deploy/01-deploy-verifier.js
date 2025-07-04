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
const saveDeploymentAddress = (contractName, address, network) => {
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
  
  // Update with new address
  const oldAddress = deployments[network][contractName];
  deployments[network][contractName] = address;
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
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("🔧 Deploying SimpleDreamVerifier...");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer);
  
  debugLog('Starting SimpleDreamVerifier deployment', { 
    network: network.name, 
    deployer 
  });

  const verifierDeployment = await deploy("SimpleDreamVerifier", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.name === "galileo" ? 2 : 1,
  });

  console.log("✅ SimpleDreamVerifier deployed to:", verifierDeployment.address);
  
  // Save address to JSON file
  saveDeploymentAddress("SimpleDreamVerifier", verifierDeployment.address, network.name);
  
  // Save to environment for next deployment
  console.log("📝 Add to .env:");
  console.log(`DREAM_VERIFIER_ADDRESS=${verifierDeployment.address}`);
  
  debugLog('SimpleDreamVerifier deployment completed', {
    address: verifierDeployment.address,
    gasUsed: verifierDeployment.receipt?.gasUsed?.toString()
  });
};

module.exports.tags = ["SimpleDreamVerifier", "verifier"];
module.exports.id = "deploy-verifier"; 