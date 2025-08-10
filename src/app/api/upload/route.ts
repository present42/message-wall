import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, deleteFile } from '@/lib/file-upload'

export async function POST(request: NextRequest) {
    console.log('📁 Upload API called')
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        console.log('📄 File received:', file?.name, file?.size)

        if (!file) {
            console.log('❌ No file provided')
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        console.log('⬆️ Starting file upload...')
        const uploadResult = await uploadFile(file, {
            maxSize: 10 * 1024 * 1024, // 10MB for direct uploads
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        })

        console.log('📤 Upload result:', uploadResult)

        if (!uploadResult.success) {
            console.log('❌ Upload failed:', uploadResult.error)
            return NextResponse.json(
                { error: uploadResult.error },
                { status: 400 }
            )
        }

        console.log('✅ Upload successful:', uploadResult.filename)
        return NextResponse.json({
            success: true,
            filename: uploadResult.filename,
            path: uploadResult.path,
            metadata: uploadResult.metadata
        })

    } catch (error) {
        console.error('File upload API error:', error)
        return NextResponse.json(
            { error: 'Internal server error during file upload' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const filename = searchParams.get('filename')

        if (!filename) {
            return NextResponse.json(
                { error: 'No filename provided' },
                { status: 400 }
            )
        }

        const success = await deleteFile(filename)

        if (!success) {
            return NextResponse.json(
                { error: 'File not found or could not be deleted' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'File deleted successfully'
        })

    } catch (error) {
        console.error('File deletion API error:', error)
        return NextResponse.json(
            { error: 'Internal server error during file deletion' },
            { status: 500 }
        )
    }
}
