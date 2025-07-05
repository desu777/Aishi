'use client';

import { useState, useEffect } from 'react';
import { useCompute } from '../../hooks/useCompute';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Brain, 
  Wallet, 
  Settings, 
  Activity, 
  MessageSquare,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

export default function TestComputePage() {
  const { theme, debugLog } = useTheme();
  const { isConnected, address, shortAddress, connectWallet, switchToOGNetwork, isCorrectNetwork } = useWallet();
  const {
    isLoading,
    error,
    brokerInfo,
    models,
    healthStatus,
    pendingSignatures,
    isInitializing,
    initializeBroker,
    checkBalance,
    fundAccount,
    getBrokerInfo,
    getModels,
    analyzeDream,
    quickTest,
    checkHealth,
    clearError,
    loadInitialData,
    processSignatureRequest
  } = useCompute();

  // Local state
  const [balance, setBalance] = useState<string>('');
  const [fundAmount, setFundAmount] = useState<string>('0.1');
  const [selectedModel, setSelectedModel] = useState<'llama' | 'deepseek'>('llama');
  const [dreamText, setDreamText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'broker' | 'ai' | 'health'>('broker');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initial data is loaded automatically by useCompute hook

  // Handlers
  const handleInitializeBroker = async () => {
    const result = await initializeBroker();
    if (result.success) {
      await getBrokerInfo();
    }
  };

  const handleCheckBalance = async () => {
    const result = await checkBalance();
    if (result) {
      setBalance(result.formatted);
    }
  };

  const handleFundAccount = async () => {
    const result = await fundAccount(fundAmount);
    if (result.success) {
      setBalance(result.newBalance);
      await getBrokerInfo();
    }
  };

  const handleAnalyzeDream = async () => {
    if (!dreamText.trim()) {
      clearError();
      return;
    }

    const result = await analyzeDream(dreamText, selectedModel);
    if (result) {
      setAnalysisResult(result);
    }
  };

  const handleQuickTest = async () => {
    const result = await quickTest(selectedModel);
    if (result) {
      setTestResult(result);
    }
  };

  const handleLoadModels = async () => {
    await getModels();
  };

  const handleRefreshHealth = async () => {
    await checkHealth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            🧠 Compute Backend Test
          </h1>
          <p className="text-gray-400">
            Test interface for 0G Compute Network integration
          </p>
        </motion.div>

        {/* Wallet Connection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Wallet className="text-purple-400" size={24} />
              <h2 className="text-xl font-semibold text-white">Wallet Status</h2>
            </div>
            {isConnected && (
              <div className="text-sm text-gray-400">
                {shortAddress}
              </div>
            )}
          </div>

          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
          ) : !isCorrectNetwork ? (
            <button
              onClick={switchToOGNetwork}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Switch to 0G Network
            </button>
          ) : (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={20} />
              <span>Connected to 0G Galileo Testnet</span>
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        {isConnected && isCorrectNetwork && (
          <>
            {/* Navigation Tabs */}
            <div className="flex space-x-1 mb-6">
              {[
                { id: 'broker', label: 'Broker Management', icon: Settings },
                { id: 'ai', label: 'AI Testing', icon: Brain },
                { id: 'health', label: 'Health Check', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Error Display */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
              >
                <AlertCircle size={20} />
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </motion.div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="fixed top-4 right-4 z-50">
                <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-2 text-white">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processing...</span>
                </div>
              </div>
            )}

            {/* Pending Signatures */}
            {pendingSignatures.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed bottom-4 right-4 z-50 bg-purple-900 rounded-lg p-4 max-w-md"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="animate-spin text-white" size={20} />
                  <h3 className="text-white font-semibold">Signature Required</h3>
                </div>
                <p className="text-purple-200 text-sm mb-3">
                  Please sign the {pendingSignatures[0].operation.type} request in your wallet
                </p>
                <div className="text-xs text-purple-300">
                  Operation: {pendingSignatures[0].operationId.slice(0, 20)}...
                </div>
              </motion.div>
            )}

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Broker Management Tab */}
              {activeTab === 'broker' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Broker Info */}
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">Broker Information</h3>
                      <button
                        onClick={getBrokerInfo}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={16} />
                        Refresh
                      </button>
                    </div>

                    {brokerInfo ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Status:</span>
                          <span className={`font-semibold ${
                            brokerInfo.initialized ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {brokerInfo.initialized ? 'Initialized' : 'Not Initialized'}
                          </span>
                        </div>
                        {brokerInfo.balance && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Balance:</span>
                            <span className="text-white font-semibold">{brokerInfo.balance}</span>
                          </div>
                        )}
                        {brokerInfo.lastUsed && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Last Used:</span>
                            <span className="text-white">{new Date(brokerInfo.lastUsed).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400">No broker information available</div>
                    )}
                  </div>

                  {/* Broker Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Initialize Broker */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Initialize Broker</h3>
                      <p className="text-gray-400 mb-4">
                        Create a new broker account with initial funding
                      </p>
                      <button
                        onClick={handleInitializeBroker}
                        disabled={isLoading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Initializing...' : 'Initialize Broker'}
                      </button>
                    </div>

                    {/* Check Balance */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Check Balance</h3>
                      <div className="space-y-4">
                        {balance && (
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="text-sm text-gray-400">Current Balance</div>
                            <div className="text-lg font-semibold text-green-400">{balance}</div>
                          </div>
                        )}
                        <button
                          onClick={handleCheckBalance}
                          disabled={isLoading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Checking...' : 'Check Balance'}
                        </button>
                      </div>
                    </div>

                    {/* Fund Account */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Fund Account</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Amount (OG)</label>
                          <input
                            type="number"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            step="0.001"
                            min="0.001"
                            max="10"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            placeholder="0.1"
                          />
                        </div>
                        <button
                          onClick={handleFundAccount}
                          disabled={isLoading || !fundAmount}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Funding...' : 'Fund Account'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* AI Testing Tab */}
              {activeTab === 'ai' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Model Selection */}
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">AI Models</h3>
                      <button
                        onClick={handleLoadModels}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={16} />
                        Refresh
                      </button>
                    </div>

                    {models.length > 0 ? (
                      <div className="space-y-3">
                        {models.map((model) => (
                          <label key={model.id} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="model"
                              value={model.id}
                              checked={selectedModel === model.id}
                              onChange={(e) => setSelectedModel(e.target.value as any)}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-white">{model.name}</div>
                              <div className="text-sm text-gray-400">
                                {model.bestFor} • {model.averageResponseTime}
                              </div>
                              <div className="text-sm text-green-400">{model.testnetNote}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400">No models available</div>
                    )}
                  </div>

                  {/* Quick Test */}
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Test</h3>
                    <p className="text-gray-400 mb-4">
                      Run a quick test with a predefined dream text
                    </p>
                    <button
                      onClick={handleQuickTest}
                      disabled={isLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Testing...' : `Quick Test (${selectedModel.toUpperCase()})`}
                    </button>

                    {testResult && (
                      <div className="mt-4 bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-white mb-2">Test Result:</h4>
                        <div className="text-sm text-gray-300">
                          <div className="mb-2">
                            <span className="text-gray-400">Test Dream:</span> {testResult.testDream}
                          </div>
                          <div className="mb-2">
                            <span className="text-gray-400">AI Response:</span> {testResult.result?.analysis?.interpretation}
                          </div>
                          <div className="mb-2">
                            <span className="text-gray-400">Cost:</span> {testResult.result?.cost}
                          </div>
                          <div>
                            <span className="text-gray-400">Remaining Balance:</span> {testResult.result?.remainingBalance}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dream Analysis */}
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Dream Analysis</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Dream Text</label>
                        <textarea
                          value={dreamText}
                          onChange={(e) => setDreamText(e.target.value)}
                          rows={4}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                          placeholder="Describe your dream here..."
                        />
                      </div>
                      <button
                        onClick={handleAnalyzeDream}
                        disabled={isLoading || !dreamText.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Analyzing...' : `Analyze Dream (${selectedModel.toUpperCase()})`}
                      </button>
                    </div>

                    {analysisResult && (
                      <div className="mt-6 bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-white mb-3">Analysis Result:</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-gray-400">Interpretation:</span>
                            <div className="text-white mt-1">{analysisResult.analysis?.interpretation}</div>
                          </div>
                          
                          {analysisResult.analysis?.symbols?.length > 0 && (
                            <div>
                              <span className="text-gray-400">Symbols:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {analysisResult.analysis.symbols.map((symbol: string, index: number) => (
                                  <span key={index} className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                                    {symbol}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {analysisResult.analysis?.emotions?.length > 0 && (
                            <div>
                              <span className="text-gray-400">Emotions:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {analysisResult.analysis.emotions.map((emotion: string, index: number) => (
                                  <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                                    {emotion}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {analysisResult.analysis?.insights?.length > 0 && (
                            <div>
                              <span className="text-gray-400">Insights:</span>
                              <ul className="text-white mt-1 space-y-1">
                                {analysisResult.analysis.insights.map((insight: string, index: number) => (
                                  <li key={index} className="text-sm">• {insight}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="flex justify-between pt-3 border-t border-gray-600">
                            <span className="text-gray-400">Cost: {analysisResult.cost}</span>
                            <span className="text-gray-400">Balance: {analysisResult.remainingBalance}</span>
                            <span className="text-gray-400">Time: {analysisResult.analysis?.responseTime}ms</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Health Check Tab */}
              {activeTab === 'health' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">Backend Health</h3>
                      <button
                        onClick={handleRefreshHealth}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={16} />
                        Refresh
                      </button>
                    </div>

                    {healthStatus ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Status:</span>
                          <span className={`font-semibold ${
                            healthStatus.status === 'healthy' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {healthStatus.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Version:</span>
                          <span className="text-white">{healthStatus.version}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Uptime:</span>
                          <span className="text-white">{healthStatus.uptime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Network:</span>
                          <span className="text-white">{healthStatus.network}</span>
                        </div>
                        {healthStatus.models && (
                          <div>
                            <span className="text-gray-400">Available Models:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {healthStatus.models.map((model: string, index: number) => (
                                <span key={index} className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                                  {model}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400">No health information available</div>
                    )}
                  </div>

                  {/* Advanced Debug */}
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white"
                      >
                        {showAdvanced ? <EyeOff size={20} /> : <Eye size={20} />}
                        Advanced Debug Info
                      </button>
                    </div>

                    {showAdvanced && (
                      <div className="space-y-3">
                        <div className="bg-gray-700 rounded-lg p-3">
                          <h4 className="font-semibold text-white mb-2">Environment Variables</h4>
                          <div className="text-sm text-gray-300 space-y-1">
                            <div>API URL: {process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api'}</div>
                            <div>Debug Mode: {process.env.NEXT_PUBLIC_DREAM_TEST || 'false'}</div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-3">
                          <h4 className="font-semibold text-white mb-2">Connection State</h4>
                          <div className="text-sm text-gray-300 space-y-1">
                            <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
                            <div>Network: {isCorrectNetwork ? 'Correct' : 'Wrong'}</div>
                            <div>Address: {address || 'Not connected'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 