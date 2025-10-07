'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Shield,
  AlertTriangle,
  Zap
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
  Bar,
  ScatterChart,
  Scatter,
  XAxis as ScatterXAxis,
  YAxis as ScatterYAxis
} from 'recharts'

interface PortfolioMetrics {
  totalCollateralValue: number
  totalBorrowed: number
  netPosition: number
  utilizationRate: number
  averageHealthFactor: number
  portfolioLTV: number
  collateralEfficiency: number
  riskScore: number
}

interface StressScenario {
  name: string
  btcPriceShock: number
  liquidationProbability: number
  portfolioValue: number
  healthFactor: number
  collateralEfficiency: number
  backstopRequired: number
}

interface TimeSeriesData {
  timestamp: number
  collateralValue: number
  borrowedAmount: number
  healthFactor: number
  liquidationProbability: number
}

export default function PortfolioAnalytics() {
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalCollateralValue: 165420,
    totalBorrowed: 125000,
    netPosition: 40420,
    utilizationRate: 0.756,
    averageHealthFactor: 1.32,
    portfolioLTV: 0.756,
    collateralEfficiency: 0.85,
    riskScore: 0.68
  })

  const [stressScenarios, setStressScenarios] = useState<StressScenario[]>([
    { name: 'Baseline', btcPriceShock: 0, liquidationProbability: 0.12, portfolioValue: 165420, healthFactor: 1.32, collateralEfficiency: 0.85, backstopRequired: 0.15 },
    { name: 'Mild Shock (-10%)', btcPriceShock: -0.1, liquidationProbability: 0.25, portfolioValue: 148878, healthFactor: 1.19, collateralEfficiency: 0.78, backstopRequired: 0.35 },
    { name: 'Moderate Shock (-20%)', btcPriceShock: -0.2, liquidationProbability: 0.45, portfolioValue: 132336, healthFactor: 1.06, collateralEfficiency: 0.72, backstopRequired: 0.65 },
    { name: 'Severe Shock (-30%)', btcPriceShock: -0.3, liquidationProbability: 0.68, portfolioValue: 115794, healthFactor: 0.92, collateralEfficiency: 0.65, backstopRequired: 0.85 }
  ])

  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [collateralUtilizationData, setCollateralUtilizationData] = useState<Array<{time: string, utilization: number}>>([])

  // Generate time series data
  useEffect(() => {
    const generateTimeSeries = () => {
      const now = Date.now()
      const data: TimeSeriesData[] = []
      
      for (let i = 30; i >= 0; i--) {
        const timestamp = now - (i * 24 * 60 * 60 * 1000) // Daily data
        const priceChange = (Math.random() - 0.5) * 0.1 // ±5% daily change
        const collateralValue = 165420 * (1 + priceChange)
        const borrowedAmount = 125000
        const healthFactor = collateralValue / borrowedAmount
        const liquidationProbability = Math.max(0, Math.min(1, 0.5 - (healthFactor - 1) * 2))
        
        data.push({
          timestamp,
          collateralValue,
          borrowedAmount,
          healthFactor,
          liquidationProbability
        })
      }
      
      setTimeSeriesData(data)
    }

    generateTimeSeries()
    const interval = setInterval(generateTimeSeries, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Generate collateral utilization data
  useEffect(() => {
    const generateUtilizationData = () => {
      const data = []
      const now = new Date()
      
      for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - (i * 60 * 60 * 1000))
        const utilization = 0.75 + (Math.random() - 0.5) * 0.1
        
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          utilization: Math.max(0, Math.min(1, utilization))
        })
      }
      
      setCollateralUtilizationData(data)
    }

    generateUtilizationData()
    const interval = setInterval(generateUtilizationData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getRiskLevel = (score: number) => {
    if (score < 0.3) return { level: 'Low', color: 'text-green-400', bg: 'bg-green-400/10' }
    if (score < 0.7) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10' }
    return { level: 'High', color: 'text-red-400', bg: 'bg-red-400/10' }
  }

  const riskLevel = getRiskLevel(metrics.riskScore)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="institutional-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-mezo-neutral-500/10">
            <BarChart3 className="w-6 h-6 text-mezo-neutral-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-mezo-dark-50 font-display">Portfolio Analytics</h2>
            <p className="text-sm text-mezo-dark-300">Collateral utilization & stress scenario simulations</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full ${riskLevel.bg} ${riskLevel.color} text-sm font-medium`}>
          {riskLevel.level} Risk
        </div>
      </div>

      {/* Portfolio Overview Metrics */}
      <div className="data-grid mb-6">
        <div className="metric-card">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-mezo-btc-500" />
            <span className="text-sm text-mezo-dark-300">Total Collateral</span>
          </div>
          <div className="metric-value text-mezo-btc-500">
            ${metrics.totalCollateralValue.toLocaleString()}
          </div>
          <div className="metric-label">BTC value</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-mezo-musd-500" />
            <span className="text-sm text-mezo-dark-300">Total Borrowed</span>
          </div>
          <div className="metric-value text-mezo-musd-500">
            ${metrics.totalBorrowed.toLocaleString()}
          </div>
          <div className="metric-label">MUSD debt</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-sm text-mezo-dark-300">Net Position</span>
          </div>
          <div className="metric-value text-green-400">
            ${metrics.netPosition.toLocaleString()}
          </div>
          <div className="metric-label">Equity value</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-mezo-dark-200" />
            <span className="text-sm text-mezo-dark-300">Risk Score</span>
          </div>
          <div className={`metric-value ${riskLevel.color}`}>
            {(metrics.riskScore * 100).toFixed(0)}
          </div>
          <div className="metric-label">Portfolio risk</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Collateral Utilization Over Time */}
        <div className="institutional-card">
          <h3 className="text-lg font-semibold text-mezo-dark-50 mb-4">Collateral Utilization</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={collateralUtilizationData}>
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
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Utilization']}
                />
                <Area
                  type="monotone"
                  dataKey="utilization"
                  stroke="#F7931A"
                  fill="rgba(247, 147, 26, 0.1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Value Trend */}
        <div className="institutional-card">
          <h3 className="text-lg font-semibold text-mezo-dark-50 mb-4">Portfolio Value Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#CED4DA"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  stroke="#CED4DA"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(13, 17, 23, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#F8F9FA'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                />
                <Line
                  type="monotone"
                  dataKey="collateralValue"
                  stroke="#F7931A"
                  strokeWidth={2}
                  dot={false}
                  name="Collateral Value"
                />
                <Line
                  type="monotone"
                  dataKey="borrowedAmount"
                  stroke="#00BCD4"
                  strokeWidth={2}
                  dot={false}
                  name="Borrowed Amount"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stress Test Scenarios */}
      <div className="institutional-card mb-6">
        <h3 className="text-lg font-semibold text-mezo-dark-50 mb-4">Stress Test Scenarios</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stressScenarios}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="#CED4DA"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
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

      {/* Risk-Return Scatter Plot */}
      <div className="institutional-card mb-6">
        <h3 className="text-lg font-semibold text-mezo-dark-50 mb-4">Risk-Return Analysis</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={stressScenarios}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <ScatterXAxis 
                dataKey="liquidationProbability" 
                stroke="#CED4DA"
                fontSize={12}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <ScatterYAxis 
                dataKey="collateralEfficiency" 
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
              <Scatter 
                dataKey="collateralEfficiency" 
                fill="#F7931A"
                r={6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenario Analysis Table */}
      <div className="institutional-card">
        <h3 className="text-lg font-semibold text-mezo-dark-50 mb-4">Scenario Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left py-3 px-4 text-sm font-medium text-mezo-dark-200">Scenario</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-mezo-dark-200">BTC Price Shock</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-mezo-dark-200">Portfolio Value</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-mezo-dark-200">Health Factor</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-mezo-dark-200">Liquidation Risk</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-mezo-dark-200">Backstop Required</th>
              </tr>
            </thead>
            <tbody>
              {stressScenarios.map((scenario, index) => (
                <tr key={index} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                  <td className="py-3 px-4 text-sm text-mezo-dark-50">{scenario.name}</td>
                  <td className="py-3 px-4 text-sm text-mezo-dark-50 text-right font-mono">
                    {(scenario.btcPriceShock * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-mezo-dark-50 text-right font-mono">
                    ${scenario.portfolioValue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-mezo-dark-50 text-right font-mono">
                    {scenario.healthFactor.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-mezo-dark-50 text-right font-mono">
                    {(scenario.liquidationProbability * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-sm text-mezo-dark-50 text-right font-mono">
                    {(scenario.backstopRequired * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
