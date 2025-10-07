# BTCShield - Backstop Protection Implementation

A professional implementation of the BTCShield backstop protection system using reversible call options adapted for Mezo Network's BTC lending ecosystem.

## 🎯 Overview

BTCShield implements a three-phase backstop mechanism to mitigate DeFi liquidations through reversible call options, specifically designed for Mezo Network's BTC/MUSD lending environment.

### Key Features

- **Three-Phase System**: Initialization → Pre-Maturity → Maturity
- **Black-Scholes Pricing**: λ* calculation using adapted Black-Scholes formula
- **Collateral Restraint**: Supporters deposit λ × C_t0 × p_t0
- **Early Termination**: k_re factor for borrower rescue mechanism
- **Fallback Buffer**: k_SF eligibility and buffer system
- **Real-time Analytics**: Comprehensive risk metrics and simulations

## 📚 BTCShield Backstop Implementation

### Core Formula

The implementation uses the Black-Scholes adapted formula from the paper:

```
λ* = (p_t0 e^(–r_f T) N(d1) – K e^(–IL T) N(d2)) / (C_t0 · p_t0)
```

Where:
- `λ*` = Optimal premium factor
- `p_t0` = Current BTC price
- `K` = Liquidation price (strike price)
- `T` = Time to maturity
- `r_f` = Risk-free rate
- `IL` = Impermanent loss rate
- `N(d1), N(d2)` = Cumulative normal distribution

### Three Phases

#### 1. Initialization Phase
- Triggered when health factor < 1
- Supporters can deposit `λ × C_t0 × p_t0`
- Support eligibility: `k_SF = CR_t0(P) · (θ + B) < 1`

#### 2. Pre-Maturity Phase
- Borrower can "rescue" by paying `premium × k_re`
- Early termination factor: `0 < k_re < 1`
- Vault remains supported until maturity

#### 3. Maturity Phase
- Supporter can exercise option or default
- If exercised: supporter takes over vault
- If defaulted: fallback to native liquidation

## 🏗️ Architecture

### Core Components

```
lib/miqado/
├── blackScholes.ts      # Black-Scholes pricing engine
├── vaultManager.ts      # Three-phase vault management
└── simulationEngine.ts  # BTC price simulation & analysis

components/miqado/
├── MiqadoVault.tsx      # Three-phase vault interface
└── SupporterInterface.tsx # λ vs λ* analysis

types/
└── index.ts            # Miqado-specific type definitions
```

### Data Flow

1. **Vault Creation**: Health factor < 1 triggers initialization
2. **Support Addition**: Supporters deposit collateral with λ premium
3. **Phase Transitions**: Automatic progression based on time and conditions
4. **Settlement**: Exercise or default at maturity

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Key Metrics

### Protocol Metrics

- **Collateral Restraint**: Total BTC locked by supporters
- **Health Factor Recovery**: Average improvement through support
- **Liquidation Avoidance Rate**: Percentage of successful mitigations
- **Supporter Default Rate**: Risk assessment for supporters

### Risk Analytics

- **λ* vs λ Comparison**: Real-time pricing analysis
- **Black-Scholes Greeks**: Delta, Gamma, Theta, Vega
- **VaR/ES Calculations**: Value at Risk and Expected Shortfall
- **Stress Testing**: BTC price shock scenarios

## 🔧 API Reference

### BTCShieldVaultManager

```typescript
// Create vault
const vault = vaultManager.createVault({
  id: 'vault-1',
  borrower: '0x...',
  collateralAmount: 2.5,
  borrowedAmount: 150000,
  collateralPrice: 67420,
  liquidationThreshold: 0.85,
  healthFactor: 1.12
})

// Add support
const support = vaultManager.addSupport(
  'vault-1',
  'supporter-address',
  0.15, // lambda
  0.8,  // k_re
  1.1   // buffer
)

// Rescue vault
vaultManager.rescueVault('vault-1', 'support-id')

// Settle at maturity
vaultManager.settleAtMaturity('vault-1', 'support-id', true)
```

### Black-Scholes Engine

```typescript
// Calculate optimal λ*
const result = calculateLambdaStar({
  S: 67420,        // Current BTC price
  K: 57307,        // Liquidation price
  T: 0.0137,       // Time to maturity (years)
  r_f: 0.05,       // Risk-free rate
  IL: 0.02,        // Impermanent loss
  sigma: 0.4       // Volatility
}, 2.5) // Collateral amount

console.log(result.lambdaStar) // 0.18 (18%)
```

### Simulation Engine

```typescript
// Run comprehensive simulation
const results = simulationEngine.runSimulation({
  vault: vault,
  support: support,
  btcPriceHistory: [65000, 66000, 67000, 67420],
  timeSteps: [t1, t2, t3, t4]
})

// Calculate protocol metrics
const metrics = simulationEngine.calculateProtocolMetrics(
  vaults, supports, currentBtcPrice
)
```

## 🎨 UI Components

### BTCShieldVault

Displays vault state with three-phase indicators:
- **Initialization**: Yellow badge, support button
- **Pre-Maturity**: Blue badge, rescue button
- **Maturity**: Purple badge, exercise/default buttons

### SupporterInterface

Interactive λ vs λ* analysis:
- Real-time Black-Scholes calculation
- Risk metrics (profit probability, max loss)
- Greeks display (d1, d2, N(d1), N(d2))
- Historical λ* trend chart

## 📈 Simulation & Analysis

### BTC Price History Analysis

The simulation engine analyzes historical BTC price movements to estimate:

- **Collateral Release Reduction**: How much collateral is preserved
- **Health Factor Recovery**: Improvement in vault health
- **Supporter Default Probability**: Risk of supporter failure
- **Expected Supporter Profit**: Average returns

### Stress Testing

Multiple scenarios tested:
- **Mild Shock**: ±10% BTC price movement
- **Moderate Shock**: ±20% BTC price movement  
- **Severe Shock**: ±30% BTC price movement

### Risk Metrics

- **Value at Risk (VaR)**: 95% confidence level
- **Expected Shortfall (ES)**: Tail risk assessment
- **Greeks Analysis**: Sensitivity to market parameters

## 🔒 Security Considerations

### Smart Contract Integration

The frontend is designed to integrate with Mezo Network smart contracts:

- **Collateral Locking**: Supporters' collateral locked until maturity
- **Automatic Settlement**: Time-based phase transitions
- **Fallback Mechanism**: Native liquidation if supporter defaults

### Risk Management

- **Support Eligibility**: k_SF factor prevents over-leveraging
- **Buffer System**: B > 1 provides safety margin
- **Early Termination**: k_re factor allows borrower rescue

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Simulation Tests

```bash
npm run test:simulation
```

### Integration Tests

```bash
npm run test:integration
```

## 📝 Paper References

This implementation is based on:

> Qin, K., Zhou, L., Gamal, A. E., & Gervais, A. (2022). Mitigating DeFi Liquidations with Reversible Call Options. *Proceedings of the 2022 ACM SIGSAC Conference on Computer and Communications Security*.

### Key Equations Implemented

- **Equation 1**: λ* pricing formula
- **Equation 8**: Support eligibility k_SF
- **Equation 12**: Health factor recovery
- **Appendix A**: Black-Scholes adaptation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement Miqado paper features
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Qin et al. for the original Miqado paper
- Mezo Network for the BTC lending infrastructure
- Black-Scholes model for option pricing foundation

---

**BTCShield** - Professional Backstop Protection for Mezo Network