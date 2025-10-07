'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Shield, 
  DollarSign,
  Users,
  AlertTriangle
} from 'lucide-react'

interface BTCShieldSupporter {
  id: string
  supporter: string
  lambda: number
  lambdaStar: number
  collateralDeposited: number
  k_re: number
  k_SF: number
  buffer: number
  createdAt: number
  status: 'active' | 'terminated' | 'exercised' | 'defaulted'
  timeRemaining: number
  expectedReturn: number
}

interface SupporterTableProps {
  positionId: string
  className?: string
}

export default function SupporterTable({ positionId, className = '' }: SupporterTableProps) {
  const [supporters, setSupporters] = useState<BTCShieldSupporter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSupporters()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSupporters, 30000)
    return () => clearInterval(interval)
  }, [positionId])

  const fetchSupporters = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/supporters?positionId=${positionId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch supporters')
      }
      
      const data = await response.json()
      // Adapt incoming mock supporters to local shape if needed
      const list = (data.supporters || []).map((s: any) => ({
        id: String(s.id),
        supporter: s.supporter ?? 'Supporter',
        lambda: s.lambda ?? 0.1,
        lambdaStar: s.lambdaStar ?? 0.12,
        collateralDeposited: s.amountLocked ?? 0,
        k_re: s.k_re ?? 0.8,
        k_SF: s.k_SF ?? 0.95,
        buffer: s.buffer ?? 1.1,
        createdAt: Date.now(),
        status: 'active',
        timeRemaining: (s.timeRemaining ?? 0) * 1000,
        expectedReturn: (s.expectedReturn ?? 0) * (s.amountLocked ?? 0)
      }))
      setSupporters(list)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch supporters')
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'terminated': return 'text-yellow-400'
      case 'exercised': return 'text-blue-400'
      case 'defaulted': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Shield className="w-4 h-4" />
      case 'terminated': return <Clock className="w-4 h-4" />
      case 'exercised': return <TrendingUp className="w-4 h-4" />
      case 'defaulted': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
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

  if (error) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-xl border border-red-500/50 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-32 text-red-400">
          <AlertTriangle className="w-6 h-6 mr-2" />
          {error}
        </div>
      </div>
    )
  }

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
            <Users className="w-6 h-6 text-orange-500" />
            <h3 className="text-xl font-semibold text-white">BTCShield Supporter Pool</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>{supporters.length} active supporters</span>
          </div>
        </div>
      </div>

      {supporters.length === 0 ? (
        <div className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-400 mb-2">No Active Supporters</h4>
          <p className="text-gray-500">This position doesn't have any active supporters yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Supporter
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount Locked
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  λ Factor
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Expected Return
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Time Remaining
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {supporters.map((supporter, index) => (
                <motion.tr
                  key={supporter.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="hover:bg-gray-800/30 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {supporter.supporter.slice(2, 4).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-white">
                          {formatAddress(supporter.supporter)}
                        </div>
                        <div className="text-xs text-gray-400">
                          k_SF: {supporter.k_SF.toFixed(3)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-green-400 mr-1" />
                      <span className="text-sm font-medium text-white">
                        ${supporter.collateralDeposited.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white">
                        {supporter.lambda.toFixed(3)}
                      </span>
                      {supporter.lambdaStar > supporter.lambda ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-xs text-gray-400">
                        ({supporter.lambdaStar.toFixed(3)})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-400">
                      +${supporter.expectedReturn.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {((supporter.expectedReturn / supporter.collateralDeposited) * 100).toFixed(1)}% ROI
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-300">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTimeRemaining(supporter.timeRemaining)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center text-sm ${getStatusColor(supporter.status)}`}>
                      {getStatusIcon(supporter.status)}
                      <span className="ml-1 capitalize">{supporter.status}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {supporters.length > 0 && (
        <div className="p-6 border-t border-gray-700/50 bg-gray-800/30">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                ${supporters.reduce((sum, s) => sum + s.collateralDeposited, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Locked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {supporters.reduce((sum, s) => sum + s.lambda, 0) / supporters.length}
              </div>
              <div className="text-sm text-gray-400">Avg λ Factor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                ${supporters.reduce((sum, s) => sum + s.expectedReturn, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Expected Return</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
