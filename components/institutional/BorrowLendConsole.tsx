'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bitcoin, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Zap,
  Target,
  Calculator,
  ArrowUpDown,
  Settings
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts'

interface OracleData {
  btcPrice: number
  musdPrice: number
  timestamp: number
  source: 'Pyth' | 'Stork'
  confidence: number
}

interface LendingParams {
  collateralAmount: number
  borrowAmount: number
  ltvRatio: number
  fixedRateAPR: number
  liquidationThreshold: number
}

export default function BorrowLendConsole() {
  const [oracleData, setOracleData] = useState<OracleData>({
    btcPrice: 67420,
    musdPrice: 1.00,
    timestamp: Date.now(),
    source: 'Pyth',
    confidence: 0.99
  })

  const [lendingParams, setLendingParams] = useState<LendingParams>({
    collateralAmount: 2.5,
    borrowAmount: 125000,
    ltvRatio: 0.75,
    fixedRateAPR: 8.5,
    liquidationThreshold: 0.85
  })

  const [priceHistory, setPriceHistory] = useState<Array<{time: string, price: number}>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Simulate real-time oracle updates
  useEffect(() => {
    const updateOracleData = () => {
      const priceChange = (Math.random() - 0.5) * 0.02 // ±1% change
      const newBtcPrice = oracleData.btcPrice * (1 + priceChange)
      
      setOracleData({
        btcPrice: newBtcPrice,
        musdPrice: 1.00,
        timestamp: Date.now(),
        source: Math.random() > 0.5 ? 'Pyth' : 'Stork',
        confidence: 0.95 + Math.random() * 0.04
      })

      // Update price history
      const now = new Date()
      const newHistory = [...priceHistory, {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: newBtcPrice
      }].slice(-20) // Keep last 20 data points
      
      setPriceHistory(newHistory)
    }

    const interval = setInterval(updateOracleData, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [oracleData.btcPrice, priceHistory])

  const handleCollateralChange = (amount: number) => {
    const newLtvRatio = (lendingParams.borrowAmount / (amount * oracleData.btcPrice))
    setLendingParams(prev => ({
      ...prev,
      collateralAmount: amount,
      ltvRatio: newLtvRatio
    }))
  }

  const handleBorrowChange = (amount: number) => {
    const newLtvRatio = (amount / (lendingParams.collateralAmount * oracleData.btcPrice))
    setLendingParams(prev => ({
      ...prev,
      borrowAmount: amount,
      ltvRatio: newLtvRatio
    }))
  }

  const maxBorrowAmount = lendingParams.collateralAmount * oracleData.btcPrice * lendingParams.liquidationThreshold
  const liquidationPrice = (lendingParams.borrowAmount / lendingParams.collateralAmount) / lendingParams.liquidationThreshold
  const healthFactor = (lendingParams.collateralAmount * oracleData.btcPrice) / lendingParams.borrowAmount

  const getHealthFactorColor = (hf: number) => {
    if (hf >= 1.5) return 'text-green-400'
    if (hf >= 1.2) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="institutional-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-mezo-btc-500/10">
            <ArrowUpDown className="w-6 h-6 text-mezo-btc-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-mezo-dark-50 font-display">Borrow & Lend Console</h2>
            <p className="text-sm text-mezo-dark-300">BTC collateral, MUSD borrowing with real-time oracle feeds</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-mezo-dark-300">
          <Activity className="w-4 h-4" />
          <span>Live oracle data</span>
        </div>
      </div>

      {/* Oracle Price Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="institutional-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Bitcoin className="w-5 h-5 text-mezo-btc-500" />
              <span className="text-sm font-medium text-mezo-dark-200">BTC Price</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-mezo-dark-300">{oracleData.source}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-mezo-btc-500 font-mono">
            ${oracleData.btcPrice.toLocaleString()}
          </div>
          <div className="text-xs text-mezo-dark-300 mt-1">
            Confidence: {(oracleData.confidence * 100).toFixed(1)}%
          </div>
        </div>

        <div className="institutional-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-mezo-musd-500" />
              <span className="text-sm font-medium text-mezo-dark-200">MUSD Price</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-mezo-dark-300">{oracleData.source}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-mezo-musd-500 font-mono">
            ${oracleData.musdPrice.toFixed(2)}
          </div>
          <div className="text-xs text-mezo-dark-300 mt-1">
            Stablecoin peg
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="institutional-card mb-6">
        <h3 className="text-lg font-semibold text-mezo-dark-50 mb-4">BTC Price Trend (Live)</h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="time" 
                stroke="#CED4DA"
                fontSize={10}
              />
              <YAxis 
                stroke="#CED4DA"
                fontSize={10}
                tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(13, 17, 23, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#F8F9FA'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'BTC Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#F7931A"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lending Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Collateral Input */}
        <div className="institutional-card">
          <h3 className="text-lg font-semibold text-mezo-dark-50 mb-4">Collateral Parameters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mezo-dark-200 mb-2">
                BTC Collateral Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={lendingParams.collateralAmount}
                  onChange={(e) => handleCollateralChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-mezo-btc-500/50 focus:outline-none"
                  step="0.001"
                  min="0"
                />
                <div className="absolute right-3 top-3 text-sm text-mezo-dark-300">BTC</div>
              </div>
              <div className="text-xs text-mezo-dark-300 mt-1">
                ≈ ${(lendingParams.collateralAmount * oracleData.btcPrice).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-mezo-dark-200 mb-2">
                Fixed Rate APR
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={lendingParams.fixedRateAPR}
                  onChange={(e) => setLendingParams(prev => ({ ...prev, fixedRateAPR: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-mezo-musd-500/50 focus:outline-none"
                  step="0.1"
                  min="0"
                />
                <div className="absolute right-3 top-3 text-sm text-mezo-dark-300">%</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-mezo-dark-200 mb-2">
                Liquidation Threshold
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={lendingParams.liquidationThreshold}
                  onChange={(e) => setLendingParams(prev => ({ ...prev, liquidationThreshold: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-mezo-btc-500/50 focus:outline-none"
                  step="0.01"
                  min="0"
                  max="1"
                />
                <div className="absolute right-3 top-3 text-sm text-mezo-dark-300">%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Borrow Amount */}
        <div className="institutional-card">
          <h3 className="text-lg font-semibold text-mezo-dark-50 mb-4">Borrow Parameters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mezo-dark-200 mb-2">
                MUSD Borrow Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={lendingParams.borrowAmount}
                  onChange={(e) => handleBorrowChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-mezo-musd-500/50 focus:outline-none"
                  step="1000"
                  min="0"
                  max={maxBorrowAmount}
                />
                <div className="absolute right-3 top-3 text-sm text-mezo-dark-300">MUSD</div>
              </div>
              <div className="text-xs text-mezo-dark-300 mt-1">
                Max: {maxBorrowAmount.toLocaleString()} MUSD
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-mezo-dark-200 mb-2">
                LTV Ratio
              </label>
              <div className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl p-3">
                <div className="text-2xl font-bold text-mezo-dark-50 font-mono">
                  {(lendingParams.ltvRatio * 100).toFixed(1)}%
                </div>
                <div className="w-full bg-white/[0.05] rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-mezo-btc-500 to-mezo-musd-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(lendingParams.ltvRatio / lendingParams.liquidationThreshold) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-mezo-dark-200 mb-2">
                Health Factor
              </label>
              <div className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl p-3">
                <div className={`text-2xl font-bold font-mono ${getHealthFactorColor(healthFactor)}`}>
                  {healthFactor.toFixed(2)}
                </div>
                <div className="text-xs text-mezo-dark-300 mt-1">
                  {healthFactor >= 1.5 ? 'Safe' : healthFactor >= 1.2 ? 'Warning' : 'Critical'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="institutional-card">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-mezo-dark-200">Liquidation Price</span>
          </div>
          <div className="text-xl font-bold text-mezo-dark-50 font-mono">
            ${liquidationPrice.toLocaleString()}
          </div>
          <div className="text-xs text-mezo-dark-300 mt-1">
            Current: ${oracleData.btcPrice.toLocaleString()}
          </div>
        </div>

        <div className="institutional-card">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-mezo-dark-200">Price Buffer</span>
          </div>
          <div className="text-xl font-bold text-green-400 font-mono">
            {(((oracleData.btcPrice - liquidationPrice) / oracleData.btcPrice) * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-mezo-dark-300 mt-1">
            Safety margin
          </div>
        </div>

        <div className="institutional-card">
          <div className="flex items-center space-x-2 mb-2">
            <Calculator className="w-4 h-4 text-mezo-dark-200" />
            <span className="text-sm font-medium text-mezo-dark-200">Interest Rate</span>
          </div>
          <div className="text-xl font-bold text-mezo-dark-50 font-mono">
            {lendingParams.fixedRateAPR.toFixed(1)}%
          </div>
          <div className="text-xs text-mezo-dark-300 mt-1">
            Fixed APR
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 btc-button"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Borrow MUSD'}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 musd-button"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Add Collateral'}
        </motion.button>
      </div>
    </motion.div>
  )
}
