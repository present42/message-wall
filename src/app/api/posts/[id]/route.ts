import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PostStatus } from '@/types'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const postId = parseInt(params.id)

        if (isNaN(postId)) {
            return NextResponse.json(
                { error: 'Invalid post ID' },
                { status: 400 }
            )
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                board: true
            }
        })

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(post)
    } catch (error) {
        console.error('Error fetching post:', error)
        return NextResponse.json(
            { error: 'Failed to fetch post' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const postId = parseInt(params.id)
        const body = await request.json()
        const { status } = body

        if (isNaN(postId)) {
            return NextResponse.json(
                { error: 'Invalid post ID' },
                { status: 400 }
            )
        }

        if (status === undefined || ![PostStatus.PENDING, PostStatus.APPROVED, PostStatus.REJECTED].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            )
        }

        const post = await prisma.post.update({
            where: { id: postId },
            data: {
                status
            },
            include: {
                board: true
            }
        })

        return NextResponse.json(post)
    } catch (error) {
        console.error('Error updating post:', error)
        return NextResponse.json(
            { error: 'Failed to update post' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const postId = parseInt(params.id)

        if (isNaN(postId)) {
            return NextResponse.json(
                { error: 'Invalid post ID' },
                { status: 400 }
            )
        }

        await prisma.post.delete({
            where: { id: postId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting post:', error)
        return NextResponse.json(
            { error: 'Failed to delete post' },
            { status: 500 }
        )
    }
}
