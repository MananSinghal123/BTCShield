import { SimulationResult, MezoVault, BTCShieldSupport } from '@/types'
import { calculateLambdaStar, getDefaultMezoParams } from './blackScholes'

/**
 * Simulation Engine for BTCShield Protocol
 * Analyzes BTC price history to estimate protocol performance
 */

export interface SimulationParams {
  vault: MezoVault
  support?: BTCShieldSupport
  btcPriceHistory: number[]
  timeSteps: number[]
  riskFreeRate?: number
  volatility?: number
}

export interface ProtocolMetrics {
  collateralReleaseReduction: number
  healthFactorRecoveryFraction: number
  supporterDefaultProbability: number
  averageSupporterProfit: number
  liquidationAvoidanceRate: number
  totalCollateralRestrained: number
}

export interface StressTestResult {
  scenario: string
  btcPriceShock: number
  vaultsAffected: number
  totalLosses: number
  supporterDefaultRate: number
  protocolHealth: number
}

export class MiqadoSimulationEngine {
  /**
   * Run comprehensive simulation with BTC price history
   */
  runSimulation(params: SimulationParams): SimulationResult[] {
    const { vault, support, btcPriceHistory, timeSteps } = params
    const results: SimulationResult[] = []

    for (let i = 0; i < btcPriceHistory.length; i++) {
      const btcPrice = btcPriceHistory[i]
      const timestamp = timeSteps[i]

      // Update vault with new price
      const updatedVault = { ...vault, collateralPrice: btcPrice }
      const newHealthFactor = (updatedVault.collateralAmount * btcPrice) / updatedVault.borrowedAmount

      // Calculate λ* for current conditions
      const bsParams = {
        S: btcPrice,
        K: btcPrice * vault.liquidationThreshold,
        T: (vault.maturityTime - timestamp) / (365 * 24 * 60 * 60 * 1000),
        ...getDefaultMezoParams()
      }

      const bsResult = calculateLambdaStar(bsParams, vault.collateralAmount)
      
      // Calculate collateral restraint
      const collateralRestraint = support 
        ? support.lambda * vault.collateralAmount * btcPrice
        : 0

      // Calculate supporter profit
      const supporterProfit = support 
        ? (bsResult.lambdaStar - support.lambda) * collateralRestraint
        : 0

      results.push({
        timestamp,
        btcPrice,
        healthFactor: newHealthFactor,
        lambdaStar: bsResult.lambdaStar,
        collateralRestraint,
        supporterProfit
      })
    }

    return results
  }

  /**
   * Calculate protocol-wide metrics
   */
  calculateProtocolMetrics(
    vaults: MezoVault[],
    supports: MiqadoSupport[],
    currentBtcPrice: number
  ): ProtocolMetrics {
    let totalCollateralRestrained = 0
    let totalHealthFactorRecovery = 0
    let totalSupporterProfit = 0
    let liquidationsAvoided = 0
    let totalVaults = vaults.length

    for (const vault of vaults) {
      const vaultSupport = supports.find(s => s.vaultId === vault.id && s.status === 'active')
      
      if (vaultSupport) {
        // Calculate collateral restraint
        const collateralRestraint = vaultSupport.lambda * vault.collateralAmount * currentBtcPrice
        totalCollateralRestrained += collateralRestraint

        // Calculate health factor recovery
        const originalHealthFactor = vault.healthFactor
        const newHealthFactor = originalHealthFactor * (1 + vaultSupport.lambda)
        totalHealthFactorRecovery += newHealthFactor

        // Calculate supporter profit
        const bsParams = {
          S: currentBtcPrice,
          K: currentBtcPrice * vault.liquidationThreshold,
          T: (vault.maturityTime - vault.createdAt) / (365 * 24 * 60 * 60 * 1000),
          ...getDefaultMezoParams()
        }

        const bsResult = calculateLambdaStar(bsParams, vault.collateralAmount)
        const supporterProfit = (bsResult.lambdaStar - vaultSupport.lambda) * collateralRestraint
        totalSupporterProfit += supporterProfit

        // Check if liquidation was avoided
        if (newHealthFactor > 1.2) {
          liquidationsAvoided++
        }
      }
    }

    const avgHealthFactorRecovery = totalVaults > 0 ? totalHealthFactorRecovery / totalVaults : 0
    const liquidationAvoidanceRate = totalVaults > 0 ? liquidationsAvoided / totalVaults : 0
    const avgSupporterProfit = supports.length > 0 ? totalSupporterProfit / supports.length : 0

    // Calculate supporter default probability (simplified)
    const supporterDefaultProbability = Math.max(0, 1 - liquidationAvoidanceRate)

    // Calculate collateral release reduction
    const totalCollateralValue = vaults.reduce((sum, v) => sum + v.collateralAmount * currentBtcPrice, 0)
    const collateralReleaseReduction = totalCollateralValue > 0 
      ? totalCollateralRestrained / totalCollateralValue 
      : 0

    return {
      collateralReleaseReduction,
      healthFactorRecoveryFraction: avgHealthFactorRecovery,
      supporterDefaultProbability,
      averageSupporterProfit: avgSupporterProfit,
      liquidationAvoidanceRate,
      totalCollateralRestrained
    }
  }

  /**
   * Run stress test scenarios
   */
  runStressTest(
    vaults: MezoVault[],
    supports: MiqadoSupport[],
    scenarios: { name: string; priceShock: number }[]
  ): StressTestResult[] {
    const results: StressTestResult[] = []

    for (const scenario of scenarios) {
      let vaultsAffected = 0
      let totalLosses = 0
      let supporterDefaults = 0

      for (const vault of vaults) {
        const vaultSupport = supports.find(s => s.vaultId === vault.id && s.status === 'active')
        
        if (vaultSupport) {
          // Apply price shock
          const shockedPrice = vault.collateralPrice * (1 + scenario.priceShock)
          const newHealthFactor = (vault.collateralAmount * shockedPrice) / vault.borrowedAmount

          if (newHealthFactor < 1.2) {
            vaultsAffected++
            
            // Calculate losses
            const collateralValue = vault.collateralAmount * shockedPrice
            const liquidationPrice = vault.collateralPrice * vault.liquidationThreshold
            
            if (shockedPrice < liquidationPrice) {
              // Full liquidation
              const loss = vault.borrowedAmount - collateralValue
              totalLosses += Math.max(0, loss)
              supporterDefaults++
            } else {
              // Partial loss
              const loss = vault.borrowedAmount * 0.1 // 10% penalty
              totalLosses += loss
            }
          }
        }
      }

      const supporterDefaultRate = supports.length > 0 ? supporterDefaults / supports.length : 0
      const protocolHealth = 1 - (totalLosses / vaults.reduce((sum, v) => sum + v.borrowedAmount, 0))

      results.push({
        scenario: scenario.name,
        btcPriceShock: scenario.priceShock,
        vaultsAffected,
        totalLosses,
        supporterDefaultRate,
        protocolHealth
      })
    }

    return results
  }

  /**
   * Generate historical BTC price data for simulation
   */
  generateBtcPriceHistory(
    startPrice: number,
    days: number,
    volatility: number = 0.4
  ): { prices: number[]; timestamps: number[] } {
    const prices: number[] = [startPrice]
    const timestamps: number[] = [Date.now()]
    
    const dt = 1 / 365 // Daily time step
    const drift = 0.1 // 10% annual drift
    
    for (let i = 1; i < days; i++) {
      const randomShock = (Math.random() - 0.5) * 2 // Random walk
      const priceChange = drift * dt + volatility * Math.sqrt(dt) * randomShock
      const newPrice = prices[i - 1] * Math.exp(priceChange)
      
      prices.push(newPrice)
      timestamps.push(timestamps[i - 1] + 24 * 60 * 60 * 1000) // Add 1 day
    }
    
    return { prices, timestamps }
  }

  /**
   * Calculate Value at Risk (VaR) for supporters
   */
  calculateVaR(
    supports: MiqadoSupport[],
    confidenceLevel: number = 0.95,
    timeHorizon: number = 30 // days
  ): number {
    const profits: number[] = []
    
    // Generate multiple price scenarios
    for (let i = 0; i < 1000; i++) {
      let totalProfit = 0
      
      for (const support of supports) {
        // Simulate random price movement
        const priceChange = (Math.random() - 0.5) * 0.2 // ±10% price change
        const simulatedProfit = support.lambda * priceChange * 1000 // Simplified
        
        totalProfit += simulatedProfit
      }
      
      profits.push(totalProfit)
    }
    
    // Sort profits and find VaR
    profits.sort((a, b) => a - b)
    const index = Math.floor((1 - confidenceLevel) * profits.length)
    
    return profits[index]
  }

  /**
   * Calculate Expected Shortfall (ES) for supporters
   */
  calculateExpectedShortfall(
    supports: MiqadoSupport[],
    confidenceLevel: number = 0.95
  ): number {
    const profits: number[] = []
    
    // Generate multiple price scenarios (same as VaR)
    for (let i = 0; i < 1000; i++) {
      let totalProfit = 0
      
      for (const support of supports) {
        const priceChange = (Math.random() - 0.5) * 0.2
        const simulatedProfit = support.lambda * priceChange * 1000
        
        totalProfit += simulatedProfit
      }
      
      profits.push(totalProfit)
    }
    
    // Sort profits and calculate ES
    profits.sort((a, b) => a - b)
    const tailStart = Math.floor((1 - confidenceLevel) * profits.length)
    const tailProfits = profits.slice(0, tailStart)
    
    return tailProfits.reduce((sum, profit) => sum + profit, 0) / tailProfits.length
  }
}
