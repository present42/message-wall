'use client'

import { useState } from 'react'

export interface UploadProgress {
    loaded: number
    total: number
    percentage: number
}

export interface UploadResult {
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

export interface UseFileUploadOptions {
    maxSize?: number
    allowedTypes?: string[]
    onProgress?: (progress: UploadProgress) => void
    onSuccess?: (result: UploadResult) => void
    onError?: (error: string) => void
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState<UploadProgress | null>(null)
    const [error, setError] = useState<string | null>(null)

    const uploadFile = async (file: File): Promise<UploadResult> => {
        setUploading(true)
        setError(null)
        setProgress({ loaded: 0, total: file.size, percentage: 0 })

        try {
            // Client-side validation
            if (options.maxSize && file.size > options.maxSize) {
                throw new Error(`File too large. Maximum size: ${Math.round(options.maxSize / 1024 / 1024)}MB`)
            }

            if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
                throw new Error(`Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`)
            }

            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Upload failed')
            }

            const result = await response.json()

            setProgress({ loaded: file.size, total: file.size, percentage: 100 })

            if (options.onSuccess) {
                options.onSuccess(result)
            }

            return result

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed'
            setError(errorMessage)

            if (options.onError) {
                options.onError(errorMessage)
            }

            return {
                success: false,
                error: errorMessage
            }
        } finally {
            setUploading(false)
        }
    }

    const uploadMultiple = async (files: File[]): Promise<UploadResult[]> => {
        const results: UploadResult[] = []

        for (let i = 0; i < files.length; i++) {
            const result = await uploadFile(files[i])
            results.push(result)
        }

        return results
    }

    const deleteFile = async (filename: string): Promise<boolean> => {
        try {
            const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Delete failed')
            }

            return true
        } catch (err) {
            console.error('Delete error:', err)
            return false
        }
    }

    const reset = () => {
        setUploading(false)
        setProgress(null)
        setError(null)
    }

    return {
        uploadFile,
        uploadMultiple,
        deleteFile,
        uploading,
        progress,
        error,
        reset
    }
}

// Utility function to validate files before upload
export function validateFile(file: File, options: { maxSize?: number; allowedTypes?: string[] } = {}) {
    const errors: string[] = []

    if (options.maxSize && file.size > options.maxSize) {
        errors.push(`File too large. Maximum size: ${Math.round(options.maxSize / 1024 / 1024)}MB`)
    }

    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        errors.push(`Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`)
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

// Utility function to format file size
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
