import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PostStatus } from '@/types'

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

export async function GET(request: NextRequest, context: RouteParams) {
    try {
        const params = await context.params
        const boardId = parseInt(params.id)

        if (isNaN(boardId)) {
            return NextResponse.json(
                { error: 'Invalid board ID' },
                { status: 400 }
            )
        }

        const board = await prisma.board.findUnique({
            where: { id: boardId },
            include: {
                posts: {
                    where: {
                        status: PostStatus.APPROVED // Only approved posts
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        if (!board) {
            return NextResponse.json(
                { error: 'Board not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(board)
    } catch (error) {
        console.error('Error fetching board:', error)
        return NextResponse.json(
            { error: 'Failed to fetch board' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest, context: RouteParams) {
    try {
        const params = await context.params
        const boardId = parseInt(params.id)

        if (isNaN(boardId)) {
            return NextResponse.json(
                { error: 'Invalid board ID' },
                { status: 400 }
            )
        }

        const body = await request.json()

        // If setting this board as active, make all others inactive first
        if (body.isActive === true) {
            await prisma.board.updateMany({
                data: { isActive: false }
            })
        }

        const updatedBoard = await prisma.board.update({
            where: { id: boardId },
            data: body
        })

        return NextResponse.json(updatedBoard)
    } catch (error) {
        console.error('Error updating board:', error)
        return NextResponse.json(
            { error: 'Failed to update board' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, context: RouteParams) {
    try {
        const params = await context.params
        const boardId = parseInt(params.id)

        if (isNaN(boardId)) {
            return NextResponse.json(
                { error: 'Invalid board ID' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const {
            title,
            type,
            backgroundImg,
            fontFamily,
            backgroundColor,
            titleColor,
            bgMusic,
            postColors,
            backgroundVideo,
            bgMusicExtension
        } = body

        // Validate required fields
        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }

        const board = await prisma.board.update({
            where: { id: boardId },
            data: {
                title,
                type,
                backgroundImg: backgroundImg || null,
                fontFamily: fontFamily || null,
                backgroundColor: backgroundColor || null,
                titleColor: titleColor || null,
                bgMusic: bgMusic || null,
                postColors: postColors || null,
                backgroundVideo: backgroundVideo || null,
                bgMusicExtension: bgMusicExtension || null,
                updatedAt: new Date()
            }
        })

        return NextResponse.json(board)
    } catch (error) {
        console.error('Error updating board:', error)
        return NextResponse.json(
            { error: 'Failed to update board' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
    try {
        const params = await context.params
        const boardId = parseInt(params.id)

        if (isNaN(boardId)) {
            return NextResponse.json(
                { error: 'Invalid board ID' },
                { status: 400 }
            )
        }

        // Check if board exists
        const board = await prisma.board.findUnique({
            where: { id: boardId }
        })

        if (!board) {
            return NextResponse.json(
                { error: 'Board not found' },
                { status: 404 }
            )
        }

        // Delete associated posts first, then board
        await prisma.$transaction([
            prisma.post.deleteMany({
                where: { boardId: boardId }
            }),
            prisma.board.delete({
                where: { id: boardId }
            })
        ])

        return NextResponse.json({ message: 'Board deleted successfully' })
    } catch (error) {
        console.error('Error deleting board:', error)
        return NextResponse.json(
            { error: 'Failed to delete board' },
            { status: 500 }
        )
    }
}
