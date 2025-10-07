'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bitcoin, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Shield,
  AlertTriangle,
  Activity,
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
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface CollateralMetrics {
  btcBalance: number
  musdBalance: number
  totalCollateralValue: number
  totalBorrowed: number
  ltvRatio: number
  liquidationThreshold: number
  healthFactor: number
  collateralUtilization: number
}

interface PriceData {
  timestamp: number
  btcPrice: number
  musdPrice: number
}

export default function CollateralDashboard() {
  const [metrics, setMetrics] = useState<CollateralMetrics>({
    btcBalance: 2.4567,
    musdBalance: 125000,
    totalCollateralValue: 165420,
    totalBorrowed: 125000,
    ltvRatio: 0.756,
    liquidationThreshold: 0.85,
    healthFactor: 1.32,
    collateralUtilization: 0.68
  })

  const [priceHistory, setPriceHistory] = useState<PriceData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Simulate real-time price updates
  useEffect(() => {
    const generatePriceHistory = () => {
      const now = Date.now()
      const history: PriceData[] = []
      
      for (let i = 24; i >= 0; i--) {
        const timestamp = now - (i * 60 * 60 * 1000) // Hourly data
        const btcPrice = 67420 + (Math.random() - 0.5) * 2000
        history.push({
          timestamp,
          btcPrice,
          musdPrice: 1.00
        })
      }
      
      setPriceHistory(history)
      setIsLoading(false)
    }

    generatePriceHistory()
    const interval = setInterval(generatePriceHistory, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  // Calculate liquidation price
  const liquidationPrice = metrics.totalCollateralValue * metrics.liquidationThreshold / metrics.btcBalance
  const currentBtcPrice = priceHistory[priceHistory.length - 1]?.btcPrice || 67420
  const priceBuffer = ((currentBtcPrice - liquidationPrice) / currentBtcPrice) * 100

  // LTV visualization data
  const ltvData = [
    { name: 'Used', value: metrics.ltvRatio * 100, color: '#F7931A' },
    { name: 'Available', value: (metrics.liquidationThreshold - metrics.ltvRatio) * 100, color: '#00BCD4' }
  ]

  const getHealthFactorColor = (hf: number) => {
    if (hf >= 1.5) return 'text-green-400'
    if (hf >= 1.2) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getHealthFactorBg = (hf: number) => {
    if (hf >= 1.5) return 'bg-green-400/10'
    if (hf >= 1.2) return 'bg-yellow-400/10'
    return 'bg-red-400/10'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="institutional-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-mezo-btc-500/10">
            <Bitcoin className="w-6 h-6 text-mezo-btc-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-mezo-dark-50 font-display">Collateral Dashboard</h2>
            <p className="text-sm text-mezo-dark-300">BTC/MUSD balances and LTV monitoring</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-mezo-dark-300">
          <Activity className="w-4 h-4" />
          <span>Live data</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="data-grid mb-6">
        <div className="metric-card">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Bitcoin className="w-5 h-5 text-mezo-btc-500" />
            <span className="text-sm text-mezo-dark-300">BTC Balance</span>
          </div>
          <div className="metric-value text-mezo-btc-500">
            {metrics.btcBalance.toFixed(4)}
          </div>
          <div className="metric-label">≈ ${metrics.totalCollateralValue.toLocaleString()}</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-mezo-musd-500" />
            <span className="text-sm text-mezo-dark-300">MUSD Borrowed</span>
          </div>
          <div className="metric-value text-mezo-musd-500">
            {metrics.musdBalance.toLocaleString()}
          </div>
          <div className="metric-label">Stablecoin debt</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-mezo-dark-200" />
            <span className="text-sm text-mezo-dark-300">LTV Ratio</span>
          </div>
          <div className="metric-value text-mezo-dark-50">
            {(metrics.ltvRatio * 100).toFixed(1)}%
          </div>
          <div className="metric-label">Threshold: {(metrics.liquidationThreshold * 100).toFixed(0)}%</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-mezo-dark-200" />
            <span className="text-sm text-mezo-dark-300">Health Factor</span>
          </div>
          <div className={`metric-value ${getHealthFactorColor(metrics.healthFactor)}`}>
            {metrics.healthFactor.toFixed(2)}
          </div>
          <div className="metric-label">
            {metrics.healthFactor >= 1.5 ? 'Safe' : metrics.healthFactor >= 1.2 ? 'Warning' : 'Critical'}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* BTC Price Trend */}
        <div className="institutional-card">
          <h3 className="text-lg font-semibold text-mezo-dark-50 mb-4">BTC Price Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#CED4DA"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis 
                  stroke="#CED4DA"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
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
                <Area
                  type="monotone"
                  dataKey="btcPrice"
                  stroke="#F7931A"
                  fill="rgba(247, 147, 26, 0.1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LTV Distribution */}
        <div className="institutional-card">
          <h3 className="text-lg font-semibold text-mezo-dark-50 mb-4">LTV Distribution</h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ltvData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {ltvData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(13, 17, 23, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#F8F9FA'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'LTV']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-mezo-btc-500 rounded-full"></div>
              <span className="text-sm text-mezo-dark-300">Used ({(metrics.ltvRatio * 100).toFixed(1)}%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-mezo-musd-500 rounded-full"></div>
              <span className="text-sm text-mezo-dark-300">Available ({((metrics.liquidationThreshold - metrics.ltvRatio) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="institutional-card">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-mezo-dark-200">Liquidation Price</span>
          </div>
          <div className="text-xl font-bold text-mezo-dark-50 font-mono">
            ${liquidationPrice.toLocaleString()}
          </div>
          <div className="text-xs text-mezo-dark-300 mt-1">
            Current: ${currentBtcPrice.toLocaleString()}
          </div>
        </div>

        <div className="institutional-card">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-mezo-dark-200">Price Buffer</span>
          </div>
          <div className="text-xl font-bold text-green-400 font-mono">
            {priceBuffer.toFixed(1)}%
          </div>
          <div className="text-xs text-mezo-dark-300 mt-1">
            Safety margin
          </div>
        </div>

        <div className="institutional-card">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-mezo-dark-200" />
            <span className="text-sm font-medium text-mezo-dark-200">Collateral Efficiency</span>
          </div>
          <div className="text-xl font-bold text-mezo-dark-50 font-mono">
            {(metrics.collateralUtilization * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-mezo-dark-300 mt-1">
            Utilization rate
          </div>
        </div>
      </div>
    </motion.div>
  )
}
