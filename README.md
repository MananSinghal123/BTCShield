# BTCShield - Backstop Protection Implementation

A professional implementation of the BTCShield backstop protection system using reversible call options adapted for Mezo Network's BTC lending ecosystem.

## 🎯 Overview

BTCShield implements a three-phase backstop mechanism to mitigate DeFi liquidations through reversible call options, specifically designed for Mezo Network's BTC/MUSD lending environment. The design draws on the academic foundation of reversible call options for liquidation mitigation, with an adapted Black‑Scholes pricing layer for premium calibration.

Reference (open-access): [Mitigating Decentralized Finance Liquidations with Reversible Call Options](https://arxiv.org/pdf/2303.15162)

## 🔑 Key Features

- **Three-Phase System**: Initialization → Pre-Maturity → Maturity
- **Black-Scholes Pricing**: λ* (optimal λ to check whether supporting is profitable)
- **Premium (φ)**: Supporters deposit λ × C_t0
 `λ = (Expected Liquidation Loss + Safety Margin)/C_t0`
- **Early Termination**: k_re factor for borrower termination prior to maturity
- **Real-time Analytics**: Forward liquidation risk, health indices, and simulations

## 📚 BTCShield Backstop Implementation

### Core Formula (adapted premium)

```
λ* = (p_t0 e^(–r_f T) N(d1) – K e^(–IL T) N(d2)) / (C_t0 · p_t0)
```

Where:
- `λ*` = optimal premium factor
- `p_t0` = current BTC price
- `K` = liquidation (strike) price
- `T` = time to maturity (in years)
- `r_f` = risk‑free/foreign rate
- `IL` = protocol borrowing interest (effective interest on outstanding debt)
- `N(d1), N(d2)` = standard normal cumulative distribution

**Note on Black–Scholes usage**
We adapt Black–Scholes to estimate `λ*` as an approximation. Assumptions: log‑normal pricing, continuous trading, frictionless markets. Crypto markets deviate from these assumptions; treat outputs as indicative. Inputs: volatility `σ` estimated from historical BTC returns (default: 30‑day rolling), time to maturity `T` expressed in years (e.g., 6 hours = 6/8760), `r_f` a risk‑free rate, and `IL` the protocol borrowing interest rate. See `docs/pricing.md` for parameter defaults and estimation details.

### Lifecycle Phases

1) **Initialization**
- Trigger: health factor < 1 (position becomes undercollateralized)
- Action: supporters can deposit `λ × C_t0`

2) **Pre‑Maturity**
- Borrower may “terminate” by paying `C_re​=λ⋅C_t0​⋅(1+I_L​)⋅k_re` (0 < k_re < 1)
(0 < IL < 1 is the interest rate which B agreed to pay for its loan when
initiating the position P)

3) **Maturity**
- Supporter either exercises (takes position) or default hence loses the premium φ 
- If exercised: supporter assumes position; otherwise, fallback liquidation

### Lifecycle → UI mapping
- **Initialization** (health factor < 1): UI badge “Initialization”. Actions: supporter can “Support Position” (deposit `λ·C_t0`). Borrower “Request Rescue” remains disabled until Pre‑Maturity.
- **Pre‑Maturity** (`t0 < t < T`): UI badge “Pre‑Maturity – Termination available”. Actions: borrower may “Terminate” by paying `C_re​=λ⋅C_t0​⋅(1+I_L​)⋅k_re`; supporter early exit (if implemented) may require penalty.
- **Maturity** (`t = T`): UI badge “Maturity”. Actions: supporter can “Exercise” (take over vault if ITM) or “Default” (vault falls back to native liquidation).

## 🏗️ Architecture

### Core Modules

- Pricing engine (Black‑Scholes adaptation, λ*)
- Backstop manager (phase transitions, support/rescue/settle flows)
- Simulation engine (BTC price paths, health/risk trajectories)
- UI components (dashboard, risk panels, supporter flows)

### Data Flow

1. **Position Monitoring**: track health factor and thresholds
2. **Backstop Provision**: accept support with premium λ
3. **Phase Transitions**: by time and state (init → pre‑maturity → maturity)
4. **Settlement**: exercise vs. fallback handling

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

- **Collateral Restraint**: Total BTC locked by supporters
- **Health Factor Recovery**: Average improvement through support
- **Liquidation Avoidance Rate**: Percentage of mitigations
- **Supporter Default Probability**: Counterparty risk proxy

### Risk Analytics

- **λ* vs λ Comparison**: Pricing alignment check
- **Stress Tests**: BTC price shock scenarios

**Note:** Greeks (Delta, Gamma, Theta, Vega) and VaR/ES are planned/experimental features. If enabled, see `docs/analytics.md` for methodology, assumptions, and limitations.

## 🔧 API / Engine Examples

### Backstop Manager (examples)

```typescript
// Create position
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

// Borrower rescue
vaultManager.rescueVault('vault-1', 'support-id')

// Settlement at maturity
vaultManager.settleAtMaturity('vault-1', 'support-id', true)
```

### Pricing Engine (λ* calculation)

```typescript
const result = calculateLambdaStar({
  S: 67420,        // current BTC price
  K: 57307,        // liquidation price
  T: 0.0137,       // time to maturity in years (≈ 6 hours)
  r_f: 0.05,       // risk‑free rate
  IL: 0.02,        // protocol borrowing interest rate
  sigma: 0.4       // volatility
}, 2.5) // collateral amount

console.log(result.lambdaStar)
```

### Simulation Engine (sketch)

```typescript
const results = simulationEngine.runSimulation({
  vault,
  support,
  btcPriceHistory: [65000, 66000, 67000, 67420],
  timeSteps: [t1, t2, t3, t4]
})

const metrics = simulationEngine.calculateProtocolMetrics(vaults, supports, currentBtcPrice)
```

## 🎨 UI Components

- **BTCShieldVault**: Phase indicators and actions (support, rescue, settle)
- **Supporter Panel**: λ vs λ* and ROI visuals
- **Risk Engine Panel**: Health indices, liquidation probabilities, forecasts

## 📈 Simulation & Analysis

- **Collateral Release Reduction**: Preserved collateral under backstop
- **Health Factor Recovery**: Trajectory with support
- **Supporter Profitability**: ROI distributions
- **Scenario Tests**: Shock trajectories and recovery

Simulation results adapted from Qin et al. (2023) indicate reversible‑call backstops can substantially reduce collateral release under certain parameter settings. BTCShield implements the same primitive; the exact benefit depends on chosen parameters (`λ`, `ΔT`, buffer `B`), asset liquidity, and market conditions. See `docs/simulations.md` for replication setup, datasets, and assumptions.

## 🔒 Security Considerations

### Smart Contract Integration (future‑ready)

- **Collateral Locking**: Supporters’ collateral until maturity
- **Automatic Settlement**: Time‑based state transitions
- **Fallback Mechanism**: Fallback liquidation if supporter defaults

### Risk Management

- **Support Eligibility**: k_SF reduces over‑exposure
- **Buffer System**: B > 1 safety margin
- **Early Termination**: k_re enables borrower rescue

**Fallback & buffer**
BTCShield is layered atop Mezo’s native liquidation. If no supporter steps in or a supporter defaults at maturity, the system falls back to native liquidation rules. The buffer parameter `B > 1` tunes eligibility: only positions with `k_SF = CR_t0(P) · (θ + B) < 1` are eligible. See `docs/parameters.md` for demo defaults.

**Oracles & Data Integrity**
BTCShield relies on on‑chain oracles (e.g., Pyth / Stork). We suggest aggregating sources and using short TWAP fallbacks and sanity checks (max price delta per block) to mitigate flash‑feeds and oracle manipulation. See `docs/oracles.md` for details.

## 🧪 Testing

```bash
npm test
```

## 📑 References

- Qin, K., Ernstberger, J., Zhou, L., Jovanovic, P., Gervais, A. “Mitigating Decentralized Finance Liquidations with Reversible Call Options.” 2023. [arXiv:2303.15162](https://arxiv.org/pdf/2303.15162)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement features aligned with reversible‑call backstops (see `docs/spec.md`); avoid using the paper’s naming in code or UI
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**BTCShield** - Professional Backstop Protection for Mezo Network
