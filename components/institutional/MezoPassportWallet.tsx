'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  Bitcoin, 
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  Settings,
  LogOut,
  Activity
} from 'lucide-react'

interface WalletInfo {
  address: string
  balance: {
    btc: number
    musd: number
  }
  network: 'mainnet' | 'testnet'
  walletType: 'Unisat' | 'OKX' | 'Xverse' | 'Bitcoin Core'
}

interface MezoPassportWalletProps {
  onConnect?: (wallet: WalletInfo) => void
  onDisconnect?: () => void
  className?: string
}

export default function MezoPassportWallet({ onConnect, onDisconnect, className = '' }: MezoPassportWalletProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)

  // Mock wallet connection - replace with actual Mezo Passport integration
  const connectWallet = async (walletType: 'Unisat' | 'OKX' | 'Xverse' | 'Bitcoin Core') => {
    setIsConnecting(true)
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockWalletInfo: WalletInfo = {
        address: walletType === 'Bitcoin Core' 
          ? 'bc1qxy2k9g3g3g3g3g3g3g3g3g3g3g3g3g3g3g3g3g'
          : '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        balance: {
          btc: 2.4567,
          musd: 125000
        },
        network: 'mainnet',
        walletType
      }
      
      setWalletInfo(mockWalletInfo)
      setIsConnected(true)
      onConnect?.(mockWalletInfo)
      
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWalletInfo(null)
    setIsConnected(false)
    setShowDropdown(false)
    onDisconnect?.()
  }

  const copyAddress = async () => {
    if (walletInfo?.address) {
      await navigator.clipboard.writeText(walletInfo.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    if (address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3')) {
      return `${address.slice(0, 8)}...${address.slice(-8)}`
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className={`relative ${className}`}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isConnecting}
          className="btc-button flex items-center space-x-2"
        >
          <Wallet className="w-5 h-5" />
          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          <ChevronDown className="w-4 h-4" />
        </motion.button>

        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full right-0 mt-2 w-64 institutional-card z-50"
          >
            <div className="space-y-2">
              <div className="text-sm font-medium text-mezo-dark-200 mb-3">Connect Bitcoin Wallet</div>
              
              {['Unisat', 'OKX', 'Xverse', 'Bitcoin Core'].map((wallet) => (
                <motion.button
                  key={wallet}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => connectWallet(wallet as any)}
                  disabled={isConnecting}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-mezo-btc-500/10 flex items-center justify-center">
                    <Bitcoin className="w-4 h-4 text-mezo-btc-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-mezo-dark-50">{wallet}</div>
                    <div className="text-xs text-mezo-dark-300">
                      {wallet === 'Bitcoin Core' ? 'Native Bitcoin' : 'Browser Extension'}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-mezo-dark-300" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="institutional-card flex items-center space-x-3 p-3 hover:bg-white/[0.04] transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-mezo-btc-500/10 flex items-center justify-center">
          <Bitcoin className="w-4 h-4 text-mezo-btc-500" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-mezo-dark-50">
            {walletInfo?.walletType}
          </div>
          <div className="text-xs text-mezo-dark-300 font-mono">
            {walletInfo?.address ? formatAddress(walletInfo.address) : ''}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <ChevronDown className="w-4 h-4 text-mezo-dark-300" />
        </div>
      </motion.button>

      {showDropdown && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full right-0 mt-2 w-80 institutional-card z-50"
        >
          <div className="space-y-4">
            {/* Wallet Info */}
            <div className="border-b border-white/[0.08] pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-mezo-dark-200">Wallet Balance</div>
                <div className="flex items-center space-x-1 text-xs text-mezo-dark-300">
                  <Activity className="w-3 h-3" />
                  <span>Live</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bitcoin className="w-4 h-4 text-mezo-btc-500" />
                    <span className="text-sm text-mezo-dark-300">BTC</span>
                  </div>
                  <span className="text-sm font-mono text-mezo-dark-50">
                    {walletInfo?.balance.btc.toFixed(4)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-mezo-musd-500"></div>
                    <span className="text-sm text-mezo-dark-300">MUSD</span>
                  </div>
                  <span className="text-sm font-mono text-mezo-dark-50">
                    {walletInfo?.balance.musd.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="border-b border-white/[0.08] pb-4">
              <div className="text-sm font-medium text-mezo-dark-200 mb-2">Address</div>
              <div className="flex items-center space-x-2 p-2 bg-white/[0.02] rounded-lg">
                <span className="text-xs font-mono text-mezo-dark-300 flex-1">
                  {walletInfo?.address}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={copyAddress}
                  className="p-1 hover:bg-white/[0.04] rounded transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-mezo-dark-300" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <Settings className="w-4 h-4 text-mezo-dark-300" />
                <span className="text-sm text-mezo-dark-200">Wallet Settings</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={disconnectWallet}
                className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Disconnect</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
