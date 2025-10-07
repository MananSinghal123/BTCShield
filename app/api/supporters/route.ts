import { NextRequest, NextResponse } from 'next/server'

// Mock supporters data linked to positions
const supporters = [
	{ id: 1, positionId: 1, supporter: 'Alice', amountLocked: 0.5, expectedReturn: 0.02, timeRemaining: 3600 },
	{ id: 2, positionId: 2, supporter: 'Bob', amountLocked: 1, expectedReturn: 0.03, timeRemaining: 7200 },
	{ id: 3, positionId: 1, supporter: 'Carol', amountLocked: 0.2, expectedReturn: 0.01, timeRemaining: 5400 },
]

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const positionIdParam = searchParams.get('positionId')
	let data = supporters
	if (positionIdParam) {
		const idNum = Number(positionIdParam)
		if (!Number.isNaN(idNum)) {
			data = supporters.filter(s => s.positionId === idNum)
		}
	}
	return NextResponse.json({ success: true, supporters: data })
}
