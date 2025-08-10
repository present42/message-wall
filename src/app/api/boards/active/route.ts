import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PostStatus } from '@/types'

export async function GET() {
    try {
        // Get the explicitly active board
        const board = await prisma.board.findFirst({
            where: {
                isActive: true
            },
            include: {
                posts: {
                    where: {
                        status: PostStatus.APPROVED
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        if (!board) {
            return NextResponse.json(
                { error: 'No active board found' },
                { status: 404 }
            )
        }

        return NextResponse.json(board)
    } catch (error) {
        console.error('Error fetching active board:', error)
        return NextResponse.json(
            { error: 'Failed to fetch active board' },
            { status: 500 }
        )
    }
}
