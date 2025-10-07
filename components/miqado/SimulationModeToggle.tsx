'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Settings, 
  Zap, 
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface SimulationModeToggleProps {
  isActive: boolean
  onToggle: (active: boolean) => void
  className?: string
}

export default function SimulationModeToggle({ 
  isActive, 
  onToggle, 
  className = '' 
}: SimulationModeToggleProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [priceVolatility, setPriceVolatility] = useState(0.25)

  return (
    <div className={`relative ${className}`}>
      {/* Main Toggle */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onToggle(!isActive)}
        className={`
          flex items-center space-x-3 px-4 py-3 rounded-xl border transition-all duration-300
          ${isActive 
            ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50 text-orange-400' 
            : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-gray-500/50'
          }
        `}
      >
        <div className="relative">
          {isActive ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Activity className="w-5 h-5" />
            </motion.div>
          ) : (
            <Play className="w-5 h-5" />
          )}
          
          {/* Status Indicator */}
          <div className={`
            absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900
            ${isActive ? 'bg-green-400' : 'bg-gray-500'}
          `} />
        </div>
        
        <div className="text-left">
          <div className="font-medium">
            {isActive ? 'Simulation Active' : 'Start Simulation'}
          </div>
          <div className="text-xs opacity-75">
            {isActive ? 'BTCShield backstop logic running' : 'Run with mock BTC/MUSD data'}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation()
            setSettingsOpen(!settingsOpen)
          }}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
        </motion.button>
      </motion.button>

      {/* Settings Panel */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ 
          opacity: settingsOpen ? 1 : 0, 
          y: settingsOpen ? 0 : -10, 
          scale: settingsOpen ? 1 : 0.95 
        }}
        transition={{ duration: 0.2 }}
        className={`
          absolute top-full right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl 
          border border-gray-700/50 rounded-xl shadow-2xl z-50
          ${settingsOpen ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-orange-400" />
            Simulation Settings
          </h3>
          
          <div className="space-y-4">
            {/* Simulation Speed */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Simulation Speed: {simulationSpeed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0.5x</span>
                <span>Real-time</span>
                <span>5x</span>
              </div>
            </div>

            {/* Price Volatility */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                BTC Price Volatility: {(priceVolatility * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={priceVolatility}
                onChange={(e) => setPriceVolatility(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Simulation Info */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                What's Simulated
              </h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Real-time BTC/MUSD price movements</li>
                <li>• Dynamic liquidation probability updates</li>
                <li>• Supporter impact on health factors</li>
                <li>• BTCShield λ pricing calculations</li>
                <li>• Risk mitigation visualization</li>
              </ul>
            </div>

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-center text-yellow-400 text-xs">
                <AlertTriangle className="w-4 h-4 mr-2" />
                This is a simulation with mock data. No real transactions occur.
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid #1f2937;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 2px solid #1f2937;
        }
      `}</style>
    </div>
  )
}
