// BTCShield Backstop Implementation Types

export type VaultPhase = 'initialization' | 'pre-maturity' | 'maturity';

export interface MezoVault {
  id: string;
  borrower: string;
  collateral: 'BTC';
  borrowedAsset: 'MUSD';
  collateralAmount: number; // C_t0 in paper
  borrowedAmount: number; // P in paper
  collateralPrice: number; // p_t0 in paper
  liquidationThreshold: number; // θ in paper
  healthFactor: number; // HF = (C_t0 * p_t0) / P
  phase: VaultPhase;
  createdAt: number; // t0
  maturityTime: number; // T
  currentTime: number; // t
}

export interface BTCShieldSupport {
  id: string;
  vaultId: string;
  supporter: string;
  lambda: number; // λ - premium factor
  lambdaStar: number; // λ* - Black-Scholes optimal price
  collateralDeposited: number; // λ * C_t0 * p_t0
  k_re: number; // Early termination factor (0 < k_re < 1)
  k_SF: number; // Support eligibility factor
  buffer: number; // B > 1
  createdAt: number;
  status: 'active' | 'terminated' | 'exercised' | 'defaulted';
}

export interface BlackScholesParams {
  S: number; // Current price (p_t0)
  K: number; // Strike price (liquidation price)
  T: number; // Time to maturity
  r_f: number; // Risk-free rate
  IL: number; // Impermanent loss rate
  sigma: number; // Volatility
}

export interface BlackScholesResult {
  lambdaStar: number; // Optimal λ
  d1: number;
  d2: number;
  N_d1: number; // N(d1)
  N_d2: number; // N(d2)
  premium: number; // Option premium
}

export interface VaultMetrics {
  collateralRestraint: number; // Total collateral locked
  healthFactorRecovery: number; // Recovery rate
  supporterDefaultProbability: number;
  expectedSupporterProfit: number;
  liquidationAvoidanceRate: number;
}

export interface SimulationResult {
  timestamp: number;
  btcPrice: number;
  healthFactor: number;
  lambdaStar: number;
  collateralRestraint: number;
  supporterProfit: number;
}

export interface KPI {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  description: string;
  trend?: number[];
}

export interface ChartData {
  name: string;
  value: number;
  category?: string;
  date?: string;
}

export interface RiskMetrics {
  healthFactor: number;
  liquidationThreshold: number;
  collateralRatio: number;
  liquidationProbability: number;
}

export interface PortfolioSummary {
  totalCollateralRestrained: number;
  totalLoansActive: number;
  avgHealthFactor: number;
  liquidationAvoidanceRate: number;
  supporterROI: number;
}

export interface BTCShieldOption {
  id: string;
  collateral: string;
  borrowedAsset: string;
  collateralAmount: number;
  borrowedAmount: number;
  collateralPrice: number;
  liquidationThreshold: number;
  healthFactor: number;
  riskLevel: 'low' | 'medium' | 'high';
  expectedPayoff: number;
  supporterCount: number;
  timeRemaining: number;
  createdAt: number;
  maturityTime: number;
}

export interface Loan {
  id: string;
  borrower: string;
  collateral: string;
  borrowedAsset: string;
  collateralAmount: number;
  borrowedAmount: number;
  collateralPrice: number;
  liquidationThreshold: number;
  healthFactor: number;
  createdAt: number;
  maturityTime: number;
}