import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

export async function POST(request: NextRequest, context: RouteParams) {
    try {
        const params = await context.params
        const boardId = parseInt(params.id)

        if (isNaN(boardId)) {
            return NextResponse.json(
                { error: 'Invalid board ID' },
                { status: 400 }
            )
        }

        console.log('🔄 Setting active board to:', boardId)

        // Use a transaction to ensure only one board is active at a time
        await prisma.$transaction(async (tx) => {
            // First, set all boards to inactive
            await tx.board.updateMany({
                data: {
                    isActive: false
                }
            })

            // Then set the specified board to active
            await tx.board.update({
                where: {
                    id: boardId
                },
                data: {
                    isActive: true
                }
            })
        })

        console.log('✅ Active board updated successfully')

        // Get the updated board
        const activeBoard = await prisma.board.findUnique({
            where: {
                id: boardId
            },
            include: {
                posts: {
                    where: {
                        status: 'APPROVED'
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Board activated successfully',
            board: activeBoard
        })

    } catch (error) {
        console.error('❌ Error activating board:', error)

        // Handle specific Prisma errors
        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return NextResponse.json(
                { error: 'Board not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to activate board' },
            { status: 500 }
        )
    }
}
