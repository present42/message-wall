import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PostStatus } from '@prisma/client'
import { uploadFile } from '@/lib/file-upload'
import { Server as ServerIO } from 'socket.io'

// Declare global io
declare global {
    var io: ServerIO | undefined
}

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type')

        // Handle both FormData (legacy) and JSON (new) formats
        if (contentType?.includes('multipart/form-data')) {
            return handleFormDataPost(request)
        } else {
            return handleJSONPost(request)
        }
    } catch (error) {
        console.error('Error creating post:', error)
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        )
    }
}

// Legacy FormData handler for backward compatibility
async function handleFormDataPost(request: NextRequest) {
    console.log('🔄 Processing FormData request...')
    const formData = await request.formData()
    const message = formData.get('message') as string
    const nickname = formData.get('nickname') as string
    const email = formData.get('email') as string
    const imageFile = formData.get('image') as File | null

    console.log('📝 Form data received:', {
        message: message,
        nickname: nickname,
        email: email,
        imageFile: imageFile ? `${imageFile.name} (${imageFile.size} bytes)` : 'No image'
    })

    // Get current active board (explicitly marked as active)
    const currentBoard = await prisma.board.findFirst({
        where: {
            isActive: true
        }
    })
    if (!currentBoard) {
        return NextResponse.json(
            { error: 'No active board found' },
            { status: 404 }
        )
    }

    let imagePath: string | undefined

    // Handle single image upload
    if (imageFile && imageFile.size > 0) {
        console.log('📸 Processing image upload:', {
            name: imageFile.name,
            size: imageFile.size,
            type: imageFile.type
        })

        const uploadResult = await uploadFile(imageFile, {
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        })

        console.log('💾 Upload result:', uploadResult)

        if (!uploadResult.success) {
            console.error('❌ File upload failed:', uploadResult.error)
            return NextResponse.json(
                { error: `File upload failed: ${uploadResult.error}` },
                { status: 400 }
            )
        }

        imagePath = uploadResult.filename
        console.log('✅ File saved as:', imagePath)
    } else {
        console.log('📷 No image file provided')
    }

    // Create post in database
    console.log('🗃️ Creating post in database with:', {
        message: message,
        nickname: nickname,
        email: email,
        imagePath: imagePath,
        currentBoard: currentBoard.id
    })

    const post = await prisma.post.create({
        data: {
            message: message || null,
            nickname: nickname || null,
            email: email || null,
            imagePath: imagePath || null,
            boardId: currentBoard.id,
            status: PostStatus.PENDING
        }
    })

    console.log('✅ Post created successfully:', post.id)

    // Emit WebSocket event to admin for new post notification
    if (global.io) {
        global.io.to('admin').emit('message', {
            type: 'NEW_POST',
            data: post
        })
        console.log('📡 Emitted new post to admin via WebSocket')
    }

    return NextResponse.json({ success: true, post })
}

// New JSON handler for multiple attachments
async function handleJSONPost(request: NextRequest) {
    const body = await request.json()
    const { title, content, author, attachments } = body

    // Get current active board (explicitly marked as active)
    const currentBoard = await prisma.board.findFirst({
        where: {
            isActive: true
        }
    })
    if (!currentBoard) {
        return NextResponse.json(
            { error: 'No active board found' },
            { status: 404 }
        )
    }

    // Create post with attachments in a transaction
    const result = await prisma.$transaction(async (tx) => {
        // Create the post
        const post = await tx.post.create({
            data: {
                message: content || title, // Use title as fallback for message
                nickname: author,
                email: null, // Could be added to the form later
                boardId: currentBoard.id,
                status: PostStatus.PENDING
            }
        })

        // Create attachments if any
        if (attachments && attachments.length > 0) {
            const attachmentData = attachments.map((attachment: {
                filename: string;
                originalName?: string;
                size?: number;
                type?: string;
                dimensions?: { width?: number; height?: number };
            }) => ({
                postId: post.id,
                filename: attachment.filename,
                originalName: attachment.originalName || attachment.filename,
                filePath: `uploads/${attachment.filename}`,
                fileSize: attachment.size || 0,
                mimeType: attachment.type || 'application/octet-stream',
                dimensions: attachment.dimensions ? JSON.stringify(attachment.dimensions) : null
            }))

            await tx.attachment.createMany({
                data: attachmentData
            })
        }

        // Return post with attachments
        return await tx.post.findUnique({
            where: { id: post.id },
            include: {
                attachments: true,
                board: true
            }
        })
    })

    return NextResponse.json({ success: true, post: result })
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const boardId = searchParams.get('boardId')
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        const where: {
            boardId?: number
            status?: PostStatus
        } = {}

        if (boardId) {
            where.boardId = parseInt(boardId)
        }

        if (status !== null) {
            // If status is empty string, return all posts
            if (status && status.trim() !== '') {
                where.status = status as PostStatus
            }
            // If status is null or empty, don't add a status filter (show all)
        }

        // Get total count for pagination
        const total = await prisma.post.count({ where })

        const posts = await prisma.post.findMany({
            where,
            include: {
                board: true,
                attachments: true // Include attachments in the response
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        })

        // Ensure dates are properly serialized
        const serializedPosts = posts.map(post => ({
            ...post,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        }))

        return NextResponse.json({
            posts: serializedPosts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        })
    } catch (error) {
        console.error('Error fetching posts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        )
    }
}

// PATCH method to update post status
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { postId, status } = body

        console.log('🔄 Updating post status:', { postId, status })

        // Validate inputs
        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            )
        }

        if (!status || !['APPROVED', 'PENDING', 'REJECTED'].includes(status)) {
            return NextResponse.json(
                { error: 'Valid status is required (APPROVED, PENDING, or REJECTED)' },
                { status: 400 }
            )
        }

        // Update the post status
        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                status: status as PostStatus,
                updatedAt: new Date()
            },
            include: {
                board: true,
                attachments: true
            }
        })

        console.log('✅ Post status updated successfully:', updatedPost.id)

        // Emit WebSocket events based on status change
        if (global.io) {
            // Always notify admin of status changes
            global.io.to('admin').emit('message', {
                type: 'POST_STATUS_UPDATED',
                data: updatedPost
            })

            // If post was approved, notify the board for real-time display
            if (status === 'APPROVED') {
                global.io.to(`board-${updatedPost.boardId}`).emit('message', {
                    type: 'NEW_APPROVED_POST',
                    data: updatedPost
                })
                console.log('📡 Emitted approved post to board via WebSocket')
            }

            console.log('📡 Emitted status update to admin via WebSocket')
        }

        return NextResponse.json({
            success: true,
            post: updatedPost,
            message: `Post status updated to ${status}`
        })

    } catch (error) {
        console.error('❌ Error updating post status:', error)

        // Handle specific Prisma errors
        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to update post status' },
            { status: 500 }
        )
    }
}
