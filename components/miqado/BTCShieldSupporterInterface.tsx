'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  Info, 
  AlertCircle,
  CheckCircle,
  Bitcoin,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { MezoVault, MiqadoSupport, BlackScholesResult } from '@/types'
import { calculateLambdaStar, getDefaultMezoParams } from '@/lib/miqado/blackScholes'

interface SupporterInterfaceProps {
  vault: MezoVault
  support?: MiqadoSupport
  onSupport: (vaultId: string, lambda: number) => void
  onUpdateSupport: (supportId: string, newLambda: number) => void
}

export default function SupporterInterface({ 
  vault, 
  support, 
  onSupport,
  onUpdateSupport 
}: SupporterInterfaceProps) {
  const [lambda, setLambda] = useState<number>(0.1)
  const [bsResult, setBsResult] = useState<BlackScholesResult | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  // Calculate Black-Scholes result
  useEffect(() => {
    const params = {
      S: vault.collateralPrice,
      K: vault.collateralPrice * vault.liquidationThreshold,
      T: (vault.maturityTime - vault.createdAt) / (365 * 24 * 60 * 60 * 1000),
      ...getDefaultMezoParams()
    }

    const result = calculateLambdaStar(params, vault.collateralAmount)
    setBsResult(result)
  }, [vault])

  const handleSupport = () => {
    onSupport(vault.id, lambda)
  }

  const handleUpdateSupport = () => {
    if (support) {
      onUpdateSupport(support.id, lambda)
    }
  }

  const getLambdaComparison = () => {
    if (!bsResult) return { status: 'neutral', message: 'Calculating...' }
    
    const diff = lambda - bsResult.lambdaStar
    const diffPercent = (diff / bsResult.lambdaStar) * 100

    if (Math.abs(diffPercent) < 5) {
      return { 
        status: 'optimal', 
        message: 'Near optimal pricing',
        color: 'text-green-400'
      }
    } else if (diffPercent > 0) {
      return { 
        status: 'overpriced', 
        message: `${diffPercent.toFixed(1)}% above optimal`,
        color: 'text-red-400'
      }
    } else {
      return { 
        status: 'underpriced', 
        message: `${Math.abs(diffPercent).toFixed(1)}% below optimal`,
        color: 'text-yellow-400'
      }
    }
  }

  const calculateExpectedProfit = () => {
    if (!bsResult) return 0
    
    const collateralValue = vault.collateralAmount * vault.collateralPrice
    const premiumPaid = lambda * collateralValue
    const optimalPremium = bsResult.lambdaStar * collateralValue
    
    // Simplified profit calculation
    return (bsResult.lambdaStar - lambda) * collateralValue
  }

  const calculateRiskMetrics = () => {
    if (!bsResult) return null

    const collateralValue = vault.collateralAmount * vault.collateralPrice
    const premiumPaid = lambda * collateralValue
    
    // Calculate probability of profit (simplified)
    const profitProbability = Math.max(0, Math.min(1, 1 - (lambda / bsResult.lambdaStar)))
    
    // Calculate maximum loss
    const maxLoss = premiumPaid
    
    // Calculate expected return
    const expectedReturn = calculateExpectedProfit()
    
    return {
      profitProbability,
      maxLoss,
      expectedReturn,
      riskRewardRatio: expectedReturn / maxLoss
    }
  }

  const comparison = getLambdaComparison()
  const riskMetrics = calculateRiskMetrics()

  // Generate λ* trend data
  const lambdaTrendData = Array.from({ length: 30 }, (_, i) => {
    const timeToMaturity = (vault.maturityTime - vault.createdAt) / (365 * 24 * 60 * 60 * 1000)
    const adjustedTime = timeToMaturity * (1 - i / 30)
    
    const params = {
      S: vault.collateralPrice,
      K: vault.collateralPrice * vault.liquidationThreshold,
      T: adjustedTime,
      ...getDefaultMezoParams()
    }

    const result = calculateLambdaStar(params, vault.collateralAmount)
    
    return {
      time: i,
      lambdaStar: result.lambdaStar * 100,
      lambda: lambda * 100,
      premium: result.premium
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mezo-glass rounded-xl p-6 border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-mezo-accent-100/10">
            <Calculator className="w-6 h-6 text-mezo-accent-100" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-mezo-dark-50">Supporter Interface</h3>
            <p className="text-sm text-mezo-dark-50/60">λ vs λ* Analysis</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <BarChart3 className="w-4 h-4 text-mezo-dark-50" />
          <span className="text-sm text-mezo-dark-50">Compare</span>
        </button>
      </div>

      {/* Lambda Input */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-mezo-dark-50">Premium Factor (λ)</label>
          <span className="text-sm font-mono text-mezo-dark-50">
            {(lambda * 100).toFixed(2)}%
          </span>
        </div>
        
        <input
          type="range"
          min="0.01"
          max="0.5"
          step="0.01"
          value={lambda}
          onChange={(e) => setLambda(parseFloat(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
        />
        
        <div className="flex justify-between text-xs text-mezo-dark-50/60 mt-1">
          <span>1%</span>
          <span>50%</span>
        </div>
      </div>

      {/* Comparison Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-mezo-accent-100" />
            <span className="text-sm text-mezo-dark-50/80">Your λ</span>
          </div>
          <div className="text-2xl font-bold text-mezo-dark-50">
            {(lambda * 100).toFixed(2)}%
          </div>
          <div className="text-xs text-mezo-dark-50/60">
            ${(lambda * vault.collateralAmount * vault.collateralPrice).toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Calculator className="w-4 h-4 text-mezo-accent-100" />
            <span className="text-sm text-mezo-dark-50/80">Optimal λ*</span>
          </div>
          <div className="text-2xl font-bold text-mezo-accent-100">
            {bsResult ? (bsResult.lambdaStar * 100).toFixed(2) : '0.00'}%
          </div>
          <div className="text-xs text-mezo-dark-50/60">
            {bsResult ? `$${(bsResult.premium).toLocaleString()}` : '$0'}
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className={`w-4 h-4 ${comparison.color}`} />
            <span className="text-sm text-mezo-dark-50/80">Status</span>
          </div>
          <div className={`text-lg font-bold ${comparison.color}`}>
            {comparison.status === 'optimal' ? 'Optimal' : 
             comparison.status === 'overpriced' ? 'Overpriced' : 'Underpriced'}
          </div>
          <div className="text-xs text-mezo-dark-50/60">
            {comparison.message}
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      {riskMetrics && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg">
          <h4 className="text-sm font-medium text-mezo-dark-50 mb-3">Risk Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-mezo-dark-50/60">Profit Probability</div>
              <div className="text-lg font-bold text-green-400">
                {(riskMetrics.profitProbability * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-mezo-dark-50/60">Max Loss</div>
              <div className="text-lg font-bold text-red-400">
                ${riskMetrics.maxLoss.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-mezo-dark-50/60">Expected Return</div>
              <div className={`text-lg font-bold ${riskMetrics.expectedReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${riskMetrics.expectedReturn.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-mezo-dark-50/60">Risk/Reward</div>
              <div className="text-lg font-bold text-mezo-accent-100">
                {riskMetrics.riskRewardRatio.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Black-Scholes Details */}
      {bsResult && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg">
          <h4 className="text-sm font-medium text-mezo-dark-50 mb-3">Black-Scholes Parameters</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-mezo-dark-50/60">d1</div>
              <div className="font-mono text-mezo-dark-50">{bsResult.d1.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-mezo-dark-50/60">d2</div>
              <div className="font-mono text-mezo-dark-50">{bsResult.d2.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-mezo-dark-50/60">N(d1)</div>
              <div className="font-mono text-mezo-dark-50">{bsResult.N_d1.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-mezo-dark-50/60">N(d2)</div>
              <div className="font-mono text-mezo-dark-50">{bsResult.N_d2.toFixed(4)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Chart */}
      {showComparison && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-mezo-dark-50 mb-3">λ* vs λ Over Time</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lambdaTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="#C5C6C7"
                  fontSize={12}
                  tickFormatter={(value) => `${value}d`}
                />
                <YAxis 
                  stroke="#C5C6C7"
                  fontSize={12}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(11, 12, 16, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#C5C6C7'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="lambdaStar"
                  stroke="#45A29E"
                  strokeWidth={3}
                  dot={false}
                  name="λ* (Optimal)"
                />
                <Line
                  type="monotone"
                  dataKey="lambda"
                  stroke="#F7931A"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="λ (Your Price)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {!support ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSupport}
            className="w-full px-4 py-3 bg-gradient-to-r from-mezo-accent-100 to-mezo-accent-50 text-mezo-dark-200 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Support Position
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpdateSupport}
            className="w-full px-4 py-3 bg-gradient-to-r from-mezo-btc-50 to-mezo-btc-100 text-mezo-dark-200 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Update Support
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
