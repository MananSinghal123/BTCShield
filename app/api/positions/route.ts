import { NextResponse } from 'next/server'

// Mock positions data for BTCShield demo
const positions = [
	{ id: 1, asset: 'BTC', collateral: 2.5, borrowed: 1.2, leverage: 2.08, liquidationProbability: 0.15 },
	{ id: 2, asset: 'ETH', collateral: 10, borrowed: 6, leverage: 1.67, liquidationProbability: 0.05 },
]

export async function GET() {
	return NextResponse.json({ success: true, positions })
}
