import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params

        // Security: Prevent path traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return new NextResponse('Invalid filename', { status: 400 })
        }

        const filePath = path.join(process.cwd(), 'uploads', filename)

        // Check if file exists
        try {
            await fs.access(filePath)
        } catch {
            return new NextResponse('File not found', { status: 404 })
        }

        // Read file
        const fileBuffer = await fs.readFile(filePath)

        // Determine content type based on file extension
        const ext = path.extname(filename).toLowerCase()
        let contentType = 'application/octet-stream'

        switch (ext) {
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg'
                break
            case '.png':
                contentType = 'image/png'
                break
            case '.gif':
                contentType = 'image/gif'
                break
            case '.webp':
                contentType = 'image/webp'
                break
            case '.pdf':
                contentType = 'application/pdf'
                break
            case '.txt':
                contentType = 'text/plain'
                break
        }

        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        })
    } catch (error) {
        console.error('Error serving file:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
