const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("🧠 Deploying DreamAgentNFT...");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer);

  // Get the verifier contract address
  const verifierDeployment = await get("SimpleDreamVerifier");
  console.log("Using verifier at:", verifierDeployment.address);

  const dreamAgentNFTDeployment = await deploy("DreamAgentNFT", {
    from: deployer,
    args: [verifierDeployment.address],
    log: true,
    waitConfirmations: network.name === "galileo" ? 2 : 1,
  });

  console.log("✅ DreamAgentNFT deployed to:", dreamAgentNFTDeployment.address);
  
  // Save to environment
  console.log("📝 Add to .env:");
  console.log(`DREAM_AGENT_NFT_ADDRESS=${dreamAgentNFTDeployment.address}`);

  // Initialize contract info
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

  // Log contract info
  const name = await dreamAgentNFT.name();
  const symbol = await dreamAgentNFT.symbol();
  const totalAgents = await dreamAgentNFT.totalAgents();
  
  console.log("📊 Contract Info:");
  console.log(`  Name: ${name}`);
  console.log(`  Symbol: ${symbol}`);
  console.log(`  Total Agents: ${totalAgents}`);
  console.log(`  Verifier: ${await dreamAgentNFT.verifier()}`);
};

module.exports.tags = ["DreamAgentNFT", "nft"];
module.exports.dependencies = ["SimpleDreamVerifier"];
module.exports.id = "deploy-dream-agent-nft"; 