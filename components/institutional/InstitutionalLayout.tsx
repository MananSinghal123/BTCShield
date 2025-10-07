'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Shield, 
  ArrowUpDown, 
  TrendingUp,
  Menu,
  X,
  Settings,
  Activity,
  Bell,
  Users
} from 'lucide-react'
import MezoPassportWallet from './MezoPassportWallet'
import CollateralDashboard from './CollateralDashboard'
import BTCShieldRiskEngine from './BTCShieldRiskEngine'
import BorrowLendConsole from './BorrowLendConsole'
import PortfolioAnalytics from './PortfolioAnalytics'
import EnhancedDashboard from '../miqado/EnhancedDashboard'

interface InstitutionalLayoutProps {
  children?: React.ReactNode
}

export default function InstitutionalLayout({ children }: InstitutionalLayoutProps) {
  const [activeTab, setActiveTab] = useState('collateral')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabs = [
    { id: 'collateral', label: 'Collateral', icon: BarChart3, component: CollateralDashboard },
    { id: 'risk', label: 'Risk Engine', icon: Shield, component: BTCShieldRiskEngine },
    { id: 'borrow', label: 'Borrow & Lend', icon: ArrowUpDown, component: BorrowLendConsole },
    { id: 'supporters', label: 'BTCShield Supporters', icon: Users, component: EnhancedDashboard },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, component: PortfolioAnalytics }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-mezo-dark-950 via-mezo-dark-900 to-mezo-dark-800">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 institutional-card border-b border-white/[0.08]">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg btc-gradient flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-mezo-dark-50 font-display">BTCShield</h1>
                <p className="text-xs text-mezo-dark-300">BTC Backstop Protection Platform</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden lg:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-mezo-btc-500/10 text-mezo-btc-500 border border-mezo-btc-500/20'
                      : 'text-mezo-dark-300 hover:text-mezo-dark-50 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </motion.button>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <Bell className="w-5 h-5 text-mezo-dark-300" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <Settings className="w-5 h-5 text-mezo-dark-300" />
            </motion.button>
            
            <MezoPassportWallet />
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 z-50 w-64 institutional-card lg:hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-mezo-dark-50">Navigation</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-mezo-btc-500/10 text-mezo-btc-500 border border-mezo-btc-500/20'
                          : 'text-mezo-dark-300 hover:text-mezo-dark-50 hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-mezo-dark-50 font-display">
                    {tabs.find(tab => tab.id === activeTab)?.label}
                  </h2>
                  <p className="text-mezo-dark-300 mt-1">
                    {activeTab === 'collateral' && 'Monitor your BTC collateral and LTV ratios'}
                    {activeTab === 'risk' && 'Advanced risk analytics with BTCShield liquidation mitigation'}
                    {activeTab === 'borrow' && 'Borrow MUSD against BTC collateral with real-time oracle feeds'}
                    {activeTab === 'supporters' && 'Support undercollateralized positions and earn premiums through BTCShield backstop mechanism'}
                    {activeTab === 'analytics' && 'Portfolio analytics and stress scenario simulations'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-mezo-dark-300">
                  <Activity className="w-4 h-4" />
                  <span>Live data</span>
                </div>
              </div>
            </motion.div>

            {/* Active Component */}
            {ActiveComponent && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ActiveComponent />
              </motion.div>
            )}

            {/* Custom Children */}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}
    </div>
  )
}
