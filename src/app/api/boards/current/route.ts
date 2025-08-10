import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Get the first available board since we don't have isCurrentMain field
        const currentBoard = await prisma.board.findFirst({
            include: {
                posts: {
                    where: {
                        status: 'APPROVED' // Only approved posts
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        if (!currentBoard) {
            return NextResponse.json(
                { error: 'No current board found' },
                { status: 404 }
            )
        }

        return NextResponse.json(currentBoard)
    } catch (error) {
        console.error('Error fetching current board:', error)
        return NextResponse.json(
            { error: 'Failed to fetch current board' },
            { status: 500 }
        )
    }
}
