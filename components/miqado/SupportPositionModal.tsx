'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Clock,
  Calculator,
  Zap
} from 'lucide-react'

interface SupportPositionModalProps {
  isOpen: boolean
  onClose: () => void
  positionId: string
  positionData?: {
    id: string
    borrower: string
    collateralAmount: number
    borrowedAmount: number
    collateralPrice: number
    healthFactor: number
    liquidationThreshold: number
    maturityTime: number
  }
}

interface SupportCalculation {
  lambda: number
  collateralDeposited: number
  expectedReturn: number
  liquidationProbabilityReduction: number
  healthFactorImprovement: number
  timeRemaining: number
}

export default function SupportPositionModal({ 
  isOpen, 
  onClose, 
  positionId, 
  positionData 
}: SupportPositionModalProps) {
  const [lambda, setLambda] = useState(0.15)
  const [k_re, setK_re] = useState(0.8)
  const [buffer, setBuffer] = useState(1.1)
  const [calculation, setCalculation] = useState<SupportCalculation | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && positionData) {
      calculateSupport()
    }
  }, [isOpen, lambda, k_re, buffer, positionData])

  const calculateSupport = async () => {
    if (!positionData) return

    try {
      setLoading(true)
      setError(null)

      // Simulate calculation (in real implementation, this would call the API)
      const collateralDeposited = lambda * positionData.collateralAmount * positionData.collateralPrice
      const expectedReturn = collateralDeposited * 0.15 // Simplified calculation
      
      // Calculate liquidation probability reduction
      const currentLiquidationProb = Math.exp(-0.1 * positionData.healthFactor)
      const newHealthFactor = positionData.healthFactor * (1 + lambda * 0.1)
      const newLiquidationProb = Math.exp(-0.1 * newHealthFactor)
      const liquidationProbabilityReduction = (currentLiquidationProb - newLiquidationProb) / currentLiquidationProb

      const timeRemaining = positionData.maturityTime - Date.now()

      setCalculation({
        lambda,
        collateralDeposited,
        expectedReturn,
        liquidationProbabilityReduction: Math.max(0, liquidationProbabilityReduction * 100),
        healthFactorImprovement: ((newHealthFactor - positionData.healthFactor) / positionData.healthFactor) * 100,
        timeRemaining
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!positionData || !calculation) return

    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch('/api/v1/support/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positionId,
          supporterAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Mock address
          lambda,
          k_re,
          buffer
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit support')
      }

      const result = await response.json()
      console.log('Support submitted:', result)
      
      // Close modal and refresh parent component
      onClose()
      
      // In real implementation, would trigger a refresh of supporter data
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit support')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTimeRemaining = (timeMs: number) => {
    const days = Math.floor(timeMs / (24 * 60 * 60 * 1000))
    const hours = Math.floor((timeMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    
    if (days > 0) {
      return `${days} days, ${hours} hours`
    } else if (hours > 0) {
      return `${hours} hours`
    } else {
      return '< 1 hour'
    }
  }

  if (!positionData) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-semibold text-white">BTCShield This Position</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Position Info */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h3 className="text-lg font-medium text-white mb-3">Position Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Position ID:</span>
                    <div className="text-white font-mono">{positionId}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Collateral:</span>
                    <div className="text-white">{positionData.collateralAmount} BTC</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Borrowed:</span>
                    <div className="text-white">${positionData.borrowedAmount.toLocaleString()} MUSD</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Health Factor:</span>
                    <div className={`font-medium ${positionData.healthFactor > 1.2 ? 'text-green-400' : positionData.healthFactor > 1.0 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {positionData.healthFactor.toFixed(3)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Time Remaining:</span>
                    <div className="text-white">{formatTimeRemaining(positionData.maturityTime - Date.now())}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Liquidation Threshold:</span>
                    <div className="text-white">{(positionData.liquidationThreshold * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              {/* Support Parameters */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Support Parameters</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      λ Factor (Premium)
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      max="1.0"
                      step="0.01"
                      value={lambda}
                      onChange={(e) => setLambda(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      Higher λ = Higher premium, Lower risk
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Early Termination Factor (k_re)
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={k_re}
                      onChange={(e) => setK_re(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      Borrower rescue cost multiplier
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Buffer Factor
                    </label>
                    <input
                      type="number"
                      min="1.0"
                      max="2.0"
                      step="0.1"
                      value={buffer}
                      onChange={(e) => setBuffer(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      Safety margin for support eligibility
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculation Results */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : calculation && (
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Support Impact Calculation
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Collateral to Lock:</span>
                        <span className="text-white font-medium">
                          ${calculation.collateralDeposited.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expected Return:</span>
                        <span className="text-green-400 font-medium">
                          +${calculation.expectedReturn.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ROI:</span>
                        <span className="text-green-400 font-medium">
                          {((calculation.expectedReturn / calculation.collateralDeposited) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Liquidation Risk Reduction:</span>
                        <span className="text-green-400 font-medium">
                          -{calculation.liquidationProbabilityReduction.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Health Factor Improvement:</span>
                        <span className="text-green-400 font-medium">
                          +{calculation.healthFactorImprovement.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Support Duration:</span>
                        <span className="text-white font-medium">
                          {formatTimeRemaining(calculation.timeRemaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-center text-red-400">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {error}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-600/50 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!calculation || submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      BTCShield Position
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
