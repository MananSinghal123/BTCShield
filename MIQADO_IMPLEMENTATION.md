# BTCShield Supporter/Backstop Feature Implementation

## Overview

This implementation enhances the BTCShield frontend and backend to fully integrate the BTCShield supporter/backstop feature **without implementing smart contracts yet**. The system uses mock data to simulate BTC/MUSD lending, borrowing, liquidation, and supporter contributions.

## 🎯 Goals Achieved

- ✅ Allow any user to act as a supporter and temporarily back undercollateralized positions (simulated)
- ✅ Update liquidation probability and risk analytics dynamically as supporters join
- ✅ Maintain institutional-grade dark + glassmorphism theme and BTCShield design
- ✅ Prepare backend and frontend to **plug in real smart contracts later**

## 🏗️ Architecture

### Backend (TypeScript + Node.js / Express)

#### API Endpoints Implemented

1. **`POST /api/v1/support/support`**
   - Simulates supporter deposit for a position
   - Validates support parameters (λ, k_re, buffer)
   - Calculates Miqado λ pricing formula
   - Updates vault phase from initialization to pre-maturity

2. **`GET /api/v1/support/supporters/:positionId`**
   - Fetches active supporters for a specific position
   - Returns supporter details, expected returns, time remaining
   - Calculates total collateral locked and average λ factors

3. **`GET /api/v1/support/risk/:positionId`**
   - Calculates liquidation probability considering supporter contributions
   - Implements BTCShield λ pricing formula: λ* = (p_t0 e^(–r_f T) N(d1) – K e^(–IL T) N(d2)) / (C_t0 · p_t0)
   - Provides forward-looking liquidation probability
   - Calculates Backstop Health Index and Collateral Efficiency Score

4. **`GET /api/v1/support/positions`**
   - Returns all positions with their supporter status
   - Includes summary statistics and health factors

5. **`POST /api/v1/support/simulate`**
   - Runs 30-day simulation with mock BTC price movements
   - Updates liquidation probability and health factor in real-time
   - Shows supporter impact visually

#### Key Backend Components

- **`BTCShieldVaultManager`**: Core vault management with three-phase system
- **Black-Scholes Calculations**: Simplified implementation for λ* pricing
- **Mock Data**: Realistic BTC/MUSD positions and supporter data
- **Real-time Updates**: WebSocket integration for live data streaming

### Frontend (Next.js + TypeScript + Tailwind + Recharts + Framer Motion)

#### Components Implemented

1. **`SupporterTable`**
   - Displays active supporters with real-time data
   - Shows supporter details, amount locked, expected return, time remaining
   - Auto-refreshes every 30 seconds

2. **`SupportPositionModal`**
   - Interactive modal for supporting positions
   - Real-time calculation of expected profit and risk reduction
   - Parameter adjustment (λ, k_re, buffer) with instant feedback
   - Simulates support submission

3. **`RiskEnginePanel`**
   - Enhanced risk analytics with supporter impact
   - Forward-looking liquidation probability
   - Backstop Health Index and Collateral Efficiency Score
   - 30-day simulation charts with Recharts

4. **`SimulationModeToggle`**
   - Toggle for simulation mode with configurable parameters
   - Adjustable simulation speed and BTC price volatility
   - Real-time impact visualization

5. **`EnhancedDashboard`**
   - Main supporter dashboard with position overview
   - Summary statistics and health factor monitoring
   - Integration of all supporter components

#### Design Features

- **Dark + Glassmorphism Theme**: Maintains institutional-grade appearance
- **Rounded-2xl Cards**: Consistent with Mezo design language
- **Smooth Motion Transitions**: Framer Motion animations throughout
- **Real-time Updates**: Live data refresh and WebSocket integration
- **Responsive Design**: Works on desktop and mobile

## 🔧 Technical Implementation

### BTCShield λ Pricing Formula

The implementation includes the core BTCShield pricing formula:

```
λ* = (p_t0 e^(–r_f T) N(d1) – K e^(–IL T) N(d2)) / (C_t0 · p_t0)
```

Where:
- `p_t0`: Current BTC price
- `K`: Strike price (liquidation price)
- `T`: Time to maturity
- `r_f`: Risk-free rate (5%)
- `IL`: Impermanent loss rate (2%)
- `σ`: Volatility (25%)
- `C_t0`: Collateral amount

### Three-Phase System

1. **Initialization Phase**: Vault created when health factor < 1, supporters can join
2. **Pre-Maturity Phase**: Active support, borrower can rescue with early termination cost
3. **Maturity Phase**: Settlement - supporter exercises or defaults

### Risk Calculations

- **Liquidation Probability**: `e^(-λ * health_factor)`
- **Backstop Health Index**: Measures overall position stability (0-100)
- **Collateral Efficiency Score**: Collateral utilization vs. liquidation threshold (0-100)
- **Supporter Impact**: Dynamic health factor improvement calculation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Backend Setup**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   npm install
   npm run dev
   ```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/v1
- **WebSocket Stream**: ws://localhost:4000/api/v1/stream

### Navigation

1. Open the dashboard at http://localhost:3000
2. Navigate to "BTCShield Supporters" tab
3. Toggle simulation mode for real-time updates
4. Click "Support Position" to add supporter backing
5. View real-time risk analytics and supporter impact

## 📊 Mock Data

The system includes realistic mock data:

- **5 BTC Vaults**: Various health factors and phases
- **3 Active Supporters**: Different λ factors and collateral amounts
- **Real-time Price Simulation**: BTC price volatility simulation
- **Dynamic Health Factors**: Updates based on supporter contributions

## 🔮 Smart Contract Integration Ready

The implementation is designed for easy smart contract integration:

- **Modular API Design**: Easy to replace mock data with real blockchain calls
- **Type-Safe Interfaces**: All data structures match expected smart contract formats
- **Event-Driven Architecture**: Ready for blockchain event subscriptions
- **WebSocket Integration**: Real-time updates compatible with blockchain events

## 🎨 UI/UX Features

- **Institutional Grade Design**: Dark theme with glassmorphism effects
- **Real-time Animations**: Smooth transitions and loading states
- **Interactive Charts**: Recharts integration for risk visualization
- **Responsive Layout**: Works on all device sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 📈 Simulation Features

- **30-Day Price Simulation**: Mock BTC price movements
- **Dynamic Risk Updates**: Real-time liquidation probability changes
- **Supporter Impact Visualization**: Charts showing risk mitigation
- **Configurable Parameters**: Adjustable volatility and simulation speed

## 🔒 Security Considerations

- **Input Validation**: Zod schemas for all API endpoints
- **Error Handling**: Comprehensive error handling and user feedback
- **Mock Data Safety**: No real transactions or funds at risk
- **Type Safety**: Full TypeScript implementation

## 🚧 Future Enhancements

1. **Smart Contract Integration**: Replace mock data with real Mezo devnet contracts
2. **Advanced Analytics**: More sophisticated risk models
3. **Multi-Asset Support**: Extend beyond BTC/MUSD
4. **Portfolio Management**: Advanced supporter portfolio tracking
5. **Mobile App**: React Native mobile application

## 📝 API Documentation

### Support Endpoints

```typescript
// Add support to a position
POST /api/v1/support/support
Body: {
  positionId: string,
  supporterAddress: string,
  lambda: number (0.01-1.0),
  k_re?: number (0.1-1.0, default: 0.8),
  buffer?: number (1.0-2.0, default: 1.1)
}

// Get supporters for a position
GET /api/v1/support/supporters/:positionId

// Get risk metrics for a position
GET /api/v1/support/risk/:positionId

// Get all positions
GET /api/v1/support/positions

// Run simulation
POST /api/v1/support/simulate
Body: {
  positionId: string,
  simulationDays?: number (default: 30),
  priceVolatility?: number (default: 0.25)
}
```

## 🎯 Success Metrics

- ✅ **Functionality**: All supporter features working with mock data
- ✅ **Performance**: Real-time updates and smooth animations
- ✅ **Design**: Institutional-grade dark theme maintained
- ✅ **Modularity**: Ready for smart contract integration
- ✅ **User Experience**: Intuitive interface with comprehensive feedback

The implementation successfully demonstrates the complete BTCShield supporter/backstop mechanism with a professional, institutional-grade interface ready for real smart contract integration.
