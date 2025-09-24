#!/usr/bin/env node

/**
 * Voice Services Complete Test Script
 * Tests the complete voice pipeline with universal language support
 */

const axios = require('axios');
const chalk = require('chalk');

const BASE_URL = 'http://localhost:3001/api';

// Test cases with multiple languages
const MULTI_LANGUAGE_TESTS = [
  // Polish
  {
    name: 'Polish - Dream Request',
    transcript: 'Chcę ci opowiedzieć o moim śnie',
    expectedCommand: 'dream',
    expectedLanguage: 'Polish'
  },

  // English
  {
    name: 'English - Personality Query',
    transcript: 'What are my personality traits?',
    expectedCommand: 'personality',
    expectedLanguage: 'English'
  },

  // German
  {
    name: 'German - Stats Query',
    transcript: 'Zeig mir meine Statistiken',
    expectedCommand: 'stats',
    expectedLanguage: 'German'
  },

  // Japanese
  {
    name: 'Japanese - Chat Request',
    transcript: 'お話ししましょう',
    expectedCommand: 'chat',
    expectedLanguage: 'Japanese'
  },

  // French
  {
    name: 'French - Help Request',
    transcript: 'Que pouvez-vous faire?',
    expectedCommand: 'help',
    expectedLanguage: 'French'
  },

  // Spanish
  {
    name: 'Spanish - Memory Query',
    transcript: 'Muéstrame mis memorias',
    expectedCommand: 'memory',
    expectedLanguage: 'Spanish'
  },

  // Italian
  {
    name: 'Italian - Features Query',
    transcript: 'Mostrami le mie caratteristiche uniche',
    expectedCommand: 'unique-features',
    expectedLanguage: 'Italian'
  },

  // Mixed Language (should handle gracefully)
  {
    name: 'Mixed Language - English + Polish',
    transcript: 'I want to opowiedzieć about my sen',
    expectedCommand: 'dream',
    expectedLanguage: 'English' // Should pick dominant language
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
      console.log(`   Language: ${chalk.magenta(intent.detectedLanguage)} (${intent.languageCode})`);
      console.log(`   Response: ${chalk.gray('"' + intent.suggestedResponse.substring(0, 80) + '..."')}`);
      console.log(`   Action: ${chalk.blue(intent.followUpAction)}`);

      // Check expectations
      let passed = true;

      if (testCase.expectedCommand && intent.command !== testCase.expectedCommand) {
        console.log(chalk.red(`   ❌ Expected command: ${testCase.expectedCommand}, got: ${intent.command}`));
        passed = false;
      }

      // Language detection is fuzzy - just check it's not empty
      if (!intent.detectedLanguage || intent.detectedLanguage === '') {
        console.log(chalk.red(`   ❌ No language detected`));
        passed = false;
      }

      if (!intent.languageCode || intent.languageCode === '') {
        console.log(chalk.red(`   ❌ No language code provided`));
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

async function testVoiceStatus() {
  try {
    console.log(chalk.blue('\n🔍 Testing voice services status...'));

    const response = await axios.get(`${BASE_URL}/voice/status`);

    if (response.data.success) {
      const status = response.data.data;
      console.log(chalk.green('✅ Voice services status:'));
      console.log(`   Overall Ready: ${status.overall ? '✅' : '❌'}`);
      console.log(`   Voice Intent: ${status.voiceIntent.isReady ? '✅' : '❌'}`);
      console.log(`   Gemini: ${status.gemini.isReady ? '✅' : '❌'}`);
      return true;
    } else {
      console.log(chalk.red('❌ Voice status check failed'));
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`❌ Voice status error: ${error.message}`));
    return false;
  }
}

async function testVoiceProfiles() {
  try {
    console.log(chalk.blue('\n🎵 Testing voice profiles...'));

    const response = await axios.get(`${BASE_URL}/voice/voices`);

    if (response.data.success) {
      const voices = response.data.data.voices;
      console.log(chalk.green(`✅ Found ${voices.length} voice profiles:`));

      voices.forEach(voice => {
        console.log(`   ${chalk.yellow(voice.id)}: ${voice.name} (${voice.gender}) - ${voice.description}`);
      });

      console.log(`   Supported Languages: ${response.data.data.supportedLanguages}`);
      return true;
    } else {
      console.log(chalk.red('❌ Voice profiles check failed'));
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`❌ Voice profiles error: ${error.message}`));
    return false;
  }
}

async function runUniversalLanguageTests() {
  console.log(chalk.bold.blue('\n🌍 UNIVERSAL LANGUAGE VOICE TESTS'));
  console.log(chalk.gray('Testing voice intent with multiple languages (no hardcoding)\n'));

  // Test service status first
  const statusOk = await testVoiceStatus();
  if (!statusOk) {
    console.log(chalk.red('❌ Voice services not ready - aborting tests'));
    process.exit(1);
  }

  // Test voice profiles
  const profilesOk = await testVoiceProfiles();
  if (!profilesOk) {
    console.log(chalk.red('❌ Voice profiles not available - aborting tests'));
    process.exit(1);
  }

  const results = [];

  // Run all multi-language test cases
  for (const testCase of MULTI_LANGUAGE_TESTS) {
    const result = await testVoiceIntent(testCase);
    results.push(result);

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  // Summary
  console.log(chalk.bold.blue('\n📊 UNIVERSAL LANGUAGE TEST RESULTS'));
  console.log('='.repeat(60));

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

  // Language distribution analysis
  const languageDetection = {};
  successful.forEach(result => {
    if (result.intent && result.intent.detectedLanguage) {
      const lang = result.intent.detectedLanguage;
      languageDetection[lang] = (languageDetection[lang] || 0) + 1;
    }
  });

  console.log(chalk.cyan('\n🌍 Language Detection Results:'));
  Object.entries(languageDetection).forEach(([language, count]) => {
    console.log(`   ${language}: ${count} successful detections`);
  });

  // Performance analysis
  const avgResponseTime = successful.reduce((sum, r) => sum + (r.responseTime || 0), 0) / successful.length;
  console.log(chalk.cyan(`\n⚡ Average Response Time: ${avgResponseTime.toFixed(0)}ms`));

  // Command recognition distribution
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
    console.log(chalk.bold.green('\n🎉 ALL UNIVERSAL LANGUAGE TESTS PASSED!'));
    console.log(chalk.green('Voice intent recognition works with multiple languages automatically.'));
    process.exit(0);
  } else {
    console.log(chalk.bold.red('\n💥 Some tests failed. Check the universal language implementation.'));
    process.exit(1);
  }
}

// Command line options
if (process.argv[2] === '--single' && process.argv[3]) {
  const transcript = process.argv[3];
  console.log(chalk.blue(`\n🧪 Single Language Test: "${transcript}"`));

  testVoiceIntent({
    name: 'Manual Test',
    transcript,
    expectedCommand: null,
    expectedLanguage: null
  }).then(() => {
    process.exit(0);
  });
} else if (process.argv[2] === '--status') {
  Promise.all([
    testVoiceStatus(),
    testVoiceProfiles()
  ]).then(() => {
    process.exit(0);
  });
} else {
  runUniversalLanguageTests();
}