'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { mockBTCShieldOptions, mockLoans } from '@/data/mockData'
import OptionCard from '@/components/dashboard/OptionCard'
import RiskChart from '@/components/dashboard/RiskChart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { TrendingUpIcon, ShieldIcon, UsersIcon } from 'lucide-react'

export default function SupportPage() {
  const [supportedOptions, setSupportedOptions] = useState<Set<string>>(new Set())

  const handleSupport = (optionId: string) => {
    setSupportedOptions(prev => new Set([...Array.from(prev), optionId]))
    // In a real app, this would make an API call
    console.log('Supporting option:', optionId)
  }

  // Mock data for collateral restraint visualization
  const collateralRestraintData = [
    { name: 'Week 1', restrained: 2.4, released: 0.8 },
    { name: 'Week 2', restrained: 3.2, released: 1.2 },
    { name: 'Week 3', restrained: 4.1, released: 1.8 },
    { name: 'Week 4', restrained: 5.3, released: 2.1 },
    { name: 'Week 5', restrained: 6.8, released: 2.9 },
    { name: 'Week 6', restrained: 8.2, released: 3.4 },
  ]

  const totalSupportProvided = Array.from(supportedOptions).reduce((total, optionId) => {
    const option = mockBTCShieldOptions.find(o => o.id === optionId)
    return total + (option?.expectedPayoff || 0)
  }, 0)

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
            Support Risky Loans
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Earn returns by supporting high-risk loans through BTCShield options and help prevent liquidations
          </p>
        </motion.div>

        {/* Support Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="glass rounded-xl p-6 card-glow">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-green-400/20">
                <TrendingUpIcon className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Support Provided</h3>
            </div>
            <p className="text-2xl font-bold gradient-text">
              {formatCurrency(totalSupportProvided)}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {supportedOptions.size} options supported
            </p>
          </div>

          <div className="glass rounded-xl p-6 card-glow">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary-500/20 to-primary-400/20">
                <ShieldIcon className="h-5 w-5 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Loans Protected</h3>
            </div>
            <p className="text-2xl font-bold text-primary-400">
              {mockBTCShieldOptions.length}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Available for support
            </p>
          </div>

          <div className="glass rounded-xl p-6 card-glow">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-purple-400/20">
                <UsersIcon className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Active Supporters</h3>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {mockBTCShieldOptions.reduce((sum, option) => sum + option.supporterCount, 0)}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Community participants
            </p>
          </div>
        </motion.div>

        {/* Collateral Restraint Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6 font-display">
            Collateral Restraint Impact
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={collateralRestraintData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 17, 26, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)',
                  }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: any, name: string) => [
                    `$${value}M`,
                    name === 'restrained' ? 'Collateral Restrained' : 'Collateral Released'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="restrained" 
                  stackId="1"
                  stroke="#4C9AFF"
                  fill="url(#colorRestrained)"
                />
                <Area 
                  type="monotone" 
                  dataKey="released" 
                  stackId="1"
                  stroke="#3EDC81"
                  fill="url(#colorReleased)"
                />
                <defs>
                  <linearGradient id="colorRestrained" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4C9AFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4C9AFF" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorReleased" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3EDC81" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3EDC81" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Available Miqado Options */}
        <section>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mb-6"
          >
            <h2 className="text-2xl font-semibold text-white font-display">
              Available BTCShield Options
            </h2>
            <div className="flex items-center space-x-4">
              <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
              <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
                <option value="payoff">Sort by Payoff</option>
                <option value="risk">Sort by Risk</option>
                <option value="time">Sort by Time</option>
              </select>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockBTCShieldOptions.map((option, index) => (
              <div key={option.id} className="relative">
                <OptionCard 
                  option={option} 
                  index={index}
                  onSupport={handleSupport}
                />
                {supportedOptions.has(option.id) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-400 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg"
                  >
                    Supported ✓
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Risk Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6 font-display">
            Risk-Reward Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Expected Returns by Risk Level</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <span className="text-red-400 font-medium">High Risk</span>
                  <span className="text-white font-semibold">15-25% APY</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <span className="text-yellow-400 font-medium">Medium Risk</span>
                  <span className="text-white font-semibold">8-15% APY</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span className="text-green-400 font-medium">Low Risk</span>
                  <span className="text-white font-semibold">3-8% APY</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Support Metrics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Average Support Duration</span>
                  <span className="text-white font-medium">12 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-green-400 font-medium">94.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Volume Supported</span>
                  <span className="text-white font-medium">$12.4M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active Supporters</span>
                  <span className="text-white font-medium">1,247</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}