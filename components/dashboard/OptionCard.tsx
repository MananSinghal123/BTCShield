'use client'

import { motion } from 'framer-motion'
import { BTCShieldOption } from '@/types'
import { formatCurrency, getRiskColor } from '@/lib/utils'
import { ClockIcon, UsersIcon, TrendingUpIcon } from 'lucide-react'

interface OptionCardProps {
  option: BTCShieldOption
  index: number
  onSupport?: (optionId: string) => void
}

export default function OptionCard({ option, index, onSupport }: OptionCardProps) {
  const riskColorClass = getRiskColor(option.riskLevel)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass glass-hover rounded-xl p-6 card-glow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-primary-500 flex items-center justify-center text-white font-semibold">
            {option.collateral[0]}
          </div>
          <div>
            <h3 className="text-white font-semibold">{option.collateral} Option</h3>
            <p className="text-gray-400 text-sm">Loan ID: #{option.loanId}</p>
          </div>
        </div>
        
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${riskColorClass}`}>
          {option.riskLevel.toUpperCase()} RISK
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-sm flex items-center space-x-1">
            <span>λ (Lambda)</span>
          </p>
          <p className="text-white font-semibold">{(option.lambda * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm flex items-center space-x-1">
            <ClockIcon className="h-3 w-3" />
            <span>ΔT (Duration)</span>
          </p>
          <p className="text-white font-semibold">{option.deltaT} days</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Expected Payoff</p>
          <p className="text-green-400 font-semibold">{formatCurrency(option.expectedPayoff)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm flex items-center space-x-1">
            <UsersIcon className="h-3 w-3" />
            <span>Supporters</span>
          </p>
          <p className="text-white font-semibold">{option.supporterCount}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-sm">Total Support</p>
          <p className="text-white font-semibold">{formatCurrency(option.totalSupport)}</p>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((option.totalSupport / 100000) * 100, 100)}%` }}
          />
        </div>
        <p className="text-gray-500 text-xs mt-1">
          {((option.totalSupport / 100000) * 100).toFixed(1)}% funded
        </p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Risk Adjustment</span>
          <span className="text-white">
            {option.lambda > 0.15 ? 'High Impact' : option.lambda > 0.08 ? 'Medium Impact' : 'Low Impact'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Time Sensitivity</span>
          <span className="text-white">
            {option.deltaT <= 7 ? 'Urgent' : option.deltaT <= 14 ? 'Moderate' : 'Flexible'}
          </span>
        </div>
      </div>

      {onSupport && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSupport(option.id)}
          className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <TrendingUpIcon className="h-4 w-4" />
          <span>Support This Option</span>
        </motion.button>
      )}
    </motion.div>
  )
}