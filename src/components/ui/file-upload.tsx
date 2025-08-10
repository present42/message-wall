'use client'

import React, { useRef, useState, ChangeEvent } from 'react'
import { useFileUpload, formatFileSize, validateFile, UploadResult } from '@/hooks/useFileUpload'
import { Button } from '@/components/ui/button'

export interface FileUploadComponentProps {
    accept?: string[]
    maxSize?: number
    maxFiles?: number
    onUploadComplete?: (results: UploadResult[]) => void
    onError?: (error: string) => void
    className?: string
    children?: React.ReactNode
}

export function FileUploadComponent({
    accept = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize = 5 * 1024 * 1024, // 5MB
    maxFiles = 1,
    onUploadComplete,
    onError,
    className = '',
    children
}: FileUploadComponentProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [dragActive, setDragActive] = useState(false)

    const { uploadFile, uploading, progress, error } = useFileUpload({
        maxSize,
        allowedTypes: accept,
        onSuccess: (result) => {
            if (onUploadComplete) {
                onUploadComplete([result])
            }
        },
        onError: (err) => {
            if (onError) {
                onError(err)
            }
        }
    })

    const handleFiles = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return

        const fileArray = Array.from(selectedFiles).slice(0, maxFiles)

        // Validate files
        const validationErrors: string[] = []
        fileArray.forEach(file => {
            const validation = validateFile(file, { maxSize, allowedTypes: accept })
            if (!validation.isValid) {
                validationErrors.push(...validation.errors)
            }
        })

        if (validationErrors.length > 0) {
            if (onError) {
                onError(validationErrors.join('; '))
            }
            return
        }

        // Set files and create previews
        setFiles(fileArray)

        // Create image previews
        const newPreviews = fileArray.map(file => {
            if (file.type.startsWith('image/')) {
                return URL.createObjectURL(file)
            }
            return ''
        })
        setPreviews(newPreviews)
    }

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
        handleFiles(e.dataTransfer.files)
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleUpload = async () => {
        if (files.length === 0) return

        try {
            const results = []
            for (const file of files) {
                const result = await uploadFile(file)
                results.push(result)
            }
        } catch (err) {
            console.error('Upload error:', err)
        }
    }

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index)
        const newPreviews = previews.filter((_, i) => i !== index)

        // Revoke object URL to prevent memory leaks
        if (previews[index]) {
            URL.revokeObjectURL(previews[index])
        }

        setFiles(newFiles)
        setPreviews(newPreviews)
    }

    const openFileDialog = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className={`file-upload-component ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                multiple={maxFiles > 1}
                accept={accept.join(',')}
                onChange={handleFileSelect}
                className="hidden"
            />

            <div
                onDrop={handleDrop}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onClick={openFileDialog}
                className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
            >
                {children || (
                    <div>
                        <div className="mx-auto w-12 h-12 mb-4 text-gray-400 text-4xl">
                            📁
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-2">
                            {dragActive ? 'Drop files here' : 'Upload files'}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                            Drag and drop files here, or click to select files
                        </p>
                        <p className="text-xs text-gray-500">
                            Supported: {accept.join(', ')} • Max size: {formatFileSize(maxSize)} • Max files: {maxFiles}
                        </p>
                    </div>
                )}
            </div>

            {/* File Previews */}
            {files.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Files:</h4>
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    {previews[index] && (
                                        <div className="w-10 h-10 relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={previews[index]}
                                                alt="Preview"
                                                className="w-10 h-10 object-cover rounded"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeFile(index)
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                    disabled={uploading}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Progress */}
            {uploading && progress && (
                <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{Math.round(progress.percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress.percentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Upload Button */}
            {files.length > 0 && !uploading && (
                <div className="mt-4">
                    <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full"
                    >
                        Upload {files.length} file{files.length > 1 ? 's' : ''}
                    </Button>
                </div>
            )}
        </div>
    )
}
