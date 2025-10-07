import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}

export function getRiskColor(risk: 'low' | 'medium' | 'high'): string {
  switch (risk) {
    case 'low':
      return 'text-green-400 bg-green-400/10 border-green-400/20'
    case 'medium':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    case 'high':
      return 'text-red-400 bg-red-400/10 border-red-400/20'
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  }
}

export function getHealthFactorColor(healthFactor: number): string {
  if (healthFactor >= 2.5) return 'text-green-400'
  if (healthFactor >= 1.5) return 'text-yellow-400'
  return 'text-red-400'
}

export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}