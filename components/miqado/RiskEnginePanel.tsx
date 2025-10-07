'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle, 
  Activity,
  Target,
  Zap,
  BarChart3,
  Clock
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface RiskMetrics {
  baseHealthFactor: number
  enhancedHealthFactor: number
  collateralRatio: number
  liquidationThreshold: number
  liquidationProbability: number
  forwardLiquidationProbability: number
  backstopHealthIndex: number
  collateralEfficiencyScore: number
  supporterImpact: number
  timeToMaturity: number
  volatilityImpact: number
}

interface SupporterMetrics {
  totalSupporters: number
  totalCollateralRestraint: number
  avgLambda: number
  expectedSupporterProfit: number
  supporterDefaultProbability: number
  liquidationAvoidanceRate: number
}

interface RiskEnginePanelProps {
  positionId: string
  className?: string
}

export default function RiskEnginePanel({ positionId, className = '' }: RiskEnginePanelProps) {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null)
  const [supporterMetrics, setSupporterMetrics] = useState<SupporterMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [simulationData, setSimulationData] = useState<any[]>([])

  useEffect(() => {
    fetchRiskData()
    
    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchRiskData, 10000)
    return () => clearInterval(interval)
  }, [positionId])

  const fetchRiskData = async () => {
    try {
      setLoading(true)
      // Fetch supporters for this position from new API
      const res = await fetch(`/api/supporters?positionId=${positionId}`)
      if (!res.ok) throw new Error('Failed to fetch supporters')
      const sup = await res.json()
      const supporters = sup.supporters || []

      // Derive simple metrics locally for demo
      const totalCollateralRestraint = supporters.reduce((s: number, x: any) => s + (x.amountLocked ?? 0), 0)
      const totalSupporters = supporters.length
      const avgLambda = 0.15
      const expectedSupporterProfit = supporters.reduce((s: number, x: any) => s + ((x.expectedReturn ?? 0) * (x.amountLocked ?? 0)), 0)

      const baseHealthFactor = 1.2
      const supporterImpact = 1 + Math.min(0.25, totalCollateralRestraint * 0.01)
      const enhancedHealthFactor = baseHealthFactor * supporterImpact
      const collateralRatio = 1.3
      const liquidationThreshold = 0.8
      const lambda = 0.15
      const liquidationProbability = Math.exp(-lambda * enhancedHealthFactor)

      const timeToMaturityDays = 5
      const volatility = 0.25
      const timeDecay = Math.sqrt(timeToMaturityDays / 365)
      const volatilityImpact = volatility * timeDecay
      const forwardLiquidationProbability = Math.min(1, liquidationProbability * (1 + volatilityImpact))

      const backstopHealthIndex = Math.min(100, Math.max(0, (enhancedHealthFactor / liquidationThreshold) * 50))
      const collateralEfficiencyScore = Math.min(100, Math.max(0, (collateralRatio / liquidationThreshold) * 100))

      setRiskMetrics({
        baseHealthFactor,
        enhancedHealthFactor,
        collateralRatio,
        liquidationThreshold,
        liquidationProbability,
        forwardLiquidationProbability,
        backstopHealthIndex,
        collateralEfficiencyScore,
        supporterImpact,
        timeToMaturity: timeToMaturityDays,
        volatilityImpact,
      })

      setSupporterMetrics({
        totalSupporters,
        totalCollateralRestraint,
        avgLambda,
        expectedSupporterProfit,
        supporterDefaultProbability: Math.max(0, 1 - enhancedHealthFactor / 2),
        liquidationAvoidanceRate: enhancedHealthFactor > 1.2 ? 0.95 : 0.75,
      })

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch risk data')
    } finally {
      setLoading(false)
    }
  }

  const runSimulation = async () => {
    // Generate a lightweight local simulation for the chart
    const results = Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString()
      const liquidationRisk = Math.max(0.02, 0.25 * Math.exp(-0.05 * i))
      return { date, liquidationRisk }
    })
    setSimulationData(results)
  }

  const getHealthFactorColor = (hf: number) => {
    if (hf > 1.5) return 'text-green-400'
    if (hf > 1.2) return 'text-yellow-400'
    if (hf > 1.0) return 'text-orange-400'
    return 'text-red-400'
  }

  const getRiskLevel = (probability: number) => {
    if (probability < 0.1) return { level: 'Low', color: 'text-green-400', bg: 'bg-green-500/20' }
    if (probability < 0.3) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    if (probability < 0.6) return { level: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20' }
    return { level: 'Critical', color: 'text-red-400', bg: 'bg-red-500/20' }
  }

  if (loading) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    )
  }

  if (error || !riskMetrics || !supporterMetrics) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-xl border border-red-500/50 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-32 text-red-400">
          <AlertTriangle className="w-6 h-6 mr-2" />
          {error || 'Failed to load risk data'}
        </div>
      </div>
    )
  }

  const riskLevel = getRiskLevel(riskMetrics.liquidationProbability)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-orange-500" />
            <h3 className="text-xl font-semibold text-white">BTCShield Risk Engine Panel</h3>
          </div>
          <button
            onClick={runSimulation}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg text-orange-400 text-sm transition-colors"
          >
            <BarChart3 className="w-4 h-4 mr-2 inline" />
            Run Simulation
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Risk Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-medium text-white">Health Factor</h4>
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Base:</span>
                <span className={`font-bold ${getHealthFactorColor(riskMetrics.baseHealthFactor)}`}>
                  {riskMetrics.baseHealthFactor.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Enhanced:</span>
                <span className={`font-bold ${getHealthFactorColor(riskMetrics.enhancedHealthFactor)}`}>
                  {riskMetrics.enhancedHealthFactor.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Improvement:</span>
                <span className="text-green-400 font-medium">
                  +{((riskMetrics.enhancedHealthFactor / riskMetrics.baseHealthFactor - 1) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-medium text-white">Liquidation Risk</h4>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current:</span>
                <span className={`font-bold ${riskLevel.color}`}>
                  {(riskMetrics.liquidationProbability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Forward:</span>
                <span className={`font-bold ${getRiskLevel(riskMetrics.forwardLiquidationProbability).color}`}>
                  {(riskMetrics.forwardLiquidationProbability * 100).toFixed(1)}%
                </span>
              </div>
              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${riskLevel.bg} ${riskLevel.color}`}>
                {riskLevel.level} Risk
              </div>
            </div>
          </div>
        </div>

        {/* Health Indexes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-medium text-white">Backstop Health Index</h4>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {riskMetrics.backstopHealthIndex.toFixed(0)}
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, riskMetrics.backstopHealthIndex)}%` }}
              />
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Measures overall position stability with supporter backing
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-medium text-white">Collateral Efficiency</h4              >
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {riskMetrics.collateralEfficiencyScore.toFixed(0)}
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, riskMetrics.collateralEfficiencyScore)}%` }}
              />
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Efficiency of collateral utilization vs. liquidation threshold
            </div>
          </div>
        </div>

        {/* Supporter Impact */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-white">Supporter Impact Analysis</h4>
            <div className="flex items-center space-x-2 text-orange-400">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">
                {supporterMetrics.liquidationAvoidanceRate > 0.9 ? 'Excellent' : 
                 supporterMetrics.liquidationAvoidanceRate > 0.7 ? 'Good' : 'Moderate'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {supporterMetrics.totalSupporters}
              </div>
              <div className="text-sm text-gray-400">Active Supporters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                ${supporterMetrics.totalCollateralRestraint.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Locked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {(supporterMetrics.liquidationAvoidanceRate * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400">Avoidance Rate</div>
            </div>
          </div>
        </div>

        {/* Simulation Chart */}
        {simulationData.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-lg font-medium text-white mb-4">30-Day Risk Simulation</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    formatter={(value: any) => [`${(value * 100).toFixed(2)}%`, 'Liquidation Risk']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="liquidationRisk"
                    stroke="#F97316"
                    fill="url(#liquidationGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="liquidationGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Time Remaining */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-yellow-400" />
              <div>
                <h4 className="text-lg font-medium text-white">Time to Maturity</h4>
                <p className="text-sm text-gray-400">
                  {riskMetrics.timeToMaturity > 1 
                    ? `${riskMetrics.timeToMaturity.toFixed(1)} days remaining`
                    : `${(riskMetrics.timeToMaturity * 24).toFixed(1)} hours remaining`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Volatility Impact</div>
              <div className="text-lg font-medium text-yellow-400">
                +{(riskMetrics.volatilityImpact * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
