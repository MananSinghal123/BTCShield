'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  BarChart3,
  Calculator,
  Zap,
  Target
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

interface RiskMetrics {
  forwardLiquidationProbability: number
  collateralEfficiencyScore: number
  backstopSupportLevel: number
  lambdaStar: number
  currentLambda: number
  healthFactorRecovery: number
  supporterDefaultProbability: number
  expectedSupporterProfit: number
}

interface StressScenario {
  name: string
  btcPriceShock: number
  liquidationProbability: number
  collateralEfficiency: number
  backstopRequired: number
}

export default function BTCShieldRiskEngine() {
  const [metrics, setMetrics] = useState<RiskMetrics>({
    forwardLiquidationProbability: 0.12,
    collateralEfficiencyScore: 0.85,
    backstopSupportLevel: 0.68,
    lambdaStar: 0.18,
    currentLambda: 0.15,
    healthFactorRecovery: 1.32,
    supporterDefaultProbability: 0.08,
    expectedSupporterProfit: 0.15
  })

  const [stressScenarios, setStressScenarios] = useState<StressScenario[]>([
    { name: 'Mild Shock', btcPriceShock: -0.1, liquidationProbability: 0.25, collateralEfficiency: 0.75, backstopRequired: 0.45 },
    { name: 'Moderate Shock', btcPriceShock: -0.2, liquidationProbability: 0.45, collateralEfficiency: 0.65, backstopRequired: 0.75 },
    { name: 'Severe Shock', btcPriceShock: -0.3, liquidationProbability: 0.68, collateralEfficiency: 0.55, backstopRequired: 0.95 }
  ])

  const [liquidationProbabilityHistory, setLiquidationProbabilityHistory] = useState<Array<{time: string, probability: number}>>([])

  // Simulate real-time risk updates
  useEffect(() => {
    const generateHistory = () => {
      const now = new Date()
      const history = []
      
      for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - (i * 60 * 60 * 1000))
        const probability = 0.12 + (Math.random() - 0.5) * 0.08
        history.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          probability: Math.max(0, Math.min(1, probability))
        })
      }
      
      setLiquidationProbabilityHistory(history)
    }

    generateHistory()
    const interval = setInterval(generateHistory, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getRiskLevel = (probability: number) => {
    if (probability < 0.1) return { level: 'Low', color: 'text-green-400', bg: 'bg-green-400/10' }
    if (probability < 0.3) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10' }
    return { level: 'High', color: 'text-red-400', bg: 'bg-red-400/10' }
  }

  const riskLevel = getRiskLevel(metrics.forwardLiquidationProbability)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="institutional-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-mezo-musd-500/10">
            <Shield className="w-6 h-6 text-mezo-musd-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-mezo-dark-50 font-display">Miqado Risk Engine</h2>
            <p className="text-sm text-mezo-dark-300">Forward liquidation probability & backstop support</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full ${riskLevel.bg} ${riskLevel.color} text-sm font-medium`}>
          {riskLevel.level} Risk
        </div>
      </div>

      {/* Primary Risk Metrics */}
      <div className="data-grid mb-6">
        <div className="metric-card">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-mezo-dark-300">Liquidation Probability</span>
          </div>
          <div className="metric-value text-red-400">
            {(metrics.forwardLiquidationProbability * 100).toFixed(1)}%
          </div>
          <div className="metric-label">24h forward</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-mezo-btc-500" />
            <span className="text-sm text-mezo-dark-300">Collateral Efficiency</span>
          </div>
          <div className="metric-value text-mezo-btc-500">
            {(metrics.collateralEfficiencyScore * 100).toFixed(1)}%
          </div>
          <div className="metric-label">Optimization score</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-mezo-musd-500" />
            <span className="text-sm text-mezo-dark-300">Backstop Support</span>
          </div>
          <div className="metric-value text-mezo-musd-500">
            {(metrics.backstopSupportLevel * 100).toFixed(1)}%
          </div>
          <div className="metric-label">Required level</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Calculator className="w-5 h-5 text-mezo-dark-200" />
            <span className="text-sm text-mezo-dark-300">λ* vs λ</span>
          </div>
          <div className="metric-value text-mezo-dark-50">
            {((metrics.lambdaStar - metrics.currentLambda) * 100).toFixed(1)}%
          </div>
          <div className="metric-label">Pricing delta</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Liquidation Probability Trend */}
        <div className="institutional-card">
          <h3 className="text-lg font-semibold text-mezo-dark-50 mb-4">Liquidation Probability Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liquidationProbabilityHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="#CED4DA"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#CED4DA"
                  fontSize={12}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(13, 17, 23, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#F8F9FA'
                  }}
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Probability']}
                />
                <Area
                  type="monotone"
                  dataKey="probability"
                  stroke="#EF4444"
                  fill="rgba(239, 68, 68, 0.1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stress Test Scenarios */}
        <div className="institutional-card">
          <h3 className="text-lg font-semibold text-mezo-dark-50 mb-4">Stress Test Scenarios</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stressScenarios}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#CED4DA"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#CED4DA"
                  fontSize={12}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(13, 17, 23, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#F8F9FA'
                  }}
                />
                <Bar dataKey="liquidationProbability" fill="#EF4444" name="Liquidation Risk" />
                <Bar dataKey="backstopRequired" fill="#F7931A" name="Backstop Required" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Miqado-Specific Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Black-Scholes Analysis */}
        <div className="institutional-card">
          <h3 className="text-lg font-semibold text-mezo-dark-50 mb-4">Black-Scholes Analysis</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-mezo-dark-300">Optimal λ*</span>
              <span className="text-lg font-mono text-mezo-btc-500">
                {(metrics.lambdaStar * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-mezo-dark-300">Current λ</span>
              <span className="text-lg font-mono text-mezo-dark-50">
                {(metrics.currentLambda * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-mezo-dark-300">Health Factor Recovery</span>
              <span className="text-lg font-mono text-green-400">
                {metrics.healthFactorRecovery.toFixed(2)}x
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-mezo-dark-300">Supporter Default Risk</span>
              <span className="text-lg font-mono text-yellow-400">
                {(metrics.supporterDefaultProbability * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Backstop Support Analysis */}
        <div className="institutional-card">
          <h3 className="text-lg font-semibold text-mezo-dark-50 mb-4">Backstop Support Analysis</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-mezo-dark-300">Required Support Level</span>
              <span className="text-lg font-mono text-mezo-musd-500">
                {(metrics.backstopSupportLevel * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-mezo-dark-300">Expected Supporter Profit</span>
              <span className="text-lg font-mono text-green-400">
                {(metrics.expectedSupporterProfit * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-mezo-dark-300">Collateral Efficiency</span>
              <span className="text-lg font-mono text-mezo-btc-500">
                {(metrics.collateralEfficiencyScore * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-mezo-dark-300">Risk-Adjusted Return</span>
              <span className="text-lg font-mono text-mezo-dark-50">
                {((metrics.expectedSupporterProfit / metrics.supporterDefaultProbability) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="mt-6 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-400">Risk Alert</span>
        </div>
        <p className="text-sm text-mezo-dark-200">
          Forward liquidation probability is above optimal threshold. Consider increasing collateral or activating Miqado support.
        </p>
      </div>
    </motion.div>
  )
}
