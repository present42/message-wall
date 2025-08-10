import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

// Supported file types
const ALLOWED_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp']
} as const

type AllowedMimeType = keyof typeof ALLOWED_TYPES

// File size limits (in bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export interface FileUploadResult {
    success: boolean
    filename?: string
    path?: string
    error?: string
    metadata?: {
        originalName: string
        size: number
        type: string
        dimensions?: { width?: number; height?: number }
    }
}

export interface FileUploadOptions {
    maxSize?: number
    allowedTypes?: string[]
    generateThumbnail?: boolean
    maxDimensions?: { width: number; height: number }
}

/**
 * Validates file type and extension
 */
function validateFileType(file: File): { isValid: boolean; error?: string } {
    const mimeType = file.type
    const extension = path.extname(file.name).toLowerCase()

    if (!Object.keys(ALLOWED_TYPES).includes(mimeType)) {
        return {
            isValid: false,
            error: `Unsupported file type: ${mimeType}. Allowed types: ${Object.keys(ALLOWED_TYPES).join(', ')}`
        }
    }

    const allowedExtensions = ALLOWED_TYPES[mimeType as AllowedMimeType]
    if (!allowedExtensions.some(ext => ext === extension)) {
        return {
            isValid: false,
            error: `File extension ${extension} doesn't match MIME type ${mimeType}`
        }
    }

    return { isValid: true }
}

/**
 * Validates file size
 */
function validateFileSize(file: File, maxSize = MAX_FILE_SIZE): { isValid: boolean; error?: string } {
    if (file.size > maxSize) {
        return {
            isValid: false,
            error: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`
        }
    }
    return { isValid: true }
}

/**
 * Generates a unique filename with proper extension
 */
function generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now()
    const randomBytes = crypto.randomBytes(8).toString('hex')
    const extension = path.extname(originalName).toLowerCase()
    return `${timestamp}_${randomBytes}${extension}`
}

/**
 * Ensures upload directory exists
 */
async function ensureUploadDir(uploadPath: string): Promise<void> {
    if (!existsSync(uploadPath)) {
        await mkdir(uploadPath, { recursive: true })
    }
}

/**
 * Gets basic image metadata from buffer
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getImageMetadata(_buffer: Buffer): Promise<{ width?: number; height?: number }> {
    // For now, return empty metadata
    // In a real implementation, you'd use a library like 'sharp' or 'jimp'
    // to extract actual image dimensions
    // The _buffer parameter is prefixed with underscore to indicate it's intentionally unused
    return {}
}

/**
 * Main file upload function
 */
export async function uploadFile(
    file: File,
    options: FileUploadOptions = {}
): Promise<FileUploadResult> {
    console.log('🔧 uploadFile called with:', file.name, file.size, 'bytes')
    try {
        // Validate file type
        const typeValidation = validateFileType(file)
        if (!typeValidation.isValid) {
            console.log('❌ Type validation failed:', typeValidation.error)
            return {
                success: false,
                error: typeValidation.error
            }
        }

        // Validate file size
        const sizeValidation = validateFileSize(file, options.maxSize)
        if (!sizeValidation.isValid) {
            console.log('❌ Size validation failed:', sizeValidation.error)
            return {
                success: false,
                error: sizeValidation.error
            }
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        console.log('📊 Buffer created, size:', buffer.length)

        // Generate unique filename
        const filename = generateUniqueFilename(file.name)
        console.log('📝 Generated filename:', filename)

        // Set up upload paths - Save to root/uploads (not public/uploads)
        const uploadDir = path.join(process.cwd(), 'uploads')
        const filePath = path.join(uploadDir, filename)
        console.log('📂 Upload directory:', uploadDir)
        console.log('📄 File path:', filePath)

        // Ensure upload directory exists
        await ensureUploadDir(uploadDir)
        console.log('✅ Upload directory ready')

        // Get image metadata
        const metadata = await getImageMetadata(buffer)

        // Write file to disk
        console.log('💾 Writing file to disk...')
        await writeFile(filePath, buffer)
        console.log('✅ File written successfully!')

        return {
            success: true,
            filename,
            path: `/uploads/${filename}`,
            metadata: {
                originalName: file.name,
                size: file.size,
                type: file.type,
                dimensions: metadata
            }
        }
    } catch (error) {
        console.error('File upload error:', error)
        return {
            success: false,
            error: 'Failed to upload file'
        }
    }
}

/**
 * Deletes an uploaded file
 */
export async function deleteFile(filename: string): Promise<boolean> {
    try {
        const filePath = path.join(process.cwd(), 'public', 'uploads', filename)
        if (existsSync(filePath)) {
            await import('fs').then(fs => fs.promises.unlink(filePath))
            return true
        }
        return false
    } catch (error) {
        console.error('File deletion error:', error)
        return false
    }
}

/**
 * Validates multiple files at once
 */
export function validateFiles(files: File[], options: FileUploadOptions = {}): {
    valid: File[]
    invalid: { file: File; error: string }[]
} {
    const valid: File[] = []
    const invalid: { file: File; error: string }[] = []

    files.forEach(file => {
        const typeValidation = validateFileType(file)
        if (!typeValidation.isValid) {
            invalid.push({ file, error: typeValidation.error! })
            return
        }

        const sizeValidation = validateFileSize(file, options.maxSize)
        if (!sizeValidation.isValid) {
            invalid.push({ file, error: sizeValidation.error! })
            return
        }

        valid.push(file)
    })

    return { valid, invalid }
}
