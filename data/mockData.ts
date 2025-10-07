import { 
  MezoVault, 
  BTCShieldSupport, 
  VaultPhase, 
  KPI, 
  ChartData,
  VaultMetrics,
  SimulationResult,
  BTCShieldOption,
  Loan
} from '@/types';

export const mockKPIs: KPI[] = [
  {
    id: '1',
    title: 'Total Collateral Restrained',
    value: '$2.4M',
    change: 8.2,
    changeType: 'positive',
    description: 'Total BTC collateral currently restrained by BTCShield supporters',
    trend: [1.8, 2.0, 1.9, 2.2, 2.4, 2.3, 2.5, 2.4]
  },
  {
    id: '2',
    title: 'Active Vaults',
    value: 47,
    change: 12.5,
    changeType: 'positive',
    description: 'Number of BTC vaults currently supported by BTCShield',
    trend: [35, 38, 42, 45, 47, 46, 48, 47]
  },
  {
    id: '3',
    title: 'Avg Health Factor Recovery',
    value: '1.85',
    change: 5.2,
    changeType: 'positive',
    description: 'Average health factor improvement through BTCShield support',
    trend: [1.65, 1.70, 1.75, 1.80, 1.85, 1.83, 1.87, 1.85]
  },
  {
    id: '4',
    title: 'Liquidation Avoidance Rate',
    value: '94.8%',
    change: 2.1,
    changeType: 'positive',
    description: 'Percentage of vaults that avoided liquidation through BTCShield',
    trend: [92, 93, 94, 94.5, 94.8, 94.6, 95.0, 94.8]
  },
  {
    id: '5',
    title: 'Supporter Default Rate',
    value: '3.2%',
    change: -1.4,
    changeType: 'positive',
    description: 'Percentage of supporters who defaulted on their obligations',
    trend: [5.1, 4.8, 4.2, 3.8, 3.5, 3.4, 3.2, 3.2]
  }
];

export const mockMezoVaults: MezoVault[] = [
  {
    id: '1',
    borrower: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    collateral: 'BTC',
    borrowedAsset: 'MUSD',
    collateralAmount: 2.5,
    borrowedAmount: 150000,
    collateralPrice: 67420,
    liquidationThreshold: 0.85,
    healthFactor: 1.12,
    phase: 'initialization',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    maturityTime: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
    currentTime: Date.now()
  },
  {
    id: '2',
    borrower: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    collateral: 'BTC',
    borrowedAsset: 'MUSD',
    collateralAmount: 1.8,
    borrowedAmount: 95000,
    collateralPrice: 67420,
    liquidationThreshold: 0.80,
    healthFactor: 1.28,
    phase: 'pre-maturity',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    maturityTime: Date.now() + 4 * 24 * 60 * 60 * 1000, // 4 days from now
    currentTime: Date.now()
  },
  {
    id: '3',
    borrower: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    collateral: 'BTC',
    borrowedAsset: 'MUSD',
    collateralAmount: 3.2,
    borrowedAmount: 180000,
    collateralPrice: 67420,
    liquidationThreshold: 0.75,
    healthFactor: 1.20,
    phase: 'initialization',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    maturityTime: Date.now() + 6 * 24 * 60 * 60 * 1000, // 6 days from now
    currentTime: Date.now()
  },
  {
    id: '4',
    borrower: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    collateral: 'BTC',
    borrowedAsset: 'MUSD',
    collateralAmount: 1.5,
    borrowedAmount: 85000,
    collateralPrice: 67420,
    liquidationThreshold: 0.82,
    healthFactor: 1.19,
    phase: 'maturity',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    maturityTime: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
    currentTime: Date.now()
  },
  {
    id: '5',
    borrower: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    collateral: 'BTC',
    borrowedAsset: 'MUSD',
    collateralAmount: 2.1,
    borrowedAmount: 120000,
    collateralPrice: 67420,
    liquidationThreshold: 0.78,
    healthFactor: 1.18,
    phase: 'pre-maturity',
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
    maturityTime: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
    currentTime: Date.now()
  }
];

export const mockBTCShieldSupports: BTCShieldSupport[] = [
  {
    id: '1',
    vaultId: '2',
    supporter: '0x1234567890123456789012345678901234567890',
    lambda: 0.15,
    lambdaStar: 0.18,
    collateralDeposited: 18150,
    k_re: 0.8,
    k_SF: 0.95,
    buffer: 1.1,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    status: 'active'
  },
  {
    id: '2',
    vaultId: '5',
    supporter: '0x2345678901234567890123456789012345678901',
    lambda: 0.12,
    lambdaStar: 0.14,
    collateralDeposited: 16980,
    k_re: 0.75,
    k_SF: 0.92,
    buffer: 1.1,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    status: 'active'
  },
  {
    id: '3',
    vaultId: '4',
    supporter: '0x3456789012345678901234567890123456789012',
    lambda: 0.20,
    lambdaStar: 0.22,
    collateralDeposited: 20226,
    k_re: 0.85,
    k_SF: 0.98,
    buffer: 1.1,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    status: 'active'
  }
];

export const collateralRestrainedData: ChartData[] = [
  { name: 'Jan', value: 8.2, category: 'Restrained' },
  { name: 'Feb', value: 9.1, category: 'Restrained' },
  { name: 'Mar', value: 7.8, category: 'Restrained' },
  { name: 'Apr', value: 10.5, category: 'Restrained' },
  { name: 'May', value: 11.2, category: 'Restrained' },
  { name: 'Jun', value: 12.4, category: 'Restrained' },
  { name: 'Jan', value: 2.1, category: 'Released' },
  { name: 'Feb', value: 2.8, category: 'Released' },
  { name: 'Mar', value: 3.2, category: 'Released' },
  { name: 'Apr', value: 2.9, category: 'Released' },
  { name: 'May', value: 3.5, category: 'Released' },
  { name: 'Jun', value: 4.1, category: 'Released' }
];

export const healthFactorDistribution: ChartData[] = [
  { name: '0-1', value: 45 },
  { name: '1-1.5', value: 120 },
  { name: '1.5-2', value: 180 },
  { name: '2-2.5', value: 280 },
  { name: '2.5-3', value: 320 },
  { name: '3-3.5', value: 220 },
  { name: '3.5+', value: 80 }
];

export const supporterROIData: ChartData[] = [
  { name: 'Jan', value: 12.5 },
  { name: 'Feb', value: 14.2 },
  { name: 'Mar', value: 13.8 },
  { name: 'Apr', value: 16.1 },
  { name: 'May', value: 17.3 },
  { name: 'Jun', value: 18.7 }
];

export const liquidationProbabilityData: ChartData[] = [
  { name: '1 Day', value: 0.05 },
  { name: '3 Days', value: 0.12 },
  { name: '1 Week', value: 0.18 },
  { name: '2 Weeks', value: 0.25 },
  { name: '1 Month', value: 0.32 },
  { name: '3 Months', value: 0.45 }
];

export const mockBTCShieldOptions: BTCShieldOption[] = [
  {
    id: '1',
    collateral: 'BTC',
    borrowedAsset: 'MUSD',
    collateralAmount: 2.5,
    borrowedAmount: 150000,
    collateralPrice: 67420,
    liquidationThreshold: 0.85,
    healthFactor: 1.12,
    riskLevel: 'high',
    expectedPayoff: 18750,
    supporterCount: 3,
    timeRemaining: 5 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    maturityTime: Date.now() + 5 * 24 * 60 * 60 * 1000
  },
  {
    id: '2',
    collateral: 'BTC',
    borrowedAsset: 'MUSD',
    collateralAmount: 1.8,
    borrowedAmount: 95000,
    collateralPrice: 67420,
    liquidationThreshold: 0.80,
    healthFactor: 1.28,
    riskLevel: 'medium',
    expectedPayoff: 12160,
    supporterCount: 2,
    timeRemaining: 4 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    maturityTime: Date.now() + 4 * 24 * 60 * 60 * 1000
  },
  {
    id: '3',
    collateral: 'BTC',
    borrowedAsset: 'MUSD',
    collateralAmount: 3.2,
    borrowedAmount: 180000,
    collateralPrice: 67420,
    liquidationThreshold: 0.75,
    healthFactor: 1.20,
    riskLevel: 'high',
    expectedPayoff: 25920,
    supporterCount: 5,
    timeRemaining: 6 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    maturityTime: Date.now() + 6 * 24 * 60 * 60 * 1000
  }
];

export const mockLoans: Loan[] = [
  {
    id: '1',
    borrower: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    collateral: 'BTC',
    borrowedAsset: 'MUSD',
    collateralAmount: 2.5,
    borrowedAmount: 150000,
    collateralPrice: 67420,
    liquidationThreshold: 0.85,
    healthFactor: 1.12,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    maturityTime: Date.now() + 5 * 24 * 60 * 60 * 1000
  }
];