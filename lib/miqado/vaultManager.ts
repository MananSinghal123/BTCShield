import { 
  MezoVault, 
  BTCShieldSupport, 
  VaultPhase, 
  BlackScholesParams,
  VaultMetrics,
  SimulationResult
} from '@/types'
import { 
  calculateLambdaStar, 
  calculateSupportEligibility,
  calculateEarlyTerminationCost,
  calculateCollateralRestraint,
  calculateHealthFactorRecovery,
  getDefaultMezoParams
} from './blackScholes'

/**
 * BTCShield Vault Manager
 * Implements the three-phase backstop system
 */

export class BTCShieldVaultManager {
  private vaults: Map<string, MezoVault> = new Map()
  private supports: Map<string, BTCShieldSupport> = new Map()

  /**
   * Create a new vault when health factor < 1
   */
  createVault(vault: Omit<MezoVault, 'phase' | 'currentTime'>): MezoVault {
    const newVault: MezoVault = {
      ...vault,
      phase: 'initialization',
      currentTime: Date.now()
    }

    this.vaults.set(vault.id, newVault)
    return newVault
  }

  /**
   * Add support to a vault (Initialization phase)
   * Supporter deposits λ × C_t0 × p_t0
   */
  addSupport(
    vaultId: string,
    supporter: string,
    lambda: number,
    k_re: number = 0.8,
    buffer: number = 1.1
  ): BTCShieldSupport | null {
    const vault = this.vaults.get(vaultId)
    if (!vault || vault.phase !== 'initialization') {
      return null
    }

    // Check support eligibility
    const eligibility = calculateSupportEligibility(
      vault.borrowedAmount,
      vault.collateralAmount,
      vault.collateralPrice,
      vault.liquidationThreshold,
      buffer
    )

    if (!eligibility.isEligible) {
      throw new Error(`Vault not eligible for support: k_SF = ${eligibility.k_SF}`)
    }

    // Calculate Black-Scholes optimal price
    const params: BlackScholesParams = {
      S: vault.collateralPrice,
      K: vault.collateralPrice * vault.liquidationThreshold, // Liquidation price
      T: (vault.maturityTime - vault.createdAt) / (365 * 24 * 60 * 60 * 1000), // Years
      ...getDefaultMezoParams()
    }

    const bsResult = calculateLambdaStar(params, vault.collateralAmount)
    const collateralDeposited = calculateCollateralRestraint(
      lambda,
      vault.collateralAmount,
      vault.collateralPrice
    )

    const support: BTCShieldSupport = {
      id: `${vaultId}-${supporter}-${Date.now()}`,
      vaultId,
      supporter,
      lambda,
      lambdaStar: bsResult.lambdaStar,
      collateralDeposited,
      k_re,
      k_SF: eligibility.k_SF,
      buffer,
      createdAt: Date.now(),
      status: 'active'
    }

    this.supports.set(support.id, support)

    // Move vault to pre-maturity phase
    vault.phase = 'pre-maturity'
    vault.currentTime = Date.now()

    return support
  }

  /**
   * Borrower rescue mechanism (Pre-Maturity phase)
   * Borrower pays premium × k_re to terminate early
   */
  rescueVault(vaultId: string, supporterId: string): boolean {
    const vault = this.vaults.get(vaultId)
    const support = this.supports.get(supporterId)

    if (!vault || !support || vault.phase !== 'pre-maturity') {
      return false
    }

    // Calculate early termination cost
    const params: BlackScholesParams = {
      S: vault.collateralPrice,
      K: vault.collateralPrice * vault.liquidationThreshold,
      T: (vault.maturityTime - vault.createdAt) / (365 * 24 * 60 * 60 * 1000),
      ...getDefaultMezoParams()
    }

    const bsResult = calculateLambdaStar(params, vault.collateralAmount)
    const terminationCost = calculateEarlyTerminationCost(bsResult.premium, support.k_re)

    // Update support status
    support.status = 'terminated'

    // Return collateral to supporter
    // In real implementation, this would trigger smart contract calls

    return true
  }

  /**
   * Settle option at maturity
   * Either supporter exercises or defaults
   */
  settleAtMaturity(vaultId: string, supporterId: string, exercise: boolean): boolean {
    const vault = this.vaults.get(vaultId)
    const support = this.supports.get(supporterId)

    if (!vault || !support || vault.phase !== 'maturity') {
      return false
    }

    if (exercise) {
      // Supporter exercises option - takes over vault
      support.status = 'exercised'
      // In real implementation, transfer vault ownership to supporter
    } else {
      // Supporter defaults - return collateral to borrower
      support.status = 'defaulted'
      // In real implementation, trigger fallback liquidation
    }

    return true
  }

  /**
   * Update vault phase based on current time
   */
  updateVaultPhase(vaultId: string): VaultPhase | null {
    const vault = this.vaults.get(vaultId)
    if (!vault) return null

    const now = Date.now()
    vault.currentTime = now

    if (now >= vault.maturityTime) {
      vault.phase = 'maturity'
    } else if (vault.phase === 'initialization' && this.hasActiveSupport(vaultId)) {
      vault.phase = 'pre-maturity'
    }

    return vault.phase
  }

  /**
   * Check if vault has active support
   */
  private hasActiveSupport(vaultId: string): boolean {
    for (const support of this.supports.values()) {
      if (support.vaultId === vaultId && support.status === 'active') {
        return true
      }
    }
    return false
  }

  /**
   * Get vault metrics
   */
  getVaultMetrics(vaultId: string): VaultMetrics | null {
    const vault = this.vaults.get(vaultId)
    if (!vault) return null

    const vaultSupports = Array.from(this.supports.values())
      .filter(s => s.vaultId === vaultId && s.status === 'active')

    const totalCollateralRestraint = vaultSupports.reduce(
      (sum, s) => sum + s.collateralDeposited, 0
    )

    const avgLambda = vaultSupports.length > 0 
      ? vaultSupports.reduce((sum, s) => sum + s.lambda, 0) / vaultSupports.length
      : 0

    const healthFactorRecovery = calculateHealthFactorRecovery(vault.healthFactor, avgLambda)

    // Calculate supporter default probability (simplified)
    const supporterDefaultProbability = Math.max(0, 1 - healthFactorRecovery)

    // Calculate expected supporter profit
    const expectedSupporterProfit = avgLambda * 0.15 // Simplified calculation

    // Calculate liquidation avoidance rate
    const liquidationAvoidanceRate = healthFactorRecovery > 1.2 ? 0.95 : 0.75

    return {
      collateralRestraint: totalCollateralRestraint,
      healthFactorRecovery,
      supporterDefaultProbability,
      expectedSupporterProfit,
      liquidationAvoidanceRate
    }
  }

  /**
   * Run simulation with BTC price history
   */
  runSimulation(
    vaultId: string,
    btcPriceHistory: number[],
    timeSteps: number[]
  ): SimulationResult[] {
    const vault = this.vaults.get(vaultId)
    if (!vault) return []

    const results: SimulationResult[] = []
    const support = Array.from(this.supports.values())
      .find(s => s.vaultId === vaultId && s.status === 'active')

    for (let i = 0; i < btcPriceHistory.length; i++) {
      const btcPrice = btcPriceHistory[i]
      const timestamp = timeSteps[i]

      // Update vault with new price
      const updatedVault = { ...vault, collateralPrice: btcPrice }
      const newHealthFactor = (updatedVault.collateralAmount * btcPrice) / updatedVault.borrowedAmount

      // Calculate λ* for current conditions
      const params: BlackScholesParams = {
        S: btcPrice,
        K: btcPrice * vault.liquidationThreshold,
        T: (vault.maturityTime - timestamp) / (365 * 24 * 60 * 60 * 1000),
        ...getDefaultMezoParams()
      }

      const bsResult = calculateLambdaStar(params, vault.collateralAmount)
      const collateralRestraint = support 
        ? calculateCollateralRestraint(support.lambda, vault.collateralAmount, btcPrice)
        : 0

      // Calculate supporter profit (simplified)
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
   * Get all vaults
   */
  getAllVaults(): MezoVault[] {
    return Array.from(this.vaults.values())
  }

  /**
   * Get all supports
   */
  getAllSupports(): BTCShieldSupport[] {
    return Array.from(this.supports.values())
  }

  /**
   * Get vault by ID
   */
  getVault(vaultId: string): MezoVault | undefined {
    return this.vaults.get(vaultId)
  }

  /**
   * Get support by ID
   */
  getSupport(supportId: string): BTCShieldSupport | undefined {
    return this.supports.get(supportId)
  }
}
