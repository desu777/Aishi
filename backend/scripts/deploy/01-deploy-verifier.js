const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("🔧 Deploying SimpleDreamVerifier...");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer);

  const verifierDeployment = await deploy("SimpleDreamVerifier", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.name === "galileo" ? 2 : 1,
  });

  console.log("✅ SimpleDreamVerifier deployed to:", verifierDeployment.address);
  
  // Save to environment for next deployment
  console.log("📝 Add to .env:");
  console.log(`DREAM_VERIFIER_ADDRESS=${verifierDeployment.address}`);
};

module.exports.tags = ["SimpleDreamVerifier", "verifier"];
module.exports.id = "deploy-verifier"; 