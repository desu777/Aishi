#!/usr/bin/env node

/**
 * Voice Intent Recognition Test Script
 * Tests the /api/voice/intent endpoint with various user inputs
 */

const axios = require('axios');
const chalk = require('chalk');

const BASE_URL = 'http://localhost:3001/api';

// Test cases covering different scenarios
const TEST_CASES = [
  // Polish dream scenarios
  {
    name: 'Polish - Dream Request',
    transcript: 'Chcę ci opowiedzieć o moim śnie z zeszłej nocy',
    expected: { command: 'dream', language: 'pl' }
  },
  {
    name: 'Polish - Dream Casual',
    transcript: 'Miałem dziwny sen',
    expected: { command: 'dream', language: 'pl' }
  },

  // English dream scenarios
  {
    name: 'English - Dream Request',
    transcript: 'I want to tell you about my dream',
    expected: { command: 'dream', language: 'en' }
  },
  {
    name: 'English - Dream Casual',
    transcript: 'I had this weird dream last night',
    expected: { command: 'dream', language: 'en' }
  },

  // Personality queries
  {
    name: 'Polish - Personality',
    transcript: 'Jakie mam cechy osobowości?',
    expected: { command: 'personality', language: 'pl' }
  },
  {
    name: 'English - Personality',
    transcript: 'What are my personality traits?',
    expected: { command: 'personality', language: 'en' }
  },

  // Stats queries
  {
    name: 'Polish - Stats',
    transcript: 'Jakie mam statystyki? Jaki mam poziom inteligencji?',
    expected: { command: 'stats', language: 'pl' }
  },
  {
    name: 'English - Stats',
    transcript: 'Show me my statistics and intelligence level',
    expected: { command: 'stats', language: 'en' }
  },

  // Chat scenarios
  {
    name: 'Polish - Chat',
    transcript: 'Chcę porozmawiać',
    expected: { command: 'chat', language: 'pl' }
  },
  {
    name: 'English - Chat',
    transcript: 'Let\'s have a conversation',
    expected: { command: 'chat', language: 'en' }
  },

  // Help scenarios
  {
    name: 'Polish - Help',
    transcript: 'Jakie masz funkcje? Co możesz robić?',
    expected: { command: 'help', language: 'pl' }
  },
  {
    name: 'English - Help',
    transcript: 'What can you do? What are your functions?',
    expected: { command: 'help', language: 'en' }
  },

  // Memory scenarios
  {
    name: 'English - Memory',
    transcript: 'Show me my memories',
    expected: { command: 'memory', language: 'en' }
  },

  // Features scenarios
  {
    name: 'Polish - Features',
    transcript: 'Jakie mam unikalne cechy?',
    expected: { command: 'unique-features', language: 'pl' }
  },

  // Ambiguous scenarios
  {
    name: 'Unclear Intent',
    transcript: 'I don\'t know what I want',
    expected: { command: 'help', language: 'en' }
  },

  // Edge cases
  {
    name: 'Very Short',
    transcript: 'help',
    expected: { command: 'help', language: 'en' }
  },
  {
    name: 'Mixed Language',
    transcript: 'I want to opowiedzieć about my sen',
    expected: { command: 'dream', language: 'en' } // Should default to dominant language
  }
];

async function testVoiceIntent(testCase) {
  try {
    console.log(chalk.blue(`\n🧪 Testing: ${testCase.name}`));
    console.log(chalk.gray(`Input: "${testCase.transcript}"`));

    const startTime = Date.now();
    const response = await axios.post(`${BASE_URL}/voice/intent`, {
      transcript: testCase.transcript
    });
    const responseTime = Date.now() - startTime;

    if (response.data.success) {
      const intent = response.data.data.intent;

      console.log(chalk.green(`✅ Success (${responseTime}ms)`));
      console.log(`   Command: ${chalk.yellow(intent.command)}`);
      console.log(`   Confidence: ${chalk.cyan(intent.confidence.toFixed(2))}`);
      console.log(`   Language: ${chalk.magenta(intent.parameters.language)}`);
      console.log(`   Response: ${chalk.gray('"' + intent.suggestedResponse.substring(0, 80) + '..."')}`);
      console.log(`   Action: ${chalk.blue(intent.followUpAction)}`);

      // Check expectations
      let passed = true;
      if (testCase.expected.command && intent.command !== testCase.expected.command) {
        console.log(chalk.red(`   ❌ Expected command: ${testCase.expected.command}, got: ${intent.command}`));
        passed = false;
      }
      if (testCase.expected.language && intent.parameters.language !== testCase.expected.language) {
        console.log(chalk.red(`   ❌ Expected language: ${testCase.expected.language}, got: ${intent.parameters.language}`));
        passed = false;
      }

      if (passed) {
        console.log(chalk.green(`   ✅ All expectations met`));
      }

      return {
        name: testCase.name,
        success: true,
        passed,
        intent,
        responseTime
      };
    } else {
      console.log(chalk.red(`❌ API Error: ${response.data.error}`));
      return {
        name: testCase.name,
        success: false,
        error: response.data.error
      };
    }
  } catch (error) {
    console.log(chalk.red(`❌ Request failed: ${error.message}`));
    return {
      name: testCase.name,
      success: false,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log(chalk.bold.blue('\n🎤 VOICE INTENT RECOGNITION TEST SUITE'));
  console.log(chalk.gray('Testing voice intent analysis with various user inputs\n'));

  // Test service status first
  try {
    console.log(chalk.blue('🔍 Checking voice service status...'));
    const statusResponse = await axios.get(`${BASE_URL}/voice/status`);

    if (statusResponse.data.success && statusResponse.data.data.overall) {
      console.log(chalk.green('✅ Voice services are ready'));
    } else {
      console.log(chalk.red('❌ Voice services not ready:', statusResponse.data.data));
      process.exit(1);
    }
  } catch (error) {
    console.log(chalk.red('❌ Failed to check service status:', error.message));
    process.exit(1);
  }

  const results = [];

  // Run all test cases
  for (const testCase of TEST_CASES) {
    const result = await testVoiceIntent(testCase);
    results.push(result);

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log(chalk.bold.blue('\n📊 TEST RESULTS SUMMARY'));
  console.log('='.repeat(50));

  const successful = results.filter(r => r.success && r.passed);
  const failed = results.filter(r => !r.success || !r.passed);

  console.log(chalk.green(`✅ Passed: ${successful.length}/${results.length}`));
  console.log(chalk.red(`❌ Failed: ${failed.length}/${results.length}`));

  if (failed.length > 0) {
    console.log(chalk.red('\nFailed tests:'));
    failed.forEach(result => {
      console.log(chalk.red(`   • ${result.name}: ${result.error || 'Expectations not met'}`));
    });
  }

  // Performance summary
  const avgResponseTime = successful.reduce((sum, r) => sum + (r.responseTime || 0), 0) / successful.length;
  console.log(chalk.cyan(`\n⚡ Average Response Time: ${avgResponseTime.toFixed(0)}ms`));

  // Command distribution
  const commandCounts = {};
  successful.forEach(result => {
    if (result.intent) {
      commandCounts[result.intent.command] = (commandCounts[result.intent.command] || 0) + 1;
    }
  });

  console.log(chalk.cyan('\n📈 Command Recognition Distribution:'));
  Object.entries(commandCounts).forEach(([command, count]) => {
    console.log(`   ${command}: ${count} times`);
  });

  if (successful.length === results.length) {
    console.log(chalk.bold.green('\n🎉 ALL TESTS PASSED! Voice intent recognition is working perfectly.'));
    process.exit(0);
  } else {
    console.log(chalk.bold.red('\n💥 Some tests failed. Check the implementation.'));
    process.exit(1);
  }
}

// Add command line option for single test
if (process.argv[2] === '--single' && process.argv[3]) {
  const transcript = process.argv[3];
  console.log(chalk.blue(`\n🧪 Single Test: "${transcript}"`));

  testVoiceIntent({
    name: 'Manual Test',
    transcript,
    expected: {}
  }).then(() => {
    process.exit(0);
  });
} else {
  runAllTests();
}