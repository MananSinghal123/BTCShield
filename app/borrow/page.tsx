'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loan } from '@/types'
import { mockLoans } from '@/data/mockData'
import { formatCurrency, formatPercentage, getRiskColor, getHealthFactorColor } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { TrendingUpIcon, TrendingDownIcon, PlusIcon, AlertTriangleIcon } from 'lucide-react'
import Modal from '@/components/ui/Modal'

export default function BorrowPage() {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRequestOption = (loan: Loan) => {
    setSelectedLoan(loan)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedLoan(null)
  }

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
            Borrow Assets
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Monitor your lending positions and request Miqado options for risk mitigation
          </p>
        </motion.div>

        {/* Loans Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white font-display">
              Active Loan Positions
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Track your borrowing positions and associated risks
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Asset</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Collateral</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Borrowed Amount</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Leverage</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Health Factor</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Liquidation Risk</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Price Trend</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockLoans.map((loan, index) => {
                  const riskColorClass = getRiskColor(loan.riskLevel)
                  const healthFactorColor = getHealthFactorColor(loan.healthFactor)
                  const priceChange = loan.collateralPriceTrend[loan.collateralPriceTrend.length - 1] - loan.collateralPriceTrend[0]
                  const priceChangePercent = (priceChange / loan.collateralPriceTrend[0]) * 100

                  return (
                    <motion.tr
                      key={loan.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {loan.asset[0]}
                          </div>
                          <span className="text-white font-medium">{loan.asset}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300">{loan.collateral}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-medium">
                          {formatCurrency(loan.borrowedAmount)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-medium">{loan.leverageFactor}x</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${healthFactorColor}`}>
                            {loan.healthFactor.toFixed(2)}
                          </span>
                          {loan.healthFactor < 1.5 && (
                            <AlertTriangleIcon className="h-4 w-4 text-yellow-400" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${riskColorClass}`}>
                            {formatPercentage(loan.liquidationProbability)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-8">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={loan.collateralPriceTrend.map((price, i) => ({ value: price, index: i }))}>
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke={priceChange >= 0 ? '#3EDC81' : '#EF4444'}
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="text-xs">
                            <div className={`flex items-center space-x-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {priceChange >= 0 ? (
                                <TrendingUpIcon className="h-3 w-3" />
                              ) : (
                                <TrendingDownIcon className="h-3 w-3" />
                              )}
                              <span>{priceChangePercent.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRequestOption(loan)}
                          className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                        >
                          <PlusIcon className="h-3 w-3" />
                          <span>Request Option</span>
                        </motion.button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Risk Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Total Borrowed</h3>
            <p className="text-2xl font-bold gradient-text">
              {formatCurrency(mockLoans.reduce((sum, loan) => sum + loan.borrowedAmount, 0))}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Across {mockLoans.length} positions
            </p>
          </div>
          
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Average Health Factor</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {(mockLoans.reduce((sum, loan) => sum + loan.healthFactor, 0) / mockLoans.length).toFixed(2)}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Risk level: Moderate
            </p>
          </div>
          
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">High-Risk Positions</h3>
            <p className="text-2xl font-bold text-red-400">
              {mockLoans.filter(loan => loan.riskLevel === 'high').length}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Require immediate attention
            </p>
          </div>
        </motion.div>
      </div>

      {/* Request Miqado Option Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Request Miqado Option">
        {selectedLoan && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {selectedLoan.asset[0]}
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">{selectedLoan.asset} Position</h3>
                <p className="text-gray-400">Collateral: {selectedLoan.collateral}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Current Health Factor</p>
                <p className={`font-semibold ${getHealthFactorColor(selectedLoan.healthFactor)}`}>
                  {selectedLoan.healthFactor.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Liquidation Risk</p>
                <p className="text-white font-semibold">{formatPercentage(selectedLoan.liquidationProbability)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Desired Lambda (λ)
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="0.30"
                  step="0.01"
                  defaultValue="0.15"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1%</span>
                  <span>15%</span>
                  <span>30%</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Time Period (ΔT)
                </label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="21">21 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-white/10 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white py-2.5 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                Submit Request
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}