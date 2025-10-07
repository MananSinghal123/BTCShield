'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { BarChart3, Home, CreditCard, Shield, TrendingUp, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Borrow', href: '/borrow', icon: CreditCard },
  { name: 'Support', href: '/support', icon: Shield },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
]

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="font-display font-bold text-xl gradient-text">
                BTCShield
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary-400' : 'text-gray-400'}`} />
                  <span className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Connect Wallet Button */}
          <div className="hidden md:flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-200"
            >
              Connect Wallet
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-white/10 glass"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary-400' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            <div className="pt-4 border-t border-white/10">
              <button className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium text-sm">
                Connect Wallet
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}