'use client'

import { motion } from 'framer-motion'
import RiskChart from '@/components/dashboard/RiskChart'
import { 
  healthFactorDistribution,
  supporterROIData,
  liquidationProbabilityData,
  collateralRestrainedData
} from '@/data/mockData'
import { TrendingUpIcon, TrendingDownIcon, AlertCircleIcon, BarChart3Icon } from 'lucide-react'

export default function AnalyticsPage() {
  // Mock data for additional analytics
  const liquidationTrendsData = [
    { name: 'Jan', value: 2.1 },
    { name: 'Feb', value: 3.4 },
    { name: 'Mar', value: 1.8 },
    { name: 'Apr', value: 4.2 },
    { name: 'May', value: 2.9 },
    { name: 'Jun', value: 1.5 },
  ]

  const collateralImpactData = [
    { name: 'ETH', value: 35.2 },
    { name: 'WBTC', value: 28.1 },
    { name: 'USDC', value: 18.7 },
    { name: 'DAI', value: 12.3 },
    { name: 'Others', value: 5.7 },
  ]

  const performanceMetrics = [
    {
      title: 'Total Value Locked',
      value: '$47.2M',
      change: 12.3,
      trend: 'up',
      description: 'Total assets locked in the protocol'
    },
    {
      title: 'Liquidations Prevented',
      value: '1,847',
      change: 8.7,
      trend: 'up',
      description: 'Successful liquidation preventions through Miqado'
    },
    {
      title: 'Average Health Factor',
      value: '2.34',
      change: -5.2,
      trend: 'down',
      description: 'Platform-wide average health factor'
    },
    {
      title: 'Protocol Revenue',
      value: '$892K',
      change: 15.6,
      trend: 'up',
      description: 'Total revenue generated from fees'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-200 via-dark-100 to-dark-200 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold gradient-text font-display">
            Advanced Analytics
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Deep insights into protocol performance, risk metrics, and market trends
          </p>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {performanceMetrics.map((metric, index) => (
            <div key={metric.title} className="glass glass-hover rounded-xl p-6 card-glow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-primary-500/20 to-purple-500/20">
                    <BarChart3Icon className="h-4 w-4 text-primary-400" />
                  </div>
                  <h3 className="text-white font-medium text-sm">{metric.title}</h3>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  metric.trend === 'up' 
                    ? 'text-green-400 bg-green-400/10' 
                    : 'text-red-400 bg-red-400/10'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUpIcon className="h-3 w-3" />
                  ) : (
                    <TrendingDownIcon className="h-3 w-3" />
                  )}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-2">{metric.value}</p>
              <p className="text-gray-400 text-xs">{metric.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskChart
            data={liquidationTrendsData}
            title="Historical Liquidation Trends"
            type="line"
            color="#EF4444"
            index={0}
          />
          <RiskChart
            data={collateralImpactData}
            title="Collateral Distribution"
            type="pie"
            color="#4C9AFF"
            index={1}
          />
          <RiskChart
            data={healthFactorDistribution}
            title="Health Factor Distribution"
            type="bar"
            color="#A178FF"
            index={2}
          />
          <RiskChart
            data={supporterROIData}
            title="Supporter ROI Evolution"
            type="area"
            color="#3EDC81"
            index={3}
          />
        </div>

        {/* Risk Assessment Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6 font-display">
            Risk Assessment Matrix
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                <AlertCircleIcon className="h-5 w-5 text-red-400" />
                <span>High Risk Assets</span>
              </h3>
              <div className="space-y-3">
                {['WBTC/ETH', 'UNI/USDC', 'AAVE/DAI'].map((pair, index) => (
                  <div key={pair} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <span className="text-white font-medium">{pair}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-400 text-sm">{(0.15 + index * 0.03).toFixed(2)} λ</span>
                      <div className="w-16 h-2 bg-red-500/30 rounded-full">
                        <div 
                          className="h-2 bg-red-500 rounded-full"
                          style={{ width: `${70 + index * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                <AlertCircleIcon className="h-5 w-5 text-yellow-400" />
                <span>Medium Risk Assets</span>
              </h3>
              <div className="space-y-3">
                {['ETH/USDC', 'LINK/DAI', 'COMP/ETH'].map((pair, index) => (
                  <div key={pair} className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <span className="text-white font-medium">{pair}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 text-sm">{(0.08 + index * 0.02).toFixed(2)} λ</span>
                      <div className="w-16 h-2 bg-yellow-500/30 rounded-full">
                        <div 
                          className="h-2 bg-yellow-500 rounded-full"
                          style={{ width: `${40 + index * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                <AlertCircleIcon className="h-5 w-5 text-green-400" />
                <span>Low Risk Assets</span>
              </h3>
              <div className="space-y-3">
                {['USDC/DAI', 'USDT/USDC', 'DAI/USDT'].map((pair, index) => (
                  <div key={pair} className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <span className="text-white font-medium">{pair}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 text-sm">{(0.02 + index * 0.01).toFixed(2)} λ</span>
                      <div className="w-16 h-2 bg-green-500/30 rounded-full">
                        <div 
                          className="h-2 bg-green-500 rounded-full"
                          style={{ width: `${15 + index * 5}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Collateral Impact Simulations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6 font-display">
            Collateral Impact Simulations
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Price Shock Scenarios</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">ETH -20% Shock</span>
                    <span className="text-red-400 font-semibold">High Impact</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Affected Loans</p>
                      <p className="text-white font-medium">342</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Potential Liquidations</p>
                      <p className="text-red-400 font-medium">$4.2M</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">BTC -15% Shock</span>
                    <span className="text-yellow-400 font-semibold">Medium Impact</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Affected Loans</p>
                      <p className="text-white font-medium">187</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Potential Liquidations</p>
                      <p className="text-yellow-400 font-medium">$2.8M</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-4">Protocol Health Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-gray-400">Average Collateralization Ratio</span>
                  <span className="text-white font-semibold">168%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-gray-400">Liquidation Buffer</span>
                  <span className="text-green-400 font-semibold">$12.4M</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-gray-400">Active Miqado Coverage</span>
                  <span className="text-primary-400 font-semibold">94.8%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-gray-400">Risk-Adjusted Return</span>
                  <span className="text-purple-400 font-semibold">18.7%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}