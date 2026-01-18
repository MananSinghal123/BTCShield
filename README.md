# BTCShield - Backstop Protection Implementation

A professional implementation of the BTCShield backstop protection system using reversible call options adapted for Mezo Network's BTC lending ecosystem.

## 🎯 Overview

BTCShield implements a three-phase backstop mechanism to mitigate DeFi liquidations through reversible call options, specifically designed for Mezo Network's BTC/MUSD lending environment. The design draws on the academic foundation of reversible call options for liquidation mitigation.

## 🔑 Key Features

- **Three-Phase System**: Initialization → Pre-Maturity → Maturity
- **Premium (φ)**: Supporters deposit λ × C_t0  
  `λ = (Expected Liquidation Loss + Safety Margin)/C_t0`
- λ* Calculation :
  ```
  λ* = (p_t0 e^(–r_f T) N(d1) – K e^(–I_l T) N(d2)) / (C_t0 · p_t0)
  ```
  Where:
    - `λ*` = optimal λ
    - `p_t0` = spot exchange rate
    - `K` = liquidation (strike) price
    - `T` = time to maturity (in years)
    - `r_f` = risk‑free/foreign rate
    - `I_l` = protocol borrowing interest (effective interest on outstanding debt)
    - `N(d1), N(d2)` = standard normal cumulative distribution

  **Note on λ***: We adapt Black–Scholes to estimate `λ*` as an approximation.

- **Early Termination**: k_re factor for borrower termination prior to maturity
- **Real-time Analytics**: Forward liquidation risk, health indices, and simulations

## 📚 BTCShield Backstop Implementation

### Lifecycle Phases

1. **Initialization**
    - Trigger: health factor < 1.53 (position becomes unhealthy)
    - Action: supporters can deposit `λ × C_t0`
2. **Pre‑Maturity**
    - Borrower may “terminate” by paying `C_re=λ⋅C_t0⋅(1+I_L)⋅k_re` (0 < k_re < 1)
    - (0 < IL < 1 is the interest rate which B agreed to pay for its loan when initiating the position P)
3. **Maturity**
    - Supporter either exercises (takes position) or defaults and loses the premium φ
    - If exercised: supporter assumes position;

## 🏗️ Architecture

### Core Modules
Head over to : ([https://github.com/MananSinghal123/musd](https://github.com/MananSinghal123/musd))
<!-- To be detailed in codebase, e.g., TroveManager, RCOManager, BorrowerOperations, MUSD -->

### Data Flow
<!-- Add diagrams and specs in docs/architecture.md -->

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000/)

## 📊 Key Metrics

### Risk Analytics

- *λ vs λ Comparison*: Pricing alignment check

## 🔧 API / Engine Examples

### Backstop Manager / RCO Manager (examples)
<!-- Example code snippets for creating vaults, adding support, rescue, settlement -->

### Pricing Engine (λ* calculation)
<!-- Example for lambdaStar calculation -->

### Simulation Engine (sketch)
<!-- Example for running simulations and metrics calculation -->

## 🎨 UI Components

- **Dashboard**: Current Position and Borrow operations
- **Support**: Create Support Option and Manage them
- **Marketplace**: Lists Support Options

## 📈 Simulation & Analysis
  (To be included)
- **Health Factor Recovery**: Trajectory with support
- **Supporter Profitability**: ROI distributions


## 🧭 Future Implementations

### 🧾 Order Book–Driven Backstop Allocation

Introducing an **order book–like mechanism** can make BTCShield more efficient, fair, and market-driven — especially when multiple supporters compete to back a position.

#### 1️⃣ Why an Order Book?

**Without it:**
- All supporters are treated equally.
- Early supporters may be overcompensated, while late ones get little or nothing.
- λ is just split evenly, which doesn’t reflect individual risk/reward preferences.

**With an order book:**
- Supporters can bid for their share of backing by specifying:
    - Amount of collateral they’re willing to lock
    - Minimum expected payoff (option premium)
    - Time duration of support
- The protocol then allocates support efficiently, similar to a market auction.

---

#### 2️⃣ How It Works

**Borrower creates a position**, specifying:
- Collateral \( C_{t0} \)
- Desired backstop coverage
- Liquidation threshold

**Supporters submit bids**, indicating:
- λ or fraction of collateral they can support
- Expected return or premium

**Protocol allocates support**:
- Sort bids based on **price/risk efficiency** (highest expected payoff per risk unit).
- Accept bids until total required coverage is reached.
- **Excess bids** are either rejected or queued for the next backstop round.

---

#### 3️⃣ Advantages

- **Dynamic pricing:** λ becomes market-driven rather than fixed.
- **Capital efficiency:** Only required collateral is locked.
- **Fair rewards:** Supporters are compensated according to actual risk exposure.
- **Scalable:** Handles 1 or 100+ supporters without manual tuning.

---

#### 4️⃣ Variants

- **Continuous auction:** Supporters can join/leave dynamically, λ adjusts in real time.
- **Discrete rounds:** New backstop rounds open periodically, λ recalculated each round.
- **Priority-based:** Early supporters get priority but λ scales inversely with participant count.

---

#### ✅ Summary

An **order book–like mechanism** makes λ *market-driven, fair, and dynamically adaptive* in multi-supporter scenarios.

It effectively turns backstopping into a **micro-market**, perfectly aligning incentives among borrowers and supporters.

---

### 📅 Roadmap Position

Planned for **Phase 2** of BTCShield, once the single-supporter and λ calibration layers are validated in production.

## 📑 References

- Qin, K., Ernstberger, J., Zhou, L., Jovanovic, P., Gervais, A. “Mitigating Decentralized Finance Liquidations with Reversible Call Options.” 2023. [arXiv:2303.15162](https://arxiv.org/pdf/2303.15162)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement features aligned with reversible‑call backstops 
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**BTCShield** - Professional Backstop Protection for Mezo Network
