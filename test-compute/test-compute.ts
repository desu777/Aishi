#!/usr/bin/env ts-node

import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Official 0G providers
const OFFICIAL_PROVIDERS = {
  "llama-3.3-70b-instruct": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
  "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3"
};

// Test configuration
const TEST_QUERIES = [
  "What is the capital of France? Please answer in one sentence.",
  "Explain what dreams are in 2 sentences.",
  "What does flying in a dream typically symbolize?"
];

const INITIAL_FUND_AMOUNT = 0.1; // 0.1 OG tokens
const MIN_BALANCE_THRESHOLD = 0.01; // Minimum balance before stopping

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message: string, color: string = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log(`\n${colors.cyan}${"=".repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.white}🔷 ${title}${colors.reset}`);
  console.log(`${colors.cyan}${"=".repeat(60)}${colors.reset}`);
}

function logStep(step: string) {
  console.log(`\n${colors.yellow}📋 ${step}${colors.reset}`);
  console.log(`${colors.yellow}${"-".repeat(50)}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.cyan);
}

async function testDreamscapeCompute() {
  logSection("DREAMSCAPE 0G COMPUTE TEST");
  
  try {
    // Step 1: Environment validation
    logStep("Step 1: Environment Validation");
    
    const privateKey = process.env.COMPUTE_PRIVATE_KEY;
    const rpcUrl = process.env.COMPUTE_RPC_URL || "https://evmrpc-testnet.0g.ai";
    
    if (!privateKey) {
      throw new Error('COMPUTE_PRIVATE_KEY is required in .env file');
    }
    
    if (privateKey.length !== 64) {
      throw new Error('COMPUTE_PRIVATE_KEY must be 64 characters (without 0x prefix)');
    }
    
    logSuccess("Environment variables validated");
    logInfo(`RPC URL: ${rpcUrl}`);
    
    // Step 2: Wallet initialization
    logStep("Step 2: Wallet Initialization");
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    logSuccess(`Wallet Address: ${wallet.address}`);
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    logInfo(`Wallet ETH Balance: ${balanceEth} ETH`);
    
    if (parseFloat(balanceEth) < 0.01) {
      logWarning("Low ETH balance. You may need testnet ETH from faucet.");
      logInfo("Get testnet ETH from: https://faucet.0g.ai");
    }
    
    // Step 3: Broker initialization
    logStep("Step 3: 0G Compute Broker Initialization");
    
    log("⏳ Creating ZG Compute Network Broker...", colors.blue);
    const broker = await createZGComputeNetworkBroker(wallet);
    logSuccess("Broker created successfully");
    
    // Step 4: Ledger management
    logStep("Step 4: Ledger Account Management");
    
    let ledgerInfo;
    try {
      ledgerInfo = await broker.ledger.getLedger();
      logSuccess("Ledger account exists");
      
      const currentBalance = parseFloat(ethers.formatEther(ledgerInfo.ledgerInfo[0]));
      logInfo(`Current Ledger Balance: ${currentBalance} OG`);
      
      if (currentBalance < MIN_BALANCE_THRESHOLD) {
        logWarning(`Balance too low (${currentBalance} OG). Adding funds...`);
        await broker.ledger.depositFund(INITIAL_FUND_AMOUNT);
        logSuccess(`Added ${INITIAL_FUND_AMOUNT} OG to ledger`);
        
        // Get updated balance
        ledgerInfo = await broker.ledger.getLedger();
        const newBalance = parseFloat(ethers.formatEther(ledgerInfo.ledgerInfo[0]));
        logInfo(`New Ledger Balance: ${newBalance} OG`);
      }
    } catch (error: any) {
      if (error.message.includes('LedgerNotExists')) {
        logWarning("Ledger account does not exist. Creating...");
        await broker.ledger.addLedger(INITIAL_FUND_AMOUNT);
        logSuccess(`Ledger created with ${INITIAL_FUND_AMOUNT} OG tokens`);
        
        // Get created ledger info
        ledgerInfo = await broker.ledger.getLedger();
        const balance = parseFloat(ethers.formatEther(ledgerInfo.ledgerInfo[0]));
        logInfo(`Ledger Balance: ${balance} OG`);
      } else {
        throw error;
      }
    }
    
    // Step 5: Service discovery
    logStep("Step 5: AI Service Discovery");
    
    log("⏳ Fetching available AI services...", colors.blue);
    const services = await broker.inference.listService();
    logSuccess(`Found ${services.length} available AI services`);
    
    // Display services
    services.forEach((service: any, index: number) => {
      const modelName = Object.entries(OFFICIAL_PROVIDERS).find(([_, addr]) => addr === service.provider)?.[0] || 'Unknown';
      const isOfficial = Object.values(OFFICIAL_PROVIDERS).includes(service.provider);
      
      console.log(`\n${colors.bright}🤖 Service ${index + 1}:${colors.reset}`);
      console.log(`   Model: ${colors.magenta}${modelName}${colors.reset}`);
      console.log(`   Provider: ${service.provider}`);
      console.log(`   Service Type: ${service.serviceType}`);
      console.log(`   URL: ${service.url}`);
      console.log(`   Input Price: ${ethers.formatEther(service.inputPrice || 0)} OG`);
      console.log(`   Output Price: ${ethers.formatEther(service.outputPrice || 0)} OG`);
      console.log(`   Verification: ${service.verifiability || 'None'}`);
      console.log(`   Official: ${isOfficial ? '✅' : '❌'}`);
    });
    
    // Step 6: Model Selection
    logStep("Step 6: Model Selection");
    
    console.log(`\n${colors.bright}🤖 Available Models:${colors.reset}`);
    console.log(`${colors.green}1.${colors.reset} ${colors.magenta}LLAMA-3.3-70B-INSTRUCT${colors.reset} - ${OFFICIAL_PROVIDERS["llama-3.3-70b-instruct"]}`);
    console.log(`${colors.green}2.${colors.reset} ${colors.magenta}DEEPSEEK-R1-70B${colors.reset} - ${OFFICIAL_PROVIDERS["deepseek-r1-70b"]}`);
    
    // Simple model selection - default to LLAMA if no input
    console.log(`\n${colors.yellow}Choose model (1 or 2, default: 1):${colors.reset}`);
    
    // Read user input - simplified for quick testing
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const choice = await new Promise<string>((resolve) => {
      rl.question('Enter choice (1 or 2): ', (answer: string) => {
        rl.close();
        resolve(answer.trim() || '1');
      });
    });
    
    let selectedProvider: string;
    let modelName: string;
    
    if (choice === '2') {
      selectedProvider = OFFICIAL_PROVIDERS["deepseek-r1-70b"];
      modelName = "deepseek-r1-70b";
      logSuccess(`Selected: DEEPSEEK-R1-70B`);
    } else {
      selectedProvider = OFFICIAL_PROVIDERS["llama-3.3-70b-instruct"];
      modelName = "llama-3.3-70b-instruct";
      logSuccess(`Selected: LLAMA-3.3-70B-INSTRUCT`);
    }
    
    // Step 7: Provider acknowledgment
    logStep("Step 7: Provider Acknowledgment");
    
    logInfo(`Selected Provider: ${selectedProvider}`);
    logInfo(`Model: ${modelName}`);
    
    log("⏳ Acknowledging provider...", colors.blue);
    try {
      await broker.inference.acknowledgeProviderSigner(selectedProvider);
      logSuccess("Provider acknowledged successfully");
    } catch (error: any) {
      if (error.message.includes('already acknowledged')) {
        logSuccess("Provider already acknowledged");
      } else {
        throw error;
      }
    }
    
    // Step 8: Service metadata
    logStep("Step 8: Service Metadata Retrieval");
    
    log("⏳ Fetching service metadata...", colors.blue);
    const { endpoint, model } = await broker.inference.getServiceMetadata(selectedProvider);
    logSuccess(`Service Endpoint: ${endpoint}`);
    logSuccess(`Model Name: ${model}`);
    
    // Step 9: Multiple test queries
    logStep("Step 9: AI Query Testing");
    
    const results = [];
    
    for (let i = 0; i < TEST_QUERIES.length; i++) {
      const query = TEST_QUERIES[i];
      console.log(`\n${colors.bright}🔍 Test Query ${i + 1}:${colors.reset}`);
      console.log(`${colors.cyan}Query: "${query}"${colors.reset}`);
      
      try {
        // Generate authentication headers
        log("⏳ Generating authentication headers...", colors.blue);
        const headers = await broker.inference.getRequestHeaders(selectedProvider, query);
        logSuccess("Authentication headers generated");
        
        // Create OpenAI client
        const openai = new OpenAI({
          baseURL: endpoint,
          apiKey: "",
        });
        
        // Prepare headers
        const requestHeaders: Record<string, string> = {};
        Object.entries(headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            requestHeaders[key] = value;
          }
        });
        
        // Send query
        log("⏳ Sending query to AI service...", colors.blue);
        const startTime = Date.now();
        
        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: query }],
          model: model,
        }, {
          headers: requestHeaders,
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        const aiResponse = completion.choices[0].message.content;
        const chatId = completion.id;
        
        logSuccess(`AI query completed in ${responseTime}ms`);
        console.log(`${colors.green}🤖 AI Response:${colors.reset}`);
        console.log(`${colors.white}${aiResponse}${colors.reset}`);
        logInfo(`Chat ID: ${chatId}`);
        
        // Process response and payment
        log("⏳ Processing response and payment...", colors.blue);
        const isValid = await broker.inference.processResponse(
          selectedProvider,
          aiResponse || "",
          chatId
        );
        
        logSuccess("Response processed successfully");
        logSuccess(`Verification Status: ${isValid ? 'Valid ✅' : 'Invalid ❌'}`);
        
        results.push({
          query,
          response: aiResponse,
          responseTime,
          isValid,
          chatId
        });
        
      } catch (error: any) {
        logError(`Query ${i + 1} failed: ${error.message}`);
        results.push({
          query,
          error: error.message,
          responseTime: 0,
          isValid: false
        });
      }
      
      // Small delay between queries
      if (i < TEST_QUERIES.length - 1) {
        log("⏳ Waiting 2 seconds before next query...", colors.blue);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Step 10: Final balance check
    logStep("Step 10: Final Balance and Cost Analysis");
    
    const finalBalance = await broker.ledger.getLedger();
    const initialBalanceNum = parseFloat(ethers.formatEther(ledgerInfo.ledgerInfo[0]));
    const finalBalanceNum = parseFloat(ethers.formatEther(finalBalance.ledgerInfo[0]));
    const totalCost = initialBalanceNum - finalBalanceNum;
    
    logInfo(`Initial Balance: ${initialBalanceNum} OG`);
    logInfo(`Final Balance: ${finalBalanceNum} OG`);
    
    if (totalCost > 0) {
      logInfo(`Total Cost: ${totalCost.toFixed(6)} OG`);
      logInfo(`Average Cost per Query: ${(totalCost / results.length).toFixed(6)} OG`);
    } else {
      logInfo("No cost detected (possible processing delay)");
    }
    
    // Step 11: Summary
    logStep("Step 11: Test Summary");
    
    const successfulQueries = results.filter(r => !r.error).length;
    const totalQueries = results.length;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    
    console.log(`\n${colors.bright}📊 Test Results Summary:${colors.reset}`);
    console.log(`${colors.green}✅ Successful Queries: ${successfulQueries}/${totalQueries}${colors.reset}`);
    console.log(`${colors.cyan}⏱️  Average Response Time: ${averageResponseTime.toFixed(0)}ms${colors.reset}`);
    console.log(`${colors.yellow}💰 Total Cost: ${totalCost.toFixed(6)} OG${colors.reset}`);
    console.log(`${colors.magenta}🤖 Model Used: ${modelName}${colors.reset}`);
    console.log(`${colors.blue}🔒 TEE Verification: Enabled${colors.reset}`);
    
    if (successfulQueries === totalQueries) {
      logSuccess("🎉 All tests passed! 0G Compute integration is working perfectly.");
    } else {
      logWarning(`⚠️  ${totalQueries - successfulQueries} queries failed. Check the logs above.`);
    }
    
    logSection("TEST COMPLETED SUCCESSFULLY");
    
  } catch (error: any) {
    logError(`\n❌ Test failed with error: ${error.message}`);
    
    if (error.stack) {
      console.log(`\n${colors.red}Stack trace:${colors.reset}`);
      console.log(error.stack);
    }
    
    console.log(`\n${colors.yellow}🔧 Troubleshooting tips:${colors.reset}`);
    console.log("1. Ensure COMPUTE_PRIVATE_KEY is set in .env file (64 chars, no 0x)");
    console.log("2. Ensure wallet has sufficient testnet ETH (get from https://faucet.0g.ai)");
    console.log("3. Check network connectivity to 0G testnet");
    console.log("4. Verify 0G testnet is accessible");
    console.log("5. Try running the test again (sometimes network issues are temporary)");
    
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDreamscapeCompute().catch(console.error);
}

export default testDreamscapeCompute; 