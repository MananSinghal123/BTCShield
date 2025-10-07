'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  Zap,
  CheckCircle,
  XCircle,
  Info,
  Bitcoin,
  DollarSign
} from 'lucide-react'
import { MezoVault, BTCShieldSupport, VaultPhase } from '@/types'
import { BTCShieldVaultManager } from '@/lib/miqado/vaultManager'
import { calculateLambdaStar, getDefaultMezoParams } from '@/lib/miqado/blackScholes'

interface BTCShieldVaultProps {
  vault: MezoVault
  support?: BTCShieldSupport
  vaultManager: BTCShieldVaultManager
  onSupport?: (vaultId: string, lambda: number) => void
  onRescue?: (vaultId: string, supportId: string) => void
  onSettle?: (vaultId: string, supportId: string, exercise: boolean) => void
}

const phaseConfig = {
  initialization: {
    label: 'Initialization',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30',
    icon: AlertTriangle,
    description: 'Vault eligible for support'
  },
  'pre-maturity': {
    label: 'Pre-Maturity',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30',
    icon: Clock,
    description: 'Borrower can rescue or wait for maturity'
  },
  maturity: {
    label: 'Maturity',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/30',
    icon: CheckCircle,
    description: 'Time to settle the option'
  }
}

export default function BTCShieldVault({ 
  vault, 
  support, 
  vaultManager,
  onSupport,
  onRescue,
  onSettle
}: MiqadoVaultProps) {
  const [currentPhase, setCurrentPhase] = useState<VaultPhase>(vault.phase)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [lambdaStar, setLambdaStar] = useState<number>(0)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [supportLambda, setSupportLambda] = useState<number>(0.1)

  // Update phase and time remaining
  useEffect(() => {
    const updateVault = () => {
      const phase = vaultManager.updateVaultPhase(vault.id)
      if (phase) setCurrentPhase(phase)
      
      const remaining = Math.max(0, vault.maturityTime - Date.now())
      setTimeRemaining(remaining)
    }

    updateVault()
    const interval = setInterval(updateVault, 1000)
    return () => clearInterval(interval)
  }, [vault.id, vault.maturityTime, vaultManager])

  // Calculate λ* (Black-Scholes optimal price)
  useEffect(() => {
    const params = {
      S: vault.collateralPrice,
      K: vault.collateralPrice * vault.liquidationThreshold,
      T: (vault.maturityTime - vault.createdAt) / (365 * 24 * 60 * 60 * 1000),
      ...getDefaultMezoParams()
    }

    const result = calculateLambdaStar(params, vault.collateralAmount)
    setLambdaStar(result.lambdaStar)
  }, [vault])

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const phaseInfo = phaseConfig[currentPhase]
  const PhaseIcon = phaseInfo.icon

  const handleSupport = () => {
    if (onSupport && supportLambda > 0) {
      onSupport(vault.id, supportLambda)
    }
  }

  const handleRescue = () => {
    if (onRescue && support) {
      onRescue(vault.id, support.id)
    }
  }

  const handleSettle = (exercise: boolean) => {
    if (onSettle && support) {
      onSettle(vault.id, support.id, exercise)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mezo-glass rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-mezo-btc-50 to-mezo-btc-100 rounded-lg flex items-center justify-center">
            <Bitcoin className="w-6 h-6 text-mezo-dark-200" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-mezo-dark-50">Vault #{vault.id}</h3>
            <p className="text-sm text-mezo-dark-50/60">BTC/MUSD Position</p>
          </div>
        </div>

        {/* Phase Badge */}
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${phaseInfo.bgColor} ${phaseInfo.borderColor} border`}>
          <PhaseIcon className={`w-4 h-4 ${phaseInfo.color}`} />
          <span className={`text-sm font-medium ${phaseInfo.color}`}>
            {phaseInfo.label}
          </span>
        </div>
      </div>

      {/* Phase Description */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <p className="text-sm text-mezo-dark-50/80 mb-2">{phaseInfo.description}</p>
        {timeRemaining > 0 && (
          <div className="flex items-center space-x-2 text-sm text-mezo-dark-50/60">
            <Clock className="w-4 h-4" />
            <span>{formatTimeRemaining(timeRemaining)} remaining</span>
          </div>
        )}
      </div>

      {/* Vault Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-lg font-bold text-mezo-dark-50">
            {vault.collateralAmount.toFixed(4)}
          </div>
          <div className="text-xs text-mezo-dark-50/60">BTC Collateral</div>
        </div>
        
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-lg font-bold text-mezo-musd-50">
            {vault.borrowedAmount.toLocaleString()}
          </div>
          <div className="text-xs text-mezo-dark-50/60">MUSD Borrowed</div>
        </div>
        
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className={`text-lg font-bold ${
            vault.healthFactor >= 1.5 ? 'text-green-400' : 
            vault.healthFactor >= 1.2 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {vault.healthFactor.toFixed(2)}
          </div>
          <div className="text-xs text-mezo-dark-50/60">Health Factor</div>
        </div>
        
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-lg font-bold text-mezo-accent-100">
            ${vault.collateralPrice.toLocaleString()}
          </div>
          <div className="text-xs text-mezo-dark-50/60">BTC Price</div>
        </div>
      </div>

      {/* Support Information */}
      {support && (
        <div className="mb-6 p-4 bg-mezo-accent-100/10 rounded-lg border border-mezo-accent-100/20">
          <h4 className="text-sm font-medium text-mezo-accent-100 mb-3">Active Support</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-mezo-dark-50/60">λ (Premium)</div>
              <div className="text-lg font-bold text-mezo-dark-50">
                {(support.lambda * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-mezo-dark-50/60">λ* (Optimal)</div>
              <div className="text-lg font-bold text-mezo-accent-100">
                {(lambdaStar * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-mezo-dark-50/60">k_re</div>
              <div className="text-lg font-bold text-mezo-dark-50">
                {support.k_re.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-mezo-dark-50/60">Collateral Locked</div>
              <div className="text-lg font-bold text-mezo-dark-50">
                ${support.collateralDeposited.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {currentPhase === 'initialization' && !support && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <label className="text-sm text-mezo-dark-50/80">Support with λ:</label>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={supportLambda}
                onChange={(e) => setSupportLambda(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-mono text-mezo-dark-50 min-w-[60px]">
                {(supportLambda * 100).toFixed(1)}%
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSupport}
              className="w-full px-4 py-3 bg-gradient-to-r from-mezo-accent-100 to-mezo-accent-50 text-mezo-dark-200 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Support Position
            </motion.button>
          </div>
        )}

        {currentPhase === 'pre-maturity' && support && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRescue}
            className="w-full px-4 py-3 bg-gradient-to-r from-mezo-btc-50 to-mezo-btc-100 text-mezo-dark-200 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Rescue Now (Pay Premium × k_re)
          </motion.button>
        )}

        {currentPhase === 'maturity' && support && (
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSettle(true)}
              className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Exercise Option
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSettle(false)}
              className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-400 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Default
            </motion.button>
          </div>
        )}
      </div>

      {/* Advanced View Toggle */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm text-mezo-dark-50/60 hover:text-mezo-dark-50 transition-colors"
        >
          <Calculator className="w-4 h-4" />
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Metrics</span>
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-mezo-dark-50/60">k_SF (Eligibility)</div>
                  <div className="font-mono text-mezo-dark-50">
                    {support?.k_SF.toFixed(3) || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-mezo-dark-50/60">Buffer (B)</div>
                  <div className="font-mono text-mezo-dark-50">
                    {support?.buffer.toFixed(2) || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-mezo-dark-50/60">Liquidation Price</div>
                  <div className="font-mono text-mezo-dark-50">
                    ${(vault.collateralPrice * vault.liquidationThreshold).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-mezo-dark-50/60">Collateral Ratio</div>
                  <div className="font-mono text-mezo-dark-50">
                    {(vault.borrowedAmount / (vault.collateralAmount * vault.collateralPrice)).toFixed(3)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
