import { BlackScholesParams, BlackScholesResult } from '@/types'

/**
 * Black-Scholes adapted pricing for BTCShield options
 * Implements the formula for reversible call options:
 * λ* = (p_t0 e^(–r_f T) N(d1) – K e^(–IL T) N(d2)) / (C_t0 · p_t0)
 */

// Standard normal cumulative distribution function
function normalCDF(x: number): number {
  // Approximation using Abramowitz and Stegun formula
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x >= 0 ? 1 : -1
  x = Math.abs(x) / Math.sqrt(2.0)

  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return 0.5 * (1.0 + sign * y)
}

// Standard normal probability density function
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

/**
 * Calculate d1 and d2 for Black-Scholes formula
 * d1 = [ln(S/K) + (r_f - IL + σ²/2)T] / (σ√T)
 * d2 = d1 - σ√T
 */
function calculateD1D2(params: BlackScholesParams): { d1: number; d2: number } {
  const { S, K, T, r_f, IL, sigma } = params
  
  if (T <= 0 || sigma <= 0) {
    throw new Error('Time to maturity and volatility must be positive')
  }

  const sqrtT = Math.sqrt(T)
  const d1 = (Math.log(S / K) + (r_f - IL + (sigma * sigma) / 2) * T) / (sigma * sqrtT)
  const d2 = d1 - sigma * sqrtT

  return { d1, d2 }
}

/**
 * Calculate λ* (optimal premium factor) using Black-Scholes adaptation
 * λ* = (p_t0 e^(–r_f T) N(d1) – K e^(–IL T) N(d2)) / (C_t0 · p_t0)
 */
export function calculateLambdaStar(
  params: BlackScholesParams,
  collateralAmount: number
): BlackScholesResult {
  const { S, K, T, r_f, IL } = params
  
  // Calculate d1 and d2
  const { d1, d2 } = calculateD1D2(params)
  
  // Calculate N(d1) and N(d2)
  const N_d1 = normalCDF(d1)
  const N_d2 = normalCDF(d2)
  
  // Calculate option premium components
  const premium1 = S * Math.exp(-r_f * T) * N_d1
  const premium2 = K * Math.exp(-IL * T) * N_d2
  const premium = premium1 - premium2
  
  // Calculate λ* = premium / (C_t0 * p_t0)
  const lambdaStar = premium / (collateralAmount * S)
  
  return {
    lambdaStar: Math.max(0, lambdaStar), // Ensure non-negative
    d1,
    d2,
    N_d1,
    N_d2,
    premium
  }
}

/**
 * Calculate support eligibility using k_SF factor
 * k_SF = CR_t0(P) · (θ + B) < 1
 * where CR_t0(P) = P / (C_t0 * p_t0) is the collateral ratio
 */
export function calculateSupportEligibility(
  borrowedAmount: number,
  collateralAmount: number,
  collateralPrice: number,
  liquidationThreshold: number,
  buffer: number = 1.1
): { k_SF: number; isEligible: boolean } {
  const collateralRatio = borrowedAmount / (collateralAmount * collateralPrice)
  const k_SF = collateralRatio * (liquidationThreshold + buffer)
  
  return {
    k_SF,
    isEligible: k_SF < 1
  }
}

/**
 * Calculate early termination cost
 * Cost = premium × k_re
 */
export function calculateEarlyTerminationCost(
  premium: number,
  k_re: number
): number {
  return premium * k_re
}

/**
 * Calculate collateral restraint amount
 * Restraint = λ × C_t0 × p_t0
 */
export function calculateCollateralRestraint(
  lambda: number,
  collateralAmount: number,
  collateralPrice: number
): number {
  return lambda * collateralAmount * collateralPrice
}

/**
 * Calculate health factor recovery
 * New HF = (C_t0 + λ × C_t0) × p_t0 / P
 */
export function calculateHealthFactorRecovery(
  originalHealthFactor: number,
  lambda: number
): number {
  return originalHealthFactor * (1 + lambda)
}

/**
 * Get default market parameters for BTC/MUSD on Mezo
 */
export function getDefaultMezoParams(): Partial<BlackScholesParams> {
  return {
    r_f: 0.05, // 5% risk-free rate
    IL: 0.02, // 2% impermanent loss rate
    sigma: 0.4 // 40% annual volatility for BTC
  }
}

/**
 * Calculate Greeks for risk management
 */
export function calculateGreeks(params: BlackScholesParams): {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
} {
  const { S, K, T, r_f, IL, sigma } = params
  const { d1, d2 } = calculateD1D2(params)
  
  const sqrtT = Math.sqrt(T)
  const N_d1 = normalCDF(d1)
  const N_d2 = normalCDF(d2)
  const n_d1 = normalPDF(d1)
  
  // Delta: ∂λ*/∂S
  const delta = (Math.exp(-r_f * T) * N_d1) / (S * Math.sqrt(2 * Math.PI * T) * sigma)
  
  // Gamma: ∂²λ*/∂S²
  const gamma = (Math.exp(-r_f * T) * n_d1) / (S * S * sigma * sqrtT)
  
  // Theta: ∂λ*/∂T
  const theta = -(S * Math.exp(-r_f * T) * n_d1 * sigma) / (2 * sqrtT) + 
                r_f * S * Math.exp(-r_f * T) * N_d1 - 
                IL * K * Math.exp(-IL * T) * N_d2
  
  // Vega: ∂λ*/∂σ
  const vega = S * Math.exp(-r_f * T) * n_d1 * sqrtT
  
  return { delta, gamma, theta, vega }
}
