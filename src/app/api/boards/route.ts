import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BoardType, PostStatus } from '@/types'

export async function GET() {
    try {
        const boards = await prisma.board.findMany({
            include: {
                posts: {
                    where: {
                        status: PostStatus.APPROVED // Only approved posts
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(boards)
    } catch (error) {
        console.error('Error fetching boards:', error)
        return NextResponse.json(
            { error: 'Failed to fetch boards' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            title,
            backgroundImg,
            fontFamily,
            backgroundColor,
            titleColor,
            boardType,
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

        const board = await prisma.board.create({
            data: {
                title,
                backgroundImg,
                fontFamily,
                backgroundColor,
                titleColor,
                type: boardType || BoardType.FLYING_MESSAGES,
                bgMusic,
                postColors,
                backgroundVideo,
                bgMusicExtension
            }
        })

        return NextResponse.json(board, { status: 201 })
    } catch (error) {
        console.error('Error creating board:', error)
        return NextResponse.json(
            { error: 'Failed to create board' },
            { status: 500 }
        )
    }
}
