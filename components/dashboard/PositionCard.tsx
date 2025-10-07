'use client'

import { motion } from 'framer-motion'
import { Loan } from '@/types'
import { formatCurrency, formatPercentage, getRiskColor, getHealthFactorColor } from '@/lib/utils'
import { AlertTriangleIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react'

interface PositionCardProps {
  loan: Loan
  index: number
}

export default function PositionCard({ loan, index }: PositionCardProps) {
  const riskColorClass = getRiskColor(loan.riskLevel)
  const healthFactorColor = getHealthFactorColor(loan.healthFactor)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass glass-hover rounded-xl p-6 card-glow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              {loan.asset[0]}
            </div>
            <div>
              <h3 className="text-white font-semibold">{loan.asset}</h3>
              <p className="text-gray-400 text-sm">Collateral: {loan.collateral}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${riskColorClass}`}>
            {loan.riskLevel.toUpperCase()}
          </span>
          {loan.liquidationProbability > 0.15 && (
            <AlertTriangleIcon className="h-4 w-4 text-yellow-400" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-sm">Borrowed Amount</p>
          <p className="text-white font-semibold">{formatCurrency(loan.borrowedAmount)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Leverage Factor</p>
          <p className="text-white font-semibold">{loan.leverageFactor}x</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Health Factor</p>
          <p className={`font-semibold ${healthFactorColor}`}>
            {loan.healthFactor.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Liquidation Risk</p>
          <p className="text-white font-semibold">{formatPercentage(loan.liquidationProbability)}</p>
        </div>
      </div>

      {/* Collateral Price Trend */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-sm">Price Trend (7d)</p>
          <div className="flex items-center space-x-1 text-xs">
            {loan.collateralPriceTrend[loan.collateralPriceTrend.length - 1] > loan.collateralPriceTrend[0] ? (
              <TrendingUpIcon className="h-3 w-3 text-green-400" />
            ) : (
              <TrendingDownIcon className="h-3 w-3 text-red-400" />
            )}
            <span className={
              loan.collateralPriceTrend[loan.collateralPriceTrend.length - 1] > loan.collateralPriceTrend[0]
                ? 'text-green-400'
                : 'text-red-400'
            }>
              {(((loan.collateralPriceTrend[loan.collateralPriceTrend.length - 1] / loan.collateralPriceTrend[0]) - 1) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="flex items-end space-x-1 h-8">
          {loan.collateralPriceTrend.map((price, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-primary-500/30 to-primary-400/60 rounded-sm"
              style={{
                height: `${(price / Math.max(...loan.collateralPriceTrend)) * 100}%`,
                minHeight: '2px'
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">Liquidation Threshold</p>
          <p className="text-white text-sm font-medium">{formatPercentage(loan.liquidationThreshold)}</p>
        </div>
      </div>
    </motion.div>
  )
}