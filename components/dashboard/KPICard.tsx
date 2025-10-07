'use client'

import { motion } from 'framer-motion'
import { KPI } from '@/types'
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from 'lucide-react'

interface KPICardProps {
  kpi: KPI
  index: number
}

export default function KPICard({ kpi, index }: KPICardProps) {
  const isPositive = kpi.changeType === 'positive'
  const isNegative = kpi.changeType === 'negative'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass glass-hover rounded-xl p-6 card-glow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-1">
            {kpi.title}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-white">
              {kpi.value}
            </h3>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              isPositive ? 'text-green-400 bg-green-400/10' :
              isNegative ? 'text-red-400 bg-red-400/10' :
              'text-gray-400 bg-gray-400/10'
            }`}>
              {isPositive && <ArrowUpIcon className="h-3 w-3" />}
              {isNegative && <ArrowDownIcon className="h-3 w-3" />}
              <span>{Math.abs(kpi.change)}%</span>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-2 leading-relaxed">
            {kpi.description}
          </p>
        </div>
        
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500/20 to-purple-500/20">
          <TrendingUpIcon className="h-5 w-5 text-primary-400" />
        </div>
      </div>

      {kpi.trend && (
        <div className="mt-4 h-16">
          <div className="flex items-end space-x-1 h-full">
            {kpi.trend.map((value, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-primary-500/30 to-primary-400/60 rounded-sm"
                style={{
                  height: `${(value / Math.max(...kpi.trend!)) * 100}%`,
                  minHeight: '2px'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}