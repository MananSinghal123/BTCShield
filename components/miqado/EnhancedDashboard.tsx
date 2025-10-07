'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Eye, 
  TrendingUp, 
  Users, 
  Shield,
  AlertTriangle,
  Clock,
  DollarSign
} from 'lucide-react'
import SupporterTable from './SupporterTable'
import SupportPositionModal from './SupportPositionModal'
import RiskEnginePanel from './RiskEnginePanel'
import SimulationModeToggle from './SimulationModeToggle'

interface Position {
  id: string
  borrower: string
  collateral: 'BTC'
  borrowedAsset: 'MUSD'
  collateralAmount: number
  borrowedAmount: number
  collateralPrice: number
  liquidationThreshold: number
  healthFactor: number
  phase: 'initialization' | 'pre-maturity' | 'maturity'
  createdAt: number
  maturityTime: number
  currentTime: number
  supporterCount: number
  totalSupportCollateral: number
  avgLambda: number
}

interface EnhancedDashboardProps {
  className?: string
}

export default function EnhancedDashboard({ className = '' }: EnhancedDashboardProps) {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const [simulationActive, setSimulationActive] = useState(false)

  useEffect(() => {
    fetchPositions()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPositions, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchPositions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/positions')
      
      if (!response.ok) {
        throw new Error('Failed to fetch positions')
      }
      
      const data = await response.json()
      // Adapt mock positions to existing UI structure
      const now = Date.now()
      const mapped = (data.positions || []).map((p: any, idx: number) => ({
        id: String(p.id),
        borrower: '0x' + String(p.id).padStart(6, '0'),
        collateral: p.asset === 'BTC' ? 'BTC' : 'BTC',
        borrowedAsset: 'MUSD',
        collateralAmount: p.collateral ?? 0,
        borrowedAmount: (p.borrowed ?? 0) * 50000, // mock usd notional for UI
        collateralPrice: p.asset === 'BTC' ? 67000 : 3500,
        liquidationThreshold: 0.8,
        healthFactor: Math.max(0.8, 2.0 - (p.liquidationProbability ?? 0.1) * 3),
        phase: 'pre-maturity',
        createdAt: now - 3 * 24 * 60 * 60 * 1000,
        maturityTime: now + 5 * 24 * 60 * 60 * 1000,
        currentTime: now,
        supporterCount: 2,
        totalSupportCollateral: Math.round((p.collateral ?? 0) * 0.2 * 1000),
        avgLambda: 0.15
      }))
      setPositions(mapped)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch positions')
    } finally {
      setLoading(false)
    }
  }

  const handleSupportPosition = (position: Position) => {
    setSelectedPosition(position)
    setSupportModalOpen(true)
  }

  const getHealthFactorColor = (hf: number) => {
    if (hf > 1.5) return 'text-green-400'
    if (hf > 1.2) return 'text-yellow-400'
    if (hf > 1.0) return 'text-orange-400'
    return 'text-red-400'
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'initialization': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'pre-maturity': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'maturity': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatTimeRemaining = (timeMs: number) => {
    const days = Math.floor(timeMs / (24 * 60 * 60 * 1000))
    const hours = Math.floor((timeMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    
    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return '< 1h'
    }
  }

  if (loading) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-xl border border-red-500/50 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-64 text-red-400">
          <AlertTriangle className="w-8 h-8 mr-3" />
          <div>
            <h3 className="text-lg font-medium">Failed to load positions</h3>
            <p className="text-sm opacity-75">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Simulation Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">BTCShield Supporter Dashboard</h2>
          <p className="text-gray-400">
            Monitor and support undercollateralized BTC positions with real-time risk analytics
          </p>
        </div>
        <SimulationModeToggle 
          isActive={simulationActive}
          onToggle={setSimulationActive}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{positions.length}</div>
              <div className="text-sm text-gray-400">Total Positions</div>
            </div>
            <Eye className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {positions.filter(p => p.supporterCount > 0).length}
              </div>
              <div className="text-sm text-gray-400">With Support</div>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                ${positions.reduce((sum, p) => sum + p.totalSupportCollateral, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Locked</div>
            </div>
            <DollarSign className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {(positions.reduce((sum, p) => sum + p.healthFactor, 0) / positions.length).toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Avg Health Factor</div>
            </div>
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Positions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {positions.map((position, index) => (
          <motion.div
            key={position.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden"
          >
            {/* Position Header */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    {position.id}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Position #{position.id}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {position.collateralAmount} BTC → ${position.borrowedAmount.toLocaleString()} MUSD
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPhaseColor(position.phase)}`}>
                  {position.phase.replace('-', ' ')}
                </div>
              </div>
            </div>

            {/* Position Details */}
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Health Factor</div>
                  <div className={`text-lg font-bold ${getHealthFactorColor(position.healthFactor)}`}>
                    {position.healthFactor.toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Supporters</div>
                  <div className="text-lg font-bold text-white flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {position.supporterCount}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Time Remaining</div>
                  <div className="text-lg font-bold text-white flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTimeRemaining(position.maturityTime - Date.now())}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Avg λ Factor</div>
                  <div className="text-lg font-bold text-orange-400">
                    {position.avgLambda.toFixed(3)}
                  </div>
                </div>
              </div>

              {/* Support Collateral */}
              {position.totalSupportCollateral > 0 && (
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-orange-400 font-medium">Support Collateral</div>
                      <div className="text-lg font-bold text-white">
                        ${position.totalSupportCollateral.toLocaleString()}
                      </div>
                    </div>
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleSupportPosition(position)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg text-white font-medium transition-all flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Support Position
                </button>
                <button
                  onClick={() => setSelectedPosition(position)}
                  className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-600/50 rounded-lg text-white transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Position Details */}
      {selectedPosition && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              Position #{selectedPosition.id} Details
            </h3>
            <button
              onClick={() => setSelectedPosition(null)}
              className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-600/50 rounded-lg text-white transition-colors"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SupporterTable positionId={selectedPosition.id} />
            <RiskEnginePanel positionId={selectedPosition.id} />
          </div>
        </div>
      )}

      {/* Support Modal */}
      <SupportPositionModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        positionId={selectedPosition?.id || ''}
        positionData={selectedPosition ? {
          id: selectedPosition.id,
          borrower: selectedPosition.borrower,
          collateralAmount: selectedPosition.collateralAmount,
          borrowedAmount: selectedPosition.borrowedAmount,
          collateralPrice: selectedPosition.collateralPrice,
          healthFactor: selectedPosition.healthFactor,
          liquidationThreshold: selectedPosition.liquidationThreshold,
          maturityTime: selectedPosition.maturityTime
        } : undefined}
      />
    </div>
  )
}
